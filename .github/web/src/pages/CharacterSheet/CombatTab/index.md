# web/src/pages/CharacterSheet/CombatTab/

The injury grid (`InjuryGrid/`) and its rules (`injuries.ts`, tested).

## Grid

B1-B16 run across the top, a tolerance row sits beneath (Su/Li/Mi/Se/Tr/Mo, marked at the B level where each starts), and three tappable wound bubbles sit under each B level. Wounds taken are stored in `sheetData.injuryWounds` (16 counts of 0-3, clamped in Go `normalizeInjuryWounds`). Tapping the last filled bubble clears it.

## Thresholds

Derived from Forte and Mortal Wound: Su = floor(Forte/2)+1, Mo = mortal wound, and Li/Mi/Se/Tr sit between with gaps of at most ceil(Forte/2), spare room going to the lowest gaps.

## Wound penalties

`calculateWoundPenalty` in `injuries.ts`; penalties are cumulative:

- 1-3 superficial wounds add +1 obstacle; 4 or more superficial wounds cost 1 die instead.
- Each light, midi, severe and traumatic wound costs 1, 2, 3 and 4 dice.
- Any mortal wound means no checks: the dice button shakes instead of opening the roller.

The penalty applies only to stats, skills, Steel and Reflexes. `SkillsTab` and `AttributesTab` pass `woundPenalty` to `AbilityRecord` (omitted for Health, Circles, Resources and emotional attributes). See the [CheckModal](../../../components/AbilityRecord/CheckModal/index.md) for how it is applied.

## Melee weapons

`MeleeWeapons/` lists weapons stored in `sheetData.meleeWeapons` (Go `MeleeWeapon` in `weapon.go`, numbers clamped 0-20, shade defaults to black). Each has name, shade, weapon power, Add, VA (versus armor), WS (weapon speed) and length.

- `meleeDamage` in `weapons.ts` (tested) derives I/M/S from combined power P = wielder's Power + weapon power: I = ceil(P/2), M = P, S = floor(P x 1.5). Melee and thrown weapons share this calculation. These values are not stored.
- Add is the successes needed to step I to M, and again M to S (or spend them to aim). WS is the strikes allowed in a script before another action.

### Attack roller

`MeleeWeapons/AttackModal/` is the dice roller opened by each weapon's dice button. It is separate from `CheckModal` (it reuses its `Die`, `Confetti`, `rules.ts` and styles) so the generic check stays simple.
- The first open asks for an attack skill from `sheetData.skillRecords`; the choice is stored on the weapon as `skillId` and a "Change skill" button re-opens the picker. A missing skill re-prompts.
- The pool uses the skill's exponent and shade, plus wound dice and wound obstacle, good argument, extra dice, persona (click the button again for each extra point: one die per point, up to 3 per check and no more than the pool holds; clicking past the limit resets it to none) and deeds. Persona, deeds and fate are deducted from `arthaPool` and recorded on the skill. The test is not recorded toward advancement automatically; after the roll, a "Record a … test" button does it once per roll.
- An open-ended attack skill automatically adds a new die for each six without spending Fate. For other skills, tapping a six spends Fate and adds a die; the original six remains in the pool.
- For an open-ended attack, tapping one failed die spends one Fate to reroll it in place, once per attack. Changing the result resets any allocated extra successes, aim, location and die of fortune.
- After a hit, extra successes (`extraSuccesses`) are spent on upgrading I to M to S (`upgradeCost` = the weapon's Add, at least 1) or on aiming (1 success each) or aiming at a distant target (2 successes each); a blow can only be aimed once, so the two aim options are mutually exclusive (tracked only, with no further effect). Rerolling resets the spending.
- Ranged weapons (missile and thrown) use the same modal with `rules.kind = 'ranged'` (the modal takes `rules`, `damage` and `onSkillChosen`, so it is not tied to a weapon type); the skill is stored on `RangedWeapon.skillId`. After a hit, extra successes can target a body part (arm or leg 1, head 2; one location, tracked only), then "Roll the die of fortune" rolls one die. The DoF bonus (`dofBonus`: any extra success +1, double the obstacle +2, triple +3) is computed from the successes left after the location cost, added to the die (capped at 6) and looked up in the weapon's `dof` (`rangedLevel`). The location and die lock once the die is rolled; "Roll again" resets them.

## Ranged weapons

`RangedWeapons/` stores `sheetData.rangedWeapons` (Go `RangedWeapon`). Same as melee but with no Add, no length and no WS (weapon speed), and with a free-text max range, optimal dice, extreme dice and DoF. Each weapon is a `kind`, `missile` or `thrown`, chosen by which Add button created it ("Add missile weapon" / "Add thrown weapon") and fixed afterward, shown as a static "Type" label. Only thrown weapons have a Power stat, which `rangedDamage` in `weapons.ts` adds to the thrower's Power for I/M/S. Missile weapons carry their own I/M/S damage (`incidental`, `mark`, `superb`), entered directly as number inputs in the card header and not derived from the thrower's Power; the Go model forces a missile weapon's power to 0 and zeroes thrown weapons' stored I/M/S.

Missile I/M/S inputs retain numeric input behavior but hide native spin buttons so their values stay centered, including in WebKit.

- DoF is one six-letter string, `dof`, with the hit level for each die face (e.g. `IIMMSS` = 1-2 Incidental, 3-4 Mark, 5-6 Superb). Letters never decrease along the die; the Go `validDof` resets anything else to `IIMMSS`. In the UI each face is a button that cycles its level (`cycleDof`, which keeps the order valid), and `dofRanges` formats the faces as ranges (e.g. 1-2 / 3-4 / 5-6) under each I/M/S value.
- After a successful hit, one die decides I, M or S. Extra successes add to that die: 1 extra is +1, double the obstacle +2, triple +3. The attack roller does this roll (see above).

`Armor/` edits `sheetData.armor` (Go `Armor` in `armor.go`, TS `Armor` in `types.ts`). Piece cards use an auto-fill grid (one column on narrow screens) with a fixed bubble column and a full-width Type input. Weapon cards group their fields into explicit rows (`.bottom` containing `.row`s: stats, then DoF, then max range/length with Remove) instead of one wrapping flex list. It has seven pieces in fixed order: head (6 bubbles), torso (7), right arm (6), left arm (6), right leg (6), left leg (6), shield (5). Each piece has a Type text box and a `BubbleTrack` of marked bubbles; marks are a plain count with no damage rules. A "Clumsy weight" row holds steppers (0-20) for Stealthy, Climbing, Perception, Fatigue, Speed, Shooting, Agility and Swimming. Clumsy weight is stored only and is not yet applied to checks. `normalizeArmor` rebuilds the pieces in order and clamps marks and clumsy values.
