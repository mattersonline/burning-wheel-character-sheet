import SectionHeading from '../../../components/SectionHeading/SectionHeading'
import TextField from '../../../components/TextField/TextField'
import type { SheetTabProps } from '../types'
import styles from './styles.module.css'

const NotesTab = ({ character, updateField, updateSheetData }: SheetTabProps) => (
  <>
    <SectionHeading number="01" title="Notes, spells & other details" first />
    <div className={styles.longNotes}>
      <TextField
        label="Notes"
        value={character.notes}
        onChange={(value) => updateField('notes', value)}
        placeholder="Session notes, plans, open questions, and anything else to remember"
        rows={9}
      />
      <TextField
        label="Spells"
        value={character.sheetData.spells}
        onChange={(value) => updateSheetData('spells', value)}
        placeholder="Record spells and their details"
        rows={9}
      />
      <TextField
        label="Other"
        value={character.sheetData.other}
        onChange={(value) => updateSheetData('other', value)}
        placeholder="Additional character details"
        rows={9}
      />
    </div>
  </>
)

export default NotesTab
