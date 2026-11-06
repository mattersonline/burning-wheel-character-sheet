import SectionHeading from '../../../../components/SectionHeading/SectionHeading'
import TextField from '../../../../components/TextField/TextField'
import type { SheetTabProps } from '../../types'
import styles from './styles.module.css'

const TraitsSection = ({ character, updateSheetData }: SheetTabProps) => (
  <>
    <SectionHeading number="03" title="Traits" />
    <div className={styles.grid}>
      <TextField
        label="Character traits"
        value={character.sheetData.characterTraits}
        onChange={(value) => updateSheetData('characterTraits', value)}
        placeholder="Character traits"
      />
      <TextField
        label="Die traits"
        value={character.sheetData.dieTraits}
        onChange={(value) => updateSheetData('dieTraits', value)}
        placeholder="Die traits"
      />
      <TextField
        label="Call-on traits"
        value={character.sheetData.callOnTraits}
        onChange={(value) => updateSheetData('callOnTraits', value)}
        placeholder="Call-on traits"
      />
    </div>
  </>
)

export default TraitsSection
