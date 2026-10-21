import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Ban, Pencil, Printer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { api, ApiError } from '@/api/client'
import type { Order, Product, Shape } from '@/api/types'
import { useAuth } from '@/auth/AuthContext'
import { ShapeView } from '@/drawings/ShapeView'
import { Deadline, ItemStateBadge, OrderStatusBadge, RouteSteps } from '@/kit/badges'
import { RemoteCombo } from '@/kit/fields'
import { ImageField } from '@/kit/ImageField'
import { useListState } from '@/kit/list-state'
import { FormFooter, ResourceList } from '@/kit/resource'
import { EMPTY_SHAPE, ShapeEditor } from '@/features/shape/ShapeEditor'
import { dateTime, money, num } from '@/lib/format'
import { fail, ok } from '@/lib/notify'
import { Button } from '@/ui/button'
import { FilterSelect } from '@/ui/column-filters'
import { DateInput } from '@/ui/date-input'
import { useConfirm } from '@/ui/dialog'
import { Skeleton } from '@/ui/feedback'
import { Field } from '@/ui/field'
import { Form } from '@/ui/form'
import { Input, Textarea } from '@/ui/input'
import { NumberInput } from '@/ui/number-input'
import { Card, Page } from '@/ui/page'

const STATUS_GROUPS: Record<string, string | undefined> = {
  active: 'new,planned,in_production',
  new: 'new',
  planned: 'planned',
  in_production: 'in_production',
  done: 'done',
  cancelled: 'cancelled',
  all: undefined,
}

export function OrdersPage() {
  const { t } = useTranslation()
  const { can } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const confirm = useConfirm()
  const state = useListState()
  const status = state.filter('status') ?? 'active'

  const cancel = async (o: Order) => {
    if (!(await confirm({ title: t('order.cancel_confirm'), confirmLabel: t('order.cancel'), tone: 'danger' }))) return
    try {
      await api.post(`/sales/orders/${o.id}/cancel`)
      ok()
      await qc.invalidateQueries({ queryKey: ['orders'] })
    } catch (e) {
      fail(e)
    }
  }

  const columns: ColumnDef<Order, unknown>[] = [
    {
      id: 'number',
      header: '№',
      cell: ({ row }) => <span className="font-code font-medium">{row.original.number}</span>,
      meta: { sortKey: 'created_at', fixed: true, export: (r: Order) => r.number },
    },
    {
      id: 'name',
      header: t('name'),
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.name}</p>
          <p className="truncate text-xs text-ink-3">{row.original.customer_name}</p>
        </div>
      ),
      meta: { export: (r: Order) => `${r.name} — ${r.customer_name}` },
    },
    {
      id: 'size',
      header: t('size'),
      cell: ({ row }) => <span className="tabular text-ink-2">{sizeOf(row.original)}</span>,
      meta: { export: (r: Order) => sizeOf(r) },
    },
    {
      id: 'quantity',
      header: t('qty'),
      cell: ({ row }) => <span className="tabular">{num(row.original.quantity)}</span>,
      meta: { sortKey: 'quantity', className: 'text-right', export: (r: Order) => r.quantity },
    },
    {
      id: 'status',
      header: t('status'),
      cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
      meta: { export: (r: Order) => t(`order.status.${r.status}`) },
    },
    {
      id: 'progress',
      header: t('order.progress'),
      cell: ({ row }) => {
        const item = row.original.progress[0]
        return <RouteSteps route={item?.route ?? row.original.route} step={item ? item.step : -1} compact />
      },
    },
    {
      id: 'deadline',
      header: t('deadline'),
      cell: ({ row }) => <Deadline value={row.original.deadline} done={row.original.status === 'done'} />,
      meta: { sortKey: 'deadline', export: (r: Order) => r.deadline },
    },
    {
      id: 'price',
      header: t('sale.price'),
      cell: ({ row }) => <span className="tabular">{money(row.original.price)}</span>,
      meta: { className: 'text-right', export: (r: Order) => r.price },
    },
    {
      id: 'created',
      header: t('created'),
      cell: ({ row }) => (
        <div className="text-xs">
          <p className="tabular">{dateTime(row.original.created_at)}</p>
          <p className="text-ink-3">{row.original.created_by_name}</p>
        </div>
      ),
    },
  ]

  return (
    <ResourceList<Order>
      title="menu.orders"
      url="/sales/orders"
      base="/sales/orders"
      columns={columns}
      writePermission="orders.manage"
      deletable={false}
      addLabel="order.new"
      defaultSort="deadline"
      params={{ status__in: STATUS_GROUPS[status] }}
      onRowOpen={(o) => navigate(`/sales/orders/${o.id}`)}
      rowMenu={(o) => (o.status === 'new' && can('orders.manage') ? [{ label: t('order.cancel'), icon: <Ban />, onSelect: () => void cancel(o), tone: 'danger' }] : [])}
      filters={{
        status: (
          <FilterSelect
            value={status}
            onChange={(v) => state.set({ status: v === 'active' ? undefined : v })}
            options={Object.keys(STATUS_GROUPS).map((k) => ({ value: k, label: k === 'active' ? t('order.active') : k === 'all' ? t('all') : t(`order.status.${k}`) }))}
          />
        ),
      }}
    />
  )
}

