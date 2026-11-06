package characters

// MeleeWeapon is one melee weapon entry. The I/M/S damage values are derived
// from the wielder's Power on the client and are not stored.
type MeleeWeapon struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Shade string `json:"shade"`
	// Power is the weapon power added to the wielder's Power for damage.
	Power int `json:"power"`
	// Add is the successes needed to step up from I to M, and again from M to S.
	Add int `json:"add"`
	// VersusArmor says how well an attack penetrates armor.
	VersusArmor int `json:"versusArmor"`
	// Speed is the weapon speed: strikes allowed in a script before another action.
	Speed  int    `json:"speed"`
	Length string `json:"length"`
	// SkillID is the skill record last chosen for attacking with this weapon.
	SkillID string `json:"skillId"`
}

const maxWeaponStat = 20

// maxWeaponDamage bounds a missile weapon's directly entered I/M/S damage.
const maxWeaponDamage = 99

func normalizeMeleeWeapons(weapons []MeleeWeapon) []MeleeWeapon {
	if weapons == nil {
		return []MeleeWeapon{}
	}
	for i := range weapons {
		weapon := &weapons[i]
		if weapon.Shade != ShadeGrey && weapon.Shade != ShadeWhite {
			weapon.Shade = ShadeBlack
		}
		weapon.Power = clamp(weapon.Power, maxWeaponStat)
		weapon.Add = clamp(weapon.Add, maxWeaponStat)
		weapon.VersusArmor = clamp(weapon.VersusArmor, maxWeaponStat)
		weapon.Speed = clamp(weapon.Speed, maxWeaponStat)
	}
	return weapons
}

const (
	RangedMissile = "missile"
	RangedThrown  = "thrown"
	// DefaultDof is the default die-face layout: 1-2 Incidental, 3-4 Mark, 5-6 Superb.
	DefaultDof = "IIMMSS"
)

// RangedWeapon is one ranged weapon entry. It has no Add; after a successful
// hit a single die decides Incidental, Mark or Superb using the DoF faces.
type RangedWeapon struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Shade string `json:"shade"`
	// Kind is missile or thrown. Only thrown weapons have a Power that adds to damage.
	Kind        string `json:"kind"`
	Power       int    `json:"power"`
	VersusArmor int    `json:"versusArmor"`
	// MaxRange is free text, such as "250 paces".
	MaxRange string `json:"maxRange"`
	// OptimalDice and ExtremeDice are the dice added or removed at those ranges.
	OptimalDice int `json:"optimalDice"`
	ExtremeDice int `json:"extremeDice"`
	// Dof lists the result for each face of the die, such as "IIMMSS": six letters
	// of I, M or S that never decrease.
	Dof string `json:"dof"`
	// Incidental, Mark and Superb are the weapon's own damage; only missile weapons
	// use them, since thrown weapons build damage from the thrower's Power.
	Incidental int `json:"incidental"`
	Mark       int `json:"mark"`
	Superb     int `json:"superb"`
	// SkillID is the skill record used to attack with this weapon; empty until chosen.
	SkillID string `json:"skillId"`
}

func validDof(dof string) bool {
	if len(dof) != 6 {
		return false
	}
	last := byte('I')
	for i := 0; i < len(dof); i++ {
		c := dof[i]
		if (c != 'I' && c != 'M' && c != 'S') || c < last {
			return false
		}
		last = c
	}
	return true
}

func normalizeRangedWeapons(weapons []RangedWeapon) []RangedWeapon {
	if weapons == nil {
		return []RangedWeapon{}
	}
	for i := range weapons {
		weapon := &weapons[i]
		if weapon.Shade != ShadeGrey && weapon.Shade != ShadeWhite {
			weapon.Shade = ShadeBlack
		}
		if weapon.Kind != RangedThrown {
			weapon.Kind = RangedMissile
		}
		weapon.Power = clamp(weapon.Power, maxWeaponStat)
		if weapon.Kind == RangedMissile {
			weapon.Power = 0
			weapon.Incidental = clamp(weapon.Incidental, maxWeaponDamage)
			weapon.Mark = clamp(weapon.Mark, maxWeaponDamage)
			weapon.Superb = clamp(weapon.Superb, maxWeaponDamage)
		} else {
			weapon.Incidental, weapon.Mark, weapon.Superb = 0, 0, 0
		}
		weapon.VersusArmor = clamp(weapon.VersusArmor, maxWeaponStat)
		weapon.OptimalDice = clamp(weapon.OptimalDice, maxWeaponStat)
		weapon.ExtremeDice = clamp(weapon.ExtremeDice, maxWeaponStat)
		if !validDof(weapon.Dof) {
			weapon.Dof = DefaultDof
		}
	}
	return weapons
}
