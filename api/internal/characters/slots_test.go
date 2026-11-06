package characters

import "testing"

func TestNormalizeStatsAndAttributesFixesSlots(t *testing.T) {
	var sheetData SheetData
	normalizeSheetData(&sheetData)

	wantStats := []string{"Will", "Power", "Agility", "Perception", "Forte", "Speed"}
	if len(sheetData.Stats) != len(wantStats) {
		t.Fatalf("stats = %d, want %d", len(sheetData.Stats), len(wantStats))
	}
	for i, name := range wantStats {
		stat := sheetData.Stats[i]
		if stat.Name != name || !stat.SkipRoutine {
			t.Fatalf("stat %d = %#v, want %s without routine", i, stat, name)
		}
	}
	wantAttributes := []string{"Health", "Steel", "Circles", "Resources", "", ""}
	if len(sheetData.Attributes) != len(wantAttributes) {
		t.Fatalf("attributes = %d, want %d", len(sheetData.Attributes), len(wantAttributes))
	}
	for i, name := range wantAttributes {
		attribute := sheetData.Attributes[i]
		if attribute.Name != name || attribute.SkipRoutine {
			t.Fatalf("attribute %d = %#v, want %q counting routine", i, attribute, name)
		}
	}
}

func TestNormalizeStatsAndAttributesForcesFixedNames(t *testing.T) {
	sheetData := SheetData{
		Stats:      []Ability{{ID: "will", Name: "Renamed", Exponent: 5}},
		Attributes: []Ability{{ID: "health", Name: "Renamed", Exponent: 6}, {ID: "custom-2", Name: "Hatred", Exponent: 2}},
	}
	normalizeSheetData(&sheetData)
	if sheetData.Stats[0].Name != "Will" || sheetData.Stats[0].Exponent != 5 {
		t.Fatalf("will = %#v", sheetData.Stats[0])
	}
	if sheetData.Attributes[0].Name != "Health" || sheetData.Attributes[0].Exponent != 6 {
		t.Fatalf("health = %#v", sheetData.Attributes[0])
	}
	if sheetData.Attributes[5].Name != "Hatred" || sheetData.Attributes[4].Name != "" {
		t.Fatalf("custom slots = %#v", sheetData.Attributes[4:])
	}
}

func TestNormalizeStatsAndAttributesMigratesLegacyStatuses(t *testing.T) {
	sheetData := SheetData{LegacyStatuses: []Ability{
		{ID: "a", Name: "agility", Exponent: 4},
		{ID: "b", Name: "Health", Exponent: 7},
		{ID: "c", Name: "Grief", Exponent: 2},
		{ID: "d", Name: "Wonder", Exponent: 3},
		{ID: "e", Name: "Extra", Exponent: 1},
	}}
	normalizeSheetData(&sheetData)
	if sheetData.Stats[2].Name != "Agility" || sheetData.Stats[2].Exponent != 4 {
		t.Fatalf("agility = %#v", sheetData.Stats[2])
	}
	if sheetData.Attributes[0].Exponent != 7 {
		t.Fatalf("health = %#v", sheetData.Attributes[0])
	}
	if sheetData.Attributes[4].Name != "Grief" || sheetData.Attributes[5].Name != "Wonder" {
		t.Fatalf("custom slots = %#v", sheetData.Attributes[4:])
	}
	if sheetData.LegacyStatuses != nil {
		t.Fatal("legacy statuses should be cleared after migration")
	}
}
