import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronDown, CornerUpLeft, Play, Ruler } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { api } from '@/api/client'
import type { Batch, MaterialType, Stage, WorkItem } from '@/api/types'
import { CorrugatorLayout } from '@/drawings/CorrugatorLayout'
import { ShapeView } from '@/drawings/ShapeView'
import { BatchStatusBadge, Deadline, RouteSteps, STAGE_TONE } from '@/kit/badges'
import { RemoteCombo, useOptions } from '@/kit/fields'
import { FormFooter } from '@/kit/resource'
import { cn } from '@/lib/cn'
import { kg, num } from '@/lib/format'
import { fail, ok } from '@/lib/notify'
import { useAction } from '@/lib/queries'
import { Button } from '@/ui/button'
import { Badge, EmptyState, LoadingCards } from '@/ui/feedback'
import { Field } from '@/ui/field'
import { Form } from '@/ui/form'
import { Textarea } from '@/ui/input'
import { NumberInput } from '@/ui/number-input'
import { Card, Page } from '@/ui/page'
import { Picture } from '@/kit/Picture'

interface Queue<T> {
  waiting: T[]
  mine: T[]
  others: T[]
  done_today: T[]
  drafts?: T[]
}

function Section({ title, count, children, muted }: { title: string; count: number; children: ReactNode; muted?: boolean }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className={cn('flex items-center gap-2 text-sm font-semibold', muted && 'text-ink-3')}>
        {title}
        <span className="tabular rounded-full bg-sunken px-2 py-0.5 text-xs font-medium text-ink-2">{count}</span>
      </h2>
      {children}
    </section>
  )
}

function DrawingToggle({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-md border border-line">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-2 px-3 py-2 text-[13px] font-medium text-ink-2 hover:bg-sunken">
        <span className="flex items-center gap-2"><Ruler className="size-4" />{t('drawing.show')}</span>
        <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open ? <div className="border-t border-line p-3">{children}</div> : null}
    </div>
  )
}

export function ItemCard({ item, children }: { item: WorkItem; children?: ReactNode }) {
  const { t } = useTranslation()
  return (
    <article className="flex flex-col gap-3 overflow-hidden rounded-lg border border-line bg-surface p-4 shadow-card">
      <div className="flex items-start gap-3">
        <span className={cn('mt-1 h-10 w-1.5 shrink-0 rounded-full', item.stage ? STAGE_TONE[item.stage] : 'bg-ok')} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">{item.name}</p>
          <p className="truncate text-xs text-ink-3"><span className="font-code">{item.number}</span> · {item.customer_name ?? t('item.kind.pallet')} · {item.size}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 rounded-md bg-sunken p-2.5 text-center">
        <div>
          <p className="text-[11px] text-ink-3">{t('qty')}</p>
          <p className="tabular text-lg font-bold">{num(item.qty || item.planned_qty)}</p>
        </div>
        <div>
          <p className="text-[11px] text-ink-3">{t('format')}</p>
          <p className="tabular text-sm font-semibold">{item.format_mm}</p>
        </div>
        <div>
          <p className="text-[11px] text-ink-3">{t('deadline')}</p>
          <div className="text-sm"><Deadline value={item.deadline} /></div>
        </div>
      </div>
      {item.logo && item.stage !== 'gofra' ? (
        <div className="flex items-center gap-3 rounded-md border border-warn/40 bg-warn-soft p-2.5">
          <Picture src={item.logo} alt="" className="h-20 w-28 shrink-0 rounded border border-line bg-surface object-contain p-1" />
          <p className="text-[13px] font-medium text-warn">{t('ymo.stick_label')}</p>
        </div>
      ) : null}
      <RouteSteps route={item.route} step={item.step} holds={item.holds} compact />
      {item.note ? <p className="rounded-md bg-warn-soft px-2.5 py-1.5 text-xs text-warn">{item.note}</p> : null}
      {item.shape ? (
        <DrawingToggle>
          <ShapeView shape={item.shape} quantity={item.planned_qty} logo={item.logo} compact />
        </DrawingToggle>
      ) : null}
      {children}
    </article>
  )
}

export function StageWorkPage() {
  const { stage } = useParams<{ stage: Stage }>()
  return stage === 'gofra' ? <GofraQueue /> : <ItemQueue key={stage} stage={stage!} />
}

