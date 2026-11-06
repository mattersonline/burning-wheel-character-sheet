import { useLayoutEffect, useRef } from 'react'
import type { Shade } from '../../../api/characters'
import Die, { dieRollDuration } from './Die/Die'
import type { RolledDie } from './dicePool'
import { isSuccessFace } from './rules'
import styles from './styles.module.css'

type DiceRowProps = {
  dice: RolledDie[]
  rolling: number[]
  settled: boolean
  shade: Shade
  animate: boolean
  canExplode: boolean
  canRerollFailed: boolean
  onExplode: (id: number) => void
  onRerollFailed: (id: number) => void
  onSettled: (id: number) => void
}

const DiceRow = ({
  dice,
  rolling,
  settled,
  shade,
  animate,
  canExplode,
  canRerollFailed,
  onExplode,
  onRerollFailed,
  onSettled,
}: DiceRowProps) => {
  const row = useRef<HTMLDivElement>(null)
  const positions = useRef(new Map<string, { left: number; top: number }>())
  const animations = useRef<Animation[]>([])

  // biome-ignore lint/correctness/useExhaustiveDependencies: remeasure when the rendered dice change.
  useLayoutEffect(() => {
    const nodes = row.current?.querySelectorAll<HTMLElement>('[data-die-id]') ?? []
    for (const animation of animations.current) animation.cancel()
    animations.current = []
    const next = new Map<string, { left: number; top: number }>()
    for (const node of nodes) {
      const id = node.dataset.dieId
      if (id === undefined) continue
      const rect = node.getBoundingClientRect()
      const position = { left: rect.left, top: rect.top }
      const previous = positions.current.get(id)
      next.set(id, position)
      if (!animate || positions.current.size === 0) continue
      const dx = previous ? previous.left - position.left : 0
      const dy = previous ? previous.top - position.top : -36
      if (previous && dx === 0 && dy === 0) continue
      animations.current.push(
        node.animate(
          [
            { transform: `translate(${dx}px, ${dy}px)`, opacity: previous ? 1 : 0 },
            { transform: 'translate(0, 0)', opacity: 1 },
          ],
          { duration: previous ? 350 : 450, easing: 'ease-out' },
        ),
      )
    }
    positions.current = next
  }, [dice, animate])

  useLayoutEffect(
    () => () => {
      for (const animation of animations.current) animation.cancel()
    },
    [],
  )

  return (
    <div className={styles.dice} ref={row}>
      {dice.map((die) => {
        const selectable = settled && canExplode && die.value === 6 && !die.exploded
        const rerollable = settled && canRerollFailed && !isSuccessFace(die.value, shade)
        const tone = settled ? (isSuccessFace(die.value, shade) ? 'hit' : 'miss') : undefined
        const visual = (
          <Die
            value={die.value}
            rolling={rolling.includes(die.id)}
            duration={dieRollDuration(animate)}
            tone={tone}
            onSettled={() => onSettled(die.id)}
          />
        )
        return (
          <div className={styles.dieSlot} key={die.id} data-die-id={die.id}>
            {selectable || rerollable ? (
              <button
                className={styles.dieButton}
                type="button"
                aria-label={
                  rerollable
                    ? `Failed die showing ${die.value}: spend a fate point to reroll`
                    : 'Six: spend a fate point to roll an extra die'
                }
                onClick={() => (rerollable ? onRerollFailed(die.id) : onExplode(die.id))}
              >
                {visual}
              </button>
            ) : (
              visual
            )}
          </div>
        )
      })}
    </div>
  )
}

export default DiceRow
