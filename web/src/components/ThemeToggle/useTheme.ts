import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'bw-theme'
const query = '(prefers-color-scheme: dark)'

const readStored = (): Theme | null => {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

const systemTheme = (): Theme => (window.matchMedia(query).matches ? 'dark' : 'light')

export const resolveTheme = (stored: Theme | null, system: Theme): Theme => stored ?? system

const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#121714' : '#244b3b')
}

// An explicit choice is remembered; until then the operating system setting decides and is followed live.
// index.html runs the same lookup inline so the first paint already has the right theme.
export const useTheme = () => {
  const [stored, setStored] = useState<Theme | null>(readStored)
  const [system, setSystem] = useState<Theme>(systemTheme)

  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setSystem(media.matches ? 'dark' : 'light')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const theme = resolveTheme(stored, system)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const toggle = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setStored(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage can be unavailable (private mode); the choice then lasts for this visit only.
    }
  }, [theme])

  return { theme, toggle }
}