function ItemQueue({ stage }: { stage: Stage }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data } = useQuery({ queryKey: ['queue', stage], queryFn: () => api.get<Queue<WorkItem>>(`/production/queue/${stage}`) })
  const take = useAction((id: number) => api.post(`/production/items/${id}/take`), { success: t('work.taken'), invalidate: ['queue'] })
  const release = useAction((id: number) => api.post(`/production/items/${id}/release`), { success: t('work.released'), invalidate: ['queue'] })
  const grid = 'grid gap-3 md:grid-cols-2 2xl:grid-cols-3'
  return (
    <Page title={t(`stage.${stage}`)} flow>
      {!data ? <LoadingCards rows={2} /> : null}
      {data ? (
        <div className="flex flex-col gap-6">
          {data.mine.length ? (
            <Section title={t('work.mine')} count={data.mine.length}>
              <div className={grid}>
                {data.mine.map((item) => (
                  <ItemCard key={item.id} item={item}>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="primary" className="h-11 text-sm" onClick={() => navigate(`/work/${stage}/${item.id}/finish`)}><Check />{t('work.finish')}</Button>
                      <Button className="h-11 text-sm" loading={release.isPending && release.variables === item.id} onClick={() => release.mutate(item.id)}><CornerUpLeft />{t('work.release')}</Button>
                    </div>
                  </ItemCard>
                ))}
              </div>
            </Section>
          ) : null}
          <Section title={t('work.waiting')} count={data.waiting.length}>
            {data.waiting.length ? (
              <div className={grid}>
                {data.waiting.map((item) => (
                  <ItemCard key={item.id} item={item}>
                    <Button variant="primary" className="h-11 text-sm" loading={take.isPending && take.variables === item.id} onClick={() => take.mutate(item.id)}><Play />{t('work.take')}</Button>
                  </ItemCard>
                ))}
              </div>
            ) : (
              <EmptyState icon={Check} title={t('work.queue_empty')} />
            )}
          </Section>
          {data.others.length ? (
            <Section title={t('work.others')} count={data.others.length} muted>
              <div className={grid}>
                {data.others.map((item) => (
                  <ItemCard key={item.id} item={item}><p className="text-xs text-ink-3">{t('work.by', { name: item.operator_name })}</p></ItemCard>
                ))}
              </div>
            </Section>
          ) : null}
          {data.done_today.length ? (
            <Section title={t('work.done_today')} count={data.done_today.length} muted>
              <div className={grid}>{data.done_today.map((item) => <ItemCard key={item.id} item={item} />)}</div>
            </Section>
          ) : null}
        </div>
      ) : null}
    </Page>
  )
}

