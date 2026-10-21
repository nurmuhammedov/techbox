import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, BellOff, CheckCircle2, Info, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { api, type Page } from '@/api/client'
import type { Notification } from '@/api/types'
import { cn } from '@/lib/cn'
import { dateTime } from '@/lib/format'
import { Button } from '@/ui/button'

export function useNotifications(page = 1) {
  return useQuery({
    queryKey: ['notifications', page],
    queryFn: () => api.get<Page<Notification> & { unread: number }>('/notifications/', { page, page_size: 20 }),
    refetchInterval: 120_000,
  })
}

const ICONS = {
  info: { icon: Info, tone: 'text-info bg-info-soft' },
  success: { icon: CheckCircle2, tone: 'text-ok bg-ok-soft' },
  warning: { icon: AlertTriangle, tone: 'text-warn bg-warn-soft' },
  danger: { icon: XCircle, tone: 'text-bad bg-bad-soft' },
}

export function NotificationList({ compact }: { compact?: boolean }) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const { data } = useNotifications(page)
  const qc = useQueryClient()
  const navigate = useNavigate()

  const markRead = async (ids?: number[]) => {
    await api.post('/notifications/read', ids ? { ids } : {})
    await qc.invalidateQueries({ queryKey: ['notifications'] })
  }

  const open = async (n: Notification) => {
    if (!n.read_at) await markRead([n.id])
    if (n.link) navigate(n.link)
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
        <p className="text-sm font-semibold">{t('notifications')}</p>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" disabled={!data?.unread} onClick={() => void markRead()}>
            {t('notifications.read_all')}
          </Button>
          {compact ? (
            <Button size="sm" variant="ghost" onClick={() => navigate('/notifications')}>
              {t('all')}
            </Button>
          ) : null}
        </div>
      </div>
      <div className={cn('flex flex-col', compact && 'max-h-[26rem] overflow-y-auto')}>
        {data?.results.map((n) => {
          const meta = ICONS[n.level]
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => void open(n)}
              className={cn(
                'flex items-start gap-3 border-b border-line px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-sunken',
                !n.read_at && 'bg-accent-soft/50',
              )}
            >
              <span className={cn('mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full', meta.tone)}>
                <meta.icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn('block text-[13px] leading-snug', !n.read_at && 'font-semibold')}>{n.title}</span>
                {n.body ? <span className="mt-0.5 block text-xs text-ink-2">{n.body}</span> : null}
                <span className="mt-0.5 block text-[11px] text-ink-3">{dateTime(n.created_at)}</span>
              </span>
              {!n.read_at ? <span className="mt-2 size-2 shrink-0 rounded-full bg-accent" /> : null}
            </button>
          )
        })}
        {data && !data.results.length ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-ink-3">
            <BellOff className="size-6" />
            <p className="text-[13px]">{t('notifications.empty')}</p>
          </div>
        ) : null}
      </div>
      {!compact && data && data.pages > 1 ? (
        <div className="flex items-center justify-center gap-2 border-t border-line p-2">
          <Button size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            ‹
          </Button>
          <span className="tabular text-xs text-ink-2">
            {page} / {data.pages}
          </span>
          <Button size="sm" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>
            ›
          </Button>
        </div>
      ) : null}
    </div>
  )
}
