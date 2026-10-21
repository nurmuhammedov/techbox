import { useSyncExternalStore } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
export type Accent = 'blue' | 'green' | 'violet' | 'orange' | 'teal' | 'rose'

export const ACCENTS: { value: Accent; color: string }[] = [
  { value: 'blue', color: '#2f5bd3' },
  { value: 'green', color: '#17734a' },
  { value: 'violet', color: '#6a3fd1' },
  { value: 'orange', color: '#c2560c' },
  { value: 'teal', color: '#0b7a80' },
  { value: 'rose', color: '#c0264f' },
]

const MODE_KEY = 'gofra.theme'
const ACCENT_KEY = 'gofra.accent'
const listeners = new Set<() => void>()

function stored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const value = localStorage.getItem(key) as T | null
    return value && allowed.includes(value) ? value : fallback
  } catch {
    return fallback
  }
}

const readMode = () => stored<ThemeMode>(MODE_KEY, ['light', 'dark', 'system'], 'light')
const readAccent = () => stored<Accent>(ACCENT_KEY, ACCENTS.map((a) => a.value), 'blue')

function apply() {
  const mode = readMode()
  const dark = mode === 'dark' || (mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
  const root = document.documentElement
  root.classList.toggle('dark', dark)
  const accent = readAccent()
  if (accent === 'blue') root.removeAttribute('data-accent')
  else root.setAttribute('data-accent', accent)
}

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // The choice still applies for this visit.
  }
  apply()
  listeners.forEach((listener) => listener())
}

export const setThemeMode = (mode: ThemeMode) => save(MODE_KEY, mode)
export const setAccent = (accent: Accent) => save(ACCENT_KEY, accent)
export const toggleTheme = () => setThemeMode(document.documentElement.classList.contains('dark') ? 'light' : 'dark')

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const useThemeMode = () => useSyncExternalStore(subscribe, readMode)
export const useAccent = () => useSyncExternalStore(subscribe, readAccent)

matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (readMode() === 'system') apply()
})

apply()
