import SectionHeading from '../../../components/SectionHeading/SectionHeading'
import TextField from '../../../components/TextField/TextField'
import type { SheetTabProps } from '../types'
import IdentitySection from './IdentitySection/IdentitySection'
import SlotsSection from './SlotsSection/SlotsSection'
import styles from './styles.module.css'
import TraitsSection from './TraitsSection/TraitsSection'

const beliefSlots = [
  { id: 'belief-1', label: 'Belief 1' },
  { id: 'belief-2', label: 'Belief 2' },
  { id: 'belief-3', label: 'Belief 3' },
]
const instinctSlots = [
  { id: 'instinct-1', label: 'Instinct 1' },
  { id: 'instinct-2', label: 'Instinct 2' },
  { id: 'instinct-3', label: 'Instinct 3' },
]

const replaceAt = (values: string[], index: number, value: string) =>
  values.map((current, valueIndex) => (valueIndex === index ? value : current))

const InformationTab = (props: SheetTabProps) => {
  const { character, updateSheetData } = props
  const { sheetData } = character

  return (
    <>
      <IdentitySection {...props} />

      <SlotsSection
        number="01"
        title="Beliefs"
        slots={beliefSlots}
        values={sheetData.beliefs}
        placeholder="What do they believe, and what are they trying to achieve?"
        onChange={(index, value) =>
          updateSheetData('beliefs', replaceAt(sheetData.beliefs, index, value))
        }
        extra={{
          label: 'Special belief',
          value: sheetData.specialBelief,
          placeholder: 'A special belief',
          onChange: (value) => updateSheetData('specialBelief', value),
        }}
      />

      <SlotsSection
        number="02"
        title="Instincts"
        slots={instinctSlots}
        values={sheetData.instincts}
        placeholder="What do they do without thinking?"
        onChange={(index, value) =>
          updateSheetData('instincts', replaceAt(sheetData.instincts, index, value))
        }
      />

      <TraitsSection {...props} />

      <SectionHeading number="04" title="Relationships & inventory" />
      <div className={styles.writingGrid}>
        <TextField
          label="Relationships"
          value={sheetData.relationships}
          onChange={(value) => updateSheetData('relationships', value)}
          placeholder="Important people, connections, and obligations"
        />
        <TextField
          label="Inventory"
          value={sheetData.inventory}
          onChange={(value) => updateSheetData('inventory', value)}
          placeholder="Possessions and carried gear"
        />
      </div>
    </>
  )
}

export default InformationTab
