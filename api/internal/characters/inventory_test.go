package characters

import (
	"encoding/json"
	"reflect"
	"testing"
)

func TestInventoryDecoding(t *testing.T) {
	tests := []struct {
		name string
		json string
		want Inventory
	}{
		{"legacy text", `"Map and lantern\nTwo ropes"`, Inventory{{
			ID: "legacy-inventory", Name: "Imported inventory", Description: "Map and lantern\nTwo ropes", Quantity: 1,
		}}},
		{"empty text", `""`, Inventory{}},
		{"null", `null`, Inventory{}},
		{"empty list", `[]`, Inventory{}},
		{"items", `[{"id":"rope","name":"Rope","description":"Long rope","quantity":3}]`,
			Inventory{{ID: "rope", Name: "Rope", Description: "Long rope", Quantity: 3}}},
		{"negative quantity", `[{"id":"rope","quantity":-1}]`, Inventory{{ID: "rope", Quantity: 0}}},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			var inventory Inventory
			if err := json.Unmarshal([]byte(test.json), &inventory); err != nil {
				t.Fatal(err)
			}
			inventory = normalizeInventory(inventory)
			if !reflect.DeepEqual(inventory, test.want) {
				t.Fatalf("inventory = %#v, want %#v", inventory, test.want)
			}
			data, err := json.Marshal(inventory)
			if err != nil {
				t.Fatal(err)
			}
			var reloaded Inventory
			if err := json.Unmarshal(data, &reloaded); err != nil {
				t.Fatal(err)
			}
			if !reflect.DeepEqual(reloaded, test.want) {
				t.Fatalf("round-trip inventory = %#v, want %#v", reloaded, test.want)
			}
		})
	}
}

func TestInventoryRejectsInvalidJSON(t *testing.T) {
	for _, data := range []string{`42`, `{}`, `[{"quantity":1.5}]`, `[{"quantity":"two"}]`} {
		var inventory Inventory
		if err := json.Unmarshal([]byte(data), &inventory); err == nil {
			t.Fatalf("expected error for %s", data)
		}
	}
}

func TestSQLiteStoreMigratesInventoryText(t *testing.T) {
	store, err := NewSQLiteStore(":memory:", "")
	if err != nil {
		t.Fatal(err)
	}
	defer store.Close()
	created, err := store.Create(Character{Name: "Mara"})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := store.db.Exec(`UPDATE characters SET sheet_data = ? WHERE id = ?`,
		`{"inventory":"Map and lantern\nTwo ropes"}`, created.ID); err != nil {
		t.Fatal(err)
	}
	characters, err := store.List()
	if err != nil {
		t.Fatal(err)
	}
	want := Inventory{{
		ID: "legacy-inventory", Name: "Imported inventory", Description: "Map and lantern\nTwo ropes", Quantity: 1,
	}}
	if !reflect.DeepEqual(characters[0].SheetData.Inventory, want) {
		t.Fatalf("migrated inventory = %#v", characters[0].SheetData.Inventory)
	}
	if _, err := store.Update(created.ID, characters[0]); err != nil {
		t.Fatal(err)
	}
	characters, err = store.List()
	if err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(characters[0].SheetData.Inventory, want) {
		t.Fatalf("saved inventory = %#v", characters[0].SheetData.Inventory)
	}
	characters[0].SheetData.Inventory = Inventory{}
	if _, err := store.Update(created.ID, characters[0]); err != nil {
		t.Fatal(err)
	}
	characters, err = store.List()
	if err != nil {
		t.Fatal(err)
	}
	if len(characters[0].SheetData.Inventory) != 0 {
		t.Fatal("removed imported inventory was recreated")
	}
}
