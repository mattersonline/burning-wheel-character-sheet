import { describe, expect, it } from 'vitest'
import { dieRollDuration } from '@/components/AbilityRecord/CheckModal/Die/Die'

describe('die animation duration', () => {
  it('slows animated rolls while keeping reduced-motion rolls immediate', () => {
    expect(dieRollDuration(true)).toBe(800)
    expect(dieRollDuration(false)).toBe(0)
  })
})