export function sizeOf(o: Pick<Shape, 'kind' | 'length' | 'width' | 'height' | 'sheet_length' | 'sheet_width'>) {
  if (o.kind === 'sheet') return o.sheet_width ? `${o.sheet_width}×${o.sheet_length}` : '—'
  return o.length ? `${o.length}×${o.width}×${o.height}` : '—'
}

// ───────────────────────────── Form ─────────────────────────────

type FormState = Shape & {
  customer: number | null
  product: number | null
  name: string
  quantity: number | null
  price: number | null
  deadline: string
  comment: string
  logo: File | null | undefined
}

const fromOrder = (o: Order | null): FormState =>
  o
    ? {
        kind: o.kind, length: o.length, width: o.width, height: o.height, joint: o.joint, sheet_length: o.sheet_length,
        sheet_width: o.sheet_width, layers: o.layers, route: o.route, l0: o.l0, l1: o.l1, l2: o.l2, l3: o.l3, l4: o.l4, l5: o.l5,
        customer: o.customer, product: o.product, name: o.name, quantity: o.quantity, price: o.price, deadline: o.deadline ?? '',
        comment: o.comment, logo: undefined,
      }
    : { ...EMPTY_SHAPE, customer: null, product: null, name: '', quantity: null, price: null, deadline: '', comment: '', logo: undefined }

const SHAPE_KEYS = ['kind', 'length', 'width', 'height', 'joint', 'sheet_length', 'sheet_width', 'layers', 'route', 'l0', 'l1', 'l2', 'l3', 'l4', 'l5'] as const

export function OrderFormPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const editing = !!id && id !== 'new'
  const existing = useQuery({ queryKey: ['orders', 'one', id], queryFn: () => api.get<Order>(`/sales/orders/${id}`), enabled: editing })
  const [v, setV] = useState<FormState | null>(editing ? null : fromOrder(null))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (existing.data && !v) setV(fromOrder(existing.data))
  }, [existing.data, v])

  if (!v) {
    return (
      <Page title={t('edit')} flow>
        <Skeleton className="h-96" />
      </Page>
    )
  }
  const locked = !!existing.data && existing.data.status !== 'new'
  const set = (patch: Partial<FormState>) => setV((s) => ({ ...s!, ...patch }))

  const pickProduct = (pid: number | null, row?: Record<string, unknown>) => {
    if (!pid || !row) return set({ product: null })
    const p = row as unknown as Product
    const patch: Partial<FormState> = { product: pid, name: v.name || p.name, customer: v.customer ?? p.customer }
    for (const key of SHAPE_KEYS) (patch as Record<string, unknown>)[key] = p[key]
    set(patch)
  }

  const submit = async () => {
    const missing: Record<string, string> = {}
    if (!v.customer) missing.customer = t('required')
    if (!v.name.trim()) missing.name = t('required')
    if (!v.quantity) missing.quantity = t('required')
    setErrors(missing)
    if (Object.keys(missing).length) return
    setBusy(true)
    const body: Record<string, unknown> = {
      customer: v.customer, product: v.product, name: v.name.trim(), quantity: v.quantity, price: v.price,
      deadline: v.deadline || null, comment: v.comment,
    }
    for (const key of SHAPE_KEYS) body[key] = v[key]
    let payload: unknown = body
    if (v.logo instanceof File) {
      const form = new FormData()
      for (const [k, val] of Object.entries(body)) {
        if (val === null || val === undefined) continue
        if (Array.isArray(val)) val.forEach((x) => form.append(k, String(x)))
        else form.append(k, String(val))
      }
      form.append('logo', v.logo)
      payload = form
    } else if (v.logo === null) body.logo = null
    try {
      const saved = editing ? await api.patch<Order>(`/sales/orders/${id}`, payload) : await api.post<Order>('/sales/orders', payload)
      ok()
      await qc.invalidateQueries({ queryKey: ['orders'] })
      navigate(`/sales/orders/${saved.id}`)
    } catch (e) {
      if (e instanceof ApiError && e.fields) setErrors(e.fields)
      fail(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page title={editing ? `${t('edit')}: ${existing.data?.number ?? ''}` : t('order.new')} flow>
      <Form onSubmit={submit}>
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4 xl:sticky xl:top-4">
            <Card title={t('order.main')}>
              <div className="flex flex-col gap-3.5">
                <Field label={t('customer')} required error={errors.customer}>
                  {(fid) => (
                    <RemoteCombo id={fid} url="/sales/customers" value={v.customer} onChange={(c) => set({ customer: c })} labelOf={(r) => String(r.company)} hintOf={(r) => (r.contact_name as string) || undefined} invalid={!!errors.customer} />
                  )}
                </Field>
                <Field label={t('product')} hint={t('order.product_hint')}>
                  {(fid) => (
                    <RemoteCombo id={fid} url="/catalog/products" params={v.customer ? { customer: v.customer } : undefined} value={v.product} onChange={pickProduct} labelOf={(r) => String(r.name)} hintOf={(r) => sizeOf(r as unknown as Shape)} disabled={locked} />
                  )}
                </Field>
                <Field label={t('name')} required error={errors.name}>
                  {(fid) => <Input id={fid} value={v.name} onChange={(e) => set({ name: e.target.value })} invalid={!!errors.name} />}
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t('qty')} required error={errors.quantity}>
                    {(fid) => <NumberInput id={fid} value={v.quantity} onChange={(q) => set({ quantity: q })} suffix={t('pcs')} invalid={!!errors.quantity} disabled={locked} />}
                  </Field>
                  <Field label={t('sale.price')} error={errors.price}>
                    {(fid) => <NumberInput id={fid} value={v.price} onChange={(p) => set({ price: p })} suffix={t('currency.som')} />}
                  </Field>
                </div>
                <Field label={t('deadline')} error={errors.deadline}>
                  {(fid) => <DateInput id={fid} value={v.deadline} onChange={(d) => set({ deadline: d })} warnPast />}
                </Field>
                <Field label={t('note')}>
                  {(fid) => <Textarea id={fid} value={v.comment} onChange={(e) => set({ comment: e.target.value })} />}
                </Field>
                <Field label={t('logo')} hint={t('order.logo_hint')}>
                  {(fid) => <ImageField id={fid} current={existing.data?.logo} value={v.logo} onChange={(f) => set({ logo: f })} />}
                </Field>
                {v.price && v.quantity ? (
                  <p className="tabular rounded-md bg-sunken px-3 py-2 text-[13px]">
                    {t('order.total')}: <b>{money(v.price * v.quantity)}</b>
                  </p>
                ) : null}
                {locked ? <p className="rounded-md bg-warn-soft px-3 py-2 text-xs text-warn">{t('order.locked')}</p> : null}
              </div>
            </Card>
          </div>
          <ShapeEditor value={v} onChange={set} errors={errors} locked={locked} />
        </div>
        <FormFooter busy={busy} onCancel={() => navigate(editing ? `/sales/orders/${id}` : '/sales/orders')} />
      </Form>
    </Page>
  )
}

