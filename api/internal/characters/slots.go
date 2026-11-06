package characters

import "strings"

type abilitySlot struct {
	ID   string
	Name string
}

// Every character has these six stats. Stats never count routine tests.
var statSlots = []abilitySlot{
	{"will", "Will"},
	{"power", "Power"},
	{"agility", "Agility"},
	{"perception", "Perception"},
	{"forte", "Forte"},
	{"speed", "Speed"},
}

// Every character has these four fixed attributes plus two custom-named ones.
var fixedAttributeSlots = []abilitySlot{
	{"health", "Health"},
	{"steel", "Steel"},
	{"circles", "Circles"},
	{"resources", "Resources"},
}

var customAttributeSlots = []abilitySlot{
	{"custom-1", ""},
	{"custom-2", ""},
}

// normalizeStatsAndAttributes pins the fixed slots to their names, order and
// routine rule. legacy holds records from the old single "statuses" list;
// they are matched to slots by name, and leftovers fill empty custom slots.
func normalizeStatsAndAttributes(sheetData *SheetData) {
	pool := append(append(append([]Ability{}, sheetData.Stats...), sheetData.Attributes...), sheetData.LegacyStatuses...)
	used := make([]bool, len(pool))
	sheetData.LegacyStatuses = nil

	take := func(slot abilitySlot) (Ability, bool) {
		for i, candidate := range pool {
			if !used[i] && candidate.ID == slot.ID {
				used[i] = true
				return candidate, true
			}
		}
		if slot.Name == "" {
			return Ability{}, false
		}
		for i, candidate := range pool {
			if !used[i] && strings.EqualFold(strings.TrimSpace(candidate.Name), slot.Name) {
				used[i] = true
				return candidate, true
			}
		}
		return Ability{}, false
	}

	build := func(slot abilitySlot, skipRoutine, custom bool) Ability {
		ability, found := take(slot)
		if !found {
			ability = Ability{Exponent: 1}
		}
		ability.ID = slot.ID
		ability.SkipRoutine = skipRoutine
		if !custom {
			ability.Name = slot.Name
		}
		return ability
	}

	stats := make([]Ability, 0, len(statSlots))
	for _, slot := range statSlots {
		stats = append(stats, build(slot, true, false))
	}
	attributes := make([]Ability, 0, len(fixedAttributeSlots)+len(customAttributeSlots))
	for _, slot := range fixedAttributeSlots {
		attributes = append(attributes, build(slot, false, false))
	}
	for _, slot := range customAttributeSlots {
		attributes = append(attributes, build(slot, false, true))
	}

	// Legacy records that matched no slot take over still-unnamed custom slots.
	next := len(fixedAttributeSlots)
	for i, candidate := range pool {
		if used[i] || strings.TrimSpace(candidate.Name) == "" {
			continue
		}
		for next < len(attributes) && attributes[next].Name != "" {
			next++
		}
		if next >= len(attributes) {
			break
		}
		candidate.ID = attributes[next].ID
		candidate.SkipRoutine = false
		attributes[next] = candidate
	}

	sheetData.Stats = normalizeAbilities(stats)
	sheetData.Attributes = normalizeAbilities(attributes)
}
