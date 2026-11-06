package characters

import "testing"

func TestNormalizeArmor(t *testing.T) {
	armor := normalizeArmor(Armor{
		Pieces: []ArmorPiece{
			{ID: "shield", Type: "Wood", Marked: 9},
			{ID: "head", Type: "Helm", Marked: 3},
			{ID: "bogus", Type: "x"},
		},
		Clumsy: ClumsyWeight{Stealthy: 2, Swimming: 99, Speed: -1},
	})
	if len(armor.Pieces) != 7 {
		t.Fatalf("want 7 pieces, got %d", len(armor.Pieces))
	}
	order := []string{"head", "torso", "rightArm", "leftArm", "rightLeg", "leftLeg", "shield"}
	for i, id := range order {
		if armor.Pieces[i].ID != id {
			t.Fatalf("piece %d = %s, want %s", i, armor.Pieces[i].ID, id)
		}
	}
	if armor.Pieces[0].Type != "Helm" || armor.Pieces[0].Marked != 3 {
		t.Fatalf("head = %+v", armor.Pieces[0])
	}
	if armor.Pieces[6].Marked != 5 {
		t.Fatalf("shield marks should cap at 5: %+v", armor.Pieces[6])
	}
	if armor.Clumsy.Stealthy != 2 || armor.Clumsy.Swimming != maxClumsy || armor.Clumsy.Speed != 0 {
		t.Fatalf("clumsy = %+v", armor.Clumsy)
	}
}
