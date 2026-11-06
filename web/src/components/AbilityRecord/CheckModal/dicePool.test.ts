import { describe, expect, it } from 'vitest'
import { type DicePool, explodeSix, type RolledDie, rerollFailedDie, settleDie } from './dicePool'
import { countSuccesses } from './rules'

const die = (id: number, value: number): RolledDie => ({ id, value, exploded: false })

describe('exploding dice', () => {
  it('keeps the original success and adds a bonus die', () => {
    const initial: DicePool = { dice: [die(0, 6), die(1, 2)], rolling: [], fateRerollUsed: false }
    const result = explodeSix(initial, 0, die(2, 4))
    expect(result.dice.map((item) => item.value)).toEqual([6, 4, 2])
    expect(
      countSuccesses(
        result.dice.map((item) => item.value),
        'black',
      ),
    ).toBe(2)
    expect(result.rolling).toEqual([2])
    expect(result.dice[0].exploded).toBe(true)
    expect(explodeSix(result, 0, die(3, 5))).toBe(result)
    expect(explodeSix(result, 1, die(3, 5))).toBe(result)
  })

  describe('rerolling failed dice', () => {
    it('replaces only the failed die and keeps its position and identity', () => {
      const pool: DicePool = {
        dice: [die(0, 6), die(1, 2), die(2, 4)],
        rolling: [],
        fateRerollUsed: false,
      }
      const rerolled = rerollFailedDie(pool, 1, 'black', 5)
      expect(rerolled.dice.map((item) => [item.id, item.value])).toEqual([
        [0, 6],
        [1, 5],
        [2, 4],
      ])
      expect(rerolled.rolling).toEqual([1])
      expect(rerolled.fateRerollUsed).toBe(true)
      expect(
        countSuccesses(
          rerolled.dice.map((item) => item.value),
          'black',
        ),
      ).toBe(3)
    })

    it('uses the shade threshold and rejects successes, missing dice and rolls in progress', () => {
      const pool: DicePool = { dice: [die(0, 2), die(1, 3)], rolling: [], fateRerollUsed: false }
      expect(rerollFailedDie(pool, 1, 'grey', 6)).toBe(pool)
      expect(rerollFailedDie(pool, 0, 'white', 6)).toBe(pool)
      expect(rerollFailedDie(pool, 1, 'black', 6)).not.toBe(pool)
      const whitePool: DicePool = { dice: [die(0, 1)], rolling: [], fateRerollUsed: false }
      expect(rerollFailedDie(whitePool, 0, 'white', 6)).not.toBe(whitePool)
      expect(rerollFailedDie(pool, 99, 'black', 6)).toBe(pool)
      const rolling = rerollFailedDie(pool, 0, 'grey', 6)
      expect(rerollFailedDie(rolling, 1, 'black', 6)).toBe(rolling)
    })

    it('prevents a second reroll of the same or another failed die', () => {
      const initial: DicePool = { dice: [die(0, 1), die(1, 2)], rolling: [], fateRerollUsed: false }
      const failed = settleDie(rerollFailedDie(initial, 0, 'black', 2), 0)
      expect(rerollFailedDie(failed, 0, 'black', 6)).toBe(failed)
      expect(rerollFailedDie(failed, 1, 'black', 6)).toBe(failed)
    })

    it('explodes a rerolled six without allowing another Fate reroll', () => {
      const initial: DicePool = { dice: [die(0, 1)], rolling: [], fateRerollUsed: false }
      const six = rerollFailedDie(initial, 0, 'black', 6)
      const exploded = settleDie(six, 0, die(1, 1))
      expect(exploded.dice.map((item) => item.value)).toEqual([6, 1])
      expect(exploded.rolling).toEqual([1])
      expect(exploded.fateRerollUsed).toBe(true)
      const settled = settleDie(exploded, 1)
      expect(rerollFailedDie(settled, 1, 'black', 6)).toBe(settled)
    })
  })

  it('supports successive automatic sixes while preserving each result', () => {
    const initial: DicePool = { dice: [die(0, 6)], rolling: [0], fateRerollUsed: false }
    const first = settleDie(initial, 0, die(1, 6))
    const second = settleDie(first, 1, die(2, 3))
    const final = settleDie(second, 2)
    expect(final.dice.map((item) => item.value)).toEqual([6, 6, 3])
    expect(final.dice.map((item) => item.exploded)).toEqual([true, true, false])
    expect(final.rolling).toEqual([])
    expect(
      countSuccesses(
        final.dice.map((item) => item.value),
        'black',
      ),
    ).toBe(2)
    expect(settleDie(final, 1, die(3, 6))).toBe(final)
  })

  it('does not settle until all simultaneous bonus dice finish', () => {
    let pool: DicePool = { dice: [die(0, 6), die(1, 6)], rolling: [0, 1], fateRerollUsed: false }
    pool = settleDie(pool, 0, die(2, 4))
    pool = settleDie(pool, 1, die(3, 5))
    expect(pool.dice.map((item) => item.id)).toEqual([0, 2, 1, 3])
    pool = settleDie(pool, 2)
    expect(pool.rolling).toEqual([3])
    expect(settleDie(pool, 3).rolling).toEqual([])
  })

  it('places each new generation beside the six that produced it', () => {
    let pool: DicePool = {
      dice: [die(0, 2), die(1, 6), die(2, 5)],
      rolling: [],
      fateRerollUsed: false,
    }
    pool = explodeSix(pool, 1, die(3, 6))
    pool = settleDie(pool, 3, die(4, 4))
    expect(pool.dice.map((item) => item.id)).toEqual([0, 1, 3, 4, 2])
    expect(pool.rolling).toEqual([4])
  })
})
