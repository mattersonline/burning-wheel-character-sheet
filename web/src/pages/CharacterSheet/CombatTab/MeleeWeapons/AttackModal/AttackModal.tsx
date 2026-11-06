import { useEffect, useRef, useState } from 'react'
import type { Ability, Artha } from '../../../../../api/characters'
import Confetti from '../../../../../components/AbilityRecord/CheckModal/Confetti/Confetti'
import DiceRow from '../../../../../components/AbilityRecord/CheckModal/DiceRow'
import Die, { dieRollDuration } from '../../../../../components/AbilityRecord/CheckModal/Die/Die'
import {
  calculateObstacle,
  calculatePool,
  classifyTest,
  countSuccesses,
  isSuccessFace,
  nextPersona,
  recordAdvancement,
  rollDie,
  successThreshold,
  type WoundPenalty,
} from '../../../../../components/AbilityRecord/CheckModal/rules'
import checkStyles from '../../../../../components/AbilityRecord/CheckModal/styles.module.css'
import { useDicePool } from '../../../../../components/AbilityRecord/CheckModal/useDicePool'
import Stepper from '../../../../../components/AbilityRecord/Stepper/Stepper'
import Button from '../../../../../components/Button/Button'
import {
  type DamageLevel,
  damageLevels,
  dofBonus,
  extraSuccesses,
  type HitLocation,
  hitLocations,
  type MeleeDamage,
  rangedLevel,
  successesLeft,
  upgradeCost,
} from '../../weapons'
import styles from './styles.module.css'

type AttackModalProps = {
  weapon: { name: string; skillId: string }
  // How extra successes are spent: melee weapons upgrade I/M/S or aim; ranged weapons
  // roll a die against the DoF faces and can target a body part.
  rules: { kind: 'melee'; add: number } | { kind: 'ranged'; dof: string }
  // I/M/S damage for this weapon and wielder.
  damage: MeleeDamage
  // Skill records the attack can be made with.
  skills: Ability[]
  arthaPool: Artha
  woundPenalty: WoundPenalty
  onSkillChosen: (skillId: string) => void
  // Artha spent and tests recorded during the attack land on the skill.
  onSkillChange: (skill: Ability) => void
  onArthaPoolChange: (pool: Artha) => void
  onClose: () => void
}

type RolledDie = { id: number; value: number }

