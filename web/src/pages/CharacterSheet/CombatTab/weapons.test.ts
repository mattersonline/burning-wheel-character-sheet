import { describe, expect, it } from 'vitest'
import { newRangedWeapon } from '../../../api/characters'
import {
  cycleDof,
  dofBonus,
  dofRanges,
  extraSuccesses,
  meleeDamage,
  rangedDamage,
  rangedLevel,
  successesLeft,
  upgradeCost,
} from './weapons'

describe('dofBonus', () => {
  it('adds one for any extra success, then two and three at double and triple', () => {
    expect(dofBonus(3, 3)).toBe(0)
    expect(dofBonus(4, 3)).toBe(1)
    expect(dofBonus(6, 3)).toBe(2)
    expect(dofBonus(9, 3)).toBe(3)
    expect(dofBonus(20, 3)).toBe(3)
  })

  it('gives two at obstacle 1 with two successes', () => {
    expect(dofBonus(2, 1)).toBe(2)
  })
})

describe('rangedLevel', () => {
  it('reads the face after adding the bonus, capped at six', () => {
    expect(rangedLevel('IIMMSS', 2, 0)).toBe('incidental')
    expect(rangedLevel('IIMMSS', 2, 1)).toBe('mark')
    expect(rangedLevel('IIMMSS', 4, 3)).toBe('superb')
    expect(rangedLevel('IIIIMS', 5, 0)).toBe('mark')
  })
})

describe('meleeDamage', () => {
  it('scales combined character and weapon power, rounding I up and S down', () => {
    expect(meleeDamage(5, 2)).toEqual({ incidental: 4, mark: 7, superb: 10 })
    expect(meleeDamage(4, 1)).toEqual({ incidental: 3, mark: 5, superb: 7 })
    expect(meleeDamage(4, 2)).toEqual({ incidental: 3, mark: 6, superb: 9 })
    expect(meleeDamage(3, 0)).toEqual({ incidental: 2, mark: 3, superb: 4 })
  })

  it('scales weapon power even when character Power is 0', () => {
    expect(meleeDamage(0, 3)).toEqual({ incidental: 2, mark: 3, superb: 4 })
    expect(meleeDamage(0, 0)).toEqual({ incidental: 0, mark: 0, superb: 0 })
  })
})

describe('dofRanges', () => {
  it('lists the die faces that give each hit level', () => {
    expect(dofRanges('IIIMMS')).toEqual({ incidental: '1-3', mark: '4-5', superb: '6' })
    expect(dofRanges('IIMMSS')).toEqual({ incidental: '1-2', mark: '3-4', superb: '5-6' })
  })

  it('shows a dash for levels no face gives', () => {
    expect(dofRanges('IIIISS')).toEqual({ incidental: '1-4', mark: '-', superb: '5-6' })
    expect(dofRanges('IIIMMM').superb).toBe('-')
    expect(dofRanges('MMMMMM').incidental).toBe('-')
  })
})

describe('cycleDof', () => {
  it('moves a face up a level and lifts the faces after it', () => {
    expect(cycleDof('IIMMSS', 1)).toBe('IMMMSS')
    expect(cycleDof('IIMMSS', 3)).toBe('IIMSSS')
  })

  it('wraps from superb to incidental and drops the faces before it', () => {
    expect(cycleDof('IIMMSS', 5)).toBe('IIIIII')
    expect(cycleDof('IIMMSS', 4)).toBe('IIIIIS')
  })
})

describe('rangedDamage', () => {
  const weapon = { ...newRangedWeapon(), power: 3, incidental: 2, mark: 5, superb: 8 }

  it('uses the missile weapon’s own values and builds thrown values from power', () => {
    expect(rangedDamage(weapon, 4)).toEqual({ incidental: 2, mark: 5, superb: 8 })
    expect(rangedDamage({ ...weapon, kind: 'thrown' }, 4)).toEqual({
      incidental: 4,
      mark: 7,
      superb: 10,
    })
  })
})

describe('attack successes', () => {
  it('counts only successes beyond the obstacle', () => {
    expect(extraSuccesses(5, 3)).toBe(2)
    expect(extraSuccesses(2, 3)).toBe(0)
  })

  it('charges the weapon Add per upgrade, at least 1', () => {
    expect(upgradeCost(2)).toBe(2)
    expect(upgradeCost(0)).toBe(1)
    expect(successesLeft(5, 2, 1, 2)).toBe(0)
  })
})
