# web/src/components/AbilityRecord/

Renders stats, attributes and skills (one shared `Ability` model) as a card: dice button, name, shade, exponent stepper, routine/difficult/challenging bubbles (counts 4/4/3, set in `AbilityRecord.tsx`) and fate/persona/deed artha spent. Keep touch targets about 44px tall.

| Folder | Contents |
| --- | --- |
| [CheckModal/](CheckModal/index.md) | The dice roller, its rules and advancement logic. |

`BubbleTrack/`, `ShadeButton/` and `Stepper/` are small pieces with no extra documentation.

`AbilityRecord` takes `arthaPool` and `onArthaPoolChange` and passes them to the roller. It takes `woundPenalty` only for abilities that wounds affect (stats, skills, Steel); it is omitted for Health, Circles, Resources and emotional attributes.

- **Epiphany:** when an ability has spent 3 deed, 10 persona and 20 fate artha (`epiphanyReady` in `CheckModal/rules.ts`) and is not white, the card glows gold, sparkles and fades its contents. **Raise to <shade>** upgrades the shade and clears the artha spent; **Back** dismisses until artha changes.
