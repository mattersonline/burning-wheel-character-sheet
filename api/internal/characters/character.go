package characters

import (
	"encoding/json"
	"strconv"
	"time"
)

type Character struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Concept   string    `json:"concept"`
	Stock     string    `json:"stock"`
	Age       string    `json:"age"`
	Homeland  string    `json:"homeland"`
	Beliefs   string    `json:"beliefs"`
	Instincts string    `json:"instincts"`
	Traits    string    `json:"traits"`
	Skills    string    `json:"skills"`
	Notes     string    `json:"notes"`
	SheetData SheetData `json:"sheetData"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type SheetData struct {
	Beliefs         []string      `json:"beliefs"`
	SpecialBelief   string        `json:"specialBelief"`
	Instincts       []string      `json:"instincts"`
	CharacterTraits NamedRecords  `json:"characterTraits"`
	DieTraits       NamedRecords  `json:"dieTraits"`
	CallOnTraits    NamedRecords  `json:"callOnTraits"`
	Relationships   Relationships `json:"relationships"`
	Inventory       Inventory     `json:"inventory"`
	Injuries        string        `json:"injuries"`
	// InjuryWounds holds the wounds taken (0-3) at each B level, B1 first.
	InjuryWounds []int     `json:"injuryWounds"`
	Stats        []Ability `json:"stats"`
	Attributes   []Ability `json:"attributes"`
	// LegacyStatuses is read from older saved data and folded into Stats and
	// Attributes on normalize; it is never written back.
	LegacyStatuses []Ability       `json:"statuses,omitempty"`
	SkillRecords   []Ability       `json:"skillRecords"`
	LearningSkills []LearningSkill `json:"learningSkills"`
	MeleeWeapons   []MeleeWeapon   `json:"meleeWeapons"`
	RangedWeapons  []RangedWeapon  `json:"rangedWeapons"`
	Armor          Armor           `json:"armor"`
	// ArthaPool is the artha the character currently has available, as opposed
	// to the per-ability Artha counts, which record what has been spent.
	ArthaPool Artha  `json:"arthaPool"`
	Spells    string `json:"spells"`
	Other     string `json:"other"`
}

type LearningSkill struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	// Stat is a stat ID (will, power, agility, perception, forte, speed).
	Stat string `json:"stat"`
	// Aptitude is the number of tests needed to open the skill.
	Aptitude int `json:"aptitude"`
	// Checks is the number of tests recorded so far.
	Checks int `json:"checks"`
}

// UnmarshalJSON accepts the earlier format, where aptitude was a free-text string.
func (skill *LearningSkill) UnmarshalJSON(data []byte) error {
	var raw struct {
		ID       string          `json:"id"`
		Name     string          `json:"name"`
		Stat     string          `json:"stat"`
		Aptitude json.RawMessage `json:"aptitude"`
		Checks   json.RawMessage `json:"checks"`
	}
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}
	*skill = LearningSkill{
		ID:       raw.ID,
		Name:     raw.Name,
		Stat:     raw.Stat,
		Aptitude: looseInt(raw.Aptitude),
		Checks:   looseInt(raw.Checks),
	}
	return nil
}

// looseInt reads a JSON number or numeric string, returning 0 for anything else.
func looseInt(raw json.RawMessage) int {
	var number int
	if json.Unmarshal(raw, &number) == nil {
		return number
	}
	var text string
	if json.Unmarshal(raw, &text) == nil {
		number, _ = strconv.Atoi(text)
	}
	return number
}
