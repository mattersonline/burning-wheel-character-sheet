import type { ReactNode } from 'react'
import type { Ability, Character } from '@/api/characters'
import FateRoller from '@/components/FateRoller'
import styles from './styles.module.css'

const AbilityBlock = ({
  label,
  abilities,
  onCheck,
}: {
  label: string
  abilities: Ability[]
  onCheck: (id: string) => void
}) => (
  <section className={styles.block} aria-label={label}>
    <h3 className={styles.heading}>{label}</h3>
    <div className={styles.abilities}>
      {abilities
        .filter((ability) => ability.name.trim())
        .map((ability) => (
          <button
            className={styles.ability}
            type="button"
            key={ability.id}
            aria-label={`Check ${ability.name}, exponent ${ability.exponent}`}
            onClick={() => onCheck(ability.id)}
          >
            <span className={styles.abilityName}>{ability.name}</span>
            <span className={styles.abilityValue}>{ability.exponent}</span>
          </button>
        ))}
    </div>
  </section>
)

type CharacterSummaryProps = {
  character: Character
  // Called with a stat or attribute id when it is tapped, to open its check.
  onCheck: (id: string) => void
  // Extra blocks shown after the stats, such as available artha.
  children?: ReactNode
}

const CharacterSummary = ({ character, onCheck, children }: CharacterSummaryProps) => {
  const details = [character.stock, character.age && `Age ${character.age}`].filter(Boolean)

  return (
    <div className={styles.root}>
      <div className={styles.summary}>
        <div className={styles.identity}>
          <p className={styles.name}>{character.name || 'Unnamed character'}</p>
          {details.length > 0 && <p className={styles.details}>{details.join(' · ')}</p>}
          <span className={styles.recordId}>ID · {character.id.slice(0, 8).toUpperCase()}</span>
          <div className={styles.fate}>
            <FateRoller />
          </div>
        </div>
        <div className={styles.blocks}>
          <AbilityBlock label="Stats" abilities={character.sheetData.stats} onCheck={onCheck} />
          <AbilityBlock
            label="Attributes"
            abilities={character.sheetData.attributes}
            onCheck={onCheck}
          />
          {children}
        </div>
      </div>
    </div>
  )
}

export default CharacterSummary
