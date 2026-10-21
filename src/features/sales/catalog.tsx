import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeftRight, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { api, ApiError } from '@/api/client'
import type { Customer, Order, Product, Shape } from '@/api/types'
import { Box3D } from '@/drawings/Box3D'
import { Deadline, OrderStatusBadge, RouteSteps } from '@/kit/badges'
import { RemoteCombo } from '@/kit/fields'
import { ImageField } from '@/kit/ImageField'
import { FormFooter, ResourceForm, ResourceList } from '@/kit/resource'
import { EMPTY_SHAPE, ShapeEditor } from '@/features/shape/ShapeEditor'
import { dateTime, formatPhone, money, num } from '@/lib/format'
import { fail, ok } from '@/lib/notify'
import { Button } from '@/ui/button'
import { Switch } from '@/ui/controls'
import { Badge, LoadingCards } from '@/ui/feedback'
import { Field } from '@/ui/field'
import { Form } from '@/ui/form'
import { Input } from '@/ui/input'
import { Card, Page } from '@/ui/page'

import { Row, sizeOf } from './orders'
import { Picture } from '@/kit/Picture'

// ───────────────────────────── Customers ─────────────────────────────

export function CustomersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const columns: ColumnDef<Customer, unknown>[] = [
    { id: 'company', header: t('customer.company'), cell: ({ row }) => <span className="font-medium">{row.original.company}</span>, meta: { sortKey: 'company', fixed: true, export: (r: Customer) => r.company } },
    { id: 'contact', header: t('customer.contact'), cell: ({ row }) => row.original.contact_name || '—', meta: { export: (r: Customer) => r.contact_name } },
    { id: 'phone', header: t('phone'), cell: ({ row }) => <span className="tabular">{formatPhone(row.original.phone)}</span>, meta: { export: (r: Customer) => r.phone } },
    { id: 'tin', header: t('customer.tin'), cell: ({ row }) => <span className="tabular">{row.original.tin || '—'}</span>, meta: { export: (r: Customer) => r.tin } },
    { id: 'orders', header: t('menu.orders'), cell: ({ row }) => <span className="tabular">{num(row.original.orders_count)}</span>, meta: { sortKey: 'orders_count', className: 'text-right', export: (r: Customer) => r.orders_count } },
    { id: 'created', header: t('created'), cell: ({ row }) => <span className="tabular text-xs text-ink-3">{dateTime(row.original.created_at)}</span>, meta: { sortKey: 'created_at' } },
  ]
  return (
    <ResourceList<Customer>
      title="menu.customers"
      url="/sales/customers"
      base="/sales/customers"
      columns={columns}
      writePermission="customers.manage"
      defaultSort="company"
      onRowOpen={(c) => navigate(`/sales/customers/${c.id}`)}
      rowMenu={(c) => [{ label: t('menu.orders'), icon: <ArrowLeftRight />, onSelect: () => navigate(`/sales/customers/${c.id}`) }]}
    />
  )
}

type CustomerSummary = { orders: number; open: number; done: number; total: number; bought: number }

export function CustomerDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: c } = useQuery({ queryKey: ['customers', 'one', id], queryFn: () => api.get<Customer & { summary: CustomerSummary }>(`/sales/customers/${id}`) })
  if (!c) return <Page title="…" flow><LoadingCards rows={3} /></Page>
  const s = c.summary
  const columns: ColumnDef<Order, unknown>[] = [
    { id: 'number', header: '№', cell: ({ row }) => <span className="font-code text-xs">{row.original.number}</span>, meta: { sortKey: 'created_at', export: (r: Order) => r.number } },
    { id: 'name', header: t('name'), cell: ({ row }) => <div><p className="font-medium">{row.original.name}</p><p className="text-xs text-ink-3">{sizeOf(row.original)}</p></div>, meta: { fixed: true, export: (r: Order) => r.name } },
    { id: 'qty', header: t('qty'), cell: ({ row }) => <span className="tabular">{num(row.original.quantity)}</span>, meta: { className: 'text-right', export: (r: Order) => r.quantity } },
    { id: 'sum', header: t('order.total'), cell: ({ row }) => (row.original.price ? <span className="tabular">{money(row.original.price * row.original.quantity)}</span> : '—'), meta: { className: 'text-right', export: (r: Order) => (r.price ?? 0) * r.quantity } },
    { id: 'status', header: t('status'), cell: ({ row }) => <OrderStatusBadge status={row.original.status} /> },
    { id: 'deadline', header: t('deadline'), cell: ({ row }) => <Deadline value={row.original.deadline} done={row.original.status === 'done'} />, meta: { sortKey: 'deadline' } },
  ]
  return (
    <Page
      title={c.company}
      note={c.contact_name || undefined}
      flow
      actions={<Button onClick={() => navigate(`/sales/customers/${c.id}/edit`)}><Pencil />{t('edit')}</Button>}
    >
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <Card>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-[13px]">
            <Row label={t('phone')} value={<span className="tabular">{formatPhone(c.phone) || '—'}</span>} />
            <Row label={t('customer.tin')} value={<span className="tabular">{c.tin || '—'}</span>} />
            <Row label={t('customer.since')} value={c.since_year ?? '—'} />
            {c.note ? <Row label={t('note')} value={c.note} /> : null}
          </dl>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              [t('menu.orders'), num(s.orders)],
              [t('customer.open_orders'), num(s.open)],
              [t('order.status.done'), num(s.done)],
              [t('customer.orders_sum'), money(s.total)],
              [t('customer.bought'), money(s.bought)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md bg-sunken p-2.5">
                <p className="text-[11px] text-ink-3">{label}</p>
                <p className="tabular text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card title={t('customer.orders')}>
          <ResourceList<Order>
            title="menu.orders"
            url="/sales/orders"
            base="/sales/orders"
            columns={columns}
            params={{ customer: c.id, status__in: 'new,planned,in_production,done,cancelled' }}
            defaultSort="created_at"
            defaultOrder="desc"
            onRowOpen={(o) => navigate(`/sales/orders/${o.id}`)}
            embedded
          />
        </Card>
      </div>
    </Page>
  )
}

