import type { Ability } from '../../../api/characters'
import type { WoundPenalty } from '../../../components/AbilityRecord/CheckModal/rules'
import { calculateDerivedStats } from '../AttributesTab/DerivedStats/derived'

export const injuryColumns = [
  { id: 'su', label: 'Su', name: 'Superficial' },
  { id: 'li', label: 'Li', name: 'Light' },
  { id: 'mi', label: 'Mi', name: 'Midi' },
  { id: 'se', label: 'Se', name: 'Severe' },
  { id: 'tr', label: 'Tr', name: 'Traumatic' },
  { id: 'mo', label: 'Mo', name: 'Mortal' },
] as const

export type InjuryColumnId = (typeof injuryColumns)[number]['id']

export const injuryRows = 16
export const maxWoundsPerLevel = 3

const dicePerWound: Partial<Record<InjuryColumnId, number>> = { li: 1, mi: 2, se: 3, tr: 4 }

// Wounds are cumulative. One to three superficial wounds add 1 to the obstacle; more cost 1 die.
export const calculateWoundPenalty = (stats: Ability[], wounds: number[]): WoundPenalty => {
  const thresholds = calculateInjuryThresholds(stats)
  const counts: Partial<Record<InjuryColumnId, number>> = {}
  for (let level = 1; level <= injuryRows; level += 1) {
    const column = injuryColumnFor(level, thresholds)
    if (column) counts[column] = (counts[column] ?? 0) + (wounds[level - 1] ?? 0)
  }

  const superficial = counts.su ?? 0
  let dice = superficial > 3 ? 1 : 0
  for (const [column, perWound] of Object.entries(dicePerWound)) {
    dice += (counts[column as InjuryColumnId] ?? 0) * (perWound ?? 0)
  }
  return {
    dice,
    obstacle: superficial >= 1 && superficial <= 3 ? 1 : 0,
    incapacitated: (counts.mo ?? 0) > 0,
  }
}

// Tapping the bubble that is already the last one filled clears it; otherwise fill up to it.
export const setWounds = (wounds: number[], level: number, bubble: number): number[] =>
  Array.from({ length: injuryRows }, (_, index) => {
    const current = wounds[index] ?? 0
    if (index !== level - 1) return current
    return current === bubble ? bubble - 1 : bubble
  })

export type InjuryThresholds = Record<InjuryColumnId, number>

// Su and Mo are fixed by Forte and Mortal Wound. Li, Mi, Se and Tr sit between them with
// gaps of at most half Forte rounded up; spare room goes to the lowest gaps so the upper
// columns stay packed against Mo.
export const calculateInjuryThresholds = (stats: Ability[]): InjuryThresholds => {
  const forte = stats.find((stat) => stat.id === 'forte')?.exponent ?? 0
  const superficial = Math.floor(forte / 2) + 1
  const { mortalWound } = calculateDerivedStats(stats)
  const maxGap = Math.max(1, Math.ceil(forte / 2))

  const gaps = [1, 1, 1, 1, 1]
  let spare = mortalWound - superficial - gaps.length
  for (let index = 0; spare > 0 && index < gaps.length * maxGap; index += 1) {
    const slot = index % gaps.length
    if (gaps[slot] < maxGap) {
      gaps[slot] += 1
      spare -= 1
    }
  }

  const [li, mi, se, tr] = gaps.reduce<number[]>((positions, gap) => {
    positions.push((positions.at(-1) ?? superficial) + gap)
    return positions
  }, [])

  return { su: superficial, li, mi, se, tr, mo: mortalWound }
}

// The column a wound of the given B rating falls into, or null when it is below Superficial.
export const injuryColumnFor = (
  rating: number,
  thresholds: InjuryThresholds,
): InjuryColumnId | null => {
  let result: InjuryColumnId | null = null
  for (const column of injuryColumns) {
    if (rating >= thresholds[column.id]) result = column.id
  }
  return result
}
