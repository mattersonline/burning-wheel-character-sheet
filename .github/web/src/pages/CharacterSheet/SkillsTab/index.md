# web/src/pages/CharacterSheet/SkillsTab/

Skills are a free-form list of `Ability` records rendered with `AbilityRecord`. Below them are skills being learned.

The hand-and-magic **Open** icon inside the skill name field marks a skill as open-ended, stored as `open` on the ability; it defaults to false for existing skills. Open-ended skill checks and attacks automatically add a die for every six without spending Fate, including sixes rolled on additional dice. This is separate from completing a skill being learned, which still creates a non-open-ended skill.

On an open-ended skill check or attack, one failed die may be tapped to spend one Fate and reroll it, once per check; a resulting six explodes normally.

## Skills being learned

A skill being learned is a `LearningSkill` (`sheetData.learningSkills`: name, stat ID, aptitude, tests recorded). `LearningSkillRow/` renders it as a card and rolls it through the same `CheckModal` with `beginnersLuck`.

- **Aptitude** comes only from the root stat: `learningAptitude` (10 minus the stat's exponent, at least 1). There is no selector; the row derives it from the stat's current exponent and also stores it so the API can cap the tests.
- The pool is the stat's exponent minus wound dice. Good arguments, extra dice, persona, deeds and fate rerolls do not apply.
- The obstacle is doubled (`calculateObstacle` in `CheckModal/rules.ts`), and wound obstacle is added after doubling.
- Success uses the stat's shade (black 4+, grey 3+, white 2+).
- Every roll calls `onRoll` with the advancement kind, classified on the obstacle before doubling (plus wound obstacle) against the stat dice. Routine fills a Tests bubble on the skill; difficult and challenging are recorded on the root stat (`onStatTest`). The Tests bubbles can also be edited by hand.
- When tests reach aptitude, the card's border glows and pulses, its contents fade out, and two buttons appear: **Open skill** moves the skill to the Skills list as a new exponent-1, black-shade record with empty advancement and artha, and **Back** removes the effect (rolling or editing the Tests bubbles brings it back). The roller only reports the skill is ready to open; the card does the conversion.
- A mortal wound blocks testing with the shake.

The Go model and normalization are in the [API docs](../../../../../api/internal/characters/index.md).

## Manual check

1. Add a skill being learned, name it and choose a stat.
2. Roll: the pool equals the stat exponent and the obstacle is doubled.
3. A test fills in after each roll; at aptitude the roller reports the skill as open.
4. Close the roller: the card glows with Open skill and Back; Open skill moves it to Skills with exponent 1.
5. With a mortal wound, the dice button shakes instead of opening.
