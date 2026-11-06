# web/src/pages/CharacterSheet/AttributesTab/

Stats and attributes are fixed `Ability` slots (see the [API model](../../../../../api/internal/characters/index.md)), rendered with `AbilityRecord`.

## Calculated stats

`DerivedStats/` shows values computed in the browser and never stored (`derived.ts`):

- Reflexes = floor((Perception + Agility + Speed) / 3)
- Mortal Wound = floor((Power + Forte) / 2) + 6
- Hesitation = 10 - Will

Each has a small dice button (`DiceButton small`) that opens the roller with the value as the exponent and no advancement tracking. The wound penalty applies to Reflexes only. `AttributesTab` passes `arthaPool`, `onArthaPoolChange` and `woundPenalty` down.
