import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api, setUnauthorizedHandler } from '@/api/client'
import type { Me } from '@/api/types'
import { Lang, setLanguage } from '@/i18n'

interface AuthState {
  user: Me | null
  loading: boolean
  can: (...codes: string[]) => boolean
  login: (username: string, password: string) => Promise<Me>
  logout: () => Promise<void>
  reload: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)
  const queryClient = useQueryClient()

  const apply = useCallback((me: Me | null) => {
    setUser(me)
    if (me?.language && me.language !== localStorage.getItem('lang')) {
      void setLanguage(me.language as Lang)
    }
  }, [])

  const reload = useCallback(async () => {
    try {
      apply(await api.get<Me>('/core/me'))
    } catch {
      apply(null)
    } finally {
      setLoading(false)
    }
  }, [apply])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null)
      queryClient.clear()
    })
    void reload()
  }, [reload, queryClient])

  const login = useCallback(
    async (username: string, password: string) => {
      const me = await api.post<Me>('/core/auth/login', { username, password })
      apply(me)
      return me
    },
    [apply],
  )

  const logout = useCallback(async () => {
    await api.post('/core/auth/logout').catch(() => undefined)
    setUser(null)
    queryClient.clear()
  }, [queryClient])

  const can = useCallback(
    (...codes: string[]) => {
      if (!user) return false
      if (user.is_superuser || codes.length === 0) return true
      return codes.some((c) => user.permissions.includes(c))
    },
    [user],
  )

  const value = useMemo(() => ({ user, loading, can, login, logout, reload }), [user, loading, can, login, logout, reload])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}
