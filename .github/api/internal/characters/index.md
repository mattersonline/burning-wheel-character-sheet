# api/internal/characters/

The character model and SQLite persistence.

- Keep character fields aligned across the TypeScript `Character` type (`web/src/api/characters/types.ts`), the Go `Character` struct and API responses.
- Structured sheet records live in `sheetData`, shared with the TypeScript `SheetData` type and stored in SQLite as JSON.

## Ability records

Stats, attributes and skills share one `Ability` model (`ability.go`): name, exponent (d6 count), shade (black/grey/white), advancement (routine/difficult/challenging counts), artha spent (fate/persona/deed) and a `skipRoutine` flag. Old free-text records still load through a lenient `UnmarshalJSON`, but their text advancement is dropped.

The `open` boolean marks an open-ended skill and defaults to false for older records. It round-trips through JSON and SQLite; only skill checks and attacks use it for automatic exploding sixes.

## Fixed slots

Every character has six fixed `stats` (Will, Power, Agility, Perception, Forte, Speed; they never count routine tests) and six `attributes`: Health, Steel, Circles, Resources, plus two custom-named slots (`custom-1`, `custom-2`, usually emotional). `slots.go` pins these slots, names, order and the routine rule; the TypeScript copy in `types.ts` must match. Skills remain a free-form list. The old `statuses` list is migrated by name into these slots on read.

## Other sheet data

- `characterTraits`, `dieTraits`, and `callOnTraits` are `NamedRecords` arrays with `id`, `name` and `description`. `relationships` is a `Relationships` array with the same fields plus `type` (`relationship`, `circles`, `namedCircles`, `enemyCircles`, `reputation`, `affiliation`). These categories do not change the fixed Circles ability.
- `records.go` shares the legacy-text decoder with inventory: old strings are preserved verbatim in one imported record's description. Missing/null/empty data becomes `[]`; explicit empty trait arrays never repopulate from the old top-level `traits` field. Missing relationship types default to `relationship`; unknown types produce a JSON decoding error.

- `inventory`: an array of `InventoryItem` records (`inventory.go`), with `id`, `name`, `description` and integer `quantity`. Negative quantities normalize to zero; empty lists serialize as `[]`. Its JSON decoder migrates the old inventory text into one "Imported inventory" item's description (quantity 1), preserving the text exactly. Migration works when reading SQLite or importing legacy JSON, and subsequent saves write the array format.

- `injuryWounds`: 16 counts of 0-3 (B1 first), clamped by `normalizeInjuryWounds`. See the web [Combat tab](../../../web/src/pages/CharacterSheet/CombatTab/index.md).
- `arthaPool`: available fate, persona and deed points. The per-ability `artha` fields record what was spent.
- `learningSkills`: skills being learned (id, name, stat ID, aptitude, tests). `normalizeLearningSkills` keeps aptitude 1-10 and tests no higher than aptitude. `LearningSkill.UnmarshalJSON` still accepts the earlier format where aptitude was text. See the web [Skills tab](../../../web/src/pages/CharacterSheet/SkillsTab/index.md).

## Storage boundary

Characters are stored in a local SQLite database. On first startup, any existing `api/data/characters.json` is imported. SQLite suits local development and a single process, not multi-server hosting. Before public deployment, design authentication, authorization, backups and migrations. The API is not a secure multi-user service, so do not treat local JSON or SQLite storage as suitable for public multi-user deployment.
