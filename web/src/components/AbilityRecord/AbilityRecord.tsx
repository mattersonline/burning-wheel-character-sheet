import { useEffect, useState } from 'react'
import type { Ability, Artha } from '@/api/characters'
import BubbleTrack from '@/components/AbilityRecord/BubbleTrack'
import CheckModal from '@/components/AbilityRecord/CheckModal'
import {
  advancementSlots,
  epiphanyReady,
  nextShade,
  type WoundPenalty,
} from '@/components/AbilityRecord/CheckModal/rules'
import ShadeButton from '@/components/AbilityRecord/ShadeButton'
import Stepper from '@/components/AbilityRecord/Stepper'
import Button from '@/components/Button'
import DiceButton from '@/components/DiceButton'
import RemoveButton from '@/components/RemoveButton'
import styles from './styles.module.css'

type AbilityRecordProps = {
  ability: Ability
  onChange: (ability: Ability) => void
  // The character's available artha, spent from when a check is rolled.
  arthaPool: Artha
  onArthaPoolChange: (pool: Artha) => void
  // Set only for abilities that wounds affect.
  woundPenalty?: WoundPenalty
  onRemove?: () => void
  namePlaceholder?: string
  // Fixed stats and attributes show their name as a heading instead of an input.
  nameLocked?: boolean
  showOpenToggle?: boolean
  // Opens the check when it turns true (from the character summary), then reports it opened.
  openCheck?: boolean
  onCheckOpened?: () => void
}

const SPARKLES = [10, 25, 40, 55, 70, 85].map((left, index) => ({
  left: `${left}%`,
  top: `${index % 2 ? 72 : 18}%`,
  animationDelay: `${index * 0.35}s`,
}))

