package characters

import (
	"encoding/json"
	"strconv"
	"strings"
)

const (
	ShadeBlack = "black"
	ShadeGrey  = "grey"
	ShadeWhite = "white"

	maxExponent       = 10
	maxAdvancement    = 10
	maxArtha          = 99
	injuryLevels      = 16
	maxWoundsPerLevel = 3
)

// Ability is a stat, attribute, or skill: all share the same record shape.
type Ability struct {
	ID          string      `json:"id"`
	Name        string      `json:"name"`
	Exponent    int         `json:"exponent"`
	Shade       string      `json:"shade"`
	SkipRoutine bool        `json:"skipRoutine"`
	Open        bool        `json:"open"`
	Advancement Advancement `json:"advancement"`
	Artha       Artha       `json:"artha"`
}

type Advancement struct {
	Routine     int `json:"routine"`
	Difficult   int `json:"difficult"`
	Challenging int `json:"challenging"`
}

type Artha struct {
	Fate    int `json:"fate"`
	Persona int `json:"persona"`
	Deed    int `json:"deed"`
}

// UnmarshalJSON accepts records saved before the structured shape existed,
// where exponent was a string and advancement/artha were free text.
func (a *Ability) UnmarshalJSON(data []byte) error {
	var raw struct {
		ID          string          `json:"id"`
		Name        string          `json:"name"`
		Exponent    json.RawMessage `json:"exponent"`
		Shade       string          `json:"shade"`
		SkipRoutine bool            `json:"skipRoutine"`
		Open        bool            `json:"open"`
		Advancement json.RawMessage `json:"advancement"`
		Artha       json.RawMessage `json:"artha"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}
	a.ID, a.Name, a.Shade, a.SkipRoutine, a.Open = raw.ID, raw.Name, raw.Shade, raw.SkipRoutine, raw.Open
	a.Exponent = parseExponent(raw.Exponent)
	a.Advancement = Advancement{}
	_ = json.Unmarshal(raw.Advancement, &a.Advancement)
	a.Artha = Artha{}
	_ = json.Unmarshal(raw.Artha, &a.Artha)
	return nil
}

func parseExponent(raw json.RawMessage) int {
	var number int
	if json.Unmarshal(raw, &number) == nil {
		return number
	}
	var text string
	if json.Unmarshal(raw, &text) == nil {
		if parsed, err := strconv.Atoi(strings.TrimSpace(text)); err == nil {
			return parsed
		}
	}
	return 0
}

func normalizeAbilities(abilities []Ability) []Ability {
	if abilities == nil {
		return []Ability{}
	}
	for i := range abilities {
		ability := &abilities[i]
		ability.Exponent = clamp(ability.Exponent, maxExponent)
		if ability.Shade != ShadeGrey && ability.Shade != ShadeWhite {
			ability.Shade = ShadeBlack
		}
		ability.Advancement.Routine = clamp(ability.Advancement.Routine, maxAdvancement)
		ability.Advancement.Difficult = clamp(ability.Advancement.Difficult, maxAdvancement)
		ability.Advancement.Challenging = clamp(ability.Advancement.Challenging, maxAdvancement)
		ability.Artha.Fate = clamp(ability.Artha.Fate, maxArtha)
		ability.Artha.Persona = clamp(ability.Artha.Persona, maxArtha)
		ability.Artha.Deed = clamp(ability.Artha.Deed, maxArtha)
	}
	return abilities
}

func clamp(value, max int) int {
	if value < 0 {
		return 0
	}
	if value > max {
		return max
	}
	return value
}
