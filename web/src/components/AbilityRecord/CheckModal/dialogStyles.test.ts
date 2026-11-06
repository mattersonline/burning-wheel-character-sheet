/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('dice dialog layout', () => {
  it('constrains the dialog to the viewport and allows vertical scrolling', () => {
    const css = readFileSync(new URL('./styles.module.css', import.meta.url), 'utf8')
    expect(css).toMatch(/\.dialog\s*\{[^}]*max-height:\s*calc\(100dvh - 32px\);/)
    expect(css).toMatch(/\.dialog\s*\{[^}]*overflow-x:\s*hidden;/)
    expect(css).toMatch(/\.dialog\s*\{[^}]*overflow-y:\s*auto;/)
    expect(css).toMatch(/\.body\s*\{[^}]*overflow:\s*clip;/)
  })
})
