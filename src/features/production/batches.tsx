import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowDown, ArrowLeftRight, ArrowUp, Banknote, Layers, ListChecks, PackageOpen, Pencil, Printer, Scissors, Send, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { api } from '@/api/client'
import type { Batch, Sequence, Stage, WorkItem } from '@/api/types'
import { useAuth } from '@/auth/AuthContext'
import { CorrugatorLayout } from '@/drawings/CorrugatorLayout'
import { blankOf } from '@/drawings/geometry'
import { ShapeView } from '@/drawings/ShapeView'
import { BatchStatusBadge, Deadline, ItemStateBadge, RouteSteps, StageBadge } from '@/kit/badges'
import { RemoteCombo } from '@/kit/fields'
import { ImageField } from '@/kit/ImageField'
import { useListState } from '@/kit/list-state'
import { FormFooter, ResourceList } from '@/kit/resource'
import { cn } from '@/lib/cn'
import { dateTime, kg, money, num } from '@/lib/format'
import { fail, ok } from '@/lib/notify'
import { Row } from '@/features/sales/orders'
import { SequenceCard } from '@/features/work/work'
import { Button } from '@/ui/button'
import { FilterSelect } from '@/ui/column-filters'
import { Switch } from '@/ui/controls'
import { useConfirm } from '@/ui/dialog'
import { Badge, LoadingCards } from '@/ui/feedback'
import { Field } from '@/ui/field'
import { Form } from '@/ui/form'
import { Input } from '@/ui/input'
import { NumberInput } from '@/ui/number-input'
import { Card, Page } from '@/ui/page'

// ───────────────────────────── Batches ─────────────────────────────

const BATCH_GROUPS: Record<string, string | undefined> = { active: 'draft,ready,in_work', draft: 'draft', ready: 'ready', in_work: 'in_work', done: 'done', all: undefined }

export function BatchesPage() {
  const { t } = useTranslation()
  const { can } = useAuth()
  const navigate = useNavigate()
  const state = useListState()
  const status = state.filter('status') ?? 'active'
  const columns: ColumnDef<Batch, unknown>[] = [
    { id: 'number', header: '№', cell: ({ row }) => <span className="font-code font-medium">{row.original.number}</span>, meta: { sortKey: 'created_at', fixed: true, export: (r: Batch) => r.number } },
    { id: 'status', header: t('status'), cell: ({ row }) => <BatchStatusBadge status={row.original.status} />, meta: { export: (r: Batch) => t(`batch.status.${r.status}`) } },
    { id: 'format', header: t('format'), cell: ({ row }) => <span className="tabular whitespace-nowrap">{row.original.format_mm} mm</span>, meta: { export: (r: Batch) => r.format_mm } },
    { id: 'orders', header: t('menu.orders'), cell: ({ row }) => <span className="line-clamp-2">{row.original.lines.map((l) => l.order_name).join(', ')}</span> },
    { id: 'run', header: t('plan.run'), cell: ({ row }) => <span className="tabular">{row.original.plan?.run_m ? `${num(row.original.plan.run_m, 0)} m` : '—'}</span>, meta: { className: 'text-right' } },
    { id: 'priority', header: t('batch.priority_col'), cell: ({ row }) => (row.original.priority ? <Badge tone="bad">{t('batch.priority')}</Badge> : null) },
    { id: 'sequence', header: t('seq.title'), cell: ({ row }) => (row.original.sequence ? <Badge tone="accent">{row.original.sequence_number} · {row.original.sequence_position + 1}</Badge> : null) },
    { id: 'operator', header: t('operator'), cell: ({ row }) => <span className="block max-w-40 truncate whitespace-nowrap" title={row.original.operator_name ?? undefined}>{row.original.operator_name ?? '—'}</span> },
    { id: 'created', header: t('created'), cell: ({ row }) => <span className="tabular whitespace-nowrap text-xs text-ink-3">{dateTime(row.original.created_at)}</span> },
  ]
  return (
    <ResourceList<Batch>
      title="menu.batches"
      url="/production/batches"
      base="/production/batches"
      columns={columns}
      defaultSort="created_at"
      defaultOrder="desc"
      params={{ status__in: BATCH_GROUPS[status] }}
      onRowOpen={(b) => navigate(`/production/batches/${b.id}`)}
      actions={can('production.plan') ? <><Button onClick={() => navigate('/production/sequences/new')}><Layers />{t('seq.create')}</Button><Button variant="primary" onClick={() => navigate('/production/plan')}>{t('plan.create')}</Button></> : null}
      filters={{
        status: (
          <FilterSelect
            value={status}
            onChange={(v) => state.set({ status: v === 'active' ? undefined : v })}
            options={Object.keys(BATCH_GROUPS).map((k) => ({ value: k, label: k === 'active' ? t('batch.active') : k === 'all' ? t('all') : t(`batch.status.${k}`) }))}
          />
        ),
      }}
    />
  )
}

