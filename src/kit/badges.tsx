import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { BatchStatus, ItemState, OrderStatus, Stage } from '@/api/types'
import { cn } from '@/lib/cn'
import { daysLeft } from '@/lib/format'
import { Badge, Tooltip } from '@/ui/feedback'

type Tone = 'neutral' | 'accent' | 'ok' | 'warn' | 'bad' | 'info'

export const STAGE_TONE: Record<Stage, string> = {
  gofra: 'bg-orange-500',
  fleksa: 'bg-violet-500',
  tikish: 'bg-cyan-500',
  yelimlash: 'bg-lime-500',
}

const ORDER_TONE: Record<OrderStatus, Tone> = { new: 'info', planned: 'accent', in_production: 'warn', done: 'ok', cancelled: 'neutral' }
const BATCH_TONE: Record<BatchStatus, Tone> = { draft: 'warn', ready: 'info', in_work: 'accent', done: 'ok', cancelled: 'neutral' }
const ITEM_TONE: Record<ItemState, Tone> = { waiting: 'info', in_work: 'warn', done: 'ok', cancelled: 'neutral' }

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation()
  return <Badge tone={ORDER_TONE[status]}>{t(`order.status.${status}`)}</Badge>
}

export function BatchStatusBadge({ status }: { status: BatchStatus }) {
  const { t } = useTranslation()
  return <Badge tone={BATCH_TONE[status]}>{t(`batch.status.${status}`)}</Badge>
}

export function ItemStateBadge({ state }: { state: ItemState }) {
  const { t } = useTranslation()
  return <Badge tone={ITEM_TONE[state]}>{t(`item.state.${state}`)}</Badge>
}

export function StageBadge({ stage }: { stage: Stage | null }) {
  const { t } = useTranslation()
  if (!stage) return <Badge tone="ok">{t('stage.finished')}</Badge>
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sunken px-2 py-0.5 text-xs font-medium text-ink-2">
      <span className={cn('size-2 rounded-full', STAGE_TONE[stage])} />
      {t(`stage.${stage}`)}
    </span>
  )
}

/** The stages an item goes through, done ones ticked, the current one highlighted. */
export function RouteSteps({ route, step, compact }: { route: Stage[]; step: number; compact?: boolean }) {
  const { t } = useTranslation()
  const all = [...route, 'store' as const]
  return (
    <ol className="flex items-center">
      {all.map((s, i) => {
        const done = i < step
        const current = i === step
        const label = s === 'store' ? t('stage.short.store') : t(`stage.short.${s}`)
        return (
          <li key={s} className="flex items-center">
            {i > 0 ? <span className={cn('h-px w-3', done || current ? 'bg-accent' : 'bg-line-strong')} /> : null}
            <Tooltip content={s === 'store' ? t('stage.finished') : t(`stage.${s}`)}>
              <span
                className={cn(
                  'inline-flex h-6 items-center gap-1 rounded-full border text-[11px] font-medium whitespace-nowrap',
                  compact ? 'px-1.5' : 'px-2',
                  done && 'border-accent bg-accent-soft text-accent-ink',
                  current && 'border-accent bg-accent text-on-accent',
                  !done && !current && 'border-line text-ink-3',
                )}
              >
                {done ? <Check className="size-3" /> : null}
                {label}
              </span>
            </Tooltip>
          </li>
        )
      })}
    </ol>
  )
}

export function Deadline({ value, done }: { value: string | null; done?: boolean }) {
  const { t } = useTranslation()
  const left = daysLeft(value)
  if (left === null) return <span className="text-ink-3">—</span>
  if (done) return <span className="tabular text-ink-2">{value?.split('-').reverse().join('.')}</span>
  const tone = left < 0 ? 'text-bad font-semibold' : left <= 2 ? 'text-warn font-semibold' : 'text-ink-2'
  const label = left < 0 ? t('deadline.overdue', { n: -left }) : left === 0 ? t('deadline.today') : t('deadline.left', { n: left })
  return (
    <Tooltip content={value?.split('-').reverse().join('.')}>
      <span className={cn('tabular whitespace-nowrap', tone)}>{label}</span>
    </Tooltip>
  )
}
