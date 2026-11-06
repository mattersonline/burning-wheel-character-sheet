/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('button hover feedback', () => {
  it('only adds hover outlines to enabled, non-focus-visible buttons on hover-capable devices', () => {
    const css = readFileSync(new URL('./index.css', import.meta.url), 'utf8')
    expect(css).toMatch(
      /@media \(hover: hover\)\s*\{\s*button:not\(:disabled\):not\(:focus-visible\):hover\s*\{[^}]*outline:\s*2px solid var\(--c-a55338\);/,
    )
  })

  it('does not apply button variant hover colors to disabled buttons', () => {
    const css = readFileSync(
      new URL('./components/Button/styles.module.css', import.meta.url),
      'utf8',
    )
    expect(css).toMatch(/\.primary:hover:not\(:disabled\)/)
    expect(css).toMatch(/\.danger:hover:not\(:disabled\)/)
  })
})