export function ItemFinishPage() {
  const { t } = useTranslation()
  const { stage, id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: item } = useQuery({ queryKey: ['items', 'one', id], queryFn: () => api.get<WorkItem>(`/production/items/${id}`) })
  const [qty, setQty] = useState<number | null>(null)
  const [waste, setWaste] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  if (!item) return <Page title="…" flow><LoadingCards rows={2} /></Page>
  const good = qty ?? item.qty

  const submit = async () => {
    setBusy(true)
    try {
      await api.post(`/production/items/${item.id}/finish`, { qty: good, waste_kg: waste, note })
      ok(item.next_stage ? t('work.finished') : t('work.to_store'))
      await qc.invalidateQueries({ queryKey: ['queue'] })
      navigate(`/work/${stage}`)
    } catch (e) {
      fail(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page title={`${t('work.finish')}: ${item.name}`} note={item.number} flow>
      <Form onSubmit={submit}>
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          <Card>
            <div className="grid gap-3.5">
              <Field label={t('work.good_qty')} hint={t('work.max_qty', { n: num(item.qty) })} required>
                {(fid) => <NumberInput id={fid} value={qty} onChange={setQty} placeholder={String(item.qty)} max={item.qty} suffix={t('pcs')} autoFocus className="h-12 text-lg" />}
              </Field>
              <Field label={t('work.waste_kg')}>
                {(fid) => <NumberInput id={fid} value={waste} onChange={setWaste} decimals={2} suffix="kg" className="h-12 text-lg" />}
              </Field>
              <Field label={t('note')}>{(fid) => <Textarea id={fid} value={note} onChange={(e) => setNote(e.target.value)} />}</Field>
              {item.next_stage ? (
                <p className="rounded-md bg-accent-soft px-3 py-2 text-xs text-accent-ink">{t('work.next', { stage: t(`stage.${item.next_stage}`) })}</p>
              ) : (
                <p className="rounded-md bg-ok-soft px-3 py-2 text-xs text-ok">{t('work.to_store')}</p>
              )}
            </div>
          </Card>
          {item.shape ? <Card title={t('drawing.title')}><ShapeView shape={item.shape} quantity={item.planned_qty} logo={item.logo} /></Card> : null}
        </div>
        <FormFooter busy={busy} onCancel={() => navigate(`/work/${stage}`)} label={t('work.finish')} />
      </Form>
    </Page>
  )
}

// ───────────────────────────── Corrugator ─────────────────────────────

function BatchCard({ batch, children }: { batch: Batch; children?: ReactNode }) {
  const { t } = useTranslation()
  const materials = (useOptions('/catalog/materials').data ?? []) as unknown as MaterialType[]
  const nameOf = (mid: number) => materials.find((m) => m.id === mid)?.name ?? `#${mid}`
  const earliest = batch.items.map((i) => i.deadline).filter(Boolean).sort()[0] ?? null
  return (
    <article className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-code text-base font-semibold">{batch.number}</h3>
          <BatchStatusBadge status={batch.status} />
          {batch.priority ? <Badge tone="bad">{t('batch.priority')}</Badge> : null}
        </div>
        <span className="text-xs text-ink-3">{t('deadline')}: <Deadline value={earliest} /></span>
      </div>
      {batch.plan?.lines?.length ? <CorrugatorLayout plan={batch.plan} /> : <p className="text-[13px]">{t('plan.format')}: {batch.format_mm} mm</p>}
      <p className="text-xs text-ink-2"><b>{t('layers')}:</b> {batch.layers.map(nameOf).join(' / ')}</p>
      <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
        {batch.items.map((i) => (
          <li key={i.id} className="flex items-center justify-between gap-2 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">{i.name}</p>
              <p className="truncate text-xs text-ink-3"><span className="font-code">{i.number}</span> · {i.customer_name ?? t('item.kind.pallet')} · {i.size}</p>
            </div>
            <b className="tabular text-[13px]">{num(i.planned_qty)}</b>
          </li>
        ))}
      </ul>
      {batch.items.some((i) => i.shape) ? (
        <DrawingToggle>
          <div className="flex flex-col gap-5">
            {batch.items.filter((i) => i.shape).map((i) => (
              <div key={i.id} className="flex flex-col gap-2">
                <p className="text-[13px] font-medium">{i.name}</p>
                <ShapeView shape={i.shape!} quantity={i.planned_qty} logo={i.logo} compact />
              </div>
            ))}
          </div>
        </DrawingToggle>
      ) : null}
      {batch.allocations.length ? (
        <p className="text-xs text-ink-3">{t('batch.rolls')}: {batch.allocations.map((a) => `${a.layer + 1}: ${a.roll_label} (${kg(a.weight)})`).join(' · ')}</p>
      ) : null}
      {batch.comment ? <p className="rounded-md bg-warn-soft px-2.5 py-1.5 text-xs text-warn">{batch.comment}</p> : null}
      {children}
    </article>
  )
}

function GofraQueue() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data } = useQuery({ queryKey: ['queue', 'gofra'], queryFn: () => api.get<Queue<Batch>>('/production/queue/gofra') })
  const start = useAction((id: number) => api.post(`/production/batches/${id}/start`), { success: t('work.started'), invalidate: ['queue'] })
  const grid = 'grid gap-3 2xl:grid-cols-2'
  return (
    <Page title={t('stage.gofra')} flow>
      {!data ? <LoadingCards rows={2} /> : null}
      {data ? (
        <div className="flex flex-col gap-6">
          {data.mine.length ? (
            <Section title={t('work.mine')} count={data.mine.length}>
              <div className={grid}>
                {data.mine.map((b) => (
                  <BatchCard key={b.id} batch={b}>
                    <Button variant="primary" className="h-11 text-sm" onClick={() => navigate(`/work/gofra/${b.id}/finish`)}><Check />{t('work.finish')}</Button>
                  </BatchCard>
                ))}
              </div>
            </Section>
          ) : null}
          <Section title={t('work.waiting')} count={data.waiting.length}>
            {data.waiting.length ? (
              <div className={grid}>
                {data.waiting.map((b) => (
                  <BatchCard key={b.id} batch={b}>
                    <Button variant="primary" className="h-11 text-sm" loading={start.isPending && start.variables === b.id} onClick={() => start.mutate(b.id)}><Play />{t('work.start')}</Button>
                  </BatchCard>
                ))}
              </div>
            ) : (
              <EmptyState icon={Check} title={t('work.queue_empty')} />
            )}
          </Section>
          {data.others.length ? (
            <Section title={t('work.others')} count={data.others.length} muted>
              <div className={grid}>{data.others.map((b) => <BatchCard key={b.id} batch={b}><p className="text-xs text-ink-3">{t('work.by', { name: b.operator_name })}</p></BatchCard>)}</div>
            </Section>
          ) : null}
          {data.drafts?.length ? (
            <Section title={t('work.drafts')} count={data.drafts.length} muted>
              <div className={grid}>{data.drafts.map((b) => <BatchCard key={b.id} batch={b} />)}</div>
            </Section>
          ) : null}
          {data.done_today.length ? (
            <Section title={t('work.done_today')} count={data.done_today.length} muted>
              <div className={grid}>{data.done_today.map((b) => <BatchCard key={b.id} batch={b} />)}</div>
            </Section>
          ) : null}
        </div>
      ) : null}
    </Page>
  )
}

