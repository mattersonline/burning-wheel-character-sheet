package characters

import (
	"encoding/json"
	"reflect"
	"testing"
)

func TestAbilityReadsLegacyRecords(t *testing.T) {
	legacy := `{"id":"will","name":"Will","exponent":"4","color":"#e6ebe4","advancement":"2 routine","arthaSpent":"1 fate"}`
	var got Ability
	if err := json.Unmarshal([]byte(legacy), &got); err != nil {
		t.Fatal(err)
	}
	want := Ability{ID: "will", Name: "Will", Exponent: 4}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("legacy ability = %#v, want %#v", got, want)
	}
}

func TestNormalizeAbilitiesClampsAndDefaults(t *testing.T) {
	abilities := normalizeAbilities([]Ability{{
		Exponent: 40, Shade: "purple",
		Advancement: Advancement{Routine: -2, Difficult: 99, Challenging: 3},
		Artha:       Artha{Fate: -1, Persona: 500, Deed: 2},
	}})
	got := abilities[0]
	if got.Exponent != 10 || got.Shade != ShadeBlack {
		t.Fatalf("exponent/shade = %d/%q", got.Exponent, got.Shade)
	}
	if got.Advancement != (Advancement{Routine: 0, Difficult: 10, Challenging: 3}) {
		t.Fatalf("advancement = %#v", got.Advancement)
	}
	if got.Artha != (Artha{Fate: 0, Persona: 99, Deed: 2}) {
		t.Fatalf("artha = %#v", got.Artha)
	}
	if normalizeAbilities(nil) == nil {
		t.Fatal("nil abilities should normalize to an empty slice")
	}
}
