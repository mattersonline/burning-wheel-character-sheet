import SectionHeading from '@/components/SectionHeading'
import type { SheetTabProps } from '@/pages/CharacterSheet/types'

const RelationshipsTab = ({ character, updateSheetData }: SheetTabProps) => (
  <>
    <SectionHeading number="01" title="Relationships" first />
    <RecordGrid
      label="Relationships"
      rows={character.sheetData.relationships}
      columns={columns}
      onChange={(rows) => updateSheetData('relationships', rows)}
      createRow={newRelationship}
      addLabel="Add relationship"
      emptyMessage="No relationships yet."
    />
  </>
)

export default RelationshipsTab

import { newRelationship, type Relationship, relationshipTypes } from '@/api/characters'
import RecordGrid, { type GridColumn } from '@/components/RecordGrid'

const columns: GridColumn<Relationship>[] = [
  {
    id: 'type',
    label: 'Type',
    kind: 'select',
    width: '170px',
    options: relationshipTypes,
    value: (row) => row.type,
    update: (row, value) => {
      const type = relationshipTypes.find((option) => option.value === value)
      if (!type) throw new Error(`Unknown relationship type: ${value}`)
      return { ...row, type: type.value }
    },
  },
  {
    id: 'name',
    label: 'Name',
    kind: 'text',
    width: '25%',
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
