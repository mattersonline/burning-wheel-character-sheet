package characters

import "testing"

func TestNormalizeMeleeWeapons(t *testing.T) {
	if got := normalizeMeleeWeapons(nil); got == nil || len(got) != 0 {
		t.Fatalf("nil weapons = %#v", got)
	}
	weapons := normalizeMeleeWeapons([]MeleeWeapon{
		{ID: "a", Shade: "purple", Power: -3, Add: 99, VersusArmor: 2, Speed: 4, Length: "Long"},
		{ID: "b", Shade: ShadeWhite, SkillID: "sword"},
	})
	if weapons[0].Shade != ShadeBlack || weapons[0].Power != 0 || weapons[0].Add != maxWeaponStat {
		t.Fatalf("weapon a = %+v", weapons[0])
	}
	if weapons[0].VersusArmor != 2 || weapons[0].Speed != 4 || weapons[0].Length != "Long" {
		t.Fatalf("weapon a fields = %+v", weapons[0])
	}
	if weapons[1].Shade != ShadeWhite || weapons[1].SkillID != "sword" {
		t.Fatalf("weapon b = %+v", weapons[1])
	}
}

func TestNormalizeRangedWeapons(t *testing.T) {
	if got := normalizeRangedWeapons(nil); got == nil || len(got) != 0 {
		t.Fatalf("nil weapons = %#v", got)
	}
	weapons := normalizeRangedWeapons([]RangedWeapon{
		{ID: "a", Shade: "odd", MaxRange: "250 paces", Power: 5, OptimalDice: -1, Dof: "SSMMII"},
		{ID: "b", Shade: ShadeGrey, Kind: RangedThrown, Power: 3, Dof: "IMMMSS", MaxRange: "long"},
		{ID: "c", Kind: "bogus", Dof: "IIIIIX"},
	})
	a, b, c := weapons[0], weapons[1], weapons[2]
	if a.Shade != ShadeBlack || a.MaxRange != "250 paces" || a.OptimalDice != 0 {
		t.Fatalf("weapon a = %+v", a)
	}
	if a.Kind != RangedMissile || a.Power != 0 {
		t.Fatalf("missile weapons have no power: %+v", a)
	}
	if a.Dof != DefaultDof {
		t.Fatalf("decreasing dof should reset: %+v", a)
	}
	if b.Shade != ShadeGrey || b.Kind != RangedThrown || b.Power != 3 || b.Dof != "IMMMSS" {
		t.Fatalf("weapon b = %+v", b)
	}
	if c.Kind != RangedMissile || c.Dof != DefaultDof {
		t.Fatalf("weapon c = %+v", c)
	}

	damage := normalizeRangedWeapons([]RangedWeapon{
		{Kind: RangedMissile, Incidental: 3, Mark: 500, Superb: -2, Dof: DefaultDof},
		{Kind: RangedThrown, Incidental: 3, Mark: 4, Superb: 5, Dof: DefaultDof},
	})
	if m := damage[0]; m.Incidental != 3 || m.Mark != maxWeaponDamage || m.Superb != 0 {
		t.Fatalf("missile damage should be kept and clamped: %+v", m)
	}
	if th := damage[1]; th.Incidental != 0 || th.Mark != 0 || th.Superb != 0 {
		t.Fatalf("thrown damage comes from power: %+v", th)
	}
}