export function BatchDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const { can } = useAuth()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const qc = useQueryClient()
  const { data: b } = useQuery({ queryKey: ['batches', 'one', id], queryFn: () => api.get<Batch>(`/production/batches/${id}`) })
  if (!b) return <Page title="…" flow><LoadingCards rows={3} /></Page>
  const editable = b.status === 'draft' || b.status === 'ready'

  const cancel = async () => {
    if (!(await confirm({ title: t('batch.cancel_confirm'), confirmLabel: t('batch.cancel'), tone: 'danger' }))) return
    try {
      await api.post(`/production/batches/${b.id}/cancel`)
      ok()
      await qc.invalidateQueries({ queryKey: ['batches'] })
      navigate('/production/batches')
    } catch (e) {
      fail(e)
    }
  }

  return (
    <Page
      title={`${t('batch')} ${b.number}`}
      note={`${b.format_mm} mm · ${dateTime(b.created_at)}`}
      flow
      actions={
        <>
          <Button onClick={() => window.print()}><Printer />{t('print')}</Button>
          {b.sequence ? <Button variant="soft" onClick={() => navigate(`/production/sequences/${b.sequence}`)}><Layers />{b.sequence_number}</Button> : null}
          {editable && !b.sequence && can('production.plan') ? <Button variant="danger" onClick={cancel}><X />{t('batch.cancel')}</Button> : null}
          {editable && can('production.plan') ? <Button onClick={() => navigate(`/production/plan/${b.id}`)}><Pencil />{t('edit')}</Button> : null}
          {editable && !b.sequence && can('inventory.allocate') ? <Button variant="primary" onClick={() => navigate(`/inventory/allocate/${b.id}`)}><ListChecks />{t('menu.allocate')}</Button> : null}
        </>
      }
    >
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        <div className="flex min-w-0 flex-col gap-4">
          {b.plan?.lines?.length ? (
            <Card title={t('drawing.layout')}>
              <CorrugatorLayout plan={b.plan} />
            </Card>
          ) : null}
          <Card title={t('batch.items')}>
            <ul className="flex flex-col divide-y divide-line">
              {b.items.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                  <Link to={`/production/items/${i.id}`} className="min-w-0">
                    <p className="truncate font-medium hover:text-accent">{i.name}</p>
                    <p className="text-xs text-ink-3"><span className="font-code">{i.number}</span> · {i.customer_name ?? t('item.kind.pallet')} · {i.size}</p>
                  </Link>
                  <div className="flex items-center gap-3">
                    <RouteSteps route={i.route} step={i.step} compact />
                    <ItemStateBadge state={i.state} />
                    <span className="tabular w-28 text-right text-[13px]">{num(i.qty)} / {num(i.planned_qty)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div className="flex flex-col gap-4">
          <Card title={t('status')}>
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-[13px]">
              <Row label={t('status')} value={<BatchStatusBadge status={b.status} />} />
              <Row label={t('operator')} value={b.operator_name ?? '—'} />
              <Row label={t('batch.started')} value={dateTime(b.started_at)} />
              <Row label={t('batch.finished')} value={dateTime(b.finished_at)} />
              <Row label={t('glue')} value={b.glue_name ? `${b.glue_name} · ${kg(b.glue_amount)}` : '—'} />
              <Row label={t('work.waste_kg')} value={kg(b.waste_kg)} />
              {b.comment ? <Row label={t('note')} value={b.comment} /> : null}
            </dl>
          </Card>
          <Card title={t('batch.rolls')}>
            {!b.allocations.length ? <p className="text-[13px] text-ink-3">{t('batch.no_rolls')}</p> : null}
            <ul className="flex flex-col gap-2 text-[13px]">
              {b.allocations.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate"><b>{a.layer + 1}.</b> {a.roll_label}</span>
                  <span className="tabular shrink-0 font-medium">{a.consumed !== null ? `−${kg(a.consumed)}` : kg(a.weight)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </Page>
  )
}

// ───────────────────────────── Items ─────────────────────────────

export function FinishedStockPage() {
  const { t } = useTranslation()
  const { can } = useAuth()
  const navigate = useNavigate()
  const state = useListState()
  const kind = state.filter('kind') ?? 'all'
  const columns: ColumnDef<WorkItem, unknown>[] = [
    { id: 'name', header: t('name'), cell: ({ row }) => <div><p className="font-medium">{row.original.name}</p><p className="text-xs text-ink-3"><span className="font-code">{row.original.number}</span> · {row.original.size}</p></div>, meta: { fixed: true, export: (r: WorkItem) => r.name } },
    { id: 'kind', header: t('type'), cell: ({ row }) => <Badge tone={row.original.kind === 'pallet' ? 'warn' : 'neutral'}>{t(`item.kind.${row.original.kind}`)}</Badge> },
    { id: 'customer', header: t('customer'), cell: ({ row }) => row.original.customer_name ?? '—', meta: { export: (r: WorkItem) => r.customer_name } },
    { id: 'available', header: t('finished.available'), cell: ({ row }) => <b className="tabular text-ok">{num(row.original.available_qty)}</b>, meta: { className: 'text-right', export: (r: WorkItem) => r.available_qty } },
    { id: 'sold', header: t('finished.sold'), cell: ({ row }) => <span className="tabular">{num(row.original.sold_qty)}</span>, meta: { className: 'text-right', export: (r: WorkItem) => r.sold_qty } },
    { id: 'finished', header: t('batch.finished'), cell: ({ row }) => <span className="tabular whitespace-nowrap text-xs">{dateTime(row.original.finished_at)}</span>, meta: { sortKey: 'finished_at' } },
  ]
  return (
    <ResourceList<WorkItem>
      title="menu.finished"
      url="/production/items"
      base="/production/items"
      columns={columns}
      params={{ available: 1, kind: kind === 'all' ? undefined : kind }}
      defaultSort="finished_at"
      defaultOrder="desc"
      onRowOpen={(i) => navigate(`/production/items/${i.id}`)}
      rowMenu={(i) => (can('sales.manage') ? [{ label: t('sale.sell'), icon: <Banknote />, onSelect: () => navigate(`/production/items/${i.id}/sell`) }] : [])}
      filters={{
        kind: (
          <FilterSelect value={kind} onChange={(v) => state.set({ kind: v === 'all' ? undefined : v })} options={[{ value: 'all', label: t('all') }, { value: 'order', label: t('item.kind.order') }, { value: 'pallet', label: t('item.kind.pallet') }]} />
        ),
      }}
    />
  )
}

export function SemiStockPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const state = useListState()
  const stage = state.filter('stage') ?? 'all'
  const where = state.filter('state') ?? 'all'
  const columns: ColumnDef<WorkItem, unknown>[] = [
    { id: 'name', header: t('name'), cell: ({ row }) => <div><p className="font-medium">{row.original.name}</p><p className="text-xs text-ink-3"><span className="font-code">{row.original.number}</span> · {row.original.size}</p></div>, meta: { fixed: true, export: (r: WorkItem) => r.name } },
    { id: 'customer', header: t('customer'), cell: ({ row }) => row.original.customer_name ?? '—', meta: { export: (r: WorkItem) => r.customer_name } },
    { id: 'qty', header: t('qty'), cell: ({ row }) => <b className="tabular">{num(row.original.qty)}</b>, meta: { className: 'text-right', sortKey: 'qty', export: (r: WorkItem) => r.qty } },
    { id: 'stage', header: t('semi.waits_for'), cell: ({ row }) => <StageBadge stage={row.original.stage} />, meta: { export: (r: WorkItem) => (r.stage ? t(`stage.${r.stage}`) : '') } },
    { id: 'state', header: t('status'), cell: ({ row }) => <ItemStateBadge state={row.original.state} /> },
    { id: 'route', header: t('semi.route'), cell: ({ row }) => <RouteSteps route={row.original.route} step={row.original.step} holds={row.original.holds} /> },
    { id: 'held', header: t('ymo.since'), cell: ({ row }) => (row.original.held_at ? <span className="tabular whitespace-nowrap text-xs">{dateTime(row.original.held_at)}</span> : '—') },
    { id: 'deadline', header: t('deadline'), cell: ({ row }) => <Deadline value={row.original.deadline} />, meta: { sortKey: 'deadline' } },
  ]
  return (
    <ResourceList<WorkItem>
      title="menu.semi"
      url="/production/items"
      base="/production/items"
      columns={columns}
      params={{ semi: 1, stage: stage === 'all' ? undefined : stage, state__in: where === 'held' ? 'held' : where === 'queue' ? 'waiting,in_work' : undefined }}
      defaultSort="deadline"
      defaultOrder="asc"
      onRowOpen={(i) => navigate(`/production/items/${i.id}`)}
      filters={{
        state: (
          <FilterSelect value={where} onChange={(v) => state.set({ state: v === 'all' ? undefined : v })} options={[{ value: 'all', label: t('all') }, { value: 'held', label: t('ymo.in_store') }, { value: 'queue', label: t('ymo.in_queue') }]} />
        ),
        stage: (
          <FilterSelect value={stage} onChange={(v) => state.set({ stage: v === 'all' ? undefined : v })} options={[{ value: 'all', label: t('all') }, ...['fleksa', 'tikish', 'yelimlash'].map((s) => ({ value: s, label: t(`stage.${s}`) }))]} />
        ),
      }}
    />
  )
}

/** Board area of one piece in m², to tell how much board a loss of pieces was. */
function unitArea(i: WorkItem) {
  const s = i.shape
  if (!s) return 0
  if (s.kind === 'pallet') return ((s.width ?? 0) * (s.length ?? 0)) / 1e6
  if (s.kind === 'sheet') return ((s.sheet_width ?? 0) * (s.sheet_length ?? 0)) / 1e6
  const b = blankOf({ length: s.length, width: s.width, height: s.height ?? null, joint: s.joint ?? null, l0: s.l0, l1: s.l1, l2: s.l2, l3: s.l3, l4: s.l4, l5: s.l5 }, s.parts)
  return (b.across * b.along) / 1e6
}

export function ItemDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const { can } = useAuth()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const qc = useQueryClient()
  const { data: i } = useQuery({ queryKey: ['items', 'one', id], queryFn: () => api.get<WorkItem>(`/production/items/${id}`) })
  if (!i) return <Page title="…" flow><LoadingCards rows={3} /></Page>
  const keeper = can('production.release', 'production.plan')

  const hold = async () => {
    if (!(await confirm({ title: t('ymo.hold_confirm'), description: t('ymo.hold_body'), confirmLabel: t('ymo.hold') }))) return
    try {
      await api.post(`/production/items/${i.id}/hold`)
      ok(t('ymo.held'))
      await qc.invalidateQueries({ queryKey: ['items'] })
    } catch (e) {
      fail(e)
    }
  }

  return (
    <Page
      title={i.name}
      note={`${i.number} · ${i.customer_name ?? t('item.kind.pallet')}`}
      flow
      actions={
        <>
          {(i.state === 'waiting' || i.state === 'held') && i.step > 0 && keeper ? <Button onClick={() => navigate(`/production/items/${i.id}/split`)}><Scissors />{t('item.split')}</Button> : null}
          {i.state === 'waiting' && i.step > 0 && keeper ? <Button onClick={() => void hold()}><PackageOpen />{t('ymo.hold')}</Button> : null}
          {i.state === 'held' && keeper ? <Button variant="primary" onClick={() => navigate(`/production/items/${i.id}/dispatch`)}><Send />{t('ymo.dispatch')}</Button> : null}
          {i.available_qty > 0 && can('sales.manage') ? <Button variant="primary" onClick={() => navigate(`/production/items/${i.id}/sell`)}><Banknote />{t('sale.sell')}</Button> : null}
        </>
      }
    >
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <Card>
            <div className="mb-3 flex items-center justify-between gap-2">
              <StageBadge stage={i.stage} />
              <ItemStateBadge state={i.state} />
            </div>
            <RouteSteps route={i.route} step={i.step} holds={i.holds} />
            {i.state === 'held' ? (
              <p className="mt-3 rounded-md bg-warn-soft px-3 py-2 text-xs text-warn">
                {t('ymo.waiting_since', { date: dateTime(i.held_at), stage: t(`stage.${i.stage}`) })}
              </p>
            ) : null}
            <dl className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-[13px]">
              <Row label={t('size')} value={<span className="tabular">{i.size}</span>} />
              <Row label={t('qty')} value={<span className="tabular">{num(i.qty)} / {num(i.planned_qty)}</span>} />
              <Row label={t('finished.sold')} value={num(i.sold_qty)} />
              <Row label={t('deadline')} value={<Deadline value={i.deadline} done={i.state === 'done'} />} />
              <Row label={t('batch')} value={<Link className="text-accent hover:underline" to={`/production/batches/${i.batch}`}>{i.batch_number}</Link>} />
              {i.order ? <Row label={t('order')} value={<Link className="text-accent hover:underline" to={`/sales/orders/${i.order}`}>{i.order_number}</Link>} /> : null}
              <Row label={t('warehouse')} value={i.warehouse_name ?? '—'} />
              {i.operator_name ? <Row label={t('operator')} value={i.operator_name} /> : null}
              {i.note ? <Row label={t('note')} value={i.note} /> : null}
            </dl>
            {i.logo ? (
              <div className="mt-4">
                <p className="mb-1.5 text-xs font-medium text-ink-2">{t('ymo.label')}</p>
                <img src={i.logo} alt="" className="max-h-40 rounded-md border border-line object-contain p-1" />
              </div>
            ) : null}
          </Card>
          <Card title={t('item.history')}>
            {!i.runs?.length ? <p className="text-[13px] text-ink-3">{t('item.no_runs')}</p> : null}
            <ol className="relative flex flex-col gap-4 border-l border-line pl-4">
              {i.runs?.map((r) => (
                <li key={r.id} className="relative">
                  <span className={cn('absolute top-1 -left-[21px] size-2.5 rounded-full ring-4 ring-surface', r.finished_at ? 'bg-ok' : 'bg-warn')} />
                  <p className="text-[13px] font-medium">{t(`stage.${r.stage}`)}</p>
                  <p className="text-xs text-ink-3">{r.operator_name ?? '—'} · {dateTime(r.started_at)} → {r.finished_at ? dateTime(r.finished_at) : t('item.state.in_work')}</p>
                  <p className="tabular text-xs text-ink-2">
                    {t('item.run_line', { in: num(r.qty_in), out: r.qty_out === null ? '—' : num(r.qty_out) })}
                    {r.waste_kg ? ` · ${t('work.waste_kg')}: ${kg(r.waste_kg)}` : ''}
                  </p>
                  {r.qty_out !== null && r.qty_in > r.qty_out ? (
                    <p className="tabular text-xs text-bad">
                      {t('item.loss', {
                        n: num(r.qty_in - r.qty_out),
                        pct: (((r.qty_in - r.qty_out) / r.qty_in) * 100).toFixed(1),
                        m2: (((r.qty_in - r.qty_out) * unitArea(i)) || 0).toFixed(1),
                      })}
                    </p>
                  ) : null}
                  {r.note ? <p className="mt-0.5 text-xs">{r.note}</p> : null}
                </li>
              ))}
            </ol>
          </Card>
        </div>
        {i.shape ? (
          <Card title={t('drawing.title')}>
            <ShapeView shape={i.shape} quantity={i.planned_qty} logo={i.logo} />
          </Card>
        ) : null}
      </div>
    </Page>
  )
}

export function SellPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: i } = useQuery({ queryKey: ['items', 'one', id], queryFn: () => api.get<WorkItem>(`/production/items/${id}`) })
  const [customer, setCustomer] = useState<number | null>(null)
  const [qty, setQty] = useState<number | null>(null)
  const [price, setPrice] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  if (!i) return <Page title="…" flow><LoadingCards rows={2} /></Page>
  const amount = qty ?? i.available_qty

  const submit = async () => {
    const e: Record<string, string> = {}
    if (!customer) e.customer = t('required')
    if (!amount || amount > i.available_qty) e.qty = t('sale.available', { n: num(i.available_qty) })
    setErrors(e)
    if (Object.keys(e).length) return
    setBusy(true)
    try {
      await api.post('/sales/sales', { customer, work_item: i.id, quantity: amount, price: price ?? 0, note })
      ok(t('sale.done'))
      await qc.invalidateQueries({ queryKey: ['items'] })
      await qc.invalidateQueries({ queryKey: ['sales'] })
      navigate('/sales/sales')
    } catch (err) {
      fail(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page title={`${t('sale.sell')}: ${i.name}`} note={i.number} flow width="narrow">
      <Form onSubmit={submit}>
        <Card>
          <div className="mb-4 flex items-center justify-between rounded-md bg-ok-soft px-3 py-2 text-[13px] text-ok">
            <span>{t('finished.available')}</span>
            <b className="tabular">{num(i.available_qty)}</b>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label={t('customer')} required error={errors.customer} className="sm:col-span-2">
              {(fid) => <RemoteCombo id={fid} url="/sales/customers" value={customer} onChange={setCustomer} labelOf={(r) => String(r.company)} invalid={!!errors.customer} />}
            </Field>
            <Field label={t('qty')} required error={errors.qty}>
              {(fid) => <NumberInput id={fid} value={qty} onChange={setQty} placeholder={String(i.available_qty)} max={i.available_qty} suffix={t('pcs')} invalid={!!errors.qty} />}
            </Field>
            <Field label={t('sale.price_each')}>
              {(fid) => <NumberInput id={fid} value={price} onChange={setPrice} suffix={t('currency.som')} />}
            </Field>
            <Field label={t('note')} className="sm:col-span-2">
              {(fid) => <Input id={fid} value={note} onChange={(e) => setNote(e.target.value)} />}
            </Field>
          </div>
          {price && amount ? <p className="tabular mt-3 text-right text-[13px]">{t('sale.sum')}: <b>{money(price * amount)}</b></p> : null}
        </Card>
        <FormFooter busy={busy} onCancel={() => navigate(-1)} label={t('sale.sell')} />
      </Form>
    </Page>
  )
}

export function SplitPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: i } = useQuery({ queryKey: ['items', 'one', id], queryFn: () => api.get<WorkItem>(`/production/items/${id}`) })
  const [qty, setQty] = useState<number | null>(null)
  const [route, setRoute] = useState<Stage[] | null>(null)
  const [note, setNote] = useState('')
  const [logo, setLogo] = useState<File | null | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  if (!i) return <Page title="…" flow><LoadingCards rows={2} /></Page>
  const rest = route ?? (i.route.slice(i.step) as Stage[])
  const extra: Stage[] = ['fleksa', 'tikish', 'yelimlash']

  const submit = async () => {
    if (!qty) return
    setBusy(true)
    try {
      const body = new FormData()
      body.append('qty', String(qty))
      rest.forEach((s) => body.append('route', s))
      body.append('note', note)
      if (logo) body.append('logo', logo)
      const child = await api.post<WorkItem>(`/production/items/${i.id}/split`, body)
      ok(t('item.split_done'))
      navigate(`/production/items/${child.id}`)
    } catch (e) {
      fail(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page title={`${t('item.split')}: ${i.name}`} note={i.number} flow width="narrow">
      <Form onSubmit={submit}>
        <Card>
          <p className="mb-4 text-[13px] text-ink-2">{t('item.split_hint')}</p>
          <div className="grid gap-3.5">
            <Field label={t('qty')} required hint={t('work.max_qty', { n: i.qty - 1 })}>
              {(fid) => <NumberInput id={fid} value={qty} onChange={setQty} max={i.qty - 1} suffix={t('pcs')} />}
            </Field>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-ink-2">{t('item.new_route')}</span>
              <div className="flex flex-col gap-2">
                {extra.map((s) => (
                  <Switch key={s} checked={rest.includes(s)} onChange={(on) => setRoute(on ? [...rest.filter((x) => (s === 'tikish' ? x !== 'yelimlash' : s === 'yelimlash' ? x !== 'tikish' : true)), s] : rest.filter((x) => x !== s))} label={t(`stage.${s}`)} />
                ))}
              </div>
            </div>
            <Field label={t('ymo.label')} hint={t('ymo.label_hint')}>{(fid) => <ImageField id={fid} current={i.logo} value={logo} onChange={setLogo} />}</Field>
            <Field label={t('note')}>{(fid) => <Input id={fid} value={note} onChange={(e) => setNote(e.target.value)} />}</Field>
          </div>
        </Card>
        <FormFooter busy={busy} onCancel={() => navigate(-1)} label={t('item.split')} />
      </Form>
    </Page>
  )
}

export function DispatchPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: i } = useQuery({ queryKey: ['items', 'one', id], queryFn: () => api.get<WorkItem>(`/production/items/${id}`) })
  const [qty, setQty] = useState<number | null>(null)
  const [logo, setLogo] = useState<File | null | undefined>(undefined)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  if (!i) return <Page title="…" flow><LoadingCards rows={2} /></Page>
  const counted = qty ?? i.qty
  const short = i.qty - counted

  const submit = async () => {
    setBusy(true)
    try {
      const body = new FormData()
      body.append('qty', String(counted))
      body.append('note', note)
      if (logo) body.append('logo', logo)
      await api.post(`/production/items/${i.id}/dispatch`, body)
      ok(t('ymo.dispatched', { stage: t(`stage.${i.stage}`) }))
      await qc.invalidateQueries({ queryKey: ['items'] })
      navigate(`/production/items/${i.id}`)
    } catch (e) {
      fail(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page title={`${t('ymo.dispatch')}: ${i.name}`} note={i.number} flow width="narrow">
      <Form onSubmit={submit}>
        <Card title={t('ymo.count')}>
          <p className="mb-4 text-[13px] text-ink-2">{t('ymo.count_hint', { stage: t(`stage.${i.stage}`) })}</p>
          <div className="grid gap-3.5">
            <Field label={t('ymo.counted')} required hint={t('ymo.expected', { n: num(i.qty) })}>
              {(fid) => <NumberInput id={fid} value={qty ?? i.qty} onChange={setQty} max={i.qty} suffix={t('pcs')} />}
            </Field>
            {short > 0 ? <p className="rounded-md bg-warn-soft px-3 py-2 text-xs text-warn">{t('ymo.shortage', { n: num(short) })}</p> : null}
            <Field label={t('ymo.label')} hint={t('ymo.label_hint')}>{(fid) => <ImageField id={fid} current={i.logo} value={logo} onChange={setLogo} />}</Field>
            <Field label={t('note')}>{(fid) => <Input id={fid} value={note} onChange={(e) => setNote(e.target.value)} />}</Field>
          </div>
        </Card>
        <FormFooter busy={busy} onCancel={() => navigate(-1)} label={t('ymo.dispatch_to', { stage: t(`stage.${i.stage}`) })} />
      </Form>
    </Page>
  )
}

export function ReturnPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: s } = useQuery({ queryKey: ['sales', 'one', id], queryFn: () => api.get<{ id: number; item_name: string; customer_name: string; quantity: number; returned: number; price: number }>(`/sales/sales/${id}`) })
  const [qty, setQty] = useState<number | null>(null)
  const [toWaste, setToWaste] = useState(false)
  const [weight, setWeight] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  if (!s) return <Page title="…" flow><LoadingCards rows={2} /></Page>
  const max = s.quantity - s.returned

  const submit = async () => {
    if (!qty) return
    setBusy(true)
    try {
      await api.post(`/sales/sales/${s.id}/return`, { quantity: qty, to_waste: toWaste, weight })
      ok(t('sale.returned'))
      await qc.invalidateQueries({ queryKey: ['sales'] })
      navigate('/sales/sales')
    } catch (e) {
      fail(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page title={`${t('sale.return')}: ${s.item_name}`} note={s.customer_name} flow width="narrow">
      <Form onSubmit={submit}>
        <Card>
          <div className="grid gap-3.5">
            <Field label={t('qty')} required hint={t('sale.max_return', { n: max })}>
              {(fid) => <NumberInput id={fid} value={qty} onChange={setQty} max={max} suffix={t('pcs')} />}
            </Field>
            <Switch checked={toWaste} onChange={setToWaste} label={t('sale.to_waste')} hint={t('sale.to_waste_hint')} />
            {toWaste ? <Field label={t('work.waste_kg')} required>{(fid) => <NumberInput id={fid} value={weight} onChange={setWeight} decimals={2} suffix="kg" />}</Field> : null}
          </div>
        </Card>
        <FormFooter busy={busy} onCancel={() => navigate(-1)} label={t('sale.return')} />
      </Form>
    </Page>
  )
}

export { ArrowLeftRight }

/** Batches of one format and one board picked to run back to back. */
export function SequenceNewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data } = useQuery({ queryKey: ['batches', 'for-sequence'], queryFn: () => api.get<{ results: Batch[] }>('/production/batches', { status__in: 'draft,ready', page_size: 200, ordering: 'created_at' }) })
  const [picked, setPicked] = useState<number[]>([])
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  if (!data) return <Page title={t('seq.create')} flow><LoadingCards rows={2} /></Page>
  const free = data.results.filter((b) => !b.sequence)
  const keyOf = (b: Batch) => `${b.format_mm}|${b.layers.join(',')}|${(b.flutes ?? []).join(',')}`
  const groups = Object.values(
    free.reduce<Record<string, Batch[]>>((acc, b) => {
      ;(acc[keyOf(b)] ??= []).push(b)
      return acc
    }, {}),
  ).filter((g) => g.length > 1)
  const byId = Object.fromEntries(free.map((b) => [b.id, b]))
  const groupKey = picked.length ? keyOf(byId[picked[0]]) : null
  const toggle = (b: Batch) => setPicked((p) => (p.includes(b.id) ? p.filter((x) => x !== b.id) : [...p, b.id]))
  const move = (i: number, d: number) => setPicked((p) => { const n = [...p]; [n[i], n[i + d]] = [n[i + d], n[i]]; return n })

  const submit = async () => {
    setBusy(true)
    try {
      const seq = await api.post<Sequence>('/production/sequences', { batches: picked, comment })
      ok(t('seq.created'))
      navigate(`/production/sequences/${seq.id}`)
    } catch (e) {
      fail(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page title={t('seq.create')} flow>
      <Form onSubmit={submit}>
        <p className="rounded-md bg-accent-soft px-3 py-2 text-[13px] text-accent-ink">{t('seq.create_hint')}</p>
        {!groups.length ? <Card><p className="text-[13px] text-ink-3">{t('seq.no_groups')}</p></Card> : null}
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
          <div className="flex flex-col gap-3">
            {groups.map((g) => {
              const k = keyOf(g[0])
              const locked = groupKey !== null && groupKey !== k
              return (
                <Card key={k} title={`${g[0].format_mm} mm · ${g[0].layers.length} ${t('plan.ply')}`}>
                  <ul className={cn('flex flex-col divide-y divide-line', locked && 'opacity-40')}>
                    {g.map((b) => (
                      <li key={b.id}>
                        <label className="flex cursor-pointer items-center gap-3 py-2">
                          <input type="checkbox" className="size-4 accent-[var(--accent)]" checked={picked.includes(b.id)} disabled={locked} onChange={() => toggle(b)} />
                          <span className="font-code text-[13px] font-semibold">{b.number}</span>
                          <span className="min-w-0 flex-1 truncate text-[13px]">{b.lines.map((l) => l.order_name).join(', ')}</span>
                          <span className="tabular text-xs whitespace-nowrap text-ink-3">{b.plan?.run_m ? `${num(b.plan.run_m, 0)} m` : ''}</span>
                          <BatchStatusBadge status={b.status} />
                        </label>
                      </li>
                    ))}
                  </ul>
                </Card>
              )
            })}
          </div>
          <Card title={t('seq.order')}>
            {!picked.length ? <p className="text-[13px] text-ink-3">{t('seq.pick')}</p> : null}
            <ol className="flex flex-col gap-1.5">
              {picked.map((id, i) => (
                <li key={id} className="flex items-center gap-2 rounded-md bg-sunken px-2 py-1.5">
                  <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-on-accent">{i + 1}</span>
                  <span className="font-code flex-1 text-[13px]">{byId[id]?.number}</span>
                  <Button size="iconSm" variant="ghost" disabled={i === 0} onClick={() => move(i, -1)} aria-label={t('seq.up')}><ArrowUp /></Button>
                  <Button size="iconSm" variant="ghost" disabled={i === picked.length - 1} onClick={() => move(i, 1)} aria-label={t('seq.down')}><ArrowDown /></Button>
                </li>
              ))}
            </ol>
            <Field label={t('note')} className="mt-3">{(fid) => <Input id={fid} value={comment} onChange={(e) => setComment(e.target.value)} />}</Field>
          </Card>
        </div>
        {picked.length >= 2 ? <FormFooter busy={busy} onCancel={() => navigate(-1)} label={t('seq.create')} /> : null}
      </Form>
    </Page>
  )
}

export function SequenceDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const { can } = useAuth()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const qc = useQueryClient()
  const { data: s } = useQuery({ queryKey: ['sequences', 'one', id], queryFn: () => api.get<Sequence>(`/production/sequences/${id}`) })
  if (!s) return <Page title="…" flow><LoadingCards rows={3} /></Page>
  const open = s.status === 'draft' || s.status === 'ready'
  const undo = async () => {
    if (!(await confirm({ title: t('seq.undo_confirm'), description: t('seq.undo_hint'), confirmLabel: t('seq.undo'), tone: 'danger' }))) return
    try {
      await api.delete(`/production/sequences/${s.id}`)
      ok(t('seq.undone'))
      await qc.invalidateQueries({ queryKey: ['batches'] })
      navigate('/production/batches')
    } catch (e) {
      fail(e)
    }
  }
  return (
    <Page
      title={`${t('seq.title')} ${s.number}`}
      note={`${s.format_mm} mm · ${t('seq.badge', { n: s.batches.length })}`}
      flow
      actions={
        <>
          {open && can('production.plan') ? <Button variant="danger" onClick={undo}><X />{t('seq.undo')}</Button> : null}
          {open && can('inventory.allocate') ? <Button variant="primary" onClick={() => navigate(`/inventory/allocate/sequence/${s.id}`)}><ListChecks />{t('menu.allocate')}</Button> : null}
        </>
      }
    >
      <SequenceCard seq={s} />
    </Page>
  )
}
