import { Badge, Group, Text, Tooltip } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import type { BatchStatus, ItemState, OrderStatus, Stage } from '@/api/types'
import { daysLeft } from '@/lib/format'

export const STAGE_COLORS: Record<Stage, string> = {
  gofra: 'orange',
  fleksa: 'grape',
  tikish: 'cyan',
  yelimlash: 'lime',
}

const ORDER_COLORS: Record<OrderStatus, string> = {
  new: 'blue',
  planned: 'violet',
  in_production: 'orange',
  done: 'teal',
  cancelled: 'gray',
}

const BATCH_COLORS: Record<BatchStatus, string> = {
  draft: 'yellow',
  ready: 'blue',
  in_work: 'orange',
  done: 'teal',
  cancelled: 'gray',
}

const ITEM_COLORS: Record<ItemState, string> = {
  waiting: 'blue',
  in_work: 'orange',
  done: 'teal',
  cancelled: 'gray',
}

export function StageBadge({ stage }: { stage: Stage | null }) {
  const { t } = useTranslation()
  if (!stage) return <Badge color="teal">{t('stage.finished')}</Badge>
  return <Badge color={STAGE_COLORS[stage]}>{t(`stage.${stage}`)}</Badge>
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation()
  return <Badge color={ORDER_COLORS[status]} variant="light">{t(`order.status.${status}`)}</Badge>
}

export function BatchStatusBadge({ status }: { status: BatchStatus }) {
  const { t } = useTranslation()
  return <Badge color={BATCH_COLORS[status]} variant="light">{t(`batch.status.${status}`)}</Badge>
}

export function ItemStateBadge({ state }: { state: ItemState }) {
  const { t } = useTranslation()
  return <Badge color={ITEM_COLORS[state]} variant="light">{t(`item.state.${state}`)}</Badge>
}

export function RouteSteps({ route, step }: { route: Stage[]; step: number }) {
  const { t } = useTranslation()
  return (
    <Group gap={4} wrap="nowrap">
      {route.map((s, i) => (
        <Tooltip key={s} label={t(`stage.${s}`)}>
          <Badge
            size="sm"
            radius="sm"
            color={i < step ? 'teal' : i === step ? STAGE_COLORS[s] : 'gray'}
            variant={i === step ? 'filled' : 'light'}
          >
            {t(`stage.short.${s}`)}
          </Badge>
        </Tooltip>
      ))}
      <Badge size="sm" radius="sm" color={step >= route.length ? 'teal' : 'gray'} variant={step >= route.length ? 'filled' : 'light'}>
        {t('stage.short.store')}
      </Badge>
    </Group>
  )
}

export function Deadline({ value, done }: { value: string | null; done?: boolean }) {
  const { t } = useTranslation()
  const left = daysLeft(value)
  if (left === null) return <Text c="dimmed" size="sm">—</Text>
  const color = done ? 'dimmed' : left < 0 ? 'red' : left <= 2 ? 'orange' : undefined
  const label = left < 0 ? t('deadline.overdue', { n: -left }) : left === 0 ? t('deadline.today') : t('deadline.left', { n: left })
  return (
    <Tooltip label={value}>
      <Text size="sm" c={color} fw={color && !done ? 600 : undefined}>
        {done ? value : label}
      </Text>
    </Tooltip>
  )
}
