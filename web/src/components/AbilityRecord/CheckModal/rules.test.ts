import { describe, expect, it } from 'vitest'
import {
  calculateObstacle,
  calculatePool,
  classifyTest,
  countSuccesses,
  epiphanyReady,
  learningAptitude,
  nextPersona,
  nextShade,
  recordAdvancement,
  rollDie,
  successThreshold,
} from '@/components/AbilityRecord/CheckModal/rules'

const options = { exponent: 4, goodArgument: false, persona: 0, deeds: false, extraDice: 0 }

describe('calculatePool', () => {
  it('starts at the exponent', () => {
    expect(calculatePool(options)).toEqual({ base: 4, artha: 0, total: 4 })
  })

  it('adds a die for a good argument, a persona point and manual extras', () => {
    const pool = calculatePool({ ...options, goodArgument: true, persona: 1, extraDice: 2 })
    expect(pool).toEqual({ base: 7, artha: 1, total: 8 })
  })

  it('adds one die per persona point spent', () => {
    expect(calculatePool({ ...options, persona: 3 })).toEqual({ base: 4, artha: 3, total: 7 })
    expect(calculatePool({ ...options, persona: 2, deeds: true })).toEqual({
      base: 4,
      artha: 8,
      total: 12,
    })
  })

  it('doubles the pool with a deeds point and counts the added dice as artha', () => {
    expect(calculatePool({ ...options, deeds: true })).toEqual({ base: 4, artha: 4, total: 8 })
    const both = calculatePool({ ...options, persona: 1, deeds: true })
    expect(both).toEqual({ base: 4, artha: 6, total: 10 })
  })

  it('can go negative, and deeds does not double a pool that is not positive', () => {
    expect(calculatePool({ ...options, extraDice: -9 })).toEqual({ base: -5, artha: 0, total: -5 })
    expect(calculatePool({ ...options, extraDice: -9, deeds: true }).total).toBe(-5)
  })

  it('subtracts wound dice before artha is added', () => {
    expect(calculatePool({ ...options, woundDice: 3, persona: 1 })).toEqual({
      base: 1,
      artha: 1,
      total: 2,
    })
    expect(calculatePool({ ...options, woundDice: 9 }).total).toBe(-5)
  })
})

describe('nextPersona', () => {
  it('adds a point per click and wraps to none at the limit', () => {
    expect([0, 1, 2, 3].map((n) => nextPersona(n, 5))).toEqual([1, 2, 3, 0])
  })

  it('never exceeds the persona left in the pool', () => {
    expect([0, 1, 2].map((n) => nextPersona(n, 2))).toEqual([1, 2, 0])
    expect(nextPersona(0, 1)).toBe(1)
    expect(nextPersona(1, 1)).toBe(0)
  })
})

describe('classifyTest', () => {
  const classify = (obstacle: number, base: number, skipRoutine = false) =>
    classifyTest({ obstacle, base, skipRoutine })

  it('handles one die', () => {
    expect(classify(1, 1)).toBe('routine')
    expect(classify(1, 1, true)).toBe('difficult')
    expect(classify(2, 1)).toBe('challenging')
  })

  it('handles 2-3 dice', () => {
    expect(classify(1, 2)).toBe('routine')
    expect(classify(2, 3)).toBe('routine')
    expect(classify(2, 2)).toBe('difficult')
    expect(classify(3, 3)).toBe('difficult')
    expect(classify(3, 2)).toBe('challenging')
  })

  it('handles 4-6 dice', () => {
    expect(classify(2, 4)).toBe('routine')
    expect(classify(3, 5)).toBe('routine')
    expect(classify(3, 4)).toBe('difficult')
    expect(classify(6, 6)).toBe('difficult')
    expect(classify(5, 4)).toBe('challenging')
  })

  it('handles 7-20 dice', () => {
    expect(classify(4, 7)).toBe('routine')
    expect(classify(5, 7)).toBe('difficult')
    expect(classify(7, 7)).toBe('difficult')
    expect(classify(8, 7)).toBe('challenging')
  })

  it('gives no advancement for routine tests on stats', () => {
    expect(classify(2, 4, true)).toBeNull()
  })

  it('records a test up to the slot limit', () => {
    const start = { routine: 3, difficult: 4, challenging: 2 }
    expect(recordAdvancement(start, 'routine').routine).toBe(4)
    expect(recordAdvancement(start, 'difficult').difficult).toBe(4)
    expect(recordAdvancement(start, 'challenging').challenging).toBe(3)
  })

  it('gives no advancement without dice or an obstacle', () => {
    expect(classify(3, 0)).toBeNull()
    expect(classify(0, 4)).toBeNull()
  })
})

describe('successes', () => {
  it('uses 4+, 3+ and 2+ for black, grey and white', () => {
    expect(successThreshold).toEqual({ black: 4, grey: 3, white: 2 })
    const faces = [1, 2, 3, 4, 5, 6]
    expect(countSuccesses(faces, 'black')).toBe(3)
    expect(countSuccesses(faces, 'grey')).toBe(4)
    expect(countSuccesses(faces, 'white')).toBe(5)
  })

  it('rolls faces from 1 to 6', () => {
    expect(rollDie(() => 0)).toBe(1)
    expect(rollDie(() => 0.999)).toBe(6)
  })
})

describe('calculateObstacle', () => {
  const none = { dice: 0, obstacle: 0, incapacitated: false }

  it('leaves a normal obstacle alone', () => {
    expect(calculateObstacle(3, none)).toBe(3)
  })

  it('doubles the obstacle for beginners luck', () => {
    expect(calculateObstacle(3, none, true)).toBe(6)
  })

  it('adds the wound obstacle after doubling', () => {
    expect(calculateObstacle(2, { ...none, obstacle: 1 }, true)).toBe(5)
  })
})

describe('learningAptitude', () => {
  it('is 10 minus the stat exponent', () => {
    expect(learningAptitude(4)).toBe(6)
  })

  it('never drops below 1', () => {
    expect(learningAptitude(10)).toBe(1)
  })
})

describe('epiphany', () => {
  const spent = { fate: 20, persona: 10, deed: 3 }

  it('needs 3 deeds, 10 persona and 20 fate', () => {
    expect(epiphanyReady(spent, 'black')).toBe(true)
    expect(epiphanyReady({ ...spent, deed: 2 }, 'black')).toBe(false)
    expect(epiphanyReady({ ...spent, persona: 9 }, 'grey')).toBe(false)
    expect(epiphanyReady({ ...spent, fate: 19 }, 'grey')).toBe(false)
  })

  it('cannot raise a white shade', () => {
    expect(epiphanyReady(spent, 'white')).toBe(false)
    expect(nextShade('black')).toBe('grey')
    expect(nextShade('grey')).toBe('white')
    expect(nextShade('white')).toBeNull()
  })
})
