import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { emptyCharacter, type InventoryItem } from '@/api/characters'
import RecordGrid from '@/components/RecordGrid'
import InventoryTab from '@/pages/CharacterSheet/InventoryTab/InventoryTab'
import type { SheetTabProps } from '@/pages/CharacterSheet/types'

vi.mock('@/components/RecordGrid', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/components/RecordGrid')>()
  return { default: vi.fn(original.default) }
})

const props: SheetTabProps = {
  character: {
    ...emptyCharacter,
    id: 'character',
    updatedAt: '',
    sheetData: {
      ...emptyCharacter.sheetData,
      inventory: [
        { id: 'rope', name: 'Rope', description: 'Long rope', quantity: 3 },
        { id: 'lamp', name: 'Lantern', description: 'Oil lantern', quantity: 1 },
      ],
    },
  },
  updateField: vi.fn(),
  updateSheetData: vi.fn(),
}

describe('inventory grid', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows all fields as editable table cells', () => {
    const markup = renderToStaticMarkup(<InventoryTab {...props} />)
    expect(markup).toContain('<table')
    expect(markup).toContain('aria-label="Inventory"')
    expect(markup).toContain('Long rope')
    expect(markup).toContain('Oil lantern')
    expect(markup).toContain('type="number" required="" min="0" step="1"')
    expect(markup).toContain('value="3"')
    expect(props.updateSheetData).not.toHaveBeenCalled()
  })

  it('wires name, description and quantity updates to the existing inventory data', () => {
    renderToStaticMarkup(<InventoryTab {...props} />)
    const grid = vi.mocked(RecordGrid<InventoryItem>).mock.calls[0][0]
    for (const column of grid.columns) {
      const item = props.character.sheetData.inventory[0]
      const updated =
        column.kind === 'number' ? column.update(item, 7) : column.update(item, 'Updated')
      grid.onChange([updated, props.character.sheetData.inventory[1]])
      expect(props.updateSheetData).toHaveBeenLastCalledWith('inventory', [
        { ...item, [column.id]: column.kind === 'number' ? 7 : 'Updated' },
        props.character.sheetData.inventory[1],
      ])
    }
    expect(grid.createRow()).toEqual({
      id: expect.any(String),
      name: '',
      description: '',
      quantity: 1,
    })
  })
})
