import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Check, Search, Sparkles, Trash2, Ruler } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { api, ApiError, type Page as ApiPage } from '@/api/client'
import type { Batch, Format, MaterialType, Order, Plan, Stage } from '@/api/types'
import { CorrugatorLayout } from '@/drawings/CorrugatorLayout'
import { Peek } from '@/drawings/Peek'
import { ShapeView } from '@/drawings/ShapeView'
import { Deadline } from '@/kit/badges'
import { useOptions } from '@/kit/fields'
import { FormFooter } from '@/kit/resource'
import { cn } from '@/lib/cn'
import { kg, num } from '@/lib/format'
import { fail, ok } from '@/lib/notify'
import { Button } from '@/ui/button'
import { Segments, Select, Switch } from '@/ui/controls'
import { DateInput } from '@/ui/date-input'
import { Badge, LoadingCards } from '@/ui/feedback'
import { Field } from '@/ui/field'
import { Form } from '@/ui/form'
import { Input, Textarea } from '@/ui/input'
import { NumberInput } from '@/ui/number-input'
import { Card, Page } from '@/ui/page'

import { sizeOf } from '../sales/orders'
import { defaultFlutes, flutedLayers, setFlute } from '@/drawings/geometry'
import { LayerKind } from '@/drawings/LayersSection'
import { HoldsFlow } from '@/features/shape/ShapeEditor'

interface Line {
  order: number
  quantity: number
  ups: number
  parts: number
  orientation: 'horizontal' | 'vertical'
}

const EXTRA: Stage[] = ['fleksa', 'tikish', 'yelimlash']

