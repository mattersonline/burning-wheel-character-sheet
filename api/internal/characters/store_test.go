package characters

import (
	"database/sql"
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"reflect"
	"testing"
)

func TestSQLiteStorePersistsCRUD(t *testing.T) {
	path := filepath.Join(t.TempDir(), "characters.db")
	store, err := NewSQLiteStore(path, "")
	if err != nil {
		t.Fatal(err)
	}

	sheetData := SheetData{
		Beliefs:         []string{"Protect the village", "Find my family", "Expose the traitor"},
		SpecialBelief:   "The old ways must endure",
		Instincts:       []string{"Draw first", "Never travel alone", "Hide the map"},
		CharacterTraits: "Patient",
		DieTraits:       "Keen Sight",
		CallOnTraits:    "Clever",
		Relationships:   "Allied with the scouts",
		Inventory:       "Map and lantern",
		Injuries:        "Old scar",
		Stats: []Ability{{
			ID: "will", Name: "Will", Exponent: 4, Shade: ShadeGrey, SkipRoutine: true,
			Advancement: Advancement{Difficult: 1},
			Artha:       Artha{Fate: 1},
		}},
		Attributes: []Ability{{
			ID: "custom-1", Name: "Grief", Exponent: 3, Shade: ShadeBlack,
			Advancement: Advancement{Routine: 2},
		}},
		SkillRecords: []Ability{{
			ID: "sword", Name: "Sword", Exponent: 3, Shade: ShadeBlack, SkipRoutine: true, Open: true,
			Advancement: Advancement{Challenging: 2},
			Artha:       Artha{Persona: 1, Deed: 2},
		}},
		LearningSkills: []LearningSkill{{
			ID: "tracking", Name: "Tracking", Stat: "perception", Aptitude: 3, Checks: 2,
		}},
		Spells:       "A small spell",
		Other:        "Character detail",
		ArthaPool:    Artha{Fate: 2, Persona: 3, Deed: 1},
		InjuryWounds: []int{0, 1, 3, 9, -2},
	}
	created, err := store.Create(Character{Name: "Mara", Stock: "Human", SheetData: sheetData})
	if err != nil {
		t.Fatal(err)
	}
	if created.ID == "" {
		t.Fatal("created character has no ID")
	}

	updated, err := store.Update(created.ID, Character{Name: "Mara the Scout", SheetData: sheetData})
	if err != nil {
		t.Fatal(err)
	}
	if updated.Name != "Mara the Scout" {
		t.Fatalf("updated name = %q", updated.Name)
	}

	if err := store.Close(); err != nil {
		t.Fatal(err)
	}
	reloaded, err := NewSQLiteStore(path, "")
	if err != nil {
		t.Fatal(err)
	}
	defer reloaded.Close()
	got, err := reloaded.List()
	if err != nil {
		t.Fatal(err)
	}
	if len(got) != 1 || got[0].Name != updated.Name {
		t.Fatalf("reloaded characters = %#v", got)
	}
	want := sheetData
	normalizeSheetData(&want)
	if !reflect.DeepEqual(got[0].SheetData, want) {
		t.Fatalf("reloaded sheet data = %#v, want %#v", got[0].SheetData, want)
	}
	if gotStats := got[0].SheetData.Stats; len(gotStats) != 6 || gotStats[0].Exponent != 4 ||
		gotStats[0].Shade != ShadeGrey || gotStats[0].Artha.Fate != 1 {
		t.Fatalf("will stat was not preserved: %#v", gotStats)
	}
	if custom := got[0].SheetData.Attributes[4]; custom.Name != "Grief" || custom.Exponent != 3 {
		t.Fatalf("custom attribute was not preserved: %#v", custom)
	}
	if pool := got[0].SheetData.ArthaPool; pool != (Artha{Fate: 2, Persona: 3, Deed: 1}) {
		t.Fatalf("artha pool was not preserved: %#v", pool)
	}
	wounds := got[0].SheetData.InjuryWounds
	if len(wounds) != 16 || wounds[1] != 1 || wounds[2] != 3 || wounds[3] != 3 || wounds[4] != 0 {
		t.Fatalf("injury wounds were not normalized: %#v", wounds)
	}

	if err := reloaded.Delete(created.ID); err != nil {
		t.Fatal(err)
	}
	if err := reloaded.Delete(created.ID); !errors.Is(err, ErrNotFound) {
		t.Fatalf("second delete error = %v, want ErrNotFound", err)
	}
}

