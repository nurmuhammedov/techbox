import {
  ActionIcon,
  Button,
  Drawer,
  FileInput,
  Grid,
  Group,
  NumberInput,
  SegmentedControl,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { IconBan, IconPencil, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api, ApiError } from '@/api/client'
import type { Order, Product, Shape } from '@/api/types'
import { useAuth } from '@/auth/AuthContext'
import { Deadline, OrderStatusBadge, RouteSteps } from '@/components/Badges'
import { DataTable } from '@/components/DataTable'
import { PageHeader } from '@/components/PageHeader'
import { RemoteSelect } from '@/components/RemoteSelect'
import { date, money, num } from '@/lib/format'
import { fail, ok } from '@/lib/notify'
import { usePage } from '@/lib/queries'
import { EMPTY_SHAPE, ShapeFields } from './ShapeFields'

type FormState = Shape & {
  customer: number | null
  product: number | null
  name: string
  quantity: number | string
  price: number | string
  deadline: Date | null
  comment: string
  logo: File | null
}

function fromOrder(o: Order | null): FormState {
  if (!o) return { ...EMPTY_SHAPE, customer: null, product: null, name: '', quantity: '', price: '', deadline: null, comment: '', logo: null }
  return {
    kind: o.kind, length: o.length, width: o.width, height: o.height, joint: o.joint, sheet_length: o.sheet_length,
    sheet_width: o.sheet_width, layers: o.layers, route: o.route, scores: o.scores, customer: o.customer,
    product: o.product, name: o.name, quantity: o.quantity, price: o.price ?? '', deadline: o.deadline ? dayjs(o.deadline).toDate() : null,
    comment: o.comment, logo: null,
  }
}

export function OrderForm({ order, onDone }: { order: Order | null; onDone: () => void }) {
  const { t } = useTranslation()
  const [v, setV] = useState<FormState>(fromOrder(order))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const locked = !!order && order.status !== 'new'
  const set = (patch: Partial<FormState>) => setV((s) => ({ ...s, ...patch }))

  const pickProduct = (id: number | null, row?: Record<string, unknown>) => {
    if (!id || !row) return set({ product: null })
    const p = row as unknown as Product
    set({
      product: id, name: p.name, kind: p.kind, length: p.length, width: p.width, height: p.height, joint: p.joint,
      sheet_length: p.sheet_length, sheet_width: p.sheet_width, layers: p.layers, route: p.route, scores: p.scores,
      customer: v.customer ?? p.customer,
    })
  }

  const submit = async () => {
    setBusy(true)
    setErrors({})
    const body: Record<string, unknown> = {
      customer: v.customer, product: v.product, name: v.name, kind: v.kind, length: v.length, width: v.width,
      height: v.height, joint: v.joint, sheet_length: v.sheet_length, sheet_width: v.sheet_width, layers: v.layers,
      route: v.route, scores: v.scores, quantity: Number(v.quantity) || null, price: v.price === '' ? null : Number(v.price),
      deadline: v.deadline ? dayjs(v.deadline).format('YYYY-MM-DD') : null, comment: v.comment,
    }
    let payload: unknown = body
    if (v.logo) {
      const form = new FormData()
      for (const [k, val] of Object.entries(body)) {
        if (val === null || val === undefined) continue
        if (Array.isArray(val)) val.forEach((x) => form.append(k, String(x)))
        else form.append(k, String(val))
      }
      form.append('logo', v.logo)
      payload = form
    }
    try {
      if (order) await api.patch(`/sales/orders/${order.id}`, payload)
      else await api.post('/sales/orders', payload)
      ok()
      onDone()
    } catch (e) {
      if (e instanceof ApiError) setErrors(e.fieldErrors())
      fail(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Stack>
      <Grid gutter="xs">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <RemoteSelect label={t('customer')} url="/sales/customers" labelOf={(r) => String(r.company)} value={v.customer} onChange={(id) => set({ customer: id })} error={errors.customer} required />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <RemoteSelect
            label={t('product')}
            description={t('order.product_hint')}
            url="/catalog/products"
            params={v.customer ? { customer: v.customer } : undefined}
            labelOf={(r) => String(r.name)}
            value={v.product}
            onChange={pickProduct}
            disabled={locked}
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <TextInput label={t('name')} value={v.name} onChange={(e) => set({ name: e.currentTarget.value })} error={errors.name} required />
        </Grid.Col>
      </Grid>
      <fieldset disabled={locked} style={{ border: 0, padding: 0, margin: 0 }}>
        <ShapeFields value={v} onChange={set} errors={errors} />
      </fieldset>
      <Grid gutter="xs">
        <Grid.Col span={{ base: 6, sm: 4 }}>
          <NumberInput label={t('qty')} value={v.quantity} onChange={(x) => set({ quantity: x })} min={1} thousandSeparator=" " error={errors.quantity} required disabled={locked} />
        </Grid.Col>
        <Grid.Col span={{ base: 6, sm: 4 }}>
          <NumberInput label={t('sale.price')} value={v.price} onChange={(x) => set({ price: x })} min={0} thousandSeparator=" " />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <DateInput label={t('deadline')} value={v.deadline} onChange={(d) => set({ deadline: d })} clearable valueFormat="DD.MM.YYYY" minDate={order ? undefined : new Date()} />
        </Grid.Col>
        <Grid.Col span={12}>
          <FileInput label={t('logo')} accept="image/*" value={v.logo} onChange={(f) => set({ logo: f })} clearable />
        </Grid.Col>
        <Grid.Col span={12}>
          <Textarea label={t('note')} value={v.comment} onChange={(e) => set({ comment: e.currentTarget.value })} autosize minRows={2} />
        </Grid.Col>
      </Grid>
      {locked && <Text size="sm" c="orange.8">{t('order.locked')}</Text>}
      <Group justify="flex-end">
        <Button loading={busy} onClick={submit}>
          {t('save')}
        </Button>
      </Group>
    </Stack>
  )
}

export default function Orders() {
  const { t } = useTranslation()
  const { can } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const mobile = useMediaQuery('(max-width: 48em)')
  const [params] = useSearchParams()
  const [status, setStatus] = useState(params.get('overdue') ? 'overdue' : 'active')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debounced] = useDebouncedValue(search, 300)
  const [editing, setEditing] = useState<Order | 'new' | null>(null)
  const filters: Record<string, string | undefined> = {
    active: 'new,planned,in_production',
    overdue: 'new,planned,in_production',
    done: 'done',
    cancelled: 'cancelled',
    all: undefined,
  }
  const query = usePage<Order>('/sales/orders', {
    page,
    search: debounced || undefined,
    status__in: filters[status],
    deadline__lte: status === 'overdue' ? dayjs().subtract(1, 'day').format('YYYY-MM-DD') : undefined,
    ordering: status === 'done' ? '-created_at' : 'deadline',
  })
  const refresh = () => qc.invalidateQueries({ queryKey: ['orders'] })
  const writable = can('orders.manage')

  const act = (o: Order, kind: 'cancel' | 'delete') =>
    modals.openConfirmModal({
      title: kind === 'cancel' ? t('order.cancel_confirm') : t('confirm.delete'),
      labels: { confirm: kind === 'cancel' ? t('order.cancel') : t('delete'), cancel: t('cancel') },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          if (kind === 'cancel') await api.post(`/sales/orders/${o.id}/cancel`)
          else await api.delete(`/sales/orders/${o.id}`)
          ok()
          await refresh()
        } catch (e) {
          fail(e)
        }
      },
    })

  return (
    <>
      <PageHeader
        title={t('menu.orders')}
        actions={writable && <Button leftSection={<IconPlus size={18} />} onClick={() => setEditing('new')}>{t('order.new')}</Button>}
      />
      <Group mb="sm" wrap="wrap">
        <TextInput leftSection={<IconSearch size={16} />} placeholder={t('search')} value={search} onChange={(e) => { setSearch(e.currentTarget.value); setPage(1) }} w={{ base: '100%', sm: 260 }} />
        <SegmentedControl
          value={status}
          onChange={(x) => { setStatus(x); setPage(1) }}
          data={[
            { value: 'active', label: t('order.active') },
            { value: 'overdue', label: t('board.overdue') },
            { value: 'done', label: t('order.status.done') },
            { value: 'cancelled', label: t('order.status.cancelled') },
            { value: 'all', label: t('all') },
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
        onRowClick={(o) => o.progress.length && navigate(`/production/items/${o.progress[0].id}`)}
        columns={[
          { key: 'number', title: '№', render: (o) => <Text fw={600} size="sm">{o.number}</Text> },
          { key: 'name', title: t('name'), render: (o) => <Stack gap={0}><Text size="sm" fw={500}>{o.name}</Text><Text size="xs" c="dimmed">{o.customer_name}</Text></Stack> },
          { key: 'qty', title: t('qty'), align: 'right', render: (o) => num(o.quantity) },
          { key: 'status', title: t('status'), render: (o) => <OrderStatusBadge status={o.status} /> },
          { key: 'progress', title: t('order.progress'), hideOnMobile: true, render: (o) => o.progress[0] ? <RouteSteps route={o.progress[0].route} step={o.progress[0].step} /> : <RouteSteps route={o.route} step={-1} /> },
          { key: 'deadline', title: t('deadline'), render: (o) => <Deadline value={o.deadline} done={o.status === 'done'} /> },
          { key: 'price', title: t('sale.price'), align: 'right', hideOnMobile: true, render: (o) => money(o.price) },
          { key: 'created', title: t('created'), hideOnMobile: true, render: (o) => <Stack gap={0}><Text size="xs">{date(o.created_at)}</Text><Text size="xs" c="dimmed">{o.created_by_name}</Text></Stack> },
          {
            key: '_a',
            title: '',
            align: 'right',
            render: (o) =>
              writable && (
                <Group gap={4} justify="flex-end" wrap="nowrap" onClick={(e) => e.stopPropagation()}>
                  {o.status !== 'cancelled' && o.status !== 'done' && (
                    <ActionIcon variant="subtle" onClick={() => setEditing(o)}>
                      <IconPencil size={18} />
                    </ActionIcon>
                  )}
                  {o.status === 'new' && (
                    <>
                      <ActionIcon variant="subtle" color="orange" onClick={() => act(o, 'cancel')} aria-label={t('order.cancel')}>
                        <IconBan size={18} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="red" onClick={() => act(o, 'delete')}>
                        <IconTrash size={18} />
                      </ActionIcon>
                    </>
                  )}
                </Group>
              ),
          },
        ]}
      />
      <Drawer opened={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? t('order.new') : t('edit')} position={mobile ? 'bottom' : 'right'} size={mobile ? '94%' : 'xl'}>
        {editing !== null && (
          <OrderForm
            order={editing === 'new' ? null : editing}
            onDone={() => {
              setEditing(null)
              void refresh()
            }}
          />
        )}
      </Drawer>
    </>
  )
}
