# web/src/components/AbilityRecord/CheckModal/

The dice roller, a native `<dialog>`. Pure rules live in `rules.ts` and are tested in `rules.test.ts`.

## Rolling

- The pool is exponent + good argument + extra dice, minus wound dice, then persona +1, then deeds doubles a positive pool. The pool may go negative (shown in red) but cannot be rolled until it is positive.
- `Die` components animate and are centered. Success is black 4+, grey 3+, white 2+, shown with confetti, or a shake on failure.
- Tapping an unspent six spends one fate point and rolls an additional die; the original six remains a success. Each six can be used once. An open-ended skill automatically rolls an additional die for each six, including new sixes, without spending Fate. Both skill checks and weapon attacks use the shared dice-pool logic.
- On open-ended checks, tap one failed die to spend one Fate and reroll that die in place. Only one such reroll is allowed per check. Failure is determined by the skill's shade; a rerolled six automatically explodes.
- `DiceRow` is shared by checks and attacks. An added die appears immediately after its source six; existing dice slide to their new positions and the added die drops into place. Reduced-motion mode skips these animations.
- Check and attack dialogs scroll vertically when their contents exceed the viewport; confetti is clipped to the dialog body.
- Persona, deed and fate spent are added to the ability's artha and deducted from `sheetData.arthaPool` (callers pass `arthaPool` and `onArthaPoolChange`). Options the pool cannot afford are disabled.
- If the character is incapacitated, no roll is possible.

## Advancement

Advancement uses the dice before artha against the obstacle:

- 1D: routine (difficult for stats) at obstacle 1, challenging above.
- 2-3D: routine if the obstacle is under the dice, difficult if equal.
- 4-6D: routine if 2+ under, difficult if 0-1 under.
- 7-20D: routine if 3+ under, difficult if 0-2 under.
- Above the dice is always challenging.

Stats never record routine tests. Rolling records the test on the ability's advancement bubbles (capped at 4/4/3), whether or not it succeeds; fate rerolls do not record another.

## Wounds

The optional `woundPenalty` prop (calculated in the [Combat tab](../../../pages/CharacterSheet/CombatTab/index.md)) shows in a red box, subtracts wound dice before artha and adds wound obstacle to the obstacle used for success and advancement.

## Props for other uses

- `tracksAdvancement` (default true): when false, advancement text is hidden and nothing is recorded. The derived-stat roll buttons use this.
- `beginnersLuck`, `onRoll`, `opensSkill`, `statName`: testing a skill being learned. See the [Skills tab](../../../pages/CharacterSheet/SkillsTab/index.md).
