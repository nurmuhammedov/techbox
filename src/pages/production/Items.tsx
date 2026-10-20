import { Button, Card, Grid, Group, Image, Modal, MultiSelect, NumberInput, SegmentedControl, Stack, Text, TextInput, Timeline } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { IconArrowsSplit, IconCash, IconSearch } from '@tabler/icons-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '@/api/client'
import type { Stage, WorkItem } from '@/api/types'
import { useAuth } from '@/auth/AuthContext'
import { Deadline, ItemStateBadge, RouteSteps, StageBadge } from '@/components/Badges'
import { DataTable } from '@/components/DataTable'
import { PageHeader } from '@/components/PageHeader'
import { RemoteSelect } from '@/components/RemoteSelect'
import { date, dateTime, kg, num } from '@/lib/format'
import { useAction, useOne, usePage } from '@/lib/queries'
import { Row } from './Batches'

export function SellModal({ item, onClose }: { item: WorkItem; onClose: () => void }) {
  const { t } = useTranslation()
  const [customer, setCustomer] = useState<number | null>(null)
  const [quantity, setQuantity] = useState<number | string>(item.available_qty)
  const [price, setPrice] = useState<number | string>('')
  const sell = useAction(
    () => api.post('/sales/sales', { customer, work_item: item.id, quantity: Number(quantity), price: Number(price || 0) }),
    { success: t('sale.done'), invalidate: ['items', 'sales'], onSuccess: onClose },
  )
  return (
    <Modal opened onClose={onClose} title={`${t('sale.sell')}: ${item.name}`} centered>
      <Stack>
        <RemoteSelect label={t('customer')} url="/sales/customers" labelOf={(r) => String(r.company)} value={customer} onChange={setCustomer} required />
        <NumberInput label={t('qty')} description={t('sale.available', { n: num(item.available_qty) })} value={quantity} onChange={setQuantity} min={1} max={item.available_qty} thousandSeparator=" " />
        <NumberInput label={t('sale.price')} value={price} onChange={setPrice} min={0} thousandSeparator=" " />
        <Button disabled={!customer || !quantity} loading={sell.isPending} onClick={() => sell.mutate(undefined)}>
          {t('sale.sell')}
        </Button>
      </Stack>
    </Modal>
  )
}

export function FinishedStock() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { can } = useAuth()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debounced] = useDebouncedValue(search, 300)
  const [kind, setKind] = useState('all')
  const [selling, setSelling] = useState<WorkItem | null>(null)
  const query = usePage<WorkItem>('/production/items', {
    available: 1,
    page,
    search: debounced || undefined,
    kind: kind === 'all' ? undefined : kind,
    ordering: '-finished_at',
  })
  return (
    <>
      <PageHeader title={t('menu.finished')} subtitle={t('finished.subtitle')} />
      <Group mb="sm">
        <TextInput leftSection={<IconSearch size={16} />} placeholder={t('search')} value={search} onChange={(e) => setSearch(e.currentTarget.value)} />
        <SegmentedControl
          value={kind}
          onChange={setKind}
          data={[
            { value: 'all', label: t('all') },
            { value: 'order', label: t('item.kind.order') },
            { value: 'pallet', label: t('item.kind.pallet') },
          ]}
        />
      </Group>
      <DataTable
        rows={query.data?.results}
        loading={query.isLoading}
        page={page}
        pages={query.data?.pages}
        total={query.data?.count}
        onPage={setPage}
        onRowClick={(i) => navigate(`/production/items/${i.id}`)}
        columns={[
          { key: 'name', title: t('name'), render: (i) => <Stack gap={0}><Text fw={600} size="sm">{i.name}</Text><Text size="xs" c="dimmed">{i.number} · {i.size}</Text></Stack> },
          { key: 'customer', title: t('customer'), render: (i) => i.customer_name ?? t('item.kind.pallet') },
          { key: 'available', title: t('finished.available'), align: 'right', render: (i) => <Text fw={700}>{num(i.available_qty)}</Text> },
          { key: 'sold', title: t('finished.sold'), align: 'right', render: (i) => num(i.sold_qty), hideOnMobile: true },
          { key: 'finished', title: t('batch.finished'), render: (i) => date(i.finished_at), hideOnMobile: true },
          {
            key: 'sell',
            title: '',
            align: 'right',
            render: (i) =>
              can('sales.manage') && (
                <Button size="xs" leftSection={<IconCash size={14} />} onClick={(e) => { e.stopPropagation(); setSelling(i) }}>
                  {t('sale.sell')}
                </Button>
              ),
          },
        ]}
      />
      {selling && <SellModal item={selling} onClose={() => setSelling(null)} />}
    </>
  )
}

