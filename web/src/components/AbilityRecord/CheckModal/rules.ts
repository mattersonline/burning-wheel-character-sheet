import type { Advancement, Artha, Shade } from '../../../api/characters'

// Lowest die face that counts as a success for each shade.
export const successThreshold: Record<Shade, number> = { black: 4, grey: 3, white: 2 }

export type PoolInput = {
  exponent: number
  goodArgument: boolean
  // Persona points spent on this check, each adding a die.
  persona: number
  deeds: boolean
  extraDice: number
  // Dice lost to wounds; applied before artha.
  woundDice?: number
}

// What a character's wounds do to checks on abilities that wounds affect.
export type WoundPenalty = {
  dice: number
  obstacle: number
  // A mortal wound means no checks can be made.
  incapacitated: boolean
}

export type Pool = {
  // Dice from the ability itself, a good argument and manual extras; no artha.
  base: number
  // Dice added by persona and deeds.
  artha: number
  total: number
}

// The rules allow at most three persona points on one check.
export const maxPersonaPerCheck = 3

// Each click on the persona button adds a point; past the limit it wraps back to none.
export const nextPersona = (current: number, available: number) =>
  current >= Math.min(maxPersonaPerCheck, available) ? 0 : current + 1

// Persona points add a die each, then a deeds point doubles the whole pool. Wounds can push
// the pool below zero; it cannot be rolled until it is positive, and deeds only doubles a
// positive pool.
export const calculatePool = (input: PoolInput): Pool => {
  const base =
    input.exponent + (input.goodArgument ? 1 : 0) + input.extraDice - (input.woundDice ?? 0)
  const withPersona = base + input.persona
  const total = input.deeds && withPersona > 0 ? withPersona * 2 : withPersona
  return { base, artha: total - base, total }
}

export type AdvancementKind = keyof Advancement

export const advancementSlots: Record<AdvancementKind, number> = {
  routine: 4,
  difficult: 4,
  challenging: 3,
}

// Smallest margin (dice minus obstacle) that makes a test routine, by pool size.
const routineMargin = (base: number) => {
  if (base >= 7) {
    return 3
  }
  if (base >= 4) {
    return 2
  }
  return 1
}

// Compares the obstacle with the dice before artha. A margin below zero is
// challenging, a margin under the routine margin is difficult, anything more is
// routine. One die against obstacle 1 is routine or difficult; it is routine
// unless the ability never advances from routine tests (stats). Routine tests
// on such abilities return null.
export const classifyTest = ({
  obstacle,
  base,
  skipRoutine,
}: {
  obstacle: number
  base: number
  skipRoutine: boolean
}): AdvancementKind | null => {
  if (base < 1 || obstacle < 1) {
    return null
  }
  if (obstacle > base) {
    return 'challenging'
  }
  if (base === 1) {
    return skipRoutine ? 'difficult' : 'routine'
  }
  if (base - obstacle >= routineMargin(base)) {
    return skipRoutine ? null : 'routine'
  }
  return 'difficult'
}

// Returns the advancement with one more test recorded, capped at its slot count.
export const recordAdvancement = (
  advancement: Advancement,
  kind: AdvancementKind,
): Advancement => ({
  ...advancement,
  [kind]: Math.min(advancementSlots[kind], advancement[kind] + 1),
})

export const isSuccessFace = (face: number, shade: Shade) => face >= successThreshold[shade]

// Beginner's luck (testing a skill being learned) doubles the obstacle before wounds add to it.
export const calculateObstacle = (obstacle: number, wounds: WoundPenalty, beginnersLuck = false) =>
  (beginnersLuck ? obstacle * 2 : obstacle) + wounds.obstacle

// A skill being learned needs 10 minus its root stat's exponent tests to open (at least 1).
export const learningAptitude = (statExponent: number) => Math.max(1, 10 - statExponent)

export const countSuccesses = (faces: number[], shade: Shade) =>
  faces.filter((face) => isSuccessFace(face, shade)).length

export const rollDie = (random: () => number = Math.random) => Math.floor(random() * 6) + 1

// Artha spent on one ability that earns an epiphany, which raises its shade.
export const epiphanyCost = { deed: 3, persona: 10, fate: 20 }

export const nextShade = (shade: Shade): Shade | null =>
  shade === 'black' ? 'grey' : shade === 'grey' ? 'white' : null

export const epiphanyReady = (artha: Artha, shade: Shade) =>
  nextShade(shade) !== null &&
  artha.deed >= epiphanyCost.deed &&
  artha.persona >= epiphanyCost.persona &&
  artha.fate >= epiphanyCost.fate
