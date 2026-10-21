import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { Logo } from '@/app/sidebar'
import { useAuth } from '@/auth/AuthContext'
import { Box3D } from '@/drawings/Box3D'
import { LANGUAGES, setLanguage, type Lang } from '@/i18n'
import { APP_NAME } from '@/lib/core'
import { cn } from '@/lib/cn'
import { Button } from '@/ui/button'
import { Field } from '@/ui/field'
import { Input } from '@/ui/input'
import { PasswordInput } from '@/ui/password-input'

export function LoginPage() {
  const { t, i18n } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(username.trim(), password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-full bg-canvas lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col justify-between p-6 sm:p-10">
        <div className="flex items-center gap-2.5">
          <Logo className="size-8" />
          <span className="text-[15px] font-semibold">{APP_NAME}</span>
        </div>
        <form onSubmit={submit} className="mx-auto flex w-full max-w-sm flex-col gap-4 py-10">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t('login.title')}</h1>
            <p className="mt-1 text-[13px] text-ink-3">{t('login.subtitle')}</p>
          </div>
          {error ? <p role="alert" className="rounded-md bg-bad-soft px-3 py-2 text-[13px] text-bad">{error}</p> : null}
          <Field label={t('login.username')} required>
            {(id) => <Input id={id} value={username} onChange={(e) => setUsername(e.target.value)} autoFocus autoComplete="username" className="h-10" />}
          </Field>
          <Field label={t('login.password')} required>
            {(id) => <PasswordInput id={id} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className="h-10" />}
          </Field>
          <Button type="submit" variant="primary" loading={busy} className="h-10 text-sm">
            {t('login.submit')}
          </Button>
        </form>
        <div className="flex flex-wrap justify-center gap-1">
          {LANGUAGES.map((l) => (
            <button key={l.value} type="button" onClick={() => void setLanguage(l.value as Lang)} className={cn('rounded-md px-2.5 py-1 text-xs', i18n.language === l.value ? 'bg-accent-soft font-medium text-accent-ink' : 'text-ink-3 hover:bg-sunken')}>
              {l.label}
            </button>
          ))}
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-accent lg:block">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #fff 0 1px, transparent 1px 28px), repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 28px)' }} />
        <div className="relative flex h-full flex-col justify-center gap-8 p-14 text-on-accent">
          <div className="w-64 rounded-2xl bg-white/95 p-6 shadow-float">
            <Box3D length={440} width={225} height={330} />
          </div>
          <div className="max-w-md">
            <h2 className="text-3xl font-semibold tracking-tight">{t('login.hero_title')}</h2>
            <p className="mt-3 text-[15px] leading-relaxed opacity-85">{t('login.hero_text')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
