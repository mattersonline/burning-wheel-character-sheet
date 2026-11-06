import { describe, expect, it } from 'vitest'
import { resolveTheme } from '@/components/ThemeToggle/useTheme'

describe('resolveTheme', () => {
  it('follows the system setting until a choice is stored', () => {
    expect(resolveTheme(null, 'dark')).toBe('dark')
    expect(resolveTheme(null, 'light')).toBe('light')
  })

  it('lets a stored choice override the system setting', () => {
    expect(resolveTheme('light', 'dark')).toBe('light')
    expect(resolveTheme('dark', 'light')).toBe('dark')
  })
})
