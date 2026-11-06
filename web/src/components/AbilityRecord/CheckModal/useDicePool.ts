import { useRef, useState } from 'react'
import type { Shade } from '@/api/characters'
import {
  type DicePool,
  explodeSix,
  type RolledDie,
  rerollFailedDie,
  settleDie,
} from '@/components/AbilityRecord/CheckModal/dicePool'
import { rollDie } from '@/components/AbilityRecord/CheckModal/rules'

export const useDicePool = () => {
  const nextId = useRef(0)
  const current = useRef<DicePool>({ dice: [], rolling: [], fateRerollUsed: false })
  const [pool, setPool] = useState<DicePool>(current.current)

  const update = (next: DicePool) => {
    current.current = next
    setPool(next)
  }
  const newDie = (): RolledDie => ({ id: nextId.current++, value: rollDie(), exploded: false })

  const roll = (count: number) => {
    const dice = Array.from({ length: count }, newDie)
    update({ dice, rolling: dice.map((die) => die.id), fateRerollUsed: false })
  }
  const settle = (id: number, open: boolean) => {
    const die = current.current.dice.find((item) => item.id === id)
    if (!die || !current.current.rolling.includes(id)) return
    const bonus = open && die.value === 6 && !die.exploded ? newDie() : undefined
    update(settleDie(current.current, id, bonus))
  }
  const explode = (id: number) => {
    const die = current.current.dice.find((item) => item.id === id)
    if (!die || die.value !== 6 || die.exploded || current.current.rolling.length > 0) return false
    update(explodeSix(current.current, id, newDie()))
    return true
  }
  const rerollFailed = (id: number, shade: Shade) => {
    const next = rerollFailedDie(current.current, id, shade, rollDie())
    if (next === current.current) return false
    update(next)
    return true
  }
  const reset = () => update({ dice: [], rolling: [], fateRerollUsed: false })

  return { ...pool, roll, settle, explode, rerollFailed, reset }
}
