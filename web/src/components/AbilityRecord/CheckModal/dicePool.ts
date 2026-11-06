import type { Shade } from '../../../api/characters'
import { isSuccessFace } from './rules'

export type RolledDie = { id: number; value: number; exploded: boolean }
export type DicePool = { dice: RolledDie[]; rolling: number[]; fateRerollUsed: boolean }

export const explodeSix = (pool: DicePool, id: number, bonus: RolledDie): DicePool => {
  const die = pool.dice.find((item) => item.id === id)
  if (die?.value !== 6 || die.exploded) return pool
  const index = pool.dice.findIndex((item) => item.id === id)
  return {
    ...pool,
    dice: [
      ...pool.dice.slice(0, index),
      { ...die, exploded: true },
      bonus,
      ...pool.dice.slice(index + 1),
    ],
    rolling: [...pool.rolling, bonus.id],
  }
}

export const settleDie = (pool: DicePool, id: number, bonus?: RolledDie): DicePool => {
  if (!pool.rolling.includes(id)) return pool
  const settled = { ...pool, rolling: pool.rolling.filter((item) => item !== id) }
  return bonus ? explodeSix(settled, id, bonus) : settled
}

export const rerollFailedDie = (
  pool: DicePool,
  id: number,
  shade: Shade,
  value: number,
): DicePool => {
  const die = pool.dice.find((item) => item.id === id)
  if (!die || pool.fateRerollUsed || pool.rolling.length > 0 || isSuccessFace(die.value, shade))
    return pool
  return {
    dice: pool.dice.map((item) => (item.id === id ? { ...item, value } : item)),
    rolling: [id],
    fateRerollUsed: true,
  }
}