export function PlanPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const editing = useQuery({ queryKey: ['batches', 'one', id], queryFn: () => api.get<Batch>(`/production/batches/${id}`), enabled: !!id })
  const formats = (useOptions('/catalog/formats').data ?? []) as unknown as Format[]
  const materials = (useOptions('/catalog/materials').data ?? []) as unknown as MaterialType[]
  const [search, setSearch] = useState('')
  const deferred = useDeferredValue(search)
  const orders = useQuery({
    queryKey: ['orders', 'plan', deferred],
    queryFn: () => api.get<ApiPage<Order>>('/sales/orders', { status__in: 'new', page_size: 200, search: deferred || undefined, ordering: 'deadline' }),
  })
  const [picked, setPicked] = useState<Record<number, Order>>({})
  const [lines, setLines] = useState<Line[]>([])
  const [format, setFormat] = useState<number | null>(null)
  const [layers, setLayers] = useState<number[]>([0, 0, 0])
  const [flutes, setFlutes] = useState<number[]>([1])
  const [usePallet, setUsePallet] = useState(false)
  const [pallet, setPallet] = useState<{ length: number | null; route: Stage[]; holds: Stage[]; deadline: string }>({ length: 1000, route: [], holds: [], deadline: '' })
  const [comment, setComment] = useState('')
  const [priority, setPriority] = useState(false)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [planError, setPlanError] = useState('')
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState<number | null>(null)

  useEffect(() => {
    const b = editing.data
    if (!b) return
    setFormat(b.format)
    setLayers(b.layers)
    setFlutes(b.flutes ?? [])
    setLines(b.lines.map((l) => ({ order: l.order, quantity: l.quantity, ups: l.ups, parts: l.parts, orientation: l.orientation })))
    Promise.all(b.lines.map((l) => api.get<Order>(`/sales/orders/${l.order}`))).then((os) => setPicked(Object.fromEntries(os.map((o) => [o.id, o]))))
    const p = b.items.find((i) => i.kind === 'pallet')
    if (p) {
      setUsePallet(true)
      setPallet({ length: p.length ?? 1000, route: p.route.filter((s) => s !== 'gofra'), holds: p.holds ?? [], deadline: p.deadline ?? '' })
    }
    setComment(b.comment)
    setPriority(b.priority > 0)
  }, [editing.data])

  const toggle = (o: Order) => {
    if (picked[o.id]) {
      const { [o.id]: _gone, ...rest } = picked
      setPicked(rest)
      setLines((ls) => ls.filter((l) => l.order !== o.id))
      return
    }
    setPicked((p) => ({ ...p, [o.id]: o }))
    setLines((ls) => [...ls, { order: o.id, quantity: o.quantity, ups: 1, parts: 1, orientation: 'horizontal' }])
    if (!layers.some(Boolean)) {
      setLayers(o.layers)
      setFlutes(o.flutes ?? [])
    }
    setPreview(o.id)
  }

  useEffect(() => {
    const pre = Number(params.get('order'))
    const o = orders.data?.results.find((r) => r.id === pre)
    if (o && !lines.length) toggle(o)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders.data])

  const payload = useMemo(
    () =>
      format && layers.length >= 1 && layers.every(Boolean) && lines.length
        ? {
            format,
            layers,
            flutes,
            lines,
            pallet: usePallet && pallet.length ? { length: pallet.length, route: pallet.route, holds: pallet.holds, deadline: pallet.deadline || null } : null,
            comment,
            priority: priority ? 1 : 0,
          }
        : null,
    [format, layers, flutes, lines, usePallet, pallet, comment, priority],
  )
  const deferredPayload = useDeferredValue(payload)

  useEffect(() => {
    if (!deferredPayload) {
      setPlan(null)
      setPlanError('')
      return
    }
    const timer = window.setTimeout(() => {
      api
        .post<Plan>('/production/batches/preview', { ...deferredPayload, batch: id ? Number(id) : undefined })
        .then((p) => {
          setPlan(p)
          setPlanError('')
        })
        .catch((e) => {
          setPlan(null)
          setPlanError(e instanceof ApiError ? e.message : String(e))
        })
    }, 300)
    return () => window.clearTimeout(timer)
  }, [deferredPayload, id])

  const bestFormat = async () => {
    try {
      const r = await api.post<{ format: number; stock_ok: boolean }>('/production/batches/fit', { layers, flutes, lines })
      setFormat(r.format)
      if (!r.stock_ok) fail(t('plan.no_stock_format'))
    } catch (e) {
      fail(e)
    }
  }

  const save = async () => {
    if (!payload) return
    setSaving(true)
    try {
      const b = id ? await api.put<Batch>(`/production/batches/${id}`, payload) : await api.post<Batch>('/production/batches', payload)
      ok(t('plan.saved', { n: b.number }))
      await qc.invalidateQueries({ queryKey: ['orders'] })
      await qc.invalidateQueries({ queryKey: ['batches'] })
      navigate(`/production/batches/${b.id}`)
    } catch (e) {
      fail(e)
    } finally {
      setSaving(false)
    }
  }

  const setLine = (orderId: number, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.order === orderId ? { ...l, ...patch } : l)))
  const materialName = (mid: number) => materials.find((m) => m.id === mid)?.name ?? `#${mid}`
  const available = [...Object.values(picked).filter((p) => !orders.data?.results.some((o) => o.id === p.id)), ...(orders.data?.results ?? [])]
  const previewOrder = preview ? picked[preview] : null
  const previewLine = lines.find((l) => l.order === preview)

  if (id && !editing.data) return <Page title="…" flow><LoadingCards rows={3} /></Page>

  return (
    <Page title={id ? t('plan.edit', { n: editing.data?.number ?? '' }) : t('menu.plan')} flow>
      <Form onSubmit={save}>
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <Card title={t('plan.new_orders')} className="xl:sticky xl:top-4">
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-3" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('search')} className="pl-8" />
            </div>
            <div className="-mx-1 flex max-h-[70vh] flex-col gap-1.5 overflow-y-auto px-1">
              {available.map((o) => {
                const on = !!picked[o.id]
                return (
                  <div key={o.id} className="relative">
                  <button
                    type="button"
                    onClick={() => toggle(o)}
                    className={cn('flex w-full items-start gap-2.5 rounded-md border p-2.5 pb-8 text-left transition-colors', on ? 'border-accent bg-accent-soft' : 'border-line hover:bg-sunken')}
                  >
                    <span className={cn('mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border', on ? 'border-accent bg-accent text-on-accent' : 'border-line-strong')}>
                      {on ? <Check className="size-3" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[13px] font-medium">{o.name}</span>
                        <b className="tabular text-[13px]">{num(o.quantity)}</b>
                      </span>
                      <span className="block truncate text-xs text-ink-3">
                        <span className="font-code">{o.number}</span> · {o.customer_name} · {sizeOf(o)}
                      </span>
                      <span className="mt-1 flex items-center gap-2 text-xs">
                        <Badge>{o.layers.length} {t('plan.ply')}</Badge>
                        <Deadline value={o.deadline} />
                      </span>
                    </span>
                  </button>
                  <Peek title={`${o.name} · ${sizeOf(o)}`} className="absolute right-2 bottom-2 h-6 bg-surface"><ShapeView shape={{ ...o, parts: 1, orientation: 'horizontal', ups: 1 }} quantity={o.quantity} logo={o.logo} /></Peek>
                  </div>
                )
              })}
              {orders.data && !available.length ? <p className="py-8 text-center text-[13px] text-ink-3">{t('plan.no_new_orders')}</p> : null}
            </div>
          </Card>

          <div className="flex min-w-0 flex-col gap-4">
            <Card title={t('plan.material')}>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
                <Field label={t('format')}>
                  {(fid) => (
                    <div className="flex gap-2">
                      <div className="min-w-0 flex-1"><Select id={fid} value={format ? String(format) : ''} onChange={(v) => setFormat(Number(v))} options={formats.map((f) => ({ value: String(f.id), label: `${f.width_mm} mm` }))} placeholder={t('common.select')} /></div>
                      <Button variant="soft" className="shrink-0" onClick={bestFormat} disabled={!lines.length || !layers.every(Boolean)} aria-label={t('plan.auto')}>
                        <Sparkles />
                        <span className="hidden sm:inline">{t('plan.auto')}</span>
                      </Button>
                    </div>
                  )}
                </Field>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-ink-2">{t('layers')}</span>
                    <div className="w-fit shrink-0"><Segments
                      value={String(layers.length || 3) as '2'}
                      onChange={(v) => {
                        const n = Number(v)
                        setFlutes(defaultFlutes(n))
                        setLayers((ls) => {
                          const out = [...ls]
                          while (out.length < n) out.push(out[out.length - 2] ?? 0)
                          return out.slice(0, n)
                        })
                      }}
                      options={['1', '2', '3', '4', '5', '6', '7'].map((x) => ({ value: x as '2', label: x }))}
                    /></div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {layers.map((l, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="flex shrink-0 items-center gap-1.5 text-xs text-ink-3">
                          {i + 1}.
                          <LayerKind
                            fluted={flutedLayers(layers.length, flutes).includes(i)}
                            onChange={(fluted) => setFlutes(setFlute(layers.length, flutes, i, fluted))}
                          />
                        </span>
                        <Select value={l ? String(l) : ''} onChange={(v) => setLayers((ls) => ls.map((x, j) => (j === i ? Number(v) : x)))} options={materials.map((m) => ({ value: String(m.id), label: `${m.name} · ${m.gsm}` }))} placeholder={t('common.select')} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card title={t('plan.lines')}>
              {!lines.length ? <p className="text-[13px] text-ink-3">{t('plan.pick_orders')}</p> : null}
              <div className="flex flex-col gap-2.5">
                {lines.map((l) => {
                  const o = picked[l.order]
                  const lp = plan?.lines.find((x) => x.order_id === l.order)
                  return (
                    <div key={l.order} className={cn('rounded-lg border p-3', preview === l.order ? 'border-accent' : 'border-line')}>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <button type="button" onClick={() => setPreview(l.order)} className="min-w-0 truncate text-left text-[13px] font-medium hover:text-accent">
                          {o?.name} <span className="font-code text-xs text-ink-3">{o?.number}</span>
                        </button>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button size="sm" variant={preview === l.order ? 'soft' : 'ghost'} onClick={() => setPreview(l.order)} aria-pressed={preview === l.order}>
                            <Ruler />
                            {preview === l.order ? t('plan.drawing_shown') : t('plan.drawing_show')}
                          </Button>
                          <Button variant="ghost" size="iconSm" onClick={() => o && toggle(o)} aria-label={t('delete')}>
                            <Trash2 />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        <Field label={t('plan.production_qty')}>
                          {(fid) => <NumberInput id={fid} value={l.quantity} onChange={(v) => setLine(l.order, { quantity: v || 1 })} suffix={t('pcs')} />}
                        </Field>
                        <Field label={t('plan.ups')}>
                          {(fid) => <NumberInput id={fid} value={l.ups} min={1} max={20} onChange={(v) => setLine(l.order, { ups: v || 1 })} />}
                        </Field>
                        <Field label={t('plan.parts')}>
                          {(fid) => (
                            <Select id={fid} value={String(l.parts)} onChange={(v) => setLine(l.order, { parts: Number(v) })} options={[1, 2, 3, 4].map((n) => ({ value: String(n), label: n === 1 ? t('plan.whole') : `1/${n}` }))} />
                          )}
                        </Field>
                        <Field label={t('plan.orientation')}>
                          {(fid) => (
                            <Segments id={fid} value={l.orientation} onChange={(v) => setLine(l.order, { orientation: v })} options={[{ value: 'horizontal', label: t('plan.horizontal') }, { value: 'vertical', label: t('plan.vertical') }]} />
                          )}
                        </Field>
                      </div>
                      {lp ? (
                        <p className="tabular mt-2 text-xs text-ink-3">
                          {t('plan.line_info', { across: lp.blank_across, along: lp.blank_along, lane: lp.lane_width, sheets: num(lp.sheets), run: num(lp.run_m, 1) })}
                        </p>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </Card>

            {previewOrder ? (
              <Card title={`${t('drawing.title')}: ${previewOrder.name}`}>
                {lines.length > 1 ? (
                  <div className="mb-3 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-ink-3">{t('plan.drawing_of')}</span>
                    {lines.map((l) => (
                      <button
                        key={l.order}
                        type="button"
                        onClick={() => setPreview(l.order)}
                        aria-pressed={preview === l.order}
                        className={cn('h-7 rounded-full border px-2.5 text-xs font-medium transition-colors', preview === l.order ? 'border-accent bg-accent text-on-accent' : 'border-line-strong text-ink-2 hover:border-accent hover:text-accent')}
                      >
                        {picked[l.order]?.name}
                      </button>
                    ))}
                  </div>
                ) : null}
                <ShapeView shape={{ ...previewOrder, parts: previewLine?.parts ?? 1, orientation: previewLine?.orientation ?? 'horizontal', ups: previewLine?.ups ?? 1 }} quantity={previewLine?.quantity ?? previewOrder.quantity} logo={previewOrder.logo} />
              </Card>
            ) : null}

            <Card title={t('plan.result')}>
              {planError ? (
                <p className="mb-3 flex items-start gap-2 rounded-md bg-bad-soft px-3 py-2 text-[13px] text-bad">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  {planError}
                </p>
              ) : null}
              {plan ? (
                <div className="flex flex-col gap-4">
                  <CorrugatorLayout plan={plan} />
                  {plan.warnings.map((w) => (
                    <p key={w} className="flex items-start gap-2 rounded-md bg-warn-soft px-3 py-2 text-[13px] text-warn">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                      {w}
                    </p>
                  ))}
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                      <thead className="text-xs text-ink-3">
                        <tr className="border-b border-line">
                          <th className="py-1.5 text-left font-medium">{t('layer')}</th>
                          <th className="py-1.5 text-left font-medium">{t('material')}</th>
                          <th className="py-1.5 text-right font-medium">{t('plan.need')}</th>
                          <th className="py-1.5 text-right font-medium">{t('plan.in_stock')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plan.materials.map((m) => (
                          <tr key={m.layer} className="border-b border-line last:border-0">
                            <td className="py-1.5">
                              {m.layer + 1} {m.fluted ? <Badge tone="warn">{t('plan.flute')}</Badge> : null}
                            </td>
                            <td className="py-1.5">{materialName(m.material_id)}</td>
                            <td className="tabular py-1.5 text-right">{kg(m.kg)}</td>
                            <td className={cn('tabular py-1.5 text-right font-semibold', m.enough === false ? 'text-bad' : 'text-ok')}>{kg(m.available ?? 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-ink-3">{t('plan.glue_area', { m2: num(plan.glue_m2, 1) })}</p>
                </div>
              ) : !planError ? (
                <p className="text-[13px] text-ink-3">{t('plan.fill_hint')}</p>
              ) : null}
            </Card>

            <Card title={t('plan.pallet')}>
              <Switch checked={usePallet} onChange={setUsePallet} label={t('plan.make_pallet')} hint={t('plan.pallet_hint')} />
              {usePallet ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Field label={t('plan.pallet_length')}>
                    {(fid) => <NumberInput id={fid} value={pallet.length} onChange={(v) => setPallet((p) => ({ ...p, length: v }))} suffix="mm" />}
                  </Field>
                  <Field label={t('deadline')}>
                    {(fid) => <DateInput id={fid} value={pallet.deadline} onChange={(d) => setPallet((p) => ({ ...p, deadline: d }))} />}
                  </Field>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-ink-2">{t('route')}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {EXTRA.map((s) => {
                        const on = pallet.route.includes(s)
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setPallet((p) => ({ ...p, route: on ? p.route.filter((x) => x !== s) : [...p.route.filter((x) => (s === 'tikish' ? x !== 'yelimlash' : s === 'yelimlash' ? x !== 'tikish' : true)), s] }))}
                            className={cn('h-8 rounded-full border px-2.5 text-xs font-medium', on ? 'border-accent bg-accent text-on-accent' : 'border-line-strong text-ink-2 hover:bg-sunken')}
                          >
                            {t(`stage.${s}`)}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-3">
                    <span className="text-xs font-medium text-ink-2">{t('ymo.flow')}</span>
                    <HoldsFlow
                      route={['gofra', ...EXTRA.filter((s) => pallet.route.includes(s))]}
                      holds={pallet.holds.filter((s) => ['gofra', ...pallet.route].slice(0, -1).includes(s))}
                      onChange={(holds) => setPallet((p) => ({ ...p, holds }))}
                    />
                  </div>
                </div>
              ) : null}
              {usePallet && plan && !plan.pallet ? <p className="mt-2 text-xs text-warn">{t('plan.no_pallet', { mm: plan.offcut_mm })}</p> : null}
              {plan?.pallet ? <p className="mt-2 text-xs text-ink-2">{t('plan.pallet_info', { w: plan.pallet.width, l: plan.pallet.length, n: num(plan.pallet.count) })}</p> : null}
            </Card>

            <Card>
              <div className="flex flex-col gap-3">
                <Field label={t('note')}>{(fid) => <Textarea id={fid} value={comment} onChange={(e) => setComment(e.target.value)} />}</Field>
                <Switch checked={priority} onChange={setPriority} label={t('batch.priority')} hint={t('batch.priority_hint')} />
              </div>
            </Card>
          </div>
        </div>
        <FormFooter busy={saving} onCancel={() => navigate(id ? `/production/batches/${id}` : '/production/batches')} label={id ? t('save') : t('plan.create')} />
      </Form>
    </Page>
  )
}
