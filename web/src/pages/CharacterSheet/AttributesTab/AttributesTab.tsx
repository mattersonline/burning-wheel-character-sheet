import type { Ability } from '../../../api/characters'
import { fixedAttributeSlots } from '../../../api/characters'
import AbilityRecord from '../../../components/AbilityRecord/AbilityRecord'
import SectionHeading from '../../../components/SectionHeading/SectionHeading'
import TabIntro from '../../../components/TabIntro/TabIntro'
import { calculateWoundPenalty } from '../CombatTab/injuries'
import type { SheetTabProps } from '../types'
import DerivedStats from './DerivedStats/DerivedStats'
import styles from './styles.module.css'

const replace = (list: Ability[], next: Ability) =>
  list.map((item) => (item.id === next.id ? next : item))

const AttributesTab = ({
  character,
  updateSheetData,
  checkId,
  onCheckOpened,
}: SheetTabProps & { checkId: string | null; onCheckOpened: () => void }) => {
  const { stats, attributes, arthaPool, injuryWounds } = character.sheetData
  const woundPenalty = calculateWoundPenalty(stats, injuryWounds)

  return (
    <>
      <DerivedStats
        stats={stats}
        arthaPool={arthaPool}
        onArthaPoolChange={(pool) => updateSheetData('arthaPool', pool)}
        woundPenalty={woundPenalty}
      />
      <SectionHeading number="01" title="Stats" snug />
      <TabIntro>
        Will, Power, Agility, Perception, Forte, and Speed. Stats do not count routine tests.
      </TabIntro>
      <div className={styles.list}>
        {stats.map((stat) => (
          <AbilityRecord
            key={stat.id}
            ability={stat}
            nameLocked
            openCheck={checkId === stat.id}
            onCheckOpened={onCheckOpened}
            arthaPool={arthaPool}
            woundPenalty={woundPenalty}
            onArthaPoolChange={(pool) => updateSheetData('arthaPool', pool)}
            onChange={(next) => updateSheetData('stats', replace(stats, next))}
          />
        ))}
      </div>

      <SectionHeading number="02" title="Attributes" />
      <TabIntro>
        Health, Steel, Circles, and Resources, plus two open slots for attributes of your own,
        usually emotional.
      </TabIntro>
      <div className={styles.list}>
        {attributes.map((attribute, index) => (
          <AbilityRecord
            key={attribute.id}
            ability={attribute}
            nameLocked={index < fixedAttributeSlots.length}
            namePlaceholder="Custom attribute"
            openCheck={checkId === attribute.id}
            onCheckOpened={onCheckOpened}
            arthaPool={arthaPool}
            woundPenalty={attribute.id === 'steel' ? woundPenalty : undefined}
            onArthaPoolChange={(pool) => updateSheetData('arthaPool', pool)}
            onChange={(next) => updateSheetData('attributes', replace(attributes, next))}
          />
        ))}
      </div>
    </>
  )
}

export default AttributesTab
