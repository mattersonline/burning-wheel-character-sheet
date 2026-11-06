import { type InventoryItem, newInventoryItem } from '@/api/characters'
import RecordGrid, { type GridColumn } from '@/components/RecordGrid'
import SectionHeading from '@/components/SectionHeading'
import type { SheetTabProps } from '@/pages/CharacterSheet/types'

const columns: GridColumn<InventoryItem>[] = [
  {
    id: 'name',
    label: 'Name',
    kind: 'text',
    width: '25%',
    value: (item) => item.name,
    update: (item, name) => ({ ...item, name }),
  },
  {
    id: 'description',
    label: 'Description',
    kind: 'description',
    value: (item) => item.description,
    update: (item, description) => ({ ...item, description }),
  },
  {
    id: 'quantity',
    label: 'Quantity',
    kind: 'number',
    width: '100px',
    value: (item) => item.quantity,
    update: (item, quantity) => ({ ...item, quantity }),
  },
]

const InventoryTab = ({ character, updateSheetData }: SheetTabProps) => {
  return (
    <>
      <SectionHeading number="01" title="Inventory / Gear" first />
      <RecordGrid
        label="Inventory"
        rows={character.sheetData.inventory}
        columns={columns}
        onChange={(items) => updateSheetData('inventory', items)}
        createRow={newInventoryItem}
        addLabel="Add item"
        emptyMessage="No inventory items yet."
      />
    </>
  )
}

export default InventoryTab
