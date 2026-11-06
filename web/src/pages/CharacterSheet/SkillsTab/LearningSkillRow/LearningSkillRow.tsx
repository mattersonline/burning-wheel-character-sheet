import { useState } from 'react'
import type { Ability, Artha, LearningSkill } from '../../../../api/characters'
import { newAbility, statSlots } from '../../../../api/characters'
import BubbleTrack from '../../../../components/AbilityRecord/BubbleTrack/BubbleTrack'
import CheckModal from '../../../../components/AbilityRecord/CheckModal/CheckModal'
import {
  type AdvancementKind,
  learningAptitude,
  type WoundPenalty,
} from '../../../../components/AbilityRecord/CheckModal/rules'
import Button from '../../../../components/Button/Button'
import DiceButton from '../../../../components/DiceButton/DiceButton'
import RemoveButton from '../../../../components/RemoveButton/RemoveButton'
import styles from './styles.module.css'

type LearningSkillRowProps = {
  skill: LearningSkill
  stats: Ability[]
  arthaPool: Artha
  onArthaPoolChange: (pool: Artha) => void
  woundPenalty: WoundPenalty
  // Difficult and challenging tests count toward the root stat instead of the skill.
  onStatTest: (statId: string, kind: AdvancementKind) => void
  onChange: (skill: LearningSkill) => void
  onRemove: () => void
  // Called with the new skill record once enough tests are recorded.
  onOpen: (skill: Ability) => void
}

const LearningSkillRow = ({
  skill,
  stats,
  arthaPool,
  onArthaPoolChange,
  woundPenalty,
  onStatTest,
  onChange,
  onRemove,
  onOpen,
}: LearningSkillRowProps) => {
  const [checking, setChecking] = useState(false)
  const stat = stats.find((item) => item.id === skill.stat)
  const name = skill.name || 'skill'
  const [dismissed, setDismissed] = useState(false)
  // Aptitude comes only from the root stat. It is also stored so the API can cap the tests.
  const aptitude = stat ? learningAptitude(stat.exponent) : skill.aptitude
  const ready = !!stat && skill.checks >= aptitude
  const celebrating = ready && !dismissed

  const update = (patch: Partial<LearningSkill>) => {
    const next = { ...skill, ...patch }
    const root = stats.find((item) => item.id === next.stat)
    const limit = root ? learningAptitude(root.exponent) : next.aptitude
    onChange({ ...next, aptitude: limit, checks: Math.min(next.checks, limit) })
  }

  const recordTest = (kind: AdvancementKind | null) => {
    if (kind && kind !== 'routine') {
      onStatTest(skill.stat, kind)
    } else {
      setDismissed(false)
      update({ checks: skill.checks + 1 })
    }
  }

  const openSkill = () => onOpen({ ...newAbility(), id: skill.id, name: skill.name })

  return (
    <article
      className={`${styles.record} ${celebrating ? styles.ready : ''}`}
      aria-label={skill.name || 'Unnamed skill being learned'}
    >
      <div className={`${styles.content} ${celebrating ? styles.faded : ''}`} inert={celebrating}>
        <div className={styles.top}>
          <DiceButton
            label={`Test ${name}`}
            title={stat ? "Roll a beginner's luck test" : 'Choose a stat to test with'}
            disabled={!stat || !skill.name}
            incapacitated={woundPenalty.incapacitated}
            onOpen={() => setChecking(true)}
          />
          <input
            className={styles.name}
            aria-label="Name"
            value={skill.name}
            placeholder="Skill name"
            onChange={(event) => update({ name: event.target.value })}
          />
          <select
            className={styles.stat}
            aria-label={`${name} stat`}
            value={skill.stat}
            onChange={(event) => update({ stat: event.target.value })}
          >
            <option value="">Stat</option>
            {statSlots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.bottom}>
          <BubbleTrack
            label="Tests"
            count={aptitude}
            value={skill.checks}
            onChange={(checks) => {
              setDismissed(false)
              update({ checks })
            }}
          />
          <div className={styles.footer}>
            {ready && <Button onClick={openSkill}>Open skill</Button>}
            <RemoveButton onClick={onRemove} label={`Remove ${name}`} itemName={skill.name}>
              Remove
            </RemoveButton>
          </div>
        </div>
      </div>

      {celebrating && (
        <div className={styles.overlay} role="status">
          <strong>{skill.name} is ready to open!</strong>
          <div className={styles.overlayActions}>
            <Button onClick={openSkill}>Open skill</Button>
            <button className={styles.back} type="button" onClick={() => setDismissed(true)}>
              Back
            </button>
          </div>
        </div>
      )}

      {checking && stat && (
        <CheckModal
          beginnersLuck
          tracksAdvancement={false}
          ability={{ ...newAbility(), id: skill.id, name: skill.name, ...pickStat(stat) }}
          onChange={() => {}}
          arthaPool={arthaPool}
          onArthaPoolChange={onArthaPoolChange}
          woundPenalty={woundPenalty}
          opensSkill={ready}
          statName={stat.name}
          onRoll={recordTest}
          onClose={() => setChecking(false)}
        />
      )}
    </article>
  )
}

const pickStat = (stat: Ability) => ({ exponent: stat.exponent, shade: stat.shade })

export default LearningSkillRow
