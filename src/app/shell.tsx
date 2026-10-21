import { useQueryClient } from '@tanstack/react-query'
import {
  Bell,
  Check,
  Languages,
  LogOut,
  Menu as MenuIcon,
  Monitor,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Palette,
  Sun,
  UserRound,
} from 'lucide-react'
import { DropdownMenu, Popover } from 'radix-ui'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { api } from '@/api/client'
import { useAuth } from '@/auth/AuthContext'
import { LANGUAGES, setLanguage, type Lang } from '@/i18n'
import { cn } from '@/lib/cn'
import { useRealtime } from '@/realtime/RealtimeProvider'
import { Button } from '@/ui/button'
import { Menu } from '@/ui/controls'
import { Tooltip } from '@/ui/feedback'
import { PageChrome } from '@/ui/page'

import { NotificationList, useNotifications } from './notifications'
import { NAVIGATION } from './navigation'
import { Logo, Sidebar } from './sidebar'
import { ACCENTS, setAccent, setThemeMode, useAccent, useThemeMode, type ThemeMode } from './theme'
import { PageErrorBoundary } from './error-boundary'

const COLLAPSED_KEY = 'gofra.sidebar.collapsed'
const NARROW = '(max-width: 767px)'

function useNarrow() {
  const [narrow, setNarrow] = useState(() => matchMedia(NARROW).matches)
  useEffect(() => {
    const media = matchMedia(NARROW)
    const changed = () => setNarrow(media.matches)
    media.addEventListener('change', changed)
    return () => media.removeEventListener('change', changed)
  }, [])
  return narrow
}

