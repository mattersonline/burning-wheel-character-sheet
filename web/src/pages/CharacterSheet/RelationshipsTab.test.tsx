import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { emptyCharacter, type Relationship, relationshipTypes } from '@/api/characters'
import RecordGrid from '@/components/RecordGrid'
import RelationshipsTab from '@/pages/CharacterSheet/RelationshipsTab'

vi.mock('@/components/RecordGrid', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/components/RecordGrid')>()
  return { default: vi.fn(original.default) }
})

describe('relationships grid', () => {
  it('persists each supported type and edits names and descriptions', () => {
    const onChange = vi.fn()
    const row: Relationship = {
      id: 'friend',
      name: 'Friend',
      description: 'Old friend',
      type: 'relationship',
    }
    renderToStaticMarkup(
      <RelationshipsTab
        character={{
          ...emptyCharacter,
          id: 'character',
          updatedAt: '',
          sheetData: { ...emptyCharacter.sheetData, relationships: [row] },
        }}
        updateField={vi.fn()}
        updateSheetData={onChange}
      />,
    )
    const grid = vi.mocked(RecordGrid<Relationship>).mock.calls[0][0]
    for (const column of grid.columns) {
      if (column.kind === 'number') throw new Error('Relationships have no numeric columns')
      const values =
        column.kind === 'select' ? relationshipTypes.map((type) => type.value) : ['Updated']
      for (const value of values) {
        grid.onChange([column.update(row, value)])
        expect(onChange).toHaveBeenLastCalledWith('relationships', [{ ...row, [column.id]: value }])
      }
    }
    expect(grid.createRow()).toEqual({
      id: expect.any(String),
      name: '',
      description: '',
      type: 'relationship',
    })
  })
})
