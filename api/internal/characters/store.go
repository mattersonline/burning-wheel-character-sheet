package characters

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"time"

	_ "modernc.org/sqlite"
)

var ErrNotFound = errors.New("character not found")

type SQLiteStore struct {
	db *sql.DB
}

func NewSQLiteStore(databasePath, legacyPath string) (*SQLiteStore, error) {
	if databasePath != ":memory:" {
		if err := os.MkdirAll(filepath.Dir(databasePath), 0o755); err != nil {
			return nil, err
		}
	}

	db, err := sql.Open("sqlite", databasePath)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(1)

	store := &SQLiteStore{db: db}
	if err := store.initialize(legacyPath); err != nil {
		_ = db.Close()
		return nil, err
	}
	return store, nil
}

func (s *SQLiteStore) initialize(legacyPath string) error {
	const schema = `
		CREATE TABLE IF NOT EXISTS characters (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			concept TEXT NOT NULL,
			stock TEXT NOT NULL,
			age TEXT NOT NULL,
			homeland TEXT NOT NULL,
			beliefs TEXT NOT NULL,
			instincts TEXT NOT NULL,
			traits TEXT NOT NULL,
			skills TEXT NOT NULL,
			notes TEXT NOT NULL,
			sheet_data TEXT NOT NULL DEFAULT '{}',
			updated_at TEXT NOT NULL
		);
		CREATE TABLE IF NOT EXISTS store_migrations (
			name TEXT PRIMARY KEY
		);
	`
	if _, err := s.db.Exec(schema); err != nil {
		return err
	}
	if err := s.ensureSheetDataColumn(); err != nil {
		return err
	}

	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var applied bool
	err = tx.QueryRow(`SELECT EXISTS(SELECT 1 FROM store_migrations WHERE name = 'import_legacy_json')`).Scan(&applied)
	if err != nil {
		return err
	}
	if !applied {
		if legacyPath != "" {
			data, err := os.ReadFile(legacyPath)
			if err != nil && !errors.Is(err, os.ErrNotExist) {
				return err
			}
			if err == nil {
				var characters []Character
				if err := json.Unmarshal(data, &characters); err != nil {
					return err
				}
				for index := len(characters) - 1; index >= 0; index-- {
					if err := insertCharacter(tx, characters[index]); err != nil {
						return err
					}
				}
			}
		}
		if _, err := tx.Exec(`INSERT INTO store_migrations (name) VALUES ('import_legacy_json')`); err != nil {
			return err
		}
	}
	return tx.Commit()
}

func (s *SQLiteStore) ensureSheetDataColumn() error {
	var exists bool
	if err := s.db.QueryRow(`SELECT EXISTS(
		SELECT 1 FROM pragma_table_info('characters') WHERE name = 'sheet_data'
	)`).Scan(&exists); err != nil {
		return err
	}
	if exists {
		return nil
	}
	_, err := s.db.Exec(`ALTER TABLE characters ADD COLUMN sheet_data TEXT NOT NULL DEFAULT '{}'`)
	return err
}

