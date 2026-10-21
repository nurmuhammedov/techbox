import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ClipboardList, Clock, Factory, PackageCheck, ListChecks } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import { api } from '@/api/client'
import { STAGES, type Stage, type WorkItem } from '@/api/types'
import { Deadline, ItemStateBadge, STAGE_TONE } from '@/kit/badges'
import { cn } from '@/lib/cn'
import { num } from '@/lib/format'
import { Card, Page } from '@/ui/page'

interface Board {
  columns: Record<Stage, WorkItem[]>
  orders: { new: number; planned: number; in_production: number; overdue: number }
  batches: { draft: number; ready: number; in_work: number }
  week: { stage: Stage; qty: number | null; waste: number | null; count: number }[]
  finished_stock: number
}

function Stat({ label, value, icon, tone, to }: { label: string; value: number | undefined; icon: ReactNode; tone?: string; to?: string }) {
  const body = (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3.5 shadow-card transition-colors hover:border-line-strong">
      <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg bg-sunken text-ink-2 [&_svg]:size-5', tone)}>{icon}</span>
      <div className="min-w-0">
        <p className="text-xs leading-tight text-ink-3">{label}</p>
        <p className="tabular text-2xl leading-tight font-semibold">{value ?? '—'}</p>
      </div>
    </div>
  )
  return to ? <Link to={to}>{body}</Link> : body
}

const STAGE_BORDER: Record<Stage, string> = {
  gofra: 'border-t-orange-500 border-l-orange-500',
  fleksa: 'border-t-violet-500 border-l-violet-500',
  tikish: 'border-t-cyan-500 border-l-cyan-500',
  yelimlash: 'border-t-lime-500 border-l-lime-500',
}

export function BoardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data } = useQuery({ queryKey: ['board'], queryFn: () => api.get<Board>('/production/board') })
  const weekOf = (stage: Stage) => data?.week.find((w) => w.stage === stage)
  return (
    <Page title={t('menu.board')} flow>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6">
        <Stat label={t('order.status.new')} value={data?.orders.new} icon={<ClipboardList />} tone="bg-info-soft text-info" to="/production/plan" />
        <Stat label={t('order.status.planned')} value={data?.orders.planned} icon={<ListChecks />} tone="bg-accent-soft text-accent-ink" to="/production/batches" />
        <Stat label={t('order.status.in_production')} value={data?.orders.in_production} icon={<Factory />} tone="bg-warn-soft text-warn" />
        <Stat label={t('board.overdue')} value={data?.orders.overdue} icon={<AlertTriangle />} tone={data?.orders.overdue ? 'bg-bad-soft text-bad' : undefined} to="/sales/orders?status=all" />
        <Stat label={t('board.waiting_rolls')} value={data?.batches.draft} icon={<Clock />} tone={data?.batches.draft ? 'bg-warn-soft text-warn' : undefined} to="/inventory/allocate" />
        <Stat label={t('menu.finished')} value={data?.finished_stock} icon={<PackageCheck />} tone="bg-ok-soft text-ok" to="/production/stock" />
      </div>

      <div className="mt-4 -mx-4 overflow-x-auto px-4 pb-2">
        <div className="grid min-w-[1040px] grid-cols-4 gap-3">
          {STAGES.map((stage) => {
            const items = data?.columns[stage] ?? []
            const week = weekOf(stage)
            return (
              <section key={stage} className={cn('flex min-h-64 flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-card border-t-[3px]', STAGE_BORDER[stage])}>
                <header className="flex items-center justify-between gap-2 border-b border-line bg-sunken px-3 py-2.5">
                  <span className="flex items-center gap-2 text-[13px] font-semibold">
                    <span className={cn('size-2.5 rounded-full', STAGE_TONE[stage])} />
                    {t(`stage.${stage}`)}
                    <span className="tabular rounded-full border border-line bg-surface px-1.5 text-xs text-ink-2">{items.length}</span>
                  </span>
                  <span className="tabular text-[11px] text-ink-3">{t('board.week', { qty: num(week?.qty ?? 0) })}</span>
                </header>
                <div className="flex flex-col gap-2 p-2">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigate(`/production/items/${item.id}`)}
                      className="rounded-md border border-line bg-surface p-2.5 text-left shadow-card transition hover:border-accent"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 truncate text-[13px] font-medium">{item.name}</p>
                        <ItemStateBadge state={item.state} />
                      </div>
                      <p className="truncate text-xs text-ink-3">
                        <span className="font-code">{item.number}</span> · {item.customer_name ?? t('item.kind.pallet')}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between text-xs">
                        <b className="tabular">{num(item.qty || item.planned_qty)}</b>
                        <Deadline value={item.deadline} />
                      </div>
                      {item.operator_name ? <p className="mt-1 truncate text-[11px] text-warn">{item.operator_name}</p> : null}
                    </button>
                  ))}
                  {!items.length ? <p className="py-8 text-center text-xs text-ink-3">{t('empty')}</p> : null}
                </div>
              </section>
            )
          })}
        </div>
      </div>

      <Card title={t('board.week_title')} className="mt-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {STAGES.map((s) => {
            const w = weekOf(s)
            return (
              <div key={s} className={cn('rounded-md border border-line border-l-[3px] bg-surface p-3', STAGE_BORDER[s])}>
                <p className="flex items-center gap-2 text-[13px] font-medium">
                  <span className={cn('size-2 rounded-full', STAGE_TONE[s])} />
                  {t(`stage.${s}`)}
                </p>
                <p className="tabular mt-1 text-lg font-semibold">{num(w?.qty ?? 0)}</p>
                <p className="text-xs text-ink-3">{t('board.week_line', { qty: num(w?.qty ?? 0), runs: w?.count ?? 0, waste: num(w?.waste ?? 0, 1) })}</p>
              </div>
            )
          })}
        </div>
      </Card>
    </Page>
  )
}