const levelLabels = { incidental: 'Incidental', mark: 'Mark', superb: 'Superb' }

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const AttackModal = ({
  weapon,
  rules,
  damage,
  skills,
  arthaPool,
  woundPenalty,
  onSkillChosen,
  onSkillChange,
  onArthaPoolChange,
  onClose,
}: AttackModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const nextDieId = useRef(0)
  const skill = skills.find((item) => item.id === weapon.skillId)
  const [choosing, setChoosing] = useState(!skill)
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
  const [upgrades, setUpgrades] = useState(0)
  const [aim, setAim] = useState(0)
  const [distantAim, setDistantAim] = useState(0)
  const [recorded, setRecorded] = useState(false)
  const [location, setLocation] = useState<HitLocation | null>(null)
  const [dofDie, setDofDie] = useState<RolledDie | null>(null)
  const [dofRolling, setDofRolling] = useState(false)
  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) {
      dialog.showModal()
    }
  }, [])

  const header = (
    <header className={checkStyles.header}>
      <div>
        <p className={checkStyles.eyebrow}>Attack</p>
        <h2 className={checkStyles.title} id="attack-title">
          {weapon.name || (rules.kind === 'melee' ? 'Melee weapon' : 'Ranged weapon')}
        </h2>
      </div>
      <button
        className={checkStyles.close}
        type="button"
        aria-label="Close attack"
        onClick={() => dialogRef.current?.close()}
      >
        ×
      </button>
    </header>
  )

  if (!skill || choosing) {
    return (
      <dialog
        className={checkStyles.dialog}
        ref={dialogRef}
        aria-labelledby="attack-title"
        onClose={onClose}
      >
        {header}
        <div className={checkStyles.body}>
          <p className={styles.prompt}>Choose the skill used to attack with this weapon.</p>
          {skills.length === 0 ? (
            <p className={styles.prompt}>Add a skill on the Skills tab first.</p>
          ) : (
            <div className={styles.skillList}>
              {skills.map((item) => (
                <button
                  className={checkStyles.option}
                  type="button"
                  key={item.id}
                  aria-pressed={item.id === weapon.skillId}
                  onClick={() => {
                    onSkillChosen(item.id)
                    setChoosing(false)
                  }}
                >
                  <strong>{item.name || 'Unnamed skill'}</strong>
                  <span>
                    {item.shade} · B{item.exponent}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </dialog>
    )
  }

  const pool = calculatePool({
    exponent: skill.exponent,
    goodArgument,
    persona,
    deeds,
    extraDice,
    woundDice: woundPenalty.dice,
  })
  const effectiveObstacle = calculateObstacle(obstacle, woundPenalty)
  const hasWounds = woundPenalty.dice > 0 || woundPenalty.obstacle > 0 || woundPenalty.incapacitated
  const advancement = classifyTest({
    obstacle: effectiveObstacle,
    base: pool.base,
    skipRoutine: skill.skipRoutine,
  })
  const settled = rolled && rolling.length === 0
  const successes = countSuccesses(
    dice.map((die) => die.value),
    skill.shade,
  )
  const succeeded = successes >= effectiveObstacle
  const extra = extraSuccesses(successes, effectiveObstacle)
  const meleeAdd = rules.kind === 'melee' ? rules.add : 1
  const locationCost = location ? hitLocations[location].cost : 0
  const left =
    rules.kind === 'melee'
      ? successesLeft(extra, upgrades, aim + distantAim * 2, meleeAdd)
      : extra - locationCost
  const cost = upgradeCost(meleeAdd)
  const bonus = dofBonus(successes - locationCost, effectiveObstacle)
  const dofSettled = dofDie !== null && !dofRolling
  const level: DamageLevel | null =
    rules.kind === 'melee'
      ? damageLevels[upgrades]
      : dofDie && dofSettled
        ? rangedLevel(rules.dof, dofDie.value, bonus)
        : null
  const nextLevel = damageLevels[Math.min(upgrades + 1, damageLevels.length - 1)]
  const sixes = dice.filter((die) => die.value === 6 && !die.exploded)
  const failedDice = dice.some((die) => !isSuccessFace(die.value, skill.shade))

  const resetSpending = () => {
    setUpgrades(0)
    setAim(0)
    setDistantAim(0)
    setLocation(null)
    setDofDie(null)
    setDofRolling(false)
  }

  const rollDof = () => {
    setAnimate(!prefersReducedMotion())
    setDofDie({ id: nextDieId.current++, value: rollDie() })
    setDofRolling(true)
  }

  const roll = () => {
    if (pool.total < 1 || woundPenalty.incapacitated) {
      return
    }
    onSkillChange({
      ...skill,
      artha: {
        ...skill.artha,
        persona: skill.artha.persona + persona,
        deed: skill.artha.deed + (deeds ? 1 : 0),
      },
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
    setRecorded(false)
    setRollCount((count) => count + 1)
    resetSpending()
  }

  const rerollDie = (id: number) => {
    if (!explode(id)) return
    onSkillChange({ ...skill, artha: { ...skill.artha, fate: skill.artha.fate + 1 } })
    onArthaPoolChange({ ...arthaPool, fate: Math.max(0, arthaPool.fate - 1) })
    setRollCount((count) => count + 1)
    resetSpending()
  }

  const rerollFailure = (id: number) => {
    if (!skill.open || arthaPool.fate < 1 || !rerollFailed(id, skill.shade)) return
    onSkillChange({ ...skill, artha: { ...skill.artha, fate: skill.artha.fate + 1 } })
    onArthaPoolChange({ ...arthaPool, fate: arthaPool.fate - 1 })
    setRollCount((count) => count + 1)
    resetSpending()
  }

  const rollAgain = () => {
    setRolled(false)
    reset()
    setPersona(0)
    setDeeds(false)
    resetSpending()
  }

  const breakdown = [
    `${skill.exponent} exponent`,
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
      className={checkStyles.dialog}
      ref={dialogRef}
      aria-labelledby="attack-title"
      onClose={onClose}
    >
      {header}

      <div className={checkStyles.body}>
        <p className={styles.skillRow}>
          <span>
            Attacking with <strong>{skill.name || 'Unnamed skill'}</strong> ({skill.shade} ·{' '}
            {successThreshold[skill.shade]}+)
          </span>
          {!rolled && (
            <button className={styles.change} type="button" onClick={() => setChoosing(true)}>
              Change skill
            </button>
          )}
        </p>

        {!rolled && (
          <>
            <div className={checkStyles.pool}>
              <span className={checkStyles.poolNumber} data-negative={pool.total < 1}>
                {pool.total}
              </span>
              <span className={checkStyles.poolLabel}>
                dice
                <small>{breakdown}</small>
              </span>
              {hasWounds && (
                <span className={checkStyles.wounds} role="status" aria-label="Wound penalty">
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

            <div className={checkStyles.options}>
              <button
                className={checkStyles.option}
                type="button"
                aria-pressed={goodArgument}
                onClick={() => setGoodArgument(!goodArgument)}
              >
                <strong>Good argument</strong>
                <span>+1 die</span>
              </button>
              <button
                className={checkStyles.option}
                type="button"
                aria-pressed={persona > 0}
                disabled={arthaPool.persona < 1}
                onClick={() => setPersona(nextPersona(persona, arthaPool.persona))}
              >
                <strong>Persona point{persona > 1 ? ` ×${persona}` : ''}</strong>
                <span>
                  +{Math.max(persona, 1)} {persona > 1 ? 'dice' : 'die'} · {arthaPool.persona} left
                </span>
              </button>
              <button
                className={checkStyles.option}
                type="button"
                aria-pressed={deeds}
                disabled={arthaPool.deed < 1}
                onClick={() => setDeeds(!deeds)}
              >
                <strong>Deeds point</strong>
                <span>Double the pool · {arthaPool.deed} left</span>
              </button>
            </div>

            <div className={checkStyles.steppers}>
              <div className={checkStyles.stepperGroup}>
                <span className={checkStyles.groupLabel}>Extra dice</span>
                <Stepper
                  label="extra dice"
                  value={extraDice}
                  min={-9}
                  max={10}
                  onChange={setExtraDice}
                />
              </div>
              <div className={checkStyles.stepperGroup}>
                <span className={checkStyles.groupLabel}>Obstacle</span>
                <Stepper
                  label="obstacle"
                  value={obstacle}
                  min={1}
                  max={20}
                  onChange={setObstacle}
                />
              </div>
            </div>

            <p className={checkStyles.advancement}>
              <small>
                {pool.base} dice before artha against obstacle {effectiveObstacle}
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
              shade={skill.shade}
              animate={animate}
              canExplode={!skill.open && arthaPool.fate > 0}
              canRerollFailed={Boolean(skill.open) && !fateRerollUsed && arthaPool.fate > 0}
              onExplode={rerollDie}
              onRerollFailed={rerollFailure}
              onSettled={(id) => settle(id, Boolean(skill.open))}
            />

            {settled && (
              <div className={checkStyles.result} key={rollCount}>
                {succeeded ? (
                  <Confetti />
                ) : (
                  <div className={checkStyles.flash} aria-hidden="true" />
                )}
                <p className={succeeded ? checkStyles.success : checkStyles.failure} role="status">
                  {succeeded ? 'Hit!' : 'Miss'}
                </p>
                <p className={checkStyles.tally}>
                  {successes} {successes === 1 ? 'success' : 'successes'} against obstacle{' '}
                  {effectiveObstacle}
                </p>
              </div>
            )}

            {settled && !skill.open && sixes.length > 0 && (
              <div className={checkStyles.fate}>
                <p>
                  {arthaPool.fate > 0
                    ? `Tap a six to spend a fate point and roll an extra die (${arthaPool.fate} left).`
                    : 'No fate points left to roll extra dice.'}
                </p>
              </div>
            )}
            {settled && skill.open && failedDice && (
              <div className={checkStyles.fate}>
                <p>
                  {fateRerollUsed
                    ? 'Fate reroll used for this check.'
                    : arthaPool.fate > 0
                      ? `Tap a failed die to spend a fate point and reroll it (${arthaPool.fate} left).`
                      : 'No fate points left to reroll failed dice.'}
                </p>
              </div>
            )}

            {settled && succeeded && (
              <section className={styles.spend} aria-label="Spend extra successes">
                {rules.kind === 'melee' || level ? (
                  <p className={styles.damage} role="status">
                    <span>{level ? levelLabels[level] : ''} hit</span>
                    <strong>{level ? damage[level] : ''}</strong>
                  </p>
                ) : (
                  <p className={styles.damage}>
                    <span>Roll the die of fortune for the hit level</span>
                    <strong>{bonus > 0 ? `+${bonus}` : '+0'}</strong>
                  </p>
                )}
                <p className={styles.left}>
                  {left} extra {left === 1 ? 'success' : 'successes'} to spend
                  {aim > 0 && ' · aimed'}
                  {distantAim > 0 && ' · aimed at a distant target'}
                  {location && ` · targeting the ${hitLocations[location].label.toLowerCase()}`}
                </p>
                {rules.kind === 'melee' ? (
                  <div className={styles.spendButtons}>
                    <button
                      className={checkStyles.option}
                      type="button"
                      disabled={upgrades >= damageLevels.length - 1 || left < cost}
                      onClick={() => setUpgrades(upgrades + 1)}
                    >
                      <strong>Upgrade to {levelLabels[nextLevel]}</strong>
                      <span>
                        {cost} {cost === 1 ? 'success' : 'successes'}
                      </span>
                    </button>
                    <button
                      className={checkStyles.option}
                      type="button"
                      disabled={left < 1 || aim + distantAim > 0}
                      onClick={() => setAim(1)}
                    >
                      <strong>Aim the blow</strong>
                      <span>1 success</span>
                    </button>
                    <button
                      className={checkStyles.option}
                      type="button"
                      disabled={left < 2 || aim + distantAim > 0}
                      onClick={() => setDistantAim(1)}
                    >
                      <strong>Aim at a distant target</strong>
                      <span>2 successes</span>
                    </button>
                    <button
                      className={checkStyles.option}
                      type="button"
                      disabled={upgrades === 0 && aim === 0 && distantAim === 0}
                      onClick={resetSpending}
                    >
                      <strong>Reset</strong>
                      <span>Refund spent</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={styles.spendButtons}>
                      {(Object.keys(hitLocations) as HitLocation[]).map((key) => (
                        <button
                          className={checkStyles.option}
                          type="button"
                          key={key}
                          aria-pressed={location === key}
                          disabled={
                            dofDie !== null || (location !== key && left < hitLocations[key].cost)
                          }
                          onClick={() => setLocation(location === key ? null : key)}
                        >
                          <strong>Target the {hitLocations[key].label.toLowerCase()}</strong>
                          <span>
                            {hitLocations[key].cost}{' '}
                            {hitLocations[key].cost === 1 ? 'success' : 'successes'}
                          </span>
                        </button>
                      ))}
                    </div>
                    {dofDie ? (
                      <div className={styles.dofRoll}>
                        <Die
                          value={dofDie.value}
                          rolling={dofRolling}
                          duration={dieRollDuration(animate)}
                          onSettled={() => setDofRolling(false)}
                        />
                        <p className={styles.left}>
                          Die {dofDie.value}
                          {bonus > 0 && ` +${bonus}`}
                          {dofSettled && level && ` → ${levelLabels[level]}`}
                        </p>
                      </div>
                    ) : (
                      <Button block onClick={rollDof}>
                        Roll the die of fortune
                      </Button>
                    )}
                  </>
                )}
              </section>
            )}

            {settled && advancement && (
              <button
                className={styles.record}
                type="button"
                disabled={recorded}
                onClick={() => {
                  onSkillChange({
                    ...skill,
                    advancement: recordAdvancement(skill.advancement, advancement),
                  })
                  setRecorded(true)
                }}
              >
                {recorded
                  ? `Recorded a ${advancement} test on ${skill.name || 'the skill'}`
                  : `Record a ${advancement} test on ${skill.name || 'the skill'}`}
              </button>
            )}

            <div className={checkStyles.actions}>
              <Button disabled={!settled} onClick={rollAgain}>
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

export default AttackModal