func (s *SQLiteStore) List() ([]Character, error) {
	rows, err := s.db.Query(`
		SELECT id, name, concept, stock, age, homeland, beliefs, instincts, traits, skills, notes, sheet_data, updated_at
		FROM characters
		ORDER BY rowid DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	characters := make([]Character, 0)
	for rows.Next() {
		character, err := scanCharacter(rows)
		if err != nil {
			return nil, err
		}
		characters = append(characters, character)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return characters, nil
}

func (s *SQLiteStore) Create(character Character) (Character, error) {
	id, err := newID()
	if err != nil {
		return Character{}, err
	}
	character.ID = id
	character.UpdatedAt = time.Now().UTC()
	normalizeSheetData(&character.SheetData)
	if err := insertCharacter(s.db, character); err != nil {
		return Character{}, err
	}
	return character, nil
}

func (s *SQLiteStore) Update(id string, character Character) (Character, error) {
	character.ID = id
	character.UpdatedAt = time.Now().UTC()
	normalizeSheetData(&character.SheetData)
	sheetData, err := marshalSheetData(character.SheetData)
	if err != nil {
		return Character{}, err
	}
	result, err := s.db.Exec(`
		UPDATE characters
		SET name = ?, concept = ?, stock = ?, age = ?, homeland = ?, beliefs = ?,
		    instincts = ?, traits = ?, skills = ?, notes = ?, sheet_data = ?, updated_at = ?
		WHERE id = ?
	`, character.Name, character.Concept, character.Stock, character.Age, character.Homeland,
		character.Beliefs, character.Instincts, character.Traits, character.Skills, character.Notes,
		sheetData,
		character.UpdatedAt.Format(time.RFC3339Nano), id)
	if err != nil {
		return Character{}, err
	}
	count, err := result.RowsAffected()
	if err != nil {
		return Character{}, err
	}
	if count == 0 {
		return Character{}, ErrNotFound
	}
	return character, nil
}

func (s *SQLiteStore) Delete(id string) error {
	result, err := s.db.Exec(`DELETE FROM characters WHERE id = ?`, id)
	if err != nil {
		return err
	}
	count, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if count == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *SQLiteStore) Close() error {
	return s.db.Close()
}

type characterScanner interface {
	Scan(dest ...any) error
}

func scanCharacter(scanner characterScanner) (Character, error) {
	var character Character
	var updatedAt string
	var sheetData string
	if err := scanner.Scan(
		&character.ID, &character.Name, &character.Concept, &character.Stock, &character.Age,
		&character.Homeland, &character.Beliefs, &character.Instincts, &character.Traits,
		&character.Skills, &character.Notes, &sheetData, &updatedAt,
	); err != nil {
		return Character{}, err
	}
	if err := json.Unmarshal([]byte(sheetData), &character.SheetData); err != nil {
		return Character{}, err
	}
	if sheetData == "" || sheetData == "{}" {
		migrateLegacyFields(&character)
	}
	normalizeSheetData(&character.SheetData)
	parsed, err := time.Parse(time.RFC3339Nano, updatedAt)
	if err != nil {
		return Character{}, err
	}
	character.UpdatedAt = parsed
	return character, nil
}

func insertCharacter(execer interface {
	Exec(query string, args ...any) (sql.Result, error)
}, character Character) error {
	migrateLegacyFields(&character)
	normalizeSheetData(&character.SheetData)
	sheetData, err := marshalSheetData(character.SheetData)
	if err != nil {
		return err
	}
	_, err = execer.Exec(`
		INSERT INTO characters (
			id, name, concept, stock, age, homeland, beliefs, instincts, traits, skills, notes, sheet_data, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, character.ID, character.Name, character.Concept, character.Stock, character.Age, character.Homeland,
		character.Beliefs, character.Instincts, character.Traits, character.Skills, character.Notes,
		sheetData,
		character.UpdatedAt.Format(time.RFC3339Nano))
	return err
}

func marshalSheetData(sheetData SheetData) (string, error) {
	data, err := json.Marshal(sheetData)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

func normalizeSheetData(sheetData *SheetData) {
	sheetData.Beliefs = normalizeSlots(sheetData.Beliefs)
	sheetData.Instincts = normalizeSlots(sheetData.Instincts)
	normalizeStatsAndAttributes(sheetData)
	sheetData.SkillRecords = normalizeAbilities(sheetData.SkillRecords)
	sheetData.LearningSkills = normalizeLearningSkills(sheetData.LearningSkills)
	sheetData.MeleeWeapons = normalizeMeleeWeapons(sheetData.MeleeWeapons)
	sheetData.RangedWeapons = normalizeRangedWeapons(sheetData.RangedWeapons)
	sheetData.Armor = normalizeArmor(sheetData.Armor)
	sheetData.ArthaPool.Fate = clamp(sheetData.ArthaPool.Fate, maxArtha)
	sheetData.ArthaPool.Persona = clamp(sheetData.ArthaPool.Persona, maxArtha)
	sheetData.ArthaPool.Deed = clamp(sheetData.ArthaPool.Deed, maxArtha)
	sheetData.InjuryWounds = normalizeInjuryWounds(sheetData.InjuryWounds)
}

func normalizeInjuryWounds(wounds []int) []int {
	normalized := make([]int, injuryLevels)
	for index := range normalized {
		if index < len(wounds) {
			normalized[index] = clamp(wounds[index], maxWoundsPerLevel)
		}
	}
	return normalized
}

func normalizeSlots(slots []string) []string {
	normalized := make([]string, 3)
	copy(normalized, slots)
	return normalized
}

func normalizeLearningSkills(skills []LearningSkill) []LearningSkill {
	if skills == nil {
		return []LearningSkill{}
	}
	for i := range skills {
		skill := &skills[i]
		skill.Aptitude = max(1, clamp(skill.Aptitude, 10))
		skill.Checks = clamp(skill.Checks, skill.Aptitude)
	}
	return skills
}

func migrateLegacyFields(character *Character) {
	if character.SheetData.Beliefs == nil && character.Beliefs != "" {
		character.SheetData.Beliefs = []string{character.Beliefs}
	}
	if character.SheetData.Instincts == nil && character.Instincts != "" {
		character.SheetData.Instincts = []string{character.Instincts}
	}
	if character.SheetData.CharacterTraits == "" {
		character.SheetData.CharacterTraits = character.Traits
	}
}

func newID() (string, error) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