export function CustomerFormPage() {
  return (
    <ResourceForm
      title="customer"
      url="/sales/customers"
      back="/sales/customers"
      sections={[
        {
          title: 'customer.section_company',
          fields: [
            { name: 'company', label: 'customer.company', required: true },
            { name: 'tin', label: 'customer.tin', span: 6, placeholder: '123456789' },
            { name: 'since_year', label: 'customer.since', type: 'number', span: 6, placeholder: '2024' },
          ],
        },
        {
          title: 'customer.section_contact',
          fields: [
            { name: 'contact_name', label: 'customer.contact', span: 6 },
            { name: 'phone', label: 'phone', type: 'phone', span: 6 },
            { name: 'note', label: 'note', type: 'textarea' },
          ],
        },
      ]}
    />
  )
}

// ───────────────────────────── Products ─────────────────────────────

export function ProductsPage() {
  const { t } = useTranslation()
  const columns: ColumnDef<Product, unknown>[] = [
    {
      id: 'name',
      header: t('name'),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-sunken">
            {row.original.logo ? (
              <Picture src={row.original.logo} alt="" className="size-full object-contain p-0.5" />
            ) : row.original.kind === 'box' ? (
              <Box3D length={row.original.length} width={row.original.width} height={row.original.height} className="size-9" />
            ) : null}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="truncate text-xs text-ink-3">{row.original.customer_name ?? '—'}</p>
          </div>
        </div>
      ),
      meta: { sortKey: 'name', fixed: true, export: (r: Product) => r.name },
    },
    { id: 'kind', header: t('type'), cell: ({ row }) => <Badge>{t(`product.kind.${row.original.kind}`)}</Badge>, meta: { export: (r: Product) => t(`product.kind.${r.kind}`) } },
    { id: 'size', header: t('size'), cell: ({ row }) => <span className="tabular">{sizeOf(row.original)}</span>, meta: { export: (r: Product) => sizeOf(r) } },
    { id: 'layers', header: t('layers'), cell: ({ row }) => `${row.original.layers.length} ${t('plan.ply')}` },
    { id: 'route', header: t('route'), cell: ({ row }) => <RouteSteps route={row.original.route} step={-1} compact /> },
    { id: 'active', header: t('status'), cell: ({ row }) => (row.original.is_active ? <Badge tone="ok">{t('active')}</Badge> : <Badge>{t('inactive')}</Badge>) },
  ]
  return <ResourceList<Product> title="menu.products" url="/catalog/products" base="/sales/products" columns={columns} writePermission="products.manage" defaultSort="name" />
}

type ProductState = Shape & { customer: number | null; name: string; note: string; is_active: boolean; logo: File | null | undefined }
const SHAPE_KEYS = ['kind', 'length', 'width', 'height', 'joint', 'sheet_length', 'sheet_width', 'layers', 'route', 'holds', 'l0', 'l1', 'l2', 'l3', 'l4', 'l5'] as const