export function Shell() {
  const { t, i18n } = useTranslation()
  const { user, can, logout } = useAuth()
  const { connected } = useRealtime()
  const navigate = useNavigate()
  const location = useLocation()
  const narrow = useNarrow()
  const [drawer, setDrawer] = useState(false)
  const [collapsed, setCollapsedState] = useState(() => localStorage.getItem(COLLAPSED_KEY) === '1')
  const [titleSlot, setTitleSlot] = useState<HTMLElement | null>(null)
  const chrome = useMemo(() => ({ title: titleSlot }), [titleSlot])

  const setCollapsed = (value: boolean) => {
    setCollapsedState(value)
    localStorage.setItem(COLLAPSED_KEY, value ? '1' : '0')
  }

  useEffect(() => setDrawer(false), [location.pathname])

  const groups = useMemo(
    () =>
      NAVIGATION.map((group) => ({ ...group, items: group.items.filter((item) => can(...item.perms)) })).filter(
        (group) => group.items.length > 0,
      ),
    [can],
  )

  const changeLanguage = async (lang: Lang) => {
    await setLanguage(lang)
    await api.patch('/core/me', { language: lang }).catch(() => undefined)
  }

  return (
    <div className="flex h-full bg-canvas">
      {narrow ? (
        drawer ? (
          <>
            <div className="fixed inset-0 z-40 bg-overlay" onClick={() => setDrawer(false)} />
            <div className="fixed inset-y-0 left-0 z-50 flex shadow-float animate-slide-in [animation-direction:reverse]">
              <Sidebar groups={groups} collapsed={false} />
            </div>
          </>
        ) : null
      ) : (
        <Sidebar groups={groups} collapsed={collapsed} />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-13 shrink-0 items-center gap-2 border-b border-line bg-surface px-3 sm:px-4">
          <Tooltip content={collapsed ? t('nav.expand') : t('nav.collapse')}>
            <Button
              variant="ghost"
              size="icon"
              className="-ml-1 shrink-0"
              onClick={() => (narrow ? setDrawer(!drawer) : setCollapsed(!collapsed))}
              aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
            >
              {narrow ? <MenuIcon /> : collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </Button>
          </Tooltip>
          {narrow ? <Logo className="size-6" /> : null}
          <div ref={setTitleSlot} className="flex min-w-0 flex-1 items-baseline gap-2" />

          <div className="flex shrink-0 items-center gap-0.5">
            <Tooltip content={connected ? t('online') : t('offline')}>
              <span className="hidden size-8 items-center justify-center sm:flex" role="status" aria-label={connected ? t('online') : t('offline')}>
                <span className={cn('size-2 rounded-full', connected ? 'bg-ok' : 'animate-pulse bg-warn')} />
              </span>
            </Tooltip>
            <NotificationsButton />
            <Menu
              trigger={
                <Button variant="ghost" aria-label={t('language')} className="px-2">
                  <Languages />
                  <span className="hidden lg:inline">{LANGUAGES.find((l) => l.value === i18n.language)?.label}</span>
                </Button>
              }
              items={LANGUAGES.map((l) => ({
                label: l.label,
                icon: l.value === i18n.language ? <Check /> : <span className="size-4" />,
                onSelect: () => void changeLanguage(l.value),
              }))}
            />
            <ThemeMenu />
            <Menu
              trigger={
                <button type="button" className="ml-1 flex h-9 items-center gap-2 rounded-md px-1.5 text-[13px] font-medium hover:bg-sunken">
                  <span className="flex size-7 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent-ink">
                    {initials(user?.display_name ?? '')}
                  </span>
                  <span className="hidden max-w-40 flex-col items-start leading-tight md:flex">
                    <span className="block max-w-full truncate" title={user?.display_name}>{user?.display_name}</span>
                    <span className="block max-w-full truncate text-[11px] font-normal text-ink-3">
                      {user?.is_superuser ? t('admin') : user?.role?.name}
                    </span>
                  </span>
                </button>
              }
              items={[
                { label: t('profile'), icon: <UserRound />, onSelect: () => navigate('/profile') },
                'separator',
                { label: t('logout'), icon: <LogOut />, tone: 'danger', onSelect: () => void logout() },
              ]}
            />
          </div>
        </header>
        <main className="relative min-h-0 flex-1 overflow-y-auto">
          <PageChrome.Provider value={chrome}>
            <PageErrorBoundary>
              <Outlet />
            </PageErrorBoundary>
          </PageChrome.Provider>
        </main>
      </div>
    </div>
  )
}

function ThemeMenu() {
  const { t } = useTranslation()
  const mode = useThemeMode()
  const accent = useAccent()
  const modes: { value: ThemeMode; icon: typeof Sun }[] = [
    { value: 'light', icon: Sun },
    { value: 'dark', icon: Moon },
    { value: 'system', icon: Monitor },
  ]
  return (
    <DropdownMenu.Root>
      <Tooltip content={t('theme.title')}>
        <DropdownMenu.Trigger asChild>
          <Button variant="ghost" size="icon" aria-label={t('theme.title')}>
            <Palette />
          </Button>
        </DropdownMenu.Trigger>
      </Tooltip>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="z-50 w-60 rounded-lg border border-line bg-surface p-3 shadow-float data-[state=open]:animate-pop-in"
        >
          <p className="eyebrow mb-2">{t('theme.mode')}</p>
          <div className="grid grid-cols-3 gap-1.5">
            {modes.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setThemeMode(m.value)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-md border px-2 py-2 text-xs transition-colors',
                  mode === m.value ? 'border-accent bg-accent-soft text-accent-ink' : 'border-line text-ink-2 hover:bg-sunken',
                )}
              >
                <m.icon className="size-4" />
                {t(`theme.${m.value}`)}
              </button>
            ))}
          </div>
          <p className="eyebrow mt-3 mb-2">{t('theme.accent')}</p>
          <div className="flex flex-wrap gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.value}
                type="button"
                aria-label={t(`theme.color.${a.value}`)}
                title={t(`theme.color.${a.value}`)}
                onClick={() => setAccent(a.value)}
                className={cn(
                  'flex size-8 items-center justify-center rounded-full ring-offset-2 ring-offset-surface transition',
                  accent === a.value ? 'ring-2 ring-ink' : 'hover:scale-110',
                )}
                style={{ background: a.color }}
              >
                {accent === a.value ? <Check className="size-4 text-white" /> : null}
              </button>
            ))}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

function NotificationsButton() {
  const { t } = useTranslation()
  const { data } = useNotifications()
  const unread = data?.unread ?? 0
  const qc = useQueryClient()
  return (
    <Popover.Root onOpenChange={(open) => open && void qc.invalidateQueries({ queryKey: ['notifications'] })}>
      <Tooltip content={t('notifications')}>
        <Popover.Trigger asChild>
          <Button variant="ghost" size="icon" aria-label={t('notifications')} className="relative">
            <Bell />
            {unread ? (
              <span className="tabular absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-bad px-1 text-[10px] font-semibold text-white">
                {unread > 99 ? '99+' : unread}
              </span>
            ) : null}
          </Button>
        </Popover.Trigger>
      </Tooltip>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-50 w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-lg border border-line bg-surface shadow-float data-[state=open]:animate-pop-in"
        >
          <NotificationList compact />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?'
}
