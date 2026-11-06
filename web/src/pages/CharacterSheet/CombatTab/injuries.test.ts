import { describe, expect, it } from 'vitest'
import type { Ability } from '@/api/characters'
import {
  calculateInjuryThresholds,
  calculateWoundPenalty,
  injuryColumnFor,
  setWounds,
} from '@/pages/CharacterSheet/CombatTab/injuries'

const stats = (forte: number, power: number) =>
  [
    { id: 'forte', exponent: forte },
    { id: 'power', exponent: power },
  ] as Ability[]

describe('calculateInjuryThresholds', () => {
  it('puts Su at half Forte + 1 and Mo at the mortal wound', () => {
    const thresholds = calculateInjuryThresholds(stats(4, 4))
    expect(thresholds.su).toBe(3)
    expect(thresholds.mo).toBe(10)
  })

  it('keeps gaps within half Forte rounded up and packs the upper columns beside Mo', () => {
    expect(calculateInjuryThresholds(stats(4, 4))).toEqual({
      su: 3,
      li: 5,
      mi: 7,
      se: 8,
      tr: 9,
      mo: 10,
    })
  })

  it('uses single steps when there is little room', () => {
    expect(calculateInjuryThresholds(stats(2, 2))).toEqual({
      su: 2,
      li: 3,
      mi: 4,
      se: 5,
      tr: 6,
      mo: 8,
    })
  })
})

describe('calculateWoundPenalty', () => {
  // Forte 4, Power 4: Su 3, Li 5, Mi 7, Se 8, Tr 9, Mo 10.
  const penalty = (placed: Record<number, number>) => {
    const wounds = Array.from({ length: 16 }, (_, index) => placed[index + 1] ?? 0)
    return calculateWoundPenalty(stats(4, 4), wounds)
  }

  it('has no penalty when unwounded', () => {
    expect(penalty({})).toEqual({ dice: 0, obstacle: 0, incapacitated: false })
  })

  it('adds 1 obstacle for one to three superficial wounds', () => {
    expect(penalty({ 3: 1 })).toEqual({ dice: 0, obstacle: 1, incapacitated: false })
    expect(penalty({ 3: 2, 4: 1 })).toEqual({ dice: 0, obstacle: 1, incapacitated: false })
  })

  it('costs 1 die for more than three superficial wounds instead of the obstacle', () => {
    expect(penalty({ 3: 3, 4: 1 })).toEqual({ dice: 1, obstacle: 0, incapacitated: false })
  })

  it('stacks dice per wound by tolerance level', () => {
    expect(penalty({ 5: 1 }).dice).toBe(1)
    expect(penalty({ 7: 1 }).dice).toBe(2)
    expect(penalty({ 8: 1 }).dice).toBe(3)
    expect(penalty({ 9: 1 }).dice).toBe(4)
    expect(penalty({ 5: 2, 7: 1, 3: 1 })).toEqual({ dice: 4, obstacle: 1, incapacitated: false })
  })

  it('incapacitates on a mortal wound', () => {
    expect(penalty({ 10: 1 }).incapacitated).toBe(true)
    expect(penalty({ 14: 1 }).incapacitated).toBe(true)
  })

  it('ignores wounds below Superficial', () => {
    expect(penalty({ 1: 3, 2: 3 })).toEqual({ dice: 0, obstacle: 0, incapacitated: false })
  })
})

describe('setWounds', () => {
  const empty = Array.from({ length: 16 }, () => 0)

  it('fills up to the tapped bubble at that B level only', () => {
    const next = setWounds(empty, 3, 2)
    expect(next[2]).toBe(2)
    expect(next.filter((count) => count > 0)).toHaveLength(1)
  })

  it('clears the last filled bubble when it is tapped again', () => {
    expect(setWounds(setWounds(empty, 5, 2), 5, 2)[4]).toBe(1)
    expect(setWounds(setWounds(empty, 5, 1), 5, 1)[4]).toBe(0)
  })

  it('pads missing entries', () => {
    expect(setWounds([], 1, 1)).toHaveLength(16)
  })
})

describe('injuryColumnFor', () => {
  const thresholds = calculateInjuryThresholds(stats(4, 4))

  it('is null below Superficial', () => {
    expect(injuryColumnFor(2, thresholds)).toBeNull()
  })

  it('returns the highest column reached', () => {
    expect(injuryColumnFor(3, thresholds)).toBe('su')
    expect(injuryColumnFor(6, thresholds)).toBe('li')
    expect(injuryColumnFor(16, thresholds)).toBe('mo')
  })
})
