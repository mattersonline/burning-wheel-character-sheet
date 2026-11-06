/// <reference types="node" />
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const srcDir = join(import.meta.dirname, '..', '..')

const cssFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name: string) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return cssFiles(path)
    return path.endsWith('.css') ? [path] : []
  })

const themeFile = join(srcDir, 'theme.css')
const themeCss = readFileSync(themeFile, 'utf8')
const componentSheets = cssFiles(srcDir)
  .filter((file) => file !== themeFile)
  .map((file) => ({ file, css: readFileSync(file, 'utf8') }))

const [lightBlock, darkBlock] = themeCss.split(':root[data-theme="dark"]')
const defined = (block: string) => new Set(block.match(/--[\w-]+(?=:)/g))

describe('theme.css', () => {
  it('defines every themed color variable used by the stylesheets for both themes', () => {
    const used = new Set<string>()
    for (const { css } of componentSheets) {
      for (const match of css.matchAll(/var\((--(?:c|page|panel)-[\w-]+)\)/g)) {
        used.add(match[1])
      }
    }

    const light = defined(lightBlock)
    const dark = defined(darkBlock)
    expect(used.size).toBeGreaterThan(0)
    expect([...used].filter((name) => !light.has(name))).toEqual([])
    expect([...used].filter((name) => !dark.has(name))).toEqual([])
  })

  it('leaves no raw hex colors in component stylesheets', () => {
    const offenders = componentSheets
      .filter(({ css }) => /#[0-9a-fA-F]{3,6}\b/.test(css))
      .map(({ file }) => file)
    expect(offenders).toEqual([])
  })
})
