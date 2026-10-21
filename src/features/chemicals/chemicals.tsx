import { useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { FlaskConical, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { api } from '@/api/client'
import { RemoteCombo, useOptions } from '@/kit/fields'
import { FormFooter, ResourceForm, ResourceList } from '@/kit/resource'
import { dateTime, money, num } from '@/lib/format'
import { fail, ok } from '@/lib/notify'
import { Button } from '@/ui/button'
import { TabPanel, Tabs } from '@/ui/controls'
import { Badge } from '@/ui/feedback'
import { Field } from '@/ui/field'
import { Form } from '@/ui/form'
import { NumberInput } from '@/ui/number-input'
import { Card, Page } from '@/ui/page'
import { useUrlFilters } from '@/kit/filters'

interface Lot { id: number; type_name: string; unit: string; amount: number; remaining: number; price: number; supplier: string; created_at: string }
interface GlueRow { id: number; type_name: string; amount: number; remaining: number; cost: number; ingredients: { chemical_name: string; amount: number }[]; created_at: string }
interface Named { id: number; name: string; unit?: string }

export function useTab(fallback: string) {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? fallback
  return [tab, (value: string) => setParams((p) => { const n = new URLSearchParams(p); n.set('tab', value); ['page', 'q', 'sort', 'order'].forEach((k) => n.delete(k)); return n }, { replace: true })] as const
}

export function ChemicalsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [tab, setTab] = useTab('lots')
  const f = useUrlFilters({ type: { kind: 'remote', param: 'chemical_type', url: '/chemicals/types', label: (r) => String(r.name) } })
  const lots: ColumnDef<Lot, unknown>[] = [
    { id: 'date', header: t('date'), cell: ({ row }) => <span className="tabular whitespace-nowrap">{dateTime(row.original.created_at)}</span>, meta: { sortKey: 'created_at' } },
    { id: 'type', header: t('chem.type'), cell: ({ row }) => <span className="font-medium">{row.original.type_name}</span>, meta: { export: (r: Lot) => r.type_name } },
    { id: 'amount', header: t('chem.amount'), cell: ({ row }) => <span className="tabular">{num(row.original.amount, 1)} {row.original.unit}</span>, meta: { className: 'text-right' } },
    { id: 'remaining', header: t('chem.remaining'), cell: ({ row }) => <b className={`tabular ${row.original.remaining > 0 ? 'text-ok' : 'text-ink-3'}`}>{num(row.original.remaining, 1)} {row.original.unit}</b>, meta: { className: 'text-right' } },
    { id: 'price', header: t('chem.price_total'), cell: ({ row }) => <span className="tabular">{money(row.original.price)}</span>, meta: { className: 'text-right' } },
    { id: 'supplier', header: t('roll.supplier'), cell: ({ row }) => row.original.supplier || '—' },
  ]
  const glue: ColumnDef<GlueRow, unknown>[] = [
    { id: 'date', header: t('date'), cell: ({ row }) => <span className="tabular whitespace-nowrap">{dateTime(row.original.created_at)}</span> },
    { id: 'type', header: t('glue.type'), cell: ({ row }) => <span className="font-medium">{row.original.type_name} <span className="font-code text-xs text-ink-3">#{row.original.id}</span></span> },
    { id: 'amount', header: t('glue.amount'), cell: ({ row }) => <span className="tabular">{num(row.original.amount, 1)}</span>, meta: { className: 'text-right' } },
    { id: 'remaining', header: t('chem.remaining'), cell: ({ row }) => <b className="tabular">{num(row.original.remaining, 1)}</b>, meta: { className: 'text-right' } },
    { id: 'cost', header: t('glue.cost'), cell: ({ row }) => <span className="tabular">{money(row.original.cost)}</span>, meta: { className: 'text-right' } },
    { id: 'ingredients', header: t('glue.ingredients'), cell: ({ row }) => <span className="text-xs">{row.original.ingredients.map((i) => `${i.chemical_name} ${num(i.amount, 1)}`).join(', ')}</span> },
  ]
  const types: ColumnDef<Named, unknown>[] = [
    { id: 'name', header: t('name'), cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { id: 'unit', header: t('unit'), cell: ({ row }) => (row.original.unit ? <Badge>{row.original.unit}</Badge> : null) },
  ]
  return (
    <Page title={t('menu.chemicals')} actions={<Button variant="primary" onClick={() => navigate('/chemicals/glue/new')}><FlaskConical />{t('glue.make')}</Button>}>
      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'lots', label: t('chem.lots') }, { value: 'glue', label: t('glue') }, { value: 'types', label: t('chem.types') }, { value: 'glue-types', label: t('glue.types') }]}>
        <TabPanel value="lots"><ResourceList<Lot> embedded title="chem.lots" url="/chemicals/lots" base="/chemicals/lots" columns={lots} params={f.params} filters={f.filters} writePermission="chemicals.manage" onRowOpen={() => undefined} defaultSort="created_at" defaultOrder="desc" toolbar={<Button variant="soft" onClick={() => navigate('/chemicals/lots/new')}><Plus />{t('chem.add_lot')}</Button>} /></TabPanel>
        <TabPanel value="glue"><ResourceList<GlueRow> embedded title="glue" url="/chemicals/glue" base="/chemicals/glue" columns={glue} /></TabPanel>
        <TabPanel value="types"><ResourceList<Named> embedded title="chem.types" url="/chemicals/types" base="/chemicals/types" columns={types} writePermission="chemicals.manage" paginated={false} toolbar={<Button variant="soft" onClick={() => navigate('/chemicals/types/new')}><Plus />{t('add')}</Button>} /></TabPanel>
        <TabPanel value="glue-types"><ResourceList<Named> embedded title="glue.types" url="/chemicals/glue-types" base="/chemicals/glue-types" columns={types} writePermission="chemicals.manage" paginated={false} toolbar={<Button variant="soft" onClick={() => navigate('/chemicals/glue-types/new')}><Plus />{t('add')}</Button>} /></TabPanel>
      </Tabs>
    </Page>
  )
}

