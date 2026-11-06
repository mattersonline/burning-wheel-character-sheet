import { useEffect, useRef, useState } from 'react'
import type { Ability, Artha } from '../../../api/characters'
import Button from '../../Button/Button'
import Stepper from '../Stepper/Stepper'
import Confetti from './Confetti/Confetti'
import DiceRow from './DiceRow'
import {
  type AdvancementKind,
  calculateObstacle,
  calculatePool,
  classifyTest,
  countSuccesses,
  isSuccessFace,
  nextPersona,
  recordAdvancement,
  successThreshold,
  type WoundPenalty,
} from './rules'
import styles from './styles.module.css'
import { useDicePool } from './useDicePool'

type CheckModalProps = {
  ability: Ability
  // Persona, deeds and fate spent during the check are recorded on the ability.
  onChange: (ability: Ability) => void
  // Artha the character has available; spending during the check deducts from it.
  arthaPool: Artha
  onArthaPoolChange: (pool: Artha) => void
  // Present only for abilities that wounds affect.
  woundPenalty?: WoundPenalty
  // False for calculated values, which never advance.
  tracksAdvancement?: boolean
  // Beginner's luck: a test on a skill being learned. The pool is the stat alone, the
  // obstacle is doubled, and artha, good arguments and extra dice do not apply.
  beginnersLuck?: boolean
  openEnded?: boolean
  // Name of the stat being rolled, shown for beginner's luck tests.
  statName?: string
  // Called each time dice are rolled with the test's advancement kind, so the caller can record it.
  onRoll?: (kind: AdvancementKind | null) => void
  // Set once recorded tests have reached the skill's aptitude.
  opensSkill?: boolean
  onClose: () => void
}