const AbilityRecord = ({
  ability,
  onChange,
  arthaPool,
  onArthaPoolChange,
  woundPenalty,
  onRemove,
  namePlaceholder = 'Name',
  nameLocked = false,
  showOpenToggle = false,
  openCheck = false,
  onCheckOpened,
}: AbilityRecordProps) => {
  const [checking, setChecking] = useState(false)
  const incapacitated = woundPenalty?.incapacitated

  useEffect(() => {
    if (!openCheck) return
    if (!incapacitated) setChecking(true)
    onCheckOpened?.()
  }, [openCheck, incapacitated, onCheckOpened])
  const [dismissed, setDismissed] = useState(false)
  const epiphany = epiphanyReady(ability.artha, ability.shade) && !dismissed
  const upgraded = nextShade(ability.shade)
  const name = ability.name || 'ability'
  const setAdvancement = (key: keyof Ability['advancement'], value: number) =>
    onChange({ ...ability, advancement: { ...ability.advancement, [key]: value } })
  const setArtha = (key: keyof Ability['artha'], value: number) => {
    setDismissed(false)
    onChange({ ...ability, artha: { ...ability.artha, [key]: value } })
  }
  const haveEpiphany = () =>
    upgraded && onChange({ ...ability, shade: upgraded, artha: { fate: 0, persona: 0, deed: 0 } })

  return (
    <article
      className={`${styles.record} ${epiphany ? styles.epiphany : ''}`}
      aria-label={ability.name || 'Unnamed ability'}
    >
      <div className={`${styles.content} ${epiphany ? styles.faded : ''}`} inert={epiphany}>
        <div className={styles.top}>
          <DiceButton
            label={`Check ${name}`}
            title="Roll a check"
            incapacitated={woundPenalty?.incapacitated}
            onOpen={() => setChecking(true)}
          />
          <div className={styles.nameField}>
            {nameLocked ? (
              <h3 className={styles.fixedName}>{ability.name}</h3>
            ) : (
              <input
                className={`${styles.name} ${showOpenToggle ? styles.nameWithToggle : ''}`}
                aria-label="Name"
                value={ability.name}
                placeholder={namePlaceholder}
                onChange={(event) => onChange({ ...ability, name: event.target.value })}
              />
            )}
            {showOpenToggle && (
              <button
                type="button"
                className={styles.openToggle}
                aria-pressed={Boolean(ability.open)}
                aria-label={`Open-ended ${name}`}
                title="Open-ended skills automatically roll an extra die for each six"
                onClick={() => onChange({ ...ability, open: !ability.open })}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 32 32"
                  fill="currentColor"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M2.2 26.5 5.8 17l5.2-6c.8-.9 1.7-.4 2.1.5.4.9.4 1.7 0 2.8l-.9 2.4c-.4 1.1.1 1.9 1.1 2l6.3.6 5-2.4c1.2-.6 2.3-.1 2.3 1.1 0 .7-.4 1.3-1 1.7l-6.1 4.2H12c-.8 0-1.2.3-1.5 1L9 29.3Z" />
                  <path d="M15.6 1.1c.3-.6.7-.6 1 0l1.4 3.2 2.5 1.5c.6.4.6.8 0 1.1L18 8.4l-1.4 3.1c-.3.6-.7.6-1 0l-1.4-3.1-2.5-1.5c-.6-.3-.6-.7 0-1.1l2.5-1.5Z" />
                  <path d="M24.4 5.2c.3-.6.7-.6 1 0l1.5 3.3 3.1 1.7c.5.3.5.7 0 1l-3.1 1.7-1.5 3.3c-.3.6-.7.6-1 0l-1.5-3.3-3.1-1.7c-.5-.3-.5-.7 0-1l3.1-1.7Z" />
                  <path d="M20.2 2.3a.8.8 0 0 1 1.1 0l1 1a.8.8 0 0 1-1.1 1.1l-1-1a.8.8 0 0 1 0-1.1Zm8.6 2.6 1-1a.8.8 0 1 1 1.1 1.2l-1 1a.8.8 0 0 1-1.1-1.2ZM20 14l1-1a.8.8 0 0 1 1.1 1.1l-1 1A.8.8 0 0 1 20 14Zm8.9-.9a.8.8 0 0 1 1.1 0l1 1a.8.8 0 0 1-1.1 1.1l-1-1a.8.8 0 0 1 0-1.1Z" />
                </svg>
              </button>
            )}
          </div>
          <ShadeButton
            shade={ability.shade}
            onChange={(shade) => onChange({ ...ability, shade })}
          />
          <Stepper
            label={`${name} exponent`}
            value={ability.exponent}
            min={0}
            max={10}
            onChange={(exponent) => onChange({ ...ability, exponent })}
          />
        </div>

        <div className={styles.tracks}>
          {!ability.skipRoutine && (
            <BubbleTrack
              label="Routine"
              count={advancementSlots.routine}
              value={ability.advancement.routine}
              onChange={(value) => setAdvancement('routine', value)}
            />
          )}
          <BubbleTrack
            label="Difficult"
            count={advancementSlots.difficult}
            value={ability.advancement.difficult}
            onChange={(value) => setAdvancement('difficult', value)}
          />
          <BubbleTrack
            label="Challenging"
            count={advancementSlots.challenging}
            value={ability.advancement.challenging}
            onChange={(value) => setAdvancement('challenging', value)}
          />
        </div>

        <div className={styles.bottom}>
          <div className={styles.artha}>
            {(['fate', 'persona', 'deed'] as const).map((kind) => (
              <div className={styles.arthaItem} key={kind}>
                <span className={styles.arthaLabel}>{kind}</span>
                <Stepper
                  compact
                  label={`${name} ${kind} artha`}
                  value={ability.artha[kind]}
                  onChange={(value) => setArtha(kind, value)}
                />
              </div>
            ))}
          </div>

          {onRemove && (
            <div className={styles.footer}>
              <RemoveButton onClick={onRemove} label={`Remove ${name}`} itemName={ability.name}>
                Remove
              </RemoveButton>
            </div>
          )}
        </div>
      </div>
      {epiphany && upgraded && (
        <div className={styles.overlay} role="status">
          {SPARKLES.map((sparkle) => (
            <span
              key={sparkle.left}
              className={styles.sparkle}
              style={sparkle}
              aria-hidden="true"
            />
          ))}
          <strong>{name} is ready for an epiphany!</strong>
          <div className={styles.overlayActions}>
            <Button onClick={haveEpiphany}>Raise to {upgraded}</Button>
            <button className={styles.back} type="button" onClick={() => setDismissed(true)}>
              Back
            </button>
          </div>
        </div>
      )}
      {checking && (
        <CheckModal
          ability={ability}
          openEnded={showOpenToggle && Boolean(ability.open)}
          onChange={onChange}
          arthaPool={arthaPool}
          onArthaPoolChange={onArthaPoolChange}
          woundPenalty={woundPenalty}
          onClose={() => setChecking(false)}
        />
      )}
    </article>
  )
}

export default AbilityRecord