// ───────────────────────────── Detail ─────────────────────────────

export function OrderDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const { can } = useAuth()
  const navigate = useNavigate()
  const { data: o } = useQuery({ queryKey: ['orders', 'one', id], queryFn: () => api.get<Order>(`/sales/orders/${id}`) })
  if (!o) {
    return (
      <Page title="…" flow>
        <Skeleton className="h-96" />
      </Page>
    )
  }
  return (
    <Page
      title={`${o.number} · ${o.name}`}
      note={o.customer_name}
      flow
      actions={
        <>
          <Button onClick={() => window.print()}>
            <Printer />
            {t('print')}
          </Button>
          {can('orders.manage') && o.status !== 'done' && o.status !== 'cancelled' ? (
            <Button variant="primary" onClick={() => navigate(`/sales/orders/${o.id}/edit`)}>
              <Pencil />
              {t('edit')}
            </Button>
          ) : null}
        </>
      }
    >
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <Card title={t('order.main')}>
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-[13px]">
              <Row label={t('status')} value={<OrderStatusBadge status={o.status} />} />
              <Row label={t('customer')} value={o.customer_name} />
              <Row label={t('size')} value={<span className="tabular">{sizeOf(o)}</span>} />
              <Row label={t('qty')} value={<span className="tabular">{num(o.quantity)}</span>} />
              <Row label={t('sale.price')} value={money(o.price)} />
              {o.price ? <Row label={t('order.total')} value={<b>{money(o.price * o.quantity)}</b>} /> : null}
              <Row label={t('deadline')} value={<Deadline value={o.deadline} done={o.status === 'done'} />} />
              <Row label={t('layers')} value={`${o.layers.length} ${t('plan.ply')}`} />
              <Row label={t('created')} value={`${dateTime(o.created_at)} · ${o.created_by_name ?? ''}`} />
              {o.comment ? <Row label={t('note')} value={o.comment} /> : null}
            </dl>
            {o.logo ? <img src={o.logo} alt="" className="mt-3 max-h-24 rounded-md border border-line object-contain p-1" /> : null}
          </Card>
          <Card title={t('order.progress')}>
            {o.progress.length ? (
              <ul className="flex flex-col gap-3">
                {o.progress.map((p) => (
                  <li key={p.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Link to={`/production/items/${p.id}`} className="font-code text-[13px] font-medium text-accent hover:underline">
                        {p.number}
                      </Link>
                      <ItemStateBadge state={p.state} />
                    </div>
                    <RouteSteps route={p.route} step={p.step} />
                    <p className="tabular text-xs text-ink-3">
                      {t('qty')}: {num(p.qty)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-ink-3">{t('order.not_planned')}</p>
            )}
          </Card>
        </div>
        <Card title={t('drawing.title')}>
          <ShapeView shape={o} quantity={o.quantity} logo={o.logo} />
        </Card>
      </div>
    </Page>
  )
}

export function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <dt className="text-ink-3">{label}</dt>
      <dd className="min-w-0 text-right font-medium text-ink">{value}</dd>
    </>
  )
}
