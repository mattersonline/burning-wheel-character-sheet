import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const sourceRoot = fileURLToPath(new URL('.', import.meta.url))
const files = readdirSync(sourceRoot, { recursive: true }).filter(
  (file): file is string => typeof file === 'string' && /\.(ts|tsx)$/.test(file),
)

describe('module import conventions', () => {
  it('uses aliases for modules, with relative paths only for barrels and colocated assets', () => {
    const violations: string[] = []
    for (const file of files) {
      if (/(^|[\\/])index\.ts$/.test(file)) continue
      const text = readFileSync(`${sourceRoot}${file}`, 'utf8')
      const imports = text.matchAll(
        /(?:\bfrom\s+|\bimport\s+|\bimport\s*\(\s*|\bvi\.(?:mock|doMock)\s*\(\s*)['"](\.[^'"]+)['"]/g,
      )
      for (const [, specifier] of imports) {
        if (!/\.(css|svg|png)$/.test(specifier)) {
          violations.push(`${file}: ${specifier}`)
        }
      }
    }
    expect(violations).toEqual([])
  })

  it('maps the source alias in TypeScript', () => {
    const config = readFileSync(new URL('../tsconfig.app.json', import.meta.url), 'utf8')
    expect(config).toMatch(/"@\/\*"\s*:\s*\["\.\/src\/\*"\]/)
  })
})
