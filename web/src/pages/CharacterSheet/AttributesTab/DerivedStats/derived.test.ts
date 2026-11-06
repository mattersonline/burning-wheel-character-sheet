import { describe, expect, it } from 'vitest'
import { newAbility } from '../../../../api/characters'
import { calculateDerivedStats } from './derived'

const stat = (id: string, exponent: number) => ({ ...newAbility(), id, exponent })

describe('calculateDerivedStats', () => {
  it('rounds reflexes down from the Perception, Agility and Speed average', () => {
    const stats = [stat('perception', 4), stat('agility', 5), stat('speed', 5)]
    expect(calculateDerivedStats(stats).reflexes).toBe(4)
  })

  it('adds 6 to the rounded-down Power and Forte average for the mortal wound', () => {
    expect(calculateDerivedStats([stat('power', 3), stat('forte', 4)]).mortalWound).toBe(9)
    expect(calculateDerivedStats([stat('power', 4), stat('forte', 4)]).mortalWound).toBe(10)
  })

  it('subtracts Will from 10 for hesitation', () => {
    expect(calculateDerivedStats([stat('will', 4)]).hesitation).toBe(6)
  })

  it('treats missing stats as exponent 0', () => {
    expect(calculateDerivedStats([])).toEqual({ reflexes: 0, mortalWound: 6, hesitation: 10 })
  })
})
