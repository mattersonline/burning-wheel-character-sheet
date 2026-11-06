import { useState } from 'react'
import type { Ability, Artha } from '../../../../api/characters'
import { newAbility } from '../../../../api/characters'
import CheckModal from '../../../../components/AbilityRecord/CheckModal/CheckModal'
import type { WoundPenalty } from '../../../../components/AbilityRecord/CheckModal/rules'
import DiceButton from '../../../../components/DiceButton/DiceButton'
import { calculateDerivedStats } from './derived'
import styles from './styles.module.css'

type DerivedStatsProps = {
  stats: Ability[]
  arthaPool: Artha
  onArthaPoolChange: (pool: Artha) => void
  // Wounds apply to Reflexes only; mortal wound and hesitation are unaffected.
  woundPenalty: WoundPenalty
}

type DerivedItem = {
  id: string
  label: string
  value: number
  penalized?: boolean
}

const DerivedStats = ({ stats, arthaPool, onArthaPoolChange, woundPenalty }: DerivedStatsProps) => {
  const [checking, setChecking] = useState<DerivedItem | null>(null)
  const { reflexes, mortalWound, hesitation } = calculateDerivedStats(stats)
  const items: DerivedItem[] = [
    { id: 'reflexes', label: 'Reflexes', value: reflexes, penalized: true },
    { id: 'mortal-wound', label: 'Mortal Wound', value: mortalWound },
    { id: 'hesitation', label: 'Hesitation', value: hesitation },
  ]

  return (
    <>
      <dl className={styles.derived} aria-label="Calculated stats">
        {items.map((item) => (
          <div className={styles.item} key={item.id}>
            <dt className={styles.label}>{item.label}</dt>
            <dd className={styles.value}>{item.value}</dd>
            <DiceButton
              small
              label={`Roll ${item.label}`}
              title={`Roll ${item.label} as an exponent`}
              incapacitated={item.penalized && woundPenalty.incapacitated}
              onOpen={() => setChecking(item)}
            />
          </div>
        ))}
      </dl>
      {checking && (
        <CheckModal
          ability={{
            ...newAbility(),
            id: checking.id,
            name: checking.label,
            exponent: checking.value,
          }}
          onChange={() => {}}
          arthaPool={arthaPool}
          onArthaPoolChange={onArthaPoolChange}
          woundPenalty={checking.penalized ? woundPenalty : undefined}
          tracksAdvancement={false}
          onClose={() => setChecking(null)}
        />
      )}
    </>
  )
}

export default DerivedStats
