import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { History, Plus, SlidersHorizontal, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { api } from '@/api/client'
import type { Batch, Format, MaterialType, Roll } from '@/api/types'
import { BatchStatusBadge, Deadline } from '@/kit/badges'
import { useOptions } from '@/kit/fields'
import { useListState } from '@/kit/list-state'
import { FormFooter, ResourceForm, ResourceList } from '@/kit/resource'
import { cn } from '@/lib/cn'
import { dateTime, kg, money, num } from '@/lib/format'
import { fail, ok } from '@/lib/notify'
import { useAction } from '@/lib/queries'
import { Button } from '@/ui/button'
import { FilterSelect } from '@/ui/column-filters'
import { Select } from '@/ui/controls'
import { Dialog } from '@/ui/dialog'
import { Badge, EmptyState, Skeleton } from '@/ui/feedback'
import { Field } from '@/ui/field'
import { Form } from '@/ui/form'
import { Input } from '@/ui/input'
import { NumberInput } from '@/ui/number-input'
import { Card, Page } from '@/ui/page'

interface StockRow {
  material: number
  material_name: string
  gsm: number
  format: number
  format_mm: number
  rolls: number
  remaining: number
  reserved: number
  available: number
  low: boolean
}

// ───────────────────────────── Stock ─────────────────────────────

export function StockPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const state = useListState()
  const summary = useQuery({ queryKey: ['stock'], queryFn: () => api.get<StockRow[]>('/inventory/stock') })
  const materials = (useOptions('/catalog/materials').data ?? []) as unknown as MaterialType[]
  const formats = (useOptions('/catalog/formats').data ?? []) as unknown as Format[]
  const [history, setHistory] = useState<Roll | null>(null)
  const material = state.filter('material')
  const format = state.filter('format')
  const status = state.filter('status') ?? 'in_stock'

  const byMaterial = (summary.data ?? []).reduce<Record<string, StockRow[]>>((acc, r) => {
    ;(acc[r.material_name] ??= []).push(r)
    return acc
  }, {})

  const columns: ColumnDef<Roll, unknown>[] = [
    { id: 'code', header: t('roll.code'), cell: ({ row }) => <span className="font-code">{row.original.code || `#${row.original.id}`}</span>, meta: { fixed: true, export: (r: Roll) => r.code } },
    { id: 'material', header: t('material'), cell: ({ row }) => <span>{row.original.material_name} <span className="text-ink-3">· {row.original.gsm}</span></span>, meta: { export: (r: Roll) => r.material_name } },
    { id: 'format', header: t('format'), cell: ({ row }) => <span className="tabular">{row.original.format_mm}</span>, meta: { export: (r: Roll) => r.format_mm } },
    { id: 'available', header: t('roll.available'), cell: ({ row }) => <b className="tabular">{kg(row.original.available_weight)}</b>, meta: { sortKey: 'remaining_weight', className: 'text-right', export: (r: Roll) => r.available_weight } },
    { id: 'reserved', header: t('roll.reserved'), cell: ({ row }) => (row.original.reserved_weight ? <span className="tabular text-warn">{kg(row.original.reserved_weight)}</span> : '—'), meta: { className: 'text-right' } },
    { id: 'initial', header: t('roll.initial'), cell: ({ row }) => <span className="tabular text-ink-2">{kg(row.original.initial_weight)}</span>, meta: { className: 'text-right', export: (r: Roll) => r.initial_weight } },
    { id: 'price', header: t('roll.price'), cell: ({ row }) => <span className="tabular">{money(row.original.price_per_kg)}</span>, meta: { className: 'text-right', export: (r: Roll) => r.price_per_kg } },
    { id: 'supplier', header: t('roll.supplier'), cell: ({ row }) => [row.original.supplier_name, row.original.country_name].filter(Boolean).join(' · ') || '—' },
    { id: 'warehouse', header: t('warehouse'), cell: ({ row }) => row.original.warehouse_name },
    { id: 'received', header: t('roll.received'), cell: ({ row }) => <span className="tabular text-xs text-ink-3">{dateTime(row.original.created_at)}</span>, meta: { sortKey: 'created_at' } },
  ]

  return (
    <Page title={t('menu.stock')} flow actions={<Button variant="primary" onClick={() => navigate('/inventory/rolls/new')}><Plus />{t('roll.receive')}</Button>}>
      <div className="mb-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {Object.entries(byMaterial).map(([name, rows]) => (
          <Card key={name}>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold">{name}</p>
              <span className="tabular text-xs text-ink-3">{kg(rows.reduce((s, r) => s + Number(r.available), 0))}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {rows.map((r) => (
                <button
                  key={r.format}
                  type="button"
                  onClick={() => state.set({ material: r.material, format: r.format })}
                  className={cn('tabular rounded-md border px-2 py-1 text-xs transition-colors', r.low ? 'border-bad/40 bg-bad-soft text-bad' : 'border-line bg-sunken hover:border-accent')}
                  title={t('stock.line', { rolls: r.rolls, reserved: kg(r.reserved) })}
                >
                  <b>{r.format_mm}</b> · {kg(r.available)}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <ResourceList<Roll>
        embedded
        title="menu.stock"
        url="/inventory/rolls"
        base="/inventory/rolls"
        columns={columns}
        writePermission="inventory.manage"
        deletable={false}
        defaultSort="created_at"
        defaultOrder="desc"
        params={{ material, format, status: status === 'all' ? undefined : status }}
        rowMenu={(r) => [
          { label: t('roll.history'), icon: <History />, onSelect: () => setHistory(r) },
          { label: t('roll.adjust'), icon: <SlidersHorizontal />, onSelect: () => navigate(`/inventory/rolls/${r.id}/adjust`) },
        ]}
        filters={{
          material: <FilterSelect value={material ?? 'all'} onChange={(v) => state.set({ material: v === 'all' ? undefined : v })} options={[{ value: 'all', label: t('all') }, ...materials.map((m) => ({ value: String(m.id), label: m.name }))]} />,
          format: <FilterSelect value={format ?? 'all'} onChange={(v) => state.set({ format: v === 'all' ? undefined : v })} options={[{ value: 'all', label: t('all') }, ...formats.map((f) => ({ value: String(f.id), label: String(f.width_mm) }))]} />,
          available: <FilterSelect value={status} onChange={(v) => state.set({ status: v === 'in_stock' ? undefined : v })} options={[{ value: 'in_stock', label: t('roll.status.in_stock') }, { value: 'empty', label: t('roll.status.empty') }, { value: 'all', label: t('all') }]} />,
        }}
      />
      {history ? <MovementsDialog roll={history} onClose={() => setHistory(null)} /> : null}
    </Page>
  )
}

function MovementsDialog({ roll, onClose }: { roll: Roll; onClose: () => void }) {
  const { t } = useTranslation()
  const { data } = useQuery({
    queryKey: ['rolls', 'movements', roll.id],
    queryFn: () => api.get<{ id: number; kind: string; weight: number; batch_number: string | null; note: string; user_name: string | null; created_at: string }[]>(`/inventory/rolls/${roll.id}/movements`),
  })
  return (
    <Dialog open onClose={onClose} title={`${t('roll.history')}: ${roll.code || roll.id}`} description={`${roll.material_name} · ${roll.format_mm}`} size="lg">
      <table className="w-full text-[13px]">
        <thead className="text-xs text-ink-3">
          <tr className="border-b border-line">
            <th className="py-1.5 text-left font-medium">{t('date')}</th>
            <th className="py-1.5 text-left font-medium">{t('type')}</th>
            <th className="py-1.5 text-right font-medium">{t('weight')}</th>
            <th className="py-1.5 text-left font-medium">{t('batch')}</th>
            <th className="py-1.5 text-left font-medium">{t('created_by')}</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((m) => (
            <tr key={m.id} className="border-b border-line last:border-0">
              <td className="tabular py-1.5">{dateTime(m.created_at)}</td>
              <td className="py-1.5">{t(`movement.${m.kind}`)}{m.note ? <span className="block text-xs text-ink-3">{m.note}</span> : null}</td>
              <td className="tabular py-1.5 text-right">{kg(m.weight)}</td>
              <td className="font-code py-1.5">{m.batch_number ?? '—'}</td>
              <td className="py-1.5">{m.user_name ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Dialog>
  )
}

export function RollFormPage() {
  const raw = useOptions('/inventory/warehouses', { kind: 'raw' }).data
  return (
    <ResourceForm
      title="roll"
      url="/inventory/rolls"
      back="/inventory"
      defaults={{ warehouse: raw?.[0]?.id ?? null }}
      sections={[
        {
          title: 'roll.section_what',
          fields: [
            { name: 'material', label: 'material', type: 'remote', url: '/catalog/materials', labelOf: (r) => String(r.name), hintOf: (r) => `${r.gsm} g/m²`, required: true, span: 6 },
            { name: 'format', label: 'format', type: 'remote', url: '/catalog/formats', labelOf: (r) => `${r.width_mm} mm`, required: true, span: 6 },
            { name: 'initial_weight', label: 'roll.initial', type: 'decimal', suffix: 'kg', required: true, span: 6 },
            { name: 'code', label: 'roll.code', span: 6, hint: 'roll.code_hint' },
          ],
        },
        {
          title: 'roll.section_where',
          fields: [
            { name: 'warehouse', label: 'warehouse', type: 'remote', url: '/inventory/warehouses', params: { kind: 'raw' }, required: true, span: 6 },
            { name: 'price_per_kg', label: 'roll.price', type: 'money', span: 6 },
            { name: 'supplier', label: 'roll.supplier', type: 'remote', url: '/catalog/suppliers', span: 6 },
            { name: 'country', label: 'roll.country', type: 'remote', url: '/catalog/countries', span: 6 },
          ],
        },
      ]}
    />
  )
}

export function RollAdjustPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: roll } = useQuery({ queryKey: ['rolls', 'one', id], queryFn: () => api.get<Roll>(`/inventory/rolls/${id}`) })
  const [value, setValue] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  if (!roll) return <Page title="…" flow><Skeleton className="h-48" /></Page>
  const submit = async () => {
    if (value === null || !note.trim()) return
    setBusy(true)
    try {
      await api.post(`/inventory/rolls/${roll.id}/adjust`, { remaining_weight: value, note })
      ok()
      await qc.invalidateQueries({ queryKey: ['rolls'] })
      navigate('/inventory')
    } catch (e) {
      fail(e)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Page title={`${t('roll.adjust')}: ${roll.code || roll.id}`} note={`${roll.material_name} · ${roll.format_mm}`} flow width="narrow">
      <Form onSubmit={submit}>
        <Card>
          <p className="mb-3 rounded-md bg-sunken px-3 py-2 text-[13px]">{t('roll.now')}: <b className="tabular">{kg(roll.remaining_weight)}</b></p>
          <div className="grid gap-3.5">
            <Field label={t('roll.remaining')} required>{(fid) => <NumberInput id={fid} value={value} onChange={setValue} decimals={2} suffix="kg" autoFocus />}</Field>
            <Field label={t('roll.reason')} required>{(fid) => <Input id={fid} value={note} onChange={(e) => setNote(e.target.value)} />}</Field>
          </div>
        </Card>
        <FormFooter busy={busy} onCancel={() => navigate('/inventory')} />
      </Form>
    </Page>
  )
}

// ───────────────────────────── Allocation ─────────────────────────────

export function AllocateListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data } = useQuery({ queryKey: ['batches', 'allocate'], queryFn: () => api.get<{ results: Batch[] }>('/production/batches', { status__in: 'draft,ready', page_size: 100, ordering: '-priority' }) })
  return (
    <Page title={t('menu.allocate')} flow>
      {!data ? <Skeleton className="h-48" /> : null}
      {data && !data.results.length ? <EmptyState icon={Plus} title={t('allocate.none')} /> : null}
      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {data?.results.map((b) => (
          <button key={b.id} type="button" onClick={() => navigate(`/inventory/allocate/${b.id}`)} className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-4 text-left shadow-card transition hover:border-accent">
            <div className="flex items-center justify-between gap-2">
              <span className="font-code font-semibold">{b.number}</span>
              <BatchStatusBadge status={b.status} />
            </div>
            <p className="text-[13px]">{t('format')}: <b>{b.format_mm} mm</b> · {b.layers.length} {t('plan.ply')}</p>
            <p className="line-clamp-2 text-xs text-ink-3">{b.lines.map((l) => l.order_name).join(', ')}</p>
            <div className="mt-auto flex items-center justify-between text-xs">
              <Deadline value={b.items.map((i) => i.deadline).filter(Boolean).sort()[0] ?? null} />
              <b className="tabular">{kg(b.plan?.materials?.reduce((s, m) => s + m.kg, 0) ?? 0)}</b>
            </div>
          </button>
        ))}
      </div>
    </Page>
  )
}

interface Pick {
  roll: string
  weight: number | null
}

export function AllocateBatchPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: batch } = useQuery({ queryKey: ['batches', 'one', id], queryFn: () => api.get<Batch>(`/production/batches/${id}`) })
  const materials = (useOptions('/catalog/materials').data ?? []) as unknown as MaterialType[]
  const rolls = (useOptions('/inventory/rolls', batch ? { format: batch.format, status: 'in_stock' } : { format: -1 }).data ?? []) as unknown as Roll[]
  const [picks, setPicks] = useState<Record<number, Pick[]>>({})

  useEffect(() => {
    if (!batch) return
    const initial: Record<number, Pick[]> = {}
    batch.layers.forEach((_m, layer) => {
      const existing = batch.allocations.filter((a) => a.layer === layer)
      const need = batch.plan?.materials?.find((m) => m.layer === layer)?.kg ?? null
      initial[layer] = existing.length ? existing.map((a) => ({ roll: String(a.roll), weight: Number(a.weight) })) : [{ roll: '', weight: need }]
    })
    setPicks(initial)
  }, [batch])

  const save = useAction(
    () =>
      api.post(`/production/batches/${id}/allocate`, {
        allocations: Object.entries(picks).flatMap(([layer, list]) => list.filter((p) => p.roll && p.weight).map((p) => ({ layer: Number(layer), roll: Number(p.roll), weight: p.weight }))),
      }),
    { success: t('allocate.saved'), invalidate: ['batches', 'rolls', 'stock'], onSuccess: () => navigate('/inventory/allocate') },
  )

  if (!batch) return <Page title="…" flow><Skeleton className="h-64" /></Page>
  const editable = batch.status === 'draft' || batch.status === 'ready'
  const update = (layer: number, i: number, patch: Partial<Pick>) => setPicks((s) => ({ ...s, [layer]: s[layer].map((p, j) => (j === i ? { ...p, ...patch } : p)) }))
  const own = (rollId: number) => batch.allocations.filter((a) => a.roll === rollId).reduce((s, a) => s + Number(a.weight), 0)

  return (
    <Page title={`${t('menu.allocate')}: ${batch.number}`} note={`${batch.format_mm} mm · ${batch.lines.map((l) => l.order_name).join(', ')}`} flow>
      <Form onSubmit={() => save.mutate(undefined)}>
        {!editable ? <p className="rounded-md bg-warn-soft px-3 py-2 text-[13px] text-warn">{t('allocate.locked')}</p> : null}
        <div className="grid gap-3 lg:grid-cols-2">
          {batch.layers.map((materialId, layer) => {
            const material = materials.find((m) => m.id === materialId)
            const need = batch.plan?.materials?.find((m) => m.layer === layer)?.kg ?? 0
            const options = rolls.filter((r) => r.material === materialId)
            const chosen = (picks[layer] ?? []).reduce((s, p) => s + (p.weight || 0), 0)
            return (
              <Card key={layer}>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{layer + 1}. {material?.name ?? `#${materialId}`} {layer % 2 ? <Badge tone="warn">{t('plan.flute')}</Badge> : null}</p>
                    <p className="text-xs text-ink-3">{material?.gsm} g/m²</p>
                  </div>
                  <span className={cn('tabular rounded-md px-2 py-1 text-xs font-medium', chosen + 0.01 < need ? 'bg-warn-soft text-warn' : 'bg-ok-soft text-ok')}>
                    {kg(chosen)} / {kg(need)}
                  </span>
                </div>
                {!options.length ? <p className="rounded-md bg-bad-soft px-3 py-2 text-xs text-bad">{t('allocate.no_rolls')}</p> : null}
                <div className="flex flex-col gap-2">
                  {(picks[layer] ?? []).map((p, i) => (
                    <div key={i} className="grid grid-cols-[minmax(0,1fr)_130px_auto] items-center gap-2">
                      <Select
                        value={p.roll}
                        onChange={(v) => update(layer, i, { roll: v })}
                        disabled={!editable}
                        placeholder={t('roll')}
                        options={options.map((r) => ({ value: String(r.id), label: `${r.code || '#' + r.id} · ${kg(Number(r.available_weight) + own(r.id))}${r.supplier_name ? ' · ' + r.supplier_name : ''}` }))}
                      />
                      <NumberInput value={p.weight} onChange={(v) => update(layer, i, { weight: v })} decimals={2} suffix="kg" disabled={!editable} />
                      {(picks[layer]?.length ?? 0) > 1 ? (
                        <Button variant="ghost" size="iconSm" onClick={() => setPicks((s) => ({ ...s, [layer]: s[layer].filter((_x, j) => j !== i) }))} aria-label={t('delete')}><Trash2 /></Button>
                      ) : <span className="w-7" />}
                    </div>
                  ))}
                  {editable ? (
                    <Button variant="soft" size="sm" className="w-fit" onClick={() => setPicks((s) => ({ ...s, [layer]: [...(s[layer] ?? []), { roll: '', weight: null }] }))}>
                      <Plus />{t('allocate.add_roll')}
                    </Button>
                  ) : null}
                </div>
              </Card>
            )
          })}
        </div>
        {editable ? <FormFooter busy={save.isPending} onCancel={() => navigate('/inventory/allocate')} label={t('allocate.confirm')} /> : null}
      </Form>
    </Page>
  )
}

// ───────────────────────────── Outlays & waste ─────────────────────────────

interface Outlay { id: number; roll_label: string; weight: number; count: number; price: number; organization_name: string | null; service_type_name: string | null; note: string; created_at: string }

export function OutlaysPage() {
  const { t } = useTranslation()
  const columns: ColumnDef<Outlay, unknown>[] = [
    { id: 'date', header: t('date'), cell: ({ row }) => <span className="tabular">{dateTime(row.original.created_at)}</span> },
    { id: 'roll', header: t('roll'), cell: ({ row }) => row.original.roll_label, meta: { export: (r: Outlay) => r.roll_label } },
    { id: 'weight', header: t('weight'), cell: ({ row }) => <span className="tabular">{kg(row.original.weight)}</span>, meta: { className: 'text-right', export: (r: Outlay) => r.weight } },
    { id: 'count', header: t('qty'), cell: ({ row }) => <span className="tabular">{num(row.original.count)}</span>, meta: { className: 'text-right' } },
    { id: 'org', header: t('outlay.organization'), cell: ({ row }) => row.original.organization_name ?? '—' },
    { id: 'service', header: t('outlay.service'), cell: ({ row }) => row.original.service_type_name ?? '—' },
    { id: 'price', header: t('sale.price'), cell: ({ row }) => <span className="tabular">{money(row.original.price)}</span>, meta: { className: 'text-right' } },
    { id: 'note', header: t('note'), cell: ({ row }) => row.original.note || '—' },
  ]
  return <ResourceList<Outlay> title="menu.outlays" url="/inventory/outlays" base="/inventory/outlays" columns={columns} writePermission="inventory.manage" deletable={false} onRowOpen={() => undefined} defaultSort="created_at" defaultOrder="desc" />
}

export function OutlayFormPage() {
  return (
    <ResourceForm
      title="outlay"
      url="/inventory/outlays"
      back="/inventory/outlays"
      sections={[
        {
          fields: [
            { name: 'roll', label: 'roll', type: 'remote', url: '/inventory/rolls', params: { status: 'in_stock' }, labelOf: (r) => `${r.code || '#' + r.id} · ${r.material_name} · ${r.format_mm}`, hintOf: (r) => kg(r.available_weight as number), required: true },
            { name: 'weight', label: 'weight', type: 'decimal', suffix: 'kg', required: true, span: 6 },
            { name: 'count', label: 'qty', type: 'number', span: 6 },
            { name: 'organization', label: 'outlay.organization', type: 'remote', url: '/inventory/organizations', span: 6 },
            { name: 'service_type', label: 'outlay.service', type: 'remote', url: '/inventory/service-types', span: 6 },
            { name: 'price', label: 'sale.price', type: 'money', span: 6 },
            { name: 'note', label: 'note', type: 'textarea' },
          ],
        },
      ]}
    />
  )
}

interface WasteRow { id: number; kind: 'in' | 'sale' | 'adjust'; weight: number; price: number; stage: string; item_number: string | null; batch_number: string | null; note: string; created_by_name: string | null; created_at: string }

export function WastePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data } = useQuery({ queryKey: ['waste', 'balance'], queryFn: () => api.get<{ collected: number; sold: number; balance: number }>('/inventory/waste/balance') })
  const columns: ColumnDef<WasteRow, unknown>[] = [
    { id: 'date', header: t('date'), cell: ({ row }) => <span className="tabular">{dateTime(row.original.created_at)}</span> },
    { id: 'kind', header: t('type'), cell: ({ row }) => <Badge tone={row.original.kind === 'sale' ? 'ok' : row.original.kind === 'in' ? 'info' : 'neutral'}>{t(`waste.kind.${row.original.kind}`)}</Badge> },
    { id: 'weight', header: t('weight'), cell: ({ row }) => <b className="tabular">{kg(row.original.weight)}</b>, meta: { className: 'text-right', export: (r: WasteRow) => r.weight } },
    { id: 'source', header: t('waste.source'), cell: ({ row }) => [row.original.stage && t(`stage.${row.original.stage}`, { defaultValue: row.original.stage }), row.original.batch_number, row.original.item_number].filter(Boolean).join(' · ') || '—' },
    { id: 'price', header: t('sale.price'), cell: ({ row }) => (row.original.kind === 'sale' ? <span className="tabular">{money(row.original.price)}</span> : '—'), meta: { className: 'text-right' } },
    { id: 'note', header: t('note'), cell: ({ row }) => row.original.note || '—' },
    { id: 'by', header: t('created_by'), cell: ({ row }) => row.original.created_by_name ?? '—' },
  ]
  return (
    <Page title={t('menu.waste')} flow actions={<Button variant="primary" onClick={() => navigate('/inventory/waste/sell')}>{t('waste.sell')}</Button>}>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {[
          { label: t('waste.balance'), value: data?.balance, tone: 'text-accent' },
          { label: t('waste.collected'), value: data?.collected },
          { label: t('waste.sold'), value: data?.sold, tone: 'text-ok' },
        ].map((s) => (
          <Card key={s.label}><p className="text-xs text-ink-3">{s.label}</p><p className={cn('tabular text-2xl font-semibold', s.tone)}>{kg(s.value)}</p></Card>
        ))}
      </div>
      <ResourceList<WasteRow> embedded title="menu.waste" url="/inventory/waste" base="/inventory/waste" columns={columns} defaultSort="created_at" defaultOrder="desc" />
    </Page>
  )
}

export function WasteSellPage() {
  const { t } = useTranslation()
  return (
    <ResourceForm
      title="waste.sale"
      url="/inventory/waste"
      back="/inventory/waste"
      defaults={{ kind: 'sale' }}
      sections={[
        {
          fields: [
            { name: 'kind', label: 'type', type: 'segments', options: [{ value: 'sale', label: 'waste.kind.sale' }, { value: 'in', label: 'waste.kind.in' }, { value: 'adjust', label: 'waste.kind.adjust' }] },
            { name: 'weight', label: 'weight', type: 'decimal', suffix: 'kg', required: true, span: 6 },
            { name: 'price', label: 'waste.price_total', type: 'money', span: 6, hidden: (v) => v.kind !== 'sale' },
            { name: 'note', label: 'note', type: 'textarea' },
          ],
        },
      ]}
      aside={() => <Card><p className="text-[13px] text-ink-2">{t('waste.subtitle')}</p></Card>}
    />
  )
}
