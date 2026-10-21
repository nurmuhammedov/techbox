import { ChevronRight } from 'lucide-react'
import { DropdownMenu } from 'radix-ui'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { APP_NAME } from '@/lib/core'
import { cn } from '@/lib/cn'
import { Tooltip } from '@/ui/feedback'

import { isActive, type NavGroup, type NavItem } from './navigation'

const OPEN_KEY = 'gofra.nav.open'

function storedOpen(): string[] {
  try {
    const raw = localStorage.getItem(OPEN_KEY)
    return raw ? (JSON.parse(raw) as string[]).slice(0, 1) : []
  } catch {
    return []
  }
}

const ROW = 'flex h-9 items-center gap-2.5 rounded-md text-[13.5px] transition-colors'
const IDLE = 'text-ink-2 hover:bg-sunken hover:text-ink'
const ACTIVE = 'bg-accent-soft font-medium text-accent-ink'

/** Two levels: a section and its screens. Unfolded one section at a time; folded to a rail, screens fly out. */
export function Sidebar({ groups, collapsed }: { groups: NavGroup[]; collapsed: boolean }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const all = groups.flatMap((group) => group.items)
  const here = (item: NavItem) => isActive(item, all, pathname)
  const current = groups.find((group) => group.items.some(here))?.key ?? null
  const [open, setOpen] = useState<string[]>(storedOpen)

  const toggle = (key: string) => {
    const next = open.includes(key) ? [] : [key]
    setOpen(next)
    try {
      localStorage.setItem(OPEN_KEY, JSON.stringify(next))
    } catch {
      // The menu still unfolds for this visit.
    }
  }

  useEffect(() => {
    if (current) setOpen((now) => (now.length === 1 && now[0] === current ? now : [current]))
  }, [current])

  return (
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-200',
        collapsed ? 'w-14' : 'w-60',
      )}
    >
      <div className={cn('flex h-13 shrink-0 items-center gap-2.5 border-b border-line', collapsed ? 'justify-center' : 'px-4')}>
        <Logo />
        {!collapsed ? (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold">{APP_NAME}</p>
            <p className="truncate text-[11px] text-ink-3">{t('app.tagline')}</p>
          </div>
        ) : null}
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-2 [&>*]:shrink-0">
        {groups.map((group) => {
          const active = group.key === current
          if (group.items.length === 1) {
            return <ScreenLink key={group.key} item={group.items[0]} label={t(group.label)} active={active} collapsed={collapsed} />
          }
          return collapsed ? (
            <Flyout key={group.key} group={group} active={active} isActive={here} />
          ) : (
            <Section
              key={group.key}
              group={group}
              active={active}
              open={open.includes(group.key)}
              onToggle={() => toggle(group.key)}
              isActive={here}
            />
          )
        })}
      </nav>
    </aside>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-7 shrink-0', className)} aria-hidden>
      <rect width="32" height="32" rx="8" fill="var(--accent)" />
      <path d="M7 12 L16 7 L25 12 L16 17 Z" fill="var(--on-accent)" opacity="0.95" />
      <path d="M7 12 V21 L16 26 V17 Z" fill="var(--on-accent)" opacity="0.7" />
      <path d="M25 12 V21 L16 26 V17 Z" fill="var(--on-accent)" opacity="0.5" />
    </svg>
  )
}

function ScreenLink({ item, label, active, collapsed }: { item: NavItem; label: string; active: boolean; collapsed: boolean }) {
  const Icon = item.icon
  const link = (
    <Link
      to={item.to}
      aria-label={collapsed ? label : undefined}
      aria-current={active ? 'page' : undefined}
      className={cn(ROW, active ? ACTIVE : IDLE, collapsed ? 'justify-center' : 'px-2.5')}
    >
      <Icon className="size-4.5 shrink-0" />
      {!collapsed ? <span className="min-w-0 flex-1 truncate">{label}</span> : null}
    </Link>
  )
  return collapsed ? (
    <Tooltip side="right" content={label}>
      {link}
    </Tooltip>
  ) : (
    link
  )
}

interface SectionProps {
  group: NavGroup
  active: boolean
  isActive: (item: NavItem) => boolean
}

function Section({ group, active, open, onToggle, isActive }: SectionProps & { open: boolean; onToggle: () => void }) {
  const { t } = useTranslation()
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={cn(ROW, 'w-full px-2.5 text-left', active && !open ? ACTIVE : cn(IDLE, active && 'text-ink'))}
      >
        <group.icon className="size-4.5 shrink-0" />
        <span className={cn('min-w-0 flex-1 truncate', active && 'font-medium')}>{t(group.label)}</span>
        <ChevronRight className={cn('size-3.5 shrink-0 text-ink-3 transition-transform', open && 'rotate-90')} />
      </button>
      {open ? (
        <div className="relative mt-0.5 mb-1 ml-[1.1rem] flex flex-col gap-0.5 border-l border-line pl-2.5">
          {group.items.map((item) => {
            const here = isActive(item)
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={here ? 'page' : undefined}
                className={cn(ROW, 'h-8.5 px-2.5', here ? ACTIVE : IDLE)}
              >
                <span className="min-w-0 flex-1 truncate" title={t(item.label)}>
                  {t(item.label)}
                </span>
              </Link>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function Flyout({ group, active, isActive }: SectionProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const label = t(group.label)
  return (
    <DropdownMenu.Root>
      <Tooltip side="right" content={label}>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            aria-label={label}
            className={cn(ROW, 'w-full justify-center data-[state=open]:bg-sunken', active ? ACTIVE : IDLE)}
          >
            <group.icon className="size-4.5 shrink-0" />
          </button>
        </DropdownMenu.Trigger>
      </Tooltip>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="right"
          align="start"
          sideOffset={10}
          className="z-50 min-w-52 rounded-lg border border-line bg-surface p-1 shadow-float data-[state=open]:animate-pop-in"
        >
          <DropdownMenu.Label className="eyebrow px-2 pt-1.5 pb-1">{label}</DropdownMenu.Label>
          {group.items.map((item) => (
            <DropdownMenu.Item
              key={item.to}
              onSelect={() => navigate(item.to)}
              className={cn(
                'flex h-8.5 cursor-default items-center gap-2 rounded-md px-2 text-[13px] outline-none select-none data-highlighted:bg-sunken [&_svg]:size-4',
                isActive(item) ? 'font-medium text-accent-ink' : 'text-ink-2 [&_svg]:text-ink-3',
              )}
            >
              <item.icon />
              {t(item.label)}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
