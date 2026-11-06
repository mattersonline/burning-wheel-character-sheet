import { describe, expect, it } from 'vitest'
import { readSheetUrl, writeSheetUrl } from './sheetUrl'
import { tabs } from './tabs'

describe('sheet URL', () => {
  it('restores the requested character and every supported tab', () => {
    for (const { id } of tabs) {
      expect(
        readSheetUrl(new URLSearchParams(`character=second&tab=${id}`), ['first', 'second']),
      ).toEqual({ characterId: 'second', tab: id, invalidCharacter: false, invalidTab: false })
    }
  })

  it('defaults an empty URL to the first character and information tab', () => {
    expect(readSheetUrl(new URLSearchParams(), ['first']).characterId).toBe('first')
    expect(readSheetUrl(new URLSearchParams(), ['first']).tab).toBe('information')
  })

  it('flags missing characters and invalid tabs for an explicit notification', () => {
    expect(readSheetUrl(new URLSearchParams('character=deleted&tab=unknown'), ['first'])).toEqual({
      characterId: 'first',
      tab: 'information',
      invalidCharacter: true,
      invalidTab: true,
    })
  })

  it('handles an empty roster without a character parameter', () => {
    const next = writeSheetUrl(new URLSearchParams('character=deleted'), null, 'notes')
    expect(next.toString()).toBe('tab=notes')
    expect(readSheetUrl(next, []).characterId).toBeNull()
  })

  it('preserves unrelated parameters and does not mutate the original URL', () => {
    const params = new URLSearchParams('other=kept&character=first&tab=combat')
    const next = writeSheetUrl(params, 'second', 'skills')
    expect(next.get('other')).toBe('kept')
    expect(next.get('character')).toBe('second')
    expect(next.get('tab')).toBe('skills')
    expect(params.get('character')).toBe('first')
  })
})
