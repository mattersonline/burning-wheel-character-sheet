import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { emptyCharacter } from '@/api/characters'
import TextField from '@/components/TextField'
import SheetTabs from '@/pages/CharacterSheet/SheetTabs/SheetTabs'
import type { TabId } from '@/pages/CharacterSheet/tabs'
import type { SheetTabProps } from '@/pages/CharacterSheet/types'

vi.mock('@/components/TextField', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/components/TextField')>()
  return { default: vi.fn(original.default) }
})

const props: SheetTabProps = {
  character: {
    ...emptyCharacter,
    id: 'character',
    updatedAt: '',
    sheetData: {
      ...emptyCharacter.sheetData,
      relationships: [
        { id: 'friend', name: 'Friend', description: 'An old friend', type: 'relationship' },
      ],
      inventory: [{ id: 'rope', name: 'Rope', description: 'Rope and lantern', quantity: 2 }],
    },
  },
  updateField: vi.fn(),
  updateSheetData: vi.fn(),
}

const renderTab = (activeTab: TabId) =>
  renderToStaticMarkup(
    <SheetTabs
      {...props}
      activeTab={activeTab}
      onTabChange={vi.fn()}
      checkId={null}
      onCheckOpened={vi.fn()}
    />,
  )

describe('relationships and inventory tabs', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders relationships and all six relationship types on its own tab', () => {
    const markup = renderTab('relationships')
    expect(markup).toContain('id="panel-relationships" aria-labelledby="tab-relationships"')
    expect(markup).toContain('An old friend')
    expect(markup).not.toContain('Rope and lantern')
    for (const label of [
      'Relationships',
      'Circles',
      'Named Circles',
      'Enemy Circles',
      'Reputations',
      'Affiliations',
    ]) {
      expect(markup).toContain(`>${label}</option>`)
    }
  })

  it('renders inventory rows only on the inventory tab', () => {
    const markup = renderTab('inventory')
    expect(markup).toContain('id="panel-inventory" aria-labelledby="tab-inventory"')
    expect(markup).toContain('Rope and lantern')
    expect(markup).toContain('Quantity')
    expect(markup).toContain('Add item')
    expect(markup).not.toContain('An old friend')
  })

  it('keeps identity, beliefs, instincts and traits on information without the moved fields', () => {
    const markup = renderTab('information')
    expect(markup).toContain('Belief 1')
    expect(markup).toContain('Instinct 1')
    expect(markup).toContain('Character traits')
    const labels = vi.mocked(TextField).mock.calls.map(([fieldProps]) => fieldProps.label)
    expect(labels).not.toContain('Relationships')
    expect(labels).not.toContain('Inventory')
    expect(markup).not.toContain('An old friend')
    expect(markup).not.toContain('Rope and lantern')
  })
})
