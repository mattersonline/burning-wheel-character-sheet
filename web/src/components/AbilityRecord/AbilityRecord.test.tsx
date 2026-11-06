import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { Ability } from '@/api/characters'
import AbilityRecord from '@/components/AbilityRecord/AbilityRecord'

const ability: Ability = {
  id: 'sword',
  name: 'Sword',
  exponent: 2,
  shade: 'black',
  skipRoutine: false,
  open: false,
  advancement: { routine: 0, difficult: 0, challenging: 0 },
  artha: { fate: 0, persona: 0, deed: 0 },
}

const renderRecord = (open: boolean, showOpenToggle: boolean) =>
  renderToStaticMarkup(
    <AbilityRecord
      ability={{ ...ability, open }}
      onChange={() => {}}
      arthaPool={ability.artha}
      onArthaPoolChange={() => {}}
      showOpenToggle={showOpenToggle}
    />,
  )

describe('open-ended skill toggle', () => {
  it('places the accessible toggle beside the name input inside its field', () => {
    const markup = renderRecord(true, true)
    expect(markup).toMatch(
      /<div class="[^"]*nameField[^"]*"><input[^>]*aria-label="Name"[^>]*\/><button[^>]*aria-pressed="true"[^>]*aria-label="Open-ended Sword"/,
    )
  })

  it('shows the inactive state and hides the toggle for other abilities', () => {
    expect(renderRecord(false, true)).toContain(
      'aria-pressed="false" aria-label="Open-ended Sword"',
    )
    expect(renderRecord(false, false)).not.toContain('Open-ended Sword')
  })
})
