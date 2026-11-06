/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('missile damage inputs', () => {
  it('centers numeric values and removes native spinner space', () => {
    const css = readFileSync(new URL('./styles.module.css', import.meta.url), 'utf8')
    expect(css).toMatch(/\.damageInput\s*\{[^}]*text-align:\s*center;/)
    expect(css).toMatch(/\.damageInput\s*\{[^}]*appearance:\s*textfield;/)
    expect(css).toMatch(
      /\.damageInput::-webkit-inner-spin-button,\s*\.damageInput::-webkit-outer-spin-button\s*\{[^}]*-webkit-appearance:\s*none;/,
    )
  })
})
