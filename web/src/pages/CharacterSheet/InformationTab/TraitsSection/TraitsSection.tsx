import SectionHeading from '@/components/SectionHeading'
import type { SheetTabProps } from '@/pages/CharacterSheet/types'
import styles from './styles.module.css'

const TraitsSection = ({ character, updateSheetData }: SheetTabProps) => (
  <>
    <SectionHeading number="03" title="Traits" />
    <div className={styles.grid}>
      {traitTypes.map(({ key, label, addLabel }) => (
        <section key={key} aria-label={label}>
          <h3 className={styles.heading}>{label}</h3>
          <RecordGrid
            label={label}
            rows={character.sheetData[key]}
            columns={columns}
            onChange={(rows) => updateSheetData(key, rows)}
            createRow={newNamedRecord}
            addLabel={addLabel}
            emptyMessage={`No ${label.toLowerCase()} yet.`}
          />
        </section>
      ))}
    </div>
  </>
)

export default TraitsSection

import { type NamedRecord, newNamedRecord } from '@/api/characters'
import RecordGrid, { type GridColumn } from '@/components/RecordGrid'

const columns: GridColumn<NamedRecord>[] = [
  {
    id: 'name',
    label: 'Name',
    kind: 'text',
    width: '30%',
    value: (row) => row.name,
    update: (row, name) => ({ ...row, name }),
  },
  {
    id: 'description',
    label: 'Description',
    kind: 'description',
    value: (row) => row.description,
    update: (row, description) => ({ ...row, description }),
  },
]

const traitTypes = [
  { key: 'characterTraits', label: 'Character traits', addLabel: 'Add character trait' },
  { key: 'dieTraits', label: 'Die traits', addLabel: 'Add die trait' },
  { key: 'callOnTraits', label: 'Call-on traits', addLabel: 'Add call-on trait' },
] as const
