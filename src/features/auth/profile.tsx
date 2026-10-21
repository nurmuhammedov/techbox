import { Check, Monitor, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { api } from '@/api/client'
import { NotificationList } from '@/app/notifications'
import { ACCENTS, setAccent, setThemeMode, useAccent, useThemeMode, type ThemeMode } from '@/app/theme'
import { useAuth } from '@/auth/AuthContext'
import { LANGUAGES, setLanguage, type Lang } from '@/i18n'
import { cn } from '@/lib/cn'
import { fail, ok } from '@/lib/notify'
import { disablePush, enablePush, pushStatus } from '@/realtime/push'
import { playChime, setSoundEnabled, soundEnabled } from '@/realtime/sound'
import { Button } from '@/ui/button'
import { Select, Switch } from '@/ui/controls'
import { Badge } from '@/ui/feedback'
import { Field } from '@/ui/field'
import { Form } from '@/ui/form'
import { PasswordInput } from '@/ui/password-input'
import { Card, Page } from '@/ui/page'

export function ProfilePage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const mode = useThemeMode()
  const accent = useAccent()
  const [oldPassword, setOld] = useState('')
  const [newPassword, setNew] = useState('')
  const [push, setPush] = useState('off')
  const [sound, setSound] = useState(soundEnabled())

  useEffect(() => {
    void pushStatus().then(setPush)
  }, [])

  const changeLang = async (lang: Lang) => {
    await setLanguage(lang)
    await api.patch('/core/me', { language: lang }).catch(() => undefined)
  }

  const changePassword = async () => {
    try {
      await api.post('/core/me/password', { old_password: oldPassword, new_password: newPassword })
      ok(t('profile.password_changed'))
      setOld('')
      setNew('')
    } catch (e) {
      fail(e)
    }
  }

  const togglePush = async (on: boolean) => {
    try {
      if (on && !(await enablePush())) fail(t('profile.push_denied'))
      if (!on) await disablePush()
    } catch (e) {
      fail(e)
    }
    setPush(await pushStatus())
  }

  const modes: { value: ThemeMode; icon: typeof Sun }[] = [
    { value: 'light', icon: Sun },
    { value: 'dark', icon: Moon },
    { value: 'system', icon: Monitor },
  ]

  return (
    <Page title={t('profile')} flow width="narrow">
      <Card>
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-accent-soft text-base font-semibold text-accent-ink">{user?.display_name?.[0]}</span>
          <div>
            <p className="font-semibold">{user?.display_name}</p>
            <p className="text-xs text-ink-3"><span className="font-code">{user?.username}</span> · {user?.is_superuser ? t('admin') : user?.role?.name}</p>
          </div>
        </div>
      </Card>
      <Card title={t('theme.title')}>
        <div className="grid gap-4">
          <div className="grid grid-cols-3 gap-2">
            {modes.map((m) => (
              <button key={m.value} type="button" onClick={() => setThemeMode(m.value)} className={cn('flex flex-col items-center gap-1.5 rounded-lg border p-3 text-[13px] transition-colors', mode === m.value ? 'border-accent bg-accent-soft text-accent-ink' : 'border-line hover:bg-sunken')}>
                <m.icon className="size-5" />
                {t(`theme.${m.value}`)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2.5">
            {ACCENTS.map((a) => (
              <button key={a.value} type="button" onClick={() => setAccent(a.value)} title={t(`theme.color.${a.value}`)} aria-label={t(`theme.color.${a.value}`)} className={cn('flex size-9 items-center justify-center rounded-full ring-offset-2 ring-offset-surface', accent === a.value && 'ring-2 ring-ink')} style={{ background: a.color }}>
                {accent === a.value ? <Check className="size-4 text-white" /> : null}
              </button>
            ))}
          </div>
          <Field label={t('language')}>
            {(id) => <Select id={id} value={i18n.language} onChange={(v) => void changeLang(v as Lang)} options={LANGUAGES.map((l) => ({ value: l.value, label: l.label }))} />}
          </Field>
        </div>
      </Card>
      <Card title={t('notifications')}>
        <div className="grid gap-4">
          {push === 'unsupported' || push === 'denied' ? (
            <div className="flex items-center justify-between gap-2">
              <div><p className="text-[13px] font-medium">{t('profile.push')}</p><p className="text-xs text-ink-3">{t('profile.push_hint')}</p></div>
              <Badge>{t(`profile.push_${push}`)}</Badge>
            </div>
          ) : (
            <Switch checked={push === 'on'} onChange={(on) => void togglePush(on)} label={t('profile.push')} hint={t('profile.push_hint')} />
          )}
          <div className="flex items-center justify-between gap-2">
            <Switch checked={sound} onChange={(on) => { setSound(on); setSoundEnabled(on) }} label={t('profile.sound')} />
            <Button size="sm" variant="ghost" onClick={() => playChime('info')}>{t('profile.test_sound')}</Button>
          </div>
        </div>
      </Card>
      <Card title={t('profile.change_password')}>
        <Form onSubmit={changePassword}>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label={t('profile.old_password')}>{(id) => <PasswordInput id={id} value={oldPassword} onChange={(e) => setOld(e.target.value)} />}</Field>
            <Field label={t('profile.new_password')}>{(id) => <PasswordInput id={id} value={newPassword} onChange={(e) => setNew(e.target.value)} />}</Field>
          </div>
          <div className="flex justify-end"><Button type="submit" variant="primary" disabled={!oldPassword || newPassword.length < 6}>{t('save')}</Button></div>
        </Form>
      </Card>
    </Page>
  )
}

export function NotificationsPage() {
  const { t } = useTranslation()
  return (
    <Page title={t('notifications')} flow width="narrow">
      <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
        <NotificationList />
      </div>
    </Page>
  )
}
