import Stepper from '@/components/AbilityRecord/Stepper'
import SectionHeading from '@/components/SectionHeading'
import TabIntro from '@/components/TabIntro'
import { arthaKinds } from '@/pages/CharacterSheet/artha'
import type { SheetTabProps } from '@/pages/CharacterSheet/types'
import styles from './styles.module.css'

const ArthaTab = ({ character, updateSheetData }: SheetTabProps) => {
  const pool = character.sheetData.arthaPool

  return (
    <>
      <SectionHeading number="01" title="Artha" first />
      <TabIntro>
        Artha you currently have available. The totals also show under the character record on every
        tab.
      </TabIntro>
      <div className={styles.cards}>
        {arthaKinds.map((kind) => (
          <section className={styles.card} key={kind.key} aria-label={kind.label}>
            <h3 className={styles.name}>{kind.label}</h3>
            <p className={styles.hint}>{kind.hint}</p>
            <Stepper
              label={`${kind.label} points`}
              value={pool[kind.key]}
              onChange={(value) => updateSheetData('arthaPool', { ...pool, [kind.key]: value })}
            />
          </section>
        ))}
      </div>
    </>
  )
}

export default ArthaTab