export function BatchFinishPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: batch } = useQuery({ queryKey: ['batches', 'one', id], queryFn: () => api.get<Batch>(`/production/batches/${id}`) })
  const [qty, setQty] = useState<Record<number, number | null>>({})
  const [left, setLeft] = useState<Record<number, number | null>>({})
  const [glue, setGlue] = useState<number | null>(null)
  const [glueAmount, setGlueAmount] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  if (!batch) return <Page title="…" flow><LoadingCards rows={2} /></Page>

  const rolls = Object.values(
    batch.allocations.reduce<Record<number, { roll: number; label: string; before: number; layers: number[] }>>((acc, a) => {
      acc[a.roll] ??= { roll: a.roll, label: a.roll_label, before: Number(a.weight_before), layers: [] }
      acc[a.roll].layers.push(a.layer + 1)
      return acc
    }, {}),
  )

  const submit = async () => {
    const e: Record<string, string> = {}
    for (const r of rolls) if (left[r.roll] === undefined || left[r.roll] === null) e[`roll${r.roll}`] = t('required')
    setErrors(e)
    if (Object.keys(e).length) return
    setBusy(true)
    try {
      await api.post(`/production/batches/${batch.id}/finish`, {
        items: batch.items.map((i) => ({ work_item: i.id, qty: qty[i.id] ?? i.planned_qty })),
        rolls: rolls.map((r) => ({ roll: r.roll, weight_after: left[r.roll] })),
        glue,
        glue_amount: glueAmount,
        comment,
      })
      ok(t('work.finished'))
      await qc.invalidateQueries({ queryKey: ['queue'] })
      navigate('/work/gofra')
    } catch (err) {
      fail(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page title={`${t('work.finish')}: ${batch.number}`} note={`${batch.format_mm} mm`} flow>
      <Form onSubmit={submit}>
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <Card title={t('work.result')}>
              <div className="grid gap-3.5">
                {batch.items.map((i) => (
                  <Field key={i.id} label={`${i.name} · ${i.size}`} hint={t('work.planned', { n: num(i.planned_qty) })}>
                    {(fid) => <NumberInput id={fid} value={qty[i.id] ?? null} placeholder={String(i.planned_qty)} onChange={(v) => setQty((s) => ({ ...s, [i.id]: v }))} suffix={t('pcs')} className="h-11 text-base" />}
                  </Field>
                ))}
              </div>
            </Card>
            <Card title={t('work.rolls_left')}>
              <div className="grid gap-3.5">
                {rolls.map((r) => (
                  <Field key={r.roll} label={`${r.label} — ${t('layer')} ${r.layers.join(', ')}`} hint={t('work.roll_before', { kg: kg(r.before) })} required error={errors[`roll${r.roll}`]}>
                    {(fid) => <NumberInput id={fid} value={left[r.roll] ?? null} onChange={(v) => setLeft((s) => ({ ...s, [r.roll]: v }))} max={r.before} decimals={2} suffix="kg" invalid={!!errors[`roll${r.roll}`]} className="h-11 text-base" />}
                  </Field>
                ))}
                {!rolls.length ? <p className="text-[13px] text-ink-3">{t('batch.no_rolls')}</p> : null}
              </div>
            </Card>
            <Card title={t('glue')}>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <Field label={t('glue')}>
                  {(fid) => <RemoteCombo id={fid} url="/chemicals/glue" params={{ in_stock: 1 }} value={glue} onChange={setGlue} labelOf={(r) => `${r.type_name} #${r.id}`} hintOf={(r) => kg(r.remaining as number)} />}
                </Field>
                <Field label={t('glue.amount')}>
                  {(fid) => <NumberInput id={fid} value={glueAmount} onChange={setGlueAmount} decimals={2} disabled={!glue} suffix="kg" />}
                </Field>
                <Field label={t('note')} className="sm:col-span-2">{(fid) => <Textarea id={fid} value={comment} onChange={(e) => setComment(e.target.value)} />}</Field>
              </div>
            </Card>
          </div>
          {batch.plan?.lines?.length ? <Card title={t('drawing.layout')}><CorrugatorLayout plan={batch.plan} /></Card> : null}
        </div>
        <FormFooter busy={busy} onCancel={() => navigate('/work/gofra')} label={t('work.finish')} />
      </Form>
    </Page>
  )
}
