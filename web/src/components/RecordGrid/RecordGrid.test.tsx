import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AddButton from '@/components/AddButton'
import InlineRemoveButton from '@/components/RecordGrid/InlineRemoveButton'
import RecordGrid, { type GridColumn } from '@/components/RecordGrid/RecordGrid'

vi.mock('@/components/AddButton', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/components/AddButton')>()
  return { default: vi.fn(original.default) }
})
vi.mock('@/components/RecordGrid/InlineRemoveButton', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@/components/RecordGrid/InlineRemoveButton')>()
  return { default: vi.fn(original.default) }
})

const rows = [
  { id: 'one', name: 'First', description: 'First description' },
  { id: 'two', name: 'Second', description: 'Second description' },
]
const columns: GridColumn<(typeof rows)[number]>[] = [
  {
    id: 'name',
    label: 'Name',
    kind: 'text',
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
const props = {
  label: 'Records',
  rows,
  columns,
  onChange: vi.fn(),
  createRow: () => ({ id: 'three', name: '', description: '' }),
  addLabel: 'Add record',
  emptyMessage: 'No records yet.',
}

describe('shared record grid', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders accessible headers and distinct labels for each cell', () => {
    const markup = renderToStaticMarkup(<RecordGrid {...props} />)
    expect(markup).toContain('<table')
    expect(markup).toContain('scope="col">Name')
    expect(markup).toContain('scope="col">Description')
    expect(markup).toContain('aria-label="Name, row 1"')
    expect(markup).toContain('aria-label="Name, row 2"')
    expect(markup).toContain('aria-label="Description, row 1"')
    expect(markup).toContain('First description')
    expect(markup).toContain('Second description')
  })

  it('appends a row without changing existing rows', () => {
    renderToStaticMarkup(<RecordGrid {...props} />)
    vi.mocked(AddButton).mock.calls[0][0].onClick()
    expect(props.onChange).toHaveBeenCalledExactlyOnceWith([...rows, props.createRow()])
  })

  it('defers removal to the shared confirmation button and removes only that row', () => {
    renderToStaticMarkup(<RecordGrid {...props} />)
    expect(props.onChange).not.toHaveBeenCalled()
    const remove = vi.mocked(InlineRemoveButton).mock.calls[1][0]
    expect(remove.name).toBe('Second')
    remove.onConfirm()
    expect(props.onChange).toHaveBeenCalledExactlyOnceWith([rows[0]])
  })

  it('shows headers and an add button for an empty list', () => {
    const markup = renderToStaticMarkup(<RecordGrid {...props} rows={[]} />)
    expect(markup).toContain('No records yet.')
    expect(markup).toContain('Add record')
    expect(markup).toContain('scope="col">Name')
    expect(vi.mocked(InlineRemoveButton).mock.calls).toHaveLength(0)
  })

  it('keeps all input types aligned to their growing row with a tablet-friendly minimum', () => {
    const css = readFileSync(new URL('./styles.module.css', import.meta.url), 'utf8')
    const cell = css.match(/\.cell\s*\{([^}]+)\}/)?.[1]
    expect(cell).toContain('height: var(--row-height, 52px)')
    expect(cell).toContain('min-height: 52px')
    expect(cell).toContain('font-size: 16px')
    expect(css).toContain('overflow-x: auto')
    expect(css).toContain('resize: none')
  })
})
