import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { emptyCharacter, type NamedRecord } from '@/api/characters'
import RecordGrid from '@/components/RecordGrid'
import TraitsSection from '@/pages/CharacterSheet/InformationTab/TraitsSection/TraitsSection'
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
      characterTraits: [{ id: 'patient', name: 'Patient', description: 'Waits calmly' }],
      dieTraits: [{ id: 'keen', name: 'Keen Sight', description: 'Sharp eyes' }],
      callOnTraits: [{ id: 'clever', name: 'Clever', description: 'Quick thinking' }],
    },
  },
  updateField: vi.fn(),
  updateSheetData: vi.fn(),
}

describe('trait grids', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders three separate grids with names and descriptions', () => {
    const markup = renderToStaticMarkup(<TraitsSection {...props} />)
    for (const label of ['Character traits', 'Die traits', 'Call-on traits']) {
      expect(markup).toContain(`<table class=`)
      expect(markup).toContain(`aria-label="${label}"`)
    }
    expect(markup).toContain('Waits calmly')
    expect(markup).toContain('Sharp eyes')
    expect(markup).toContain('Quick thinking')
    expect(vi.mocked(RecordGrid).mock.calls).toHaveLength(3)
  })

  it('edits each trait list without changing the other types', () => {
    renderToStaticMarkup(<TraitsSection {...props} />)
    const keys = ['characterTraits', 'dieTraits', 'callOnTraits'] as const
    for (const [index, key] of keys.entries()) {
      const grid = vi.mocked(RecordGrid<NamedRecord>).mock.calls[index][0]
      const row = grid.rows[0]
      for (const column of grid.columns) {
        if (column.kind === 'number') throw new Error('Traits have no numeric columns')
        const updated = column.update(row, 'Changed')
        grid.onChange([updated])
        expect(props.updateSheetData).toHaveBeenLastCalledWith(key, [
          { ...row, [column.id]: 'Changed' },
        ])
      }
      expect(grid.createRow()).toEqual({ id: expect.any(String), name: '', description: '' })
    }
  })
})