func TestSQLiteStoreMigratesExistingCharacterTable(t *testing.T) {
	path := filepath.Join(t.TempDir(), "characters.db")
	db, err := sql.Open("sqlite", path)
	if err != nil {
		t.Fatal(err)
	}
	_, err = db.Exec(`
		CREATE TABLE characters (
			id TEXT PRIMARY KEY, name TEXT NOT NULL, concept TEXT NOT NULL, stock TEXT NOT NULL,
			age TEXT NOT NULL, homeland TEXT NOT NULL, beliefs TEXT NOT NULL, instincts TEXT NOT NULL,
			traits TEXT NOT NULL, skills TEXT NOT NULL, notes TEXT NOT NULL, updated_at TEXT NOT NULL
		);
		INSERT INTO characters (id, name, concept, stock, age, homeland, beliefs, instincts, traits, skills, notes, updated_at)
		VALUES ('legacy-id', 'Mara', 'Scout', 'Human', '30', 'North', 'Belief', 'Instinct', 'Trait', 'Skill notes', 'Notes', '2026-01-02T03:04:05Z');
	`)
	if err != nil {
		t.Fatal(err)
	}
	if err := db.Close(); err != nil {
		t.Fatal(err)
	}

	store, err := NewSQLiteStore(path, "")
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()
	got, err := store.List()
	if err != nil {
		t.Fatal(err)
	}
	if len(got) != 1 || got[0].ID != "legacy-id" || got[0].Skills != "Skill notes" {
		t.Fatalf("migrated character = %#v", got)
	}
	if len(got[0].SheetData.Stats) != 6 || len(got[0].SheetData.Attributes) != 6 ||
		got[0].SheetData.SkillRecords == nil || got[0].SheetData.LearningSkills == nil {
		t.Fatalf("migrated sheet data lists should be empty, got %#v", got[0].SheetData)
	}
	if !reflect.DeepEqual(got[0].SheetData.Beliefs, []string{"Belief", "", ""}) ||
		!reflect.DeepEqual(got[0].SheetData.Instincts, []string{"Instinct", "", ""}) ||
		got[0].SheetData.CharacterTraits != "Trait" {
		t.Fatalf("legacy character fields were not migrated: %#v", got[0].SheetData)
	}
}

func TestSQLiteStoreImportsLegacyJSON(t *testing.T) {
	directory := t.TempDir()
	databasePath := filepath.Join(directory, "characters.db")
	legacyPath := filepath.Join(directory, "characters.json")
	legacyData := `[
		{"id":"newer-id","name":"Mara","updatedAt":"2026-01-02T03:04:05Z"},
		{"id":"older-id","name":"Bram","updatedAt":"2026-01-01T03:04:05Z"}
	]`
	if err := os.WriteFile(legacyPath, []byte(legacyData), 0o600); err != nil {
		t.Fatal(err)
	}

	store, err := NewSQLiteStore(databasePath, legacyPath)
	if err != nil {
		t.Fatal(err)
	}
	characters, err := store.List()
	if err != nil {
		t.Fatal(err)
	}
	if len(characters) != 2 || characters[0].ID != "newer-id" || characters[0].Name != "Mara" {
		t.Fatalf("imported characters = %#v", characters)
	}
	if err := store.Close(); err != nil {
		t.Fatal(err)
	}

	if err := os.WriteFile(legacyPath, []byte(`[]`), 0o600); err != nil {
		t.Fatal(err)
	}
	reloaded, err := NewSQLiteStore(databasePath, legacyPath)
	if err != nil {
		t.Fatal(err)
	}
	defer reloaded.Close()
	characters, err = reloaded.List()
	if err != nil {
		t.Fatal(err)
	}
	if len(characters) != 2 || characters[0].ID != "newer-id" || characters[1].ID != "older-id" {
		t.Fatalf("characters after reopening = %#v", characters)
	}
}

func TestNormalizeLearningSkillsKeepsAptitudeAndChecksInRange(t *testing.T) {
	skills := normalizeLearningSkills([]LearningSkill{
		{ID: "low", Aptitude: 0, Checks: 4},
		{ID: "high", Aptitude: 40, Checks: 99},
	})
	if skills[0].Aptitude != 1 || skills[0].Checks != 1 {
		t.Fatalf("low skill = %+v", skills[0])
	}
	if skills[1].Aptitude != 10 || skills[1].Checks != 10 {
		t.Fatalf("high skill = %+v", skills[1])
	}
}

func TestLearningSkillAcceptsLegacyStringAptitude(t *testing.T) {
	var skill LearningSkill
	if err := json.Unmarshal([]byte(`{"id":"a","aptitude":"4","checks":"","advancement":""}`), &skill); err != nil {
		t.Fatal(err)
	}
	if skill.Aptitude != 4 || skill.Checks != 0 {
		t.Fatalf("skill = %+v", skill)
	}
}