export const ChemicalLotForm = () => (
  <ResourceForm title="chem.lot" url="/chemicals/lots" back="/chemicals?tab=lots" sections={[{ fields: [
    { name: 'chemical_type', label: 'chem.type', type: 'remote', url: '/chemicals/types', hintOf: (r) => String(r.unit), required: true },
    { name: 'amount', label: 'chem.amount', type: 'decimal', required: true, span: 6 },
    { name: 'price', label: 'chem.price_total', type: 'money', span: 6 },
    { name: 'supplier', label: 'roll.supplier' },
  ] }]} />
)

export const ChemicalTypeForm = () => (
  <ResourceForm title="chem.type" url="/chemicals/types" back="/chemicals?tab=types" defaults={{ unit: 'kg' }} sections={[{ fields: [
    { name: 'name', label: 'name', required: true },
    { name: 'unit', label: 'unit', type: 'segments', options: [{ value: 'kg', label: 'kg' }, { value: 'l', label: 'unit.litre' }] },
  ] }]} />
)

export const GlueTypeForm = () => (
  <ResourceForm title="glue.type" url="/chemicals/glue-types" back="/chemicals?tab=glue-types" sections={[{ fields: [{ name: 'name', label: 'name', required: true }] }]} />
)

export function GlueMakePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const lots = (useOptions('/chemicals/lots', { in_stock: 1 }).data ?? []) as unknown as Lot[]
  const [type, setType] = useState<number | null>(null)
  const [amount, setAmount] = useState<number | null>(null)
  const [items, setItems] = useState<{ chemical: number | null; amount: number | null }[]>([{ chemical: null, amount: null }])
  const [busy, setBusy] = useState(false)
  const cost = items.reduce((s, i) => {
    const lot = lots.find((l) => l.id === i.chemical)
    return s + (lot && i.amount ? (lot.price / lot.amount) * i.amount : 0)
  }, 0)

  const submit = async () => {
    if (!type || !amount) return
    setBusy(true)
    try {
      await api.post('/chemicals/glue', { glue_type: type, amount, ingredients: items.filter((i) => i.chemical && i.amount).map((i) => ({ chemical: i.chemical, amount: i.amount })) })
      ok(t('glue.made'))
      await qc.invalidateQueries({ queryKey: ['chemicals/glue'] })
      await qc.invalidateQueries({ queryKey: ['chemicals/lots'] })
      navigate('/chemicals?tab=glue')
    } catch (e) {
      fail(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page title={t('glue.make')} flow width="narrow">
      <Form onSubmit={submit}>
        <Card>
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label={t('glue.type')} required>{(fid) => <RemoteCombo id={fid} url="/chemicals/glue-types" value={type} onChange={setType} />}</Field>
            <Field label={t('glue.amount')} required>{(fid) => <NumberInput id={fid} value={amount} onChange={setAmount} decimals={3} />}</Field>
          </div>
        </Card>
        <Card title={t('glue.ingredients')}>
          <div className="flex flex-col gap-2">
            {items.map((it, i) => {
              const lot = lots.find((l) => l.id === it.chemical)
              return (
                <div key={i} className="grid grid-cols-[minmax(0,1fr)_140px_auto] items-center gap-2">
                  <RemoteCombo url="/chemicals/lots" params={{ in_stock: 1 }} value={it.chemical} labelOf={(r) => `${r.type_name} #${r.id}`} hintOf={(r) => `${num(r.remaining as number, 1)} ${r.unit}`} onChange={(v) => setItems((s) => s.map((x, j) => (j === i ? { ...x, chemical: v } : x)))} />
                  <NumberInput value={it.amount} onChange={(v) => setItems((s) => s.map((x, j) => (j === i ? { ...x, amount: v } : x)))} decimals={3} suffix={lot?.unit} max={lot?.remaining} />
                  <Button variant="ghost" size="iconSm" disabled={items.length === 1} onClick={() => setItems((s) => s.filter((_x, j) => j !== i))} aria-label={t('delete')}><Trash2 /></Button>
                </div>
              )
            })}
            <Button variant="soft" size="sm" className="w-fit" onClick={() => setItems((s) => [...s, { chemical: null, amount: null }])}><Plus />{t('glue.add_ingredient')}</Button>
          </div>
          <p className="tabular mt-3 text-right text-[13px]">{t('glue.cost')}: <b>{money(cost)}</b></p>
        </Card>
        <FormFooter busy={busy} onCancel={() => navigate('/chemicals?tab=glue')} label={t('glue.make')} />
      </Form>
    </Page>
  )
}
