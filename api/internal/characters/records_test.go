package characters

import (
	"encoding/json"
	"reflect"
	"testing"
)

func TestLegacyRecordLists(t *testing.T) {
	var sheetData SheetData
	err := json.Unmarshal([]byte(`{
		"characterTraits":"Patient\nKind",
		"dieTraits":"Keen Sight",
		"callOnTraits":"Clever",
		"relationships":"Scout captain\nAn old friend"
	}`), &sheetData)
	if err != nil {
		t.Fatal(err)
	}
	want := []string{"Patient\nKind", "Keen Sight", "Clever"}
	for index, records := range []NamedRecords{sheetData.CharacterTraits, sheetData.DieTraits, sheetData.CallOnTraits} {
		if len(records) != 1 || records[0].Description != want[index] || records[0].ID == "" {
			t.Fatalf("legacy traits = %#v", records)
		}
	}
	if len(sheetData.Relationships) != 1 ||
		sheetData.Relationships[0].Description != "Scout captain\nAn old friend" ||
		sheetData.Relationships[0].Type != RelationshipDirect {
		t.Fatalf("legacy relationships = %#v", sheetData.Relationships)
	}
	for _, data := range []string{
		`{}`, `{"characterTraits":"","dieTraits":"","callOnTraits":"","relationships":""}`,
		`{"characterTraits":null,"dieTraits":null,"callOnTraits":null,"relationships":null}`,
		`{"characterTraits":[],"dieTraits":[],"callOnTraits":[],"relationships":[]}`,
	} {
		var empty SheetData
		if err := json.Unmarshal([]byte(data), &empty); err != nil {
			t.Fatal(err)
		}
		normalizeRecordLists(&empty)
		if empty.CharacterTraits == nil || empty.DieTraits == nil || empty.CallOnTraits == nil || empty.Relationships == nil {
			t.Fatalf("expected non-null lists for %s", data)
		}
		if len(empty.CharacterTraits)+len(empty.DieTraits)+len(empty.CallOnTraits)+len(empty.Relationships) != 0 {
			t.Fatalf("expected empty lists for %s", data)
		}
	}
}

func TestRecordListsRejectMalformedData(t *testing.T) {
	for _, data := range []string{
		`{"characterTraits":42}`, `{"dieTraits":{}}`, `{"callOnTraits":[{"name":7}]}`,
		`{"relationships":[{"type":"unknown"}]}`, `{"relationships":false}`,
	} {
		var sheetData SheetData
		if err := json.Unmarshal([]byte(data), &sheetData); err == nil {
			t.Fatalf("expected error for %s", data)
		}
	}
}

func TestRelationshipsDefaultMissingType(t *testing.T) {
	var sheet SheetData
	if err := json.Unmarshal([]byte(`{"relationships":[{"id":"friend","name":"Friend"}]}`), &sheet); err != nil {
		t.Fatal(err)
	}
	normalizeRecordLists(&sheet)
	if sheet.Relationships[0].Type != RelationshipDirect {
		t.Fatalf("missing type = %q, want %q", sheet.Relationships[0].Type, RelationshipDirect)
	}
}

func TestSQLiteStoreRecordListsRoundTrip(t *testing.T) {
	store, err := NewSQLiteStore(":memory:", "")
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()
	sheetData := SheetData{
		CharacterTraits: NamedRecords{{ID: "patient", Name: "Patient", Description: "Waits calmly"}},
		DieTraits:       NamedRecords{{ID: "keen", Name: "Keen Sight", Description: "Sharp eyes"}},
		CallOnTraits:    NamedRecords{{ID: "clever", Name: "Clever", Description: "Quick thinking"}},
	}
	for _, kind := range []RelationshipType{RelationshipDirect, RelationshipCircles, RelationshipNamed,
		RelationshipEnemy, RelationshipReputation, RelationshipAffiliation} {
		sheetData.Relationships = append(sheetData.Relationships, Relationship{
			ID: string(kind), Name: string(kind), Description: "Details", Type: kind,
		})
	}
	created, err := store.Create(Character{SheetData: sheetData})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := store.Update(created.ID, created); err != nil {
		t.Fatal(err)
	}
	loaded, err := store.List()
	if err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(loaded[0].SheetData.Relationships, sheetData.Relationships) ||
		!reflect.DeepEqual(loaded[0].SheetData.CharacterTraits, sheetData.CharacterTraits) ||
		!reflect.DeepEqual(loaded[0].SheetData.DieTraits, sheetData.DieTraits) ||
		!reflect.DeepEqual(loaded[0].SheetData.CallOnTraits, sheetData.CallOnTraits) {
		t.Fatalf("record lists not preserved: %#v", loaded[0].SheetData)
	}
}

func TestSQLiteStoreMigratesTextRecordsAndDoesNotRecreateRemovedTraits(t *testing.T) {
	store, err := NewSQLiteStore(":memory:", "")
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()
	created, err := store.Create(Character{Traits: "Legacy trait"})
	if err != nil {
		t.Fatal(err)
	}
	if len(created.SheetData.CharacterTraits) != 1 || created.SheetData.CharacterTraits[0].Description != "Legacy trait" {
		t.Fatalf("top-level traits not migrated: %#v", created.SheetData.CharacterTraits)
	}
	if _, err := store.db.Exec(`UPDATE characters SET sheet_data = ? WHERE id = ?`,
		`{"characterTraits":"Patient","dieTraits":"Keen Sight","callOnTraits":"Clever","relationships":"Old friend"}`, created.ID); err != nil {
		t.Fatal(err)
	}
	loaded, err := store.List()
	if err != nil {
		t.Fatal(err)
	}
	record := loaded[0]
	if record.SheetData.CharacterTraits[0].Description != "Patient" ||
		record.SheetData.DieTraits[0].Description != "Keen Sight" ||
		record.SheetData.CallOnTraits[0].Description != "Clever" ||
		record.SheetData.Relationships[0].Description != "Old friend" {
		t.Fatalf("stored text not migrated: %#v", record.SheetData)
	}
	record.SheetData.CharacterTraits = NamedRecords{}
	record.SheetData.DieTraits = NamedRecords{}
	record.SheetData.CallOnTraits = NamedRecords{}
	record.SheetData.Relationships = Relationships{}
	if _, err := store.Update(created.ID, record); err != nil {
		t.Fatal(err)
	}
	loaded, err = store.List()
	if err != nil {
		t.Fatal(err)
	}
	empty := loaded[0].SheetData
	if len(empty.CharacterTraits)+len(empty.DieTraits)+len(empty.CallOnTraits)+len(empty.Relationships) != 0 {
		t.Fatalf("removed records recreated: %#v", empty)
	}
}