const advancementLabels = {
  routine: 'Routine',
  difficult: 'Difficult',
  challenging: 'Challenging',
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const CheckModal = ({
  ability,
  onChange,
  arthaPool,
  onArthaPoolChange,
  woundPenalty = { dice: 0, obstacle: 0, incapacitated: false },
  tracksAdvancement = true,
  beginnersLuck = false,
  openEnded = false,
  statName = 'the stat',
  onRoll,
  opensSkill = false,
  onClose,
}: CheckModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [goodArgument, setGoodArgument] = useState(false)
  const [persona, setPersona] = useState(0)
  const [deeds, setDeeds] = useState(false)
  const [extraDice, setExtraDice] = useState(0)
  const [obstacle, setObstacle] = useState(1)
  const [rolled, setRolled] = useState(false)
  const {
    dice,
    rolling,
    fateRerollUsed,
    roll: rollDice,
    settle,
    explode,
    rerollFailed,
    reset,
  } = useDicePool()
  const [rollCount, setRollCount] = useState(0)
  const [animate, setAnimate] = useState(true)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) {
      dialog.showModal()
    }
  }, [])

  const pool = calculatePool({
    exponent: ability.exponent,
    goodArgument,
    persona,
    deeds,
    extraDice,
    woundDice: woundPenalty.dice,
  })
  const effectiveObstacle = calculateObstacle(obstacle, woundPenalty, beginnersLuck)
  const hasWounds = woundPenalty.dice > 0 || woundPenalty.obstacle > 0 || woundPenalty.incapacitated
  const threshold = successThreshold[ability.shade]
  // Beginner's luck is classified on the obstacle before doubling; routine tests count toward the skill.
  const advancement =
    tracksAdvancement || beginnersLuck
      ? classifyTest({
          obstacle: beginnersLuck ? calculateObstacle(obstacle, woundPenalty) : effectiveObstacle,
          base: pool.base,
          skipRoutine: beginnersLuck ? false : ability.skipRoutine,
        })
      : null

  const settled = rolled && rolling.length === 0
  const successes = countSuccesses(
    dice.map((die) => die.value),
    ability.shade,
  )
  const succeeded = successes >= effectiveObstacle
  const sixes = dice.filter((die) => die.value === 6 && !die.exploded)
  const failedDice = dice.some((die) => !isSuccessFace(die.value, ability.shade))

  const roll = () => {
    if (pool.total < 1 || woundPenalty.incapacitated) {
      return
    }
    onRoll?.(advancement)
    onChange({
      ...ability,
      artha: {
        ...ability.artha,
        persona: ability.artha.persona + persona,
        deed: ability.artha.deed + (deeds ? 1 : 0),
      },
      advancement:
        advancement && !beginnersLuck
          ? recordAdvancement(ability.advancement, advancement)
          : ability.advancement,
    })
    if (persona > 0 || deeds) {
      onArthaPoolChange({
        ...arthaPool,
        persona: Math.max(0, arthaPool.persona - persona),
        deed: Math.max(0, arthaPool.deed - (deeds ? 1 : 0)),
      })
    }
    setAnimate(!prefersReducedMotion())
    rollDice(pool.total)
    setRolled(true)
    setRollCount((count) => count + 1)
  }

  const rerollDie = (id: number) => {
    if (!explode(id)) return
    onChange({ ...ability, artha: { ...ability.artha, fate: ability.artha.fate + 1 } })
    onArthaPoolChange({ ...arthaPool, fate: Math.max(0, arthaPool.fate - 1) })
    setRollCount((count) => count + 1)
  }

  const rerollFailure = (id: number) => {
    if (!openEnded || arthaPool.fate < 1 || !rerollFailed(id, ability.shade)) return
    onChange({ ...ability, artha: { ...ability.artha, fate: ability.artha.fate + 1 } })
    onArthaPoolChange({ ...arthaPool, fate: arthaPool.fate - 1 })
    setRollCount((count) => count + 1)
  }

  const rollAgain = () => {
    setRolled(false)
    reset()
    setPersona(0)
    setDeeds(false)
  }

  const breakdown = [
    `${ability.exponent} exponent`,
    goodArgument && '+1 good argument',
    extraDice !== 0 && `${extraDice > 0 ? '+' : ''}${extraDice} extra`,
    woundPenalty.dice > 0 && `−${woundPenalty.dice} wounds`,
    persona > 0 && `+${persona} persona`,
    deeds && '×2 deeds',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <dialog
      className={styles.dialog}
      ref={dialogRef}
      aria-labelledby="check-title"
      onClose={onClose}
    >
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{beginnersLuck ? "Beginner's luck" : 'Check'}</p>
          <h2 className={styles.title} id="check-title">
            {ability.name || 'Ability'}
          </h2>
        </div>
        <span className={`${styles.shade} ${styles[ability.shade]}`}>
          {ability.shade} · {threshold}+
        </span>
        <button
          className={styles.close}
          type="button"
          aria-label="Close check"
          onClick={() => dialogRef.current?.close()}
        >
          ×
        </button>
      </header>

      <div className={styles.body}>
        {!rolled && (
          <>
            <div className={styles.pool}>
              <span className={styles.poolNumber} data-negative={pool.total < 1}>
                {pool.total}
              </span>
              <span className={styles.poolLabel}>
                dice
                <small>{breakdown}</small>
              </span>
              {hasWounds && (
                <span className={styles.wounds} role="status" aria-label="Wound penalty">
                  <small>Wounds</small>
                  {woundPenalty.incapacitated ? (
                    <strong>Incapacitated</strong>
                  ) : (
                    <strong>
                      {[
                        woundPenalty.dice > 0 && `−${woundPenalty.dice}D`,
                        woundPenalty.obstacle > 0 && `+${woundPenalty.obstacle} Ob`,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    </strong>
                  )}
                </span>
              )}
            </div>

            {!beginnersLuck && (
              <div className={styles.options}>
                <button
                  className={styles.option}
                  type="button"
                  aria-pressed={goodArgument}
                  onClick={() => setGoodArgument(!goodArgument)}
                >
                  <strong>Good argument</strong>
                  <span>+1 die</span>
                </button>
                <button
                  className={styles.option}
                  type="button"
                  aria-pressed={persona > 0}
                  disabled={arthaPool.persona < 1}
                  onClick={() => setPersona(nextPersona(persona, arthaPool.persona))}
                >
                  <strong>Persona point{persona > 1 ? ` ×${persona}` : ''}</strong>
                  <span>
                    +{Math.max(persona, 1)} {persona > 1 ? 'dice' : 'die'} · {arthaPool.persona}{' '}
                    left
                  </span>
                </button>
                <button
                  className={styles.option}
                  type="button"
                  aria-pressed={deeds}
                  disabled={arthaPool.deed < 1}
                  onClick={() => setDeeds(!deeds)}
                >
                  <strong>Deeds point</strong>
                  <span>Double the pool · {arthaPool.deed} left</span>
                </button>
              </div>
            )}

            <div className={styles.steppers}>
              {!beginnersLuck && (
                <div className={styles.stepperGroup}>
                  <span className={styles.groupLabel}>Extra dice</span>
                  <Stepper
                    label="extra dice"
                    value={extraDice}
                    min={-9}
                    max={10}
                    onChange={setExtraDice}
                  />
                </div>
              )}
              <div className={styles.stepperGroup}>
                <span className={styles.groupLabel}>Obstacle</span>
                <Stepper
                  label="obstacle"
                  value={obstacle}
                  min={1}
                  max={20}
                  onChange={setObstacle}
                />
              </div>
            </div>

            <p className={styles.advancement}>
              {tracksAdvancement &&
                (advancement
                  ? `Counts toward ${advancementLabels[advancement]} advancement`
                  : 'Does not count toward advancement')}
              <small>
                {beginnersLuck && advancement && advancement !== 'routine'
                  ? `Counts as a ${advancement} test on ${statName}. `
                  : beginnersLuck
                    ? 'Counts toward opening the skill. '
                    : ''}
                {beginnersLuck
                  ? `Beginner's luck doubles the obstacle: ${pool.base} dice against obstacle ${effectiveObstacle}`
                  : `${pool.base} dice before artha against obstacle ${effectiveObstacle}`}
              </small>
            </p>

            <Button block disabled={pool.total < 1 || woundPenalty.incapacitated} onClick={roll}>
              {pool.total < 1
                ? 'Add dice to roll'
                : `Roll ${pool.total} ${pool.total === 1 ? 'die' : 'dice'}`}
            </Button>
          </>
        )}

        {rolled && (
          <>
            <DiceRow
              dice={dice}
              rolling={rolling}
              settled={settled}
              shade={ability.shade}
              animate={animate}
              canExplode={!beginnersLuck && !openEnded && arthaPool.fate > 0}
              canRerollFailed={!beginnersLuck && openEnded && !fateRerollUsed && arthaPool.fate > 0}
              onExplode={rerollDie}
              onRerollFailed={rerollFailure}
              onSettled={(id) => settle(id, openEnded)}
            />

            {settled && (
              <div className={styles.result} key={rollCount}>
                {succeeded ? <Confetti /> : <div className={styles.flash} aria-hidden="true" />}
                <p className={succeeded ? styles.success : styles.failure} role="status">
                  {succeeded ? 'Success!' : 'Failure'}
                </p>
                <p className={styles.tally}>
                  {successes} {successes === 1 ? 'success' : 'successes'} against obstacle{' '}
                  {effectiveObstacle}
                </p>
                {tracksAdvancement && (
                  <p className={styles.advancement}>
                    {advancement
                      ? `Recorded a ${advancementLabels[advancement].toLowerCase()} test`
                      : 'Does not count toward advancement'}
                  </p>
                )}
                {beginnersLuck && (
                  <p className={styles.advancement}>
                    {opensSkill
                      ? `${ability.name || 'The skill'} is ready to open! Close this to open it.`
                      : advancement && advancement !== 'routine'
                        ? `Recorded a ${advancement} test on ${statName}`
                        : 'Recorded a test toward opening the skill'}
                  </p>
                )}
              </div>
            )}

            {settled && !beginnersLuck && !openEnded && sixes.length > 0 && (
              <div className={styles.fate}>
                <p>
                  {arthaPool.fate > 0
                    ? `Tap a six to spend a fate point and roll an extra die (${arthaPool.fate} left).`
                    : 'No fate points left to roll extra dice.'}
                </p>
              </div>
            )}
            {settled && !beginnersLuck && openEnded && failedDice && (
              <div className={styles.fate}>
                <p>
                  {fateRerollUsed
                    ? 'Fate reroll used for this check.'
                    : arthaPool.fate > 0
                      ? `Tap a failed die to spend a fate point and reroll it (${arthaPool.fate} left).`
                      : 'No fate points left to reroll failed dice.'}
                </p>
              </div>
            )}

            <div className={styles.actions}>
              <Button disabled={!settled || opensSkill} onClick={rollAgain}>
                Roll again
              </Button>
              <Button variant="danger" onClick={() => dialogRef.current?.close()}>
                Close
              </Button>
            </div>
          </>
        )}
      </div>
    </dialog>
  )
}

export default CheckModal