export function ProductFormPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const editing = !!id && id !== 'new'
  const existing = useQuery({ queryKey: ['catalog/products', 'one', id], queryFn: () => api.get<Product>(`/catalog/products/${id}`), enabled: editing })
  const [v, setV] = useState<ProductState | null>(editing ? null : { ...EMPTY_SHAPE, customer: null, name: '', note: '', is_active: true, logo: undefined })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (existing.data && !v) setV({ ...existing.data, logo: undefined })
  }, [existing.data, v])

  if (!v) return <Page title={t('edit')} flow><LoadingCards rows={3} /></Page>
  const set = (patch: Partial<ProductState>) => setV((s) => ({ ...s!, ...patch }))

  const submit = async () => {
    if (!v.name.trim()) return setErrors({ name: t('required') })
    setBusy(true)
    const body: Record<string, unknown> = { customer: v.customer, name: v.name.trim(), note: v.note, is_active: v.is_active }
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
      if (editing) await api.patch(`/catalog/products/${id}`, payload)
      else await api.post('/catalog/products', payload)
      ok()
      await qc.invalidateQueries({ queryKey: ['catalog/products'] })
      navigate('/sales/products')
    } catch (e) {
      if (e instanceof ApiError && e.fields) setErrors(e.fields)
      fail(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page title={editing ? `${t('edit')}: ${existing.data?.name ?? ''}` : t('new_of', { name: t('product') })} flow>
      <Form onSubmit={submit}>
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <Card title={t('order.main')} className="xl:sticky xl:top-4">
            <div className="flex flex-col gap-3.5">
              <Field label={t('name')} required error={errors.name}>
                {(fid) => <Input id={fid} value={v.name} onChange={(e) => set({ name: e.target.value })} invalid={!!errors.name} />}
              </Field>
              <Field label={t('customer')} hint={t('product.customer_hint')}>
                {(fid) => <RemoteCombo id={fid} url="/sales/customers" value={v.customer} onChange={(c) => set({ customer: c })} labelOf={(r) => String(r.company)} />}
              </Field>
              <Field label={t('note')}>
                {(fid) => <Input id={fid} value={v.note} onChange={(e) => set({ note: e.target.value })} />}
              </Field>
              <Field label={t('logo')} hint={t('order.logo_hint')}>
                {(fid) => <ImageField id={fid} current={existing.data?.logo} value={v.logo} onChange={(f) => set({ logo: f })} />}
              </Field>
              <Switch checked={v.is_active} onChange={(c) => set({ is_active: c })} label={t('active')} hint={t('product.active_hint')} />
            </div>
          </Card>
          <ShapeEditor value={v} onChange={set} errors={errors} />
        </div>
        <FormFooter busy={busy} onCancel={() => navigate('/sales/products')} />
      </Form>
    </Page>
  )
}

// ───────────────────────────── Sales ─────────────────────────────

interface Sale {
  id: number
  customer_name: string
  item_number: string
  item_name: string
  quantity: number
  returned: number
  price: number
  created_by_name: string | null
  created_at: string
}

export function SalesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const columns: ColumnDef<Sale, unknown>[] = [
    { id: 'date', header: t('date'), cell: ({ row }) => <span className="tabular">{dateTime(row.original.created_at)}</span>, meta: { sortKey: 'created_at', export: (r: Sale) => r.created_at } },
    { id: 'customer', header: t('customer'), cell: ({ row }) => <span className="font-medium">{row.original.customer_name}</span>, meta: { export: (r: Sale) => r.customer_name } },
    { id: 'item', header: t('name'), cell: ({ row }) => <div><p>{row.original.item_name}</p><p className="font-code text-xs text-ink-3">{row.original.item_number}</p></div>, meta: { export: (r: Sale) => r.item_name } },
    { id: 'qty', header: t('qty'), cell: ({ row }) => <span className="tabular">{num(row.original.quantity)}</span>, meta: { className: 'text-right', export: (r: Sale) => r.quantity } },
    { id: 'returned', header: t('sale.returned_qty'), cell: ({ row }) => <span className="tabular text-bad">{row.original.returned ? num(row.original.returned) : ''}</span>, meta: { className: 'text-right', export: (r: Sale) => r.returned } },
    { id: 'price', header: t('sale.price'), cell: ({ row }) => <span className="tabular">{money(row.original.price)}</span>, meta: { className: 'text-right', export: (r: Sale) => r.price } },
    { id: 'sum', header: t('sale.sum'), cell: ({ row }) => <b className="tabular">{money(row.original.price * (row.original.quantity - row.original.returned))}</b>, meta: { className: 'text-right', export: (r: Sale) => r.price * (r.quantity - r.returned) } },
    { id: 'by', header: t('created_by'), cell: ({ row }) => row.original.created_by_name ?? '—' },
  ]
  return (
    <ResourceList<Sale>
      title="menu.sales_list"
      url="/sales/sales"
      base="/sales/sales"
      columns={columns}
      defaultSort="created_at"
      defaultOrder="desc"
      onRowOpen={(s) => navigate(`/sales/sales/${s.id}/return`)}
      actions={<Button variant="primary" onClick={() => navigate('/production/stock')}>{t('sale.sell')}</Button>}
    />
  )
}
