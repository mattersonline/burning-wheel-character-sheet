import type { MeleeWeapon, RangedWeapon } from '../../../api/characters'

export type MeleeDamage = { incidental: number; mark: number; superb: number }

// Scale the combined wielder and weapon power, rounding Incidental up and Superb down.
export const meleeDamage = (attackerPower: number, weaponPower: number): MeleeDamage => ({
  incidental: Math.ceil((attackerPower + weaponPower) / 2),
  mark: attackerPower + weaponPower,
  superb: Math.floor((attackerPower + weaponPower) * 1.5),
})

export const weaponDamage = (weapon: MeleeWeapon, attackerPower: number) =>
  meleeDamage(attackerPower, weapon.power)

// A DoF string lists the hit level for each face of the die, such as "IIMMSS".
const dofOrder = ['I', 'M', 'S'] as const

// Faces that give each level, shown as "1-3"; a level no face gives shows "-".
export const dofRanges = (dof: string) => {
  const range = (level: string) => {
    const first = dof.indexOf(level)
    if (first < 0) {
      return '-'
    }
    const last = dof.lastIndexOf(level) + 1
    return first + 1 === last ? `${last}` : `${first + 1}-${last}`
  }
  return { incidental: range('I'), mark: range('M'), superb: range('S') }
}

// Moves one face to the next level (I to M to S and back to I). Faces before it drop and
// faces after it rise as needed so the levels never decrease along the die.
export const cycleDof = (dof: string, face: number) => {
  const levels = [...dof].map((letter) => dofOrder.indexOf(letter as (typeof dofOrder)[number]))
  const next = (levels[face] + 1) % dofOrder.length
  return levels
    .map((level, index) =>
      index < face ? Math.min(level, next) : index > face ? Math.max(level, next) : next,
    )
    .map((level) => dofOrder[level])
    .join('')
}

// Thrown weapons add their power to the thrower's; missile weapons carry their own I/M/S.
export const rangedDamage = (weapon: RangedWeapon, attackerPower: number): MeleeDamage =>
  weapon.kind === 'thrown'
    ? meleeDamage(attackerPower, weapon.power)
    : { incidental: weapon.incidental, mark: weapon.mark, superb: weapon.superb }

// Extra successes raise the die of fortune roll: any extra is +1, double the obstacle
// is +2 and triple is +3.
export const dofBonus = (successes: number, obstacle: number) => {
  if (successes >= obstacle * 3) {
    return 3
  }
  if (successes >= obstacle * 2) {
    return 2
  }
  return successes > obstacle ? 1 : 0
}

// The hit level a ranged die gives once the bonus is added; faces past 6 count as 6.
export const rangedLevel = (dof: string, die: number, bonus: number): DamageLevel => {
  const letter = dof[Math.min(6, die + bonus) - 1]
  return letter === 'S' ? 'superb' : letter === 'M' ? 'mark' : 'incidental'
}

export const hitLocations = {
  arm: { label: 'Arm', cost: 1 },
  leg: { label: 'Leg', cost: 1 },
  head: { label: 'Head', cost: 2 },
} as const
export type HitLocation = keyof typeof hitLocations

export const damageLevels = ['incidental', 'mark', 'superb'] as const
export type DamageLevel = (typeof damageLevels)[number]

// Successes needed to raise a hit by one level (I to M, then M to S); never free.
export const upgradeCost = (add: number) => Math.max(1, add)

// Successes beyond the obstacle, which can be spent on aiming or upgrading the hit.
export const extraSuccesses = (successes: number, obstacle: number) =>
  Math.max(0, successes - obstacle)

export const successesLeft = (extra: number, upgrades: number, aim: number, add: number) =>
  extra - upgrades * upgradeCost(add) - aim
