import { useCallback, useState } from 'react'

/** A small setting remembered on this computer, such as which columns a table shows. */
export function usePreference<T>(key: string | null, fallback: T): [T, (value: T) => void] {
  const storageKey = key ? `gofra.pref.${key}` : null
  const [value, setValue] = useState<T>(() => {
    if (!storageKey) return fallback
    try {
      const raw = localStorage.getItem(storageKey)
      return raw ? (JSON.parse(raw) as T) : fallback
    } catch {
      return fallback
    }
  })
  const set = useCallback(
    (next: T) => {
      setValue(next)
      if (!storageKey) return
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch {
        // Storage unavailable: the choice holds for this visit.
      }
    },
    [storageKey],
  )
  return [value, set]
}
