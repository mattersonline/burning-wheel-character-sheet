package characters

// armorLocations lists the armor locations in sheet order with their bubble counts.
var armorLocations = []struct {
	ID      string
	Bubbles int
}{
	{"head", 6},
	{"torso", 7},
	{"rightArm", 6},
	{"leftArm", 6},
	{"rightLeg", 6},
	{"leftLeg", 6},
	{"shield", 5},
}

const maxClumsy = 20

// ArmorPiece is the armor worn at one location. Marked counts the filled bubbles.
type ArmorPiece struct {
	ID     string `json:"id"`
	Type   string `json:"type"`
	Marked int    `json:"marked"`
}

// ClumsyWeight is the extra obstacle armor adds to each affected skill.
type ClumsyWeight struct {
	Stealthy   int `json:"stealthy"`
	Climbing   int `json:"climbing"`
	Perception int `json:"perception"`
	Fatigue    int `json:"fatigue"`
	Speed      int `json:"speed"`
	Shooting   int `json:"shooting"`
	Agility    int `json:"agility"`
	Swimming   int `json:"swimming"`
}

type Armor struct {
	Pieces []ArmorPiece `json:"pieces"`
	Clumsy ClumsyWeight `json:"clumsy"`
}

// normalizeArmor always yields one piece per location, in sheet order, with the
// marked bubbles limited to that location's count.
func normalizeArmor(armor Armor) Armor {
	pieces := make([]ArmorPiece, len(armorLocations))
	for i, location := range armorLocations {
		pieces[i] = ArmorPiece{ID: location.ID}
		for _, saved := range armor.Pieces {
			if saved.ID == location.ID {
				pieces[i].Type = saved.Type
				pieces[i].Marked = min(clamp(saved.Marked, location.Bubbles), location.Bubbles)
			}
		}
	}
	armor.Pieces = pieces
	clumsy := &armor.Clumsy
	for _, value := range []*int{
		&clumsy.Stealthy, &clumsy.Climbing, &clumsy.Perception, &clumsy.Fatigue,
		&clumsy.Speed, &clumsy.Shooting, &clumsy.Agility, &clumsy.Swimming,
	} {
		*value = clamp(*value, maxClumsy)
	}
	return armor
}