function SplitModal({ item, onClose }: { item: WorkItem; onClose: () => void }) {
  const { t } = useTranslation()
  const [qty, setQty] = useState<number | string>('')
  const [route, setRoute] = useState<Stage[]>(item.route.slice(item.step))
  const [note, setNote] = useState('')
  const split = useAction(() => api.post(`/production/items/${item.id}/split`, { qty: Number(qty), route, note }), {
    success: t('item.split_done'),
    invalidate: ['items', 'queue'],
    onSuccess: onClose,
  })
  const rest: Stage[] = ['fleksa', 'tikish', 'yelimlash']
  return (
    <Modal opened onClose={onClose} title={t('item.split')} centered>
      <Stack>
        <Text size="sm" c="dimmed">
          {t('item.split_hint')}
        </Text>
        <NumberInput label={t('qty')} value={qty} onChange={setQty} min={1} max={item.qty - 1} thousandSeparator=" " />
        <MultiSelect label={t('item.new_route')} data={rest.map((s) => ({ value: s, label: t(`stage.${s}`) }))} value={route} onChange={(v) => setRoute(v as Stage[])} />
        <TextInput label={t('note')} value={note} onChange={(e) => setNote(e.currentTarget.value)} />
        <Button disabled={!qty} loading={split.isPending} onClick={() => split.mutate(undefined)}>
          {t('item.split')}
        </Button>
      </Stack>
    </Modal>
  )
}

export function ItemDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { can } = useAuth()
  const [selling, setSelling] = useState(false)
  const [splitting, setSplitting] = useState(false)
  const { data: i } = useOne<WorkItem>(`/production/items/${id}`)
  if (!i) return null
  return (
    <>
      <PageHeader
        title={
          <Group gap="sm">
            {i.name} <ItemStateBadge state={i.state} />
          </Group>
        }
        subtitle={`${i.number} · ${i.customer_name ?? t('item.kind.pallet')}`}
        actions={
          <>
            {i.state === 'waiting' && i.step > 0 && can('production.plan') && (
              <Button variant="default" leftSection={<IconArrowsSplit size={18} />} onClick={() => setSplitting(true)}>
                {t('item.split')}
              </Button>
            )}
            {i.available_qty > 0 && can('sales.manage') && (
              <Button leftSection={<IconCash size={18} />} onClick={() => setSelling(true)}>
                {t('sale.sell')}
              </Button>
            )}
          </>
        }
      />
      <Grid>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card withBorder radius="md">
            <Stack gap={6}>
              {i.logo && <Image src={i.logo} h={80} fit="contain" />}
              <Row label={t('stage.current')} value={<StageBadge stage={i.stage} />} />
              <Row label={t('route')} value={<RouteSteps route={i.route} step={i.step} />} />
              <Row label={t('size')} value={i.size} />
              <Row label={t('qty')} value={`${num(i.qty)} / ${num(i.planned_qty)}`} />
              <Row label={t('finished.sold')} value={num(i.sold_qty)} />
              <Row label={t('deadline')} value={<Deadline value={i.deadline} done={i.state === 'done'} />} />
              <Row label={t('batch')} value={<Text size="sm" c="blue" style={{ cursor: 'pointer' }} onClick={() => navigate(`/production/batches/${i.batch}`)}>{i.batch_number}</Text>} />
              {i.order_number && <Row label={t('order')} value={i.order_number} />}
              <Row label={t('warehouse')} value={i.warehouse_name ?? '—'} />
              {i.operator_name && <Row label={t('operator')} value={i.operator_name} />}
              {i.note && <Row label={t('note')} value={i.note} />}
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card withBorder radius="md">
            <Timeline bulletSize={22} active={(i.runs?.length ?? 1) - 1}>
              {i.runs?.map((r) => (
                <Timeline.Item key={r.id} title={t(`stage.${r.stage}`)}>
                  <Text size="sm">
                    {r.operator_name ?? '—'} · {dateTime(r.started_at)} → {r.finished_at ? dateTime(r.finished_at) : t('item.state.in_work')}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {t('item.run_line', { in: num(r.qty_in), out: r.qty_out === null ? '—' : num(r.qty_out) })}
                    {r.waste_kg ? ` · ${t('work.waste_kg')}: ${kg(r.waste_kg)}` : ''}
                  </Text>
                  {r.note && <Text size="sm">{r.note}</Text>}
                </Timeline.Item>
              ))}
            </Timeline>
            {!i.runs?.length && <Text c="dimmed">{t('item.no_runs')}</Text>}
          </Card>
        </Grid.Col>
      </Grid>
      {selling && <SellModal item={i} onClose={() => setSelling(false)} />}
      {splitting && <SplitModal item={i} onClose={() => setSplitting(false)} />}
    </>
  )
}
