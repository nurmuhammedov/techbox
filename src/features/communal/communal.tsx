import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { api } from '@/api/client'
import { ResourceForm, ResourceList } from '@/kit/resource'
import { cn } from '@/lib/cn'
import { money, num } from '@/lib/format'
import { useTab } from '@/features/chemicals/chemicals'
import { Button } from '@/ui/button'
import { TabPanel, Tabs } from '@/ui/controls'
import { Badge } from '@/ui/feedback'
import { Card, Page } from '@/ui/page'

interface Report { id: number; resource_name: string; resource_type: string; year: number; month: number; meter_value: number | null; consumption: number; total_price: number; amount_paid: number; debt: number }
interface Resource { id: number; name: string; unit_name: string | null; type: string; currency: string; tariffs: { id: number; from_value: number | null; to_value: number | null; price: number; label: string }[] }
interface Tariff { id: number; resource: number; from_value: number | null; to_value: number | null; price: number; label: string }
interface Unit { id: number; name: string; symbol: string }

const TYPES = [{ value: 'meter', label: 'communal.type.meter' }, { value: 'fixed', label: 'communal.type.fixed' }, { value: 'electric', label: 'communal.type.electric' }]

export function CommunalPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [tab, setTab] = useTab('reports')
  const year = new Date().getFullYear()
  const summary = useQuery({ queryKey: ['communal/reports', 'summary', year], queryFn: () => api.get<{ resource: number; resource__name: string; consumption: number; total: number; paid: number; debt: number }[]>('/communal/reports/summary', { year }) })
  const monthly = useQuery({ queryKey: ['communal/reports', 'year', year], queryFn: () => api.get<{ results: Report[] }>('/communal/reports', { year, page_size: 200 }) })
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const totals = months.map((m) => (monthly.data?.results ?? []).filter((r) => r.month === m).reduce((s, r) => s + Number(r.total_price), 0))
  const max = Math.max(...totals, 1)

  const reports: ColumnDef<Report, unknown>[] = [
    { id: 'period', header: t('communal.period'), cell: ({ row }) => <span className="tabular font-medium">{String(row.original.month).padStart(2, '0')}.{row.original.year}</span> },
    { id: 'resource', header: t('communal.resource'), cell: ({ row }) => row.original.resource_name },
    { id: 'meter', header: t('communal.meter'), cell: ({ row }) => <span className="tabular">{num(row.original.meter_value, 1)}</span>, meta: { className: 'text-right' } },
    { id: 'consumption', header: t('communal.consumption'), cell: ({ row }) => <span className="tabular">{num(row.original.consumption, 1)}</span>, meta: { className: 'text-right' } },
    { id: 'total', header: t('communal.total'), cell: ({ row }) => <span className="tabular">{money(row.original.total_price)}</span>, meta: { className: 'text-right' } },
    { id: 'paid', header: t('communal.paid'), cell: ({ row }) => <span className="tabular">{money(row.original.amount_paid)}</span>, meta: { className: 'text-right' } },
    { id: 'debt', header: t('communal.debt'), cell: ({ row }) => <b className={cn('tabular', row.original.debt > 0 ? 'text-bad' : 'text-ok')}>{money(row.original.debt)}</b>, meta: { className: 'text-right' } },
  ]
  const resources: ColumnDef<Resource, unknown>[] = [
    { id: 'name', header: t('name'), cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { id: 'type', header: t('type'), cell: ({ row }) => <Badge>{t(`communal.type.${row.original.type}`)}</Badge> },
    { id: 'unit', header: t('unit'), cell: ({ row }) => row.original.unit_name ?? '—' },
    { id: 'tariffs', header: t('communal.tariffs'), cell: ({ row }) => <div className="flex flex-col text-xs">{row.original.tariffs.map((tf) => <span key={tf.id} className="tabular">{tf.label || `${num(tf.from_value)} – ${tf.to_value === null ? '∞' : num(tf.to_value)}`}: {money(tf.price)}</span>)}</div> },
  ]
  const tariffs: ColumnDef<Tariff, unknown>[] = [
    { id: 'resource', header: t('communal.resource'), cell: ({ row }) => row.original.resource },
    { id: 'range', header: t('communal.range'), cell: ({ row }) => <span className="tabular">{row.original.label || `${num(row.original.from_value)} – ${row.original.to_value === null ? '∞' : num(row.original.to_value)}`}</span> },
    { id: 'price', header: t('sale.price'), cell: ({ row }) => <span className="tabular">{money(row.original.price)}</span>, meta: { className: 'text-right' } },
  ]
  const units: ColumnDef<Unit, unknown>[] = [
    { id: 'name', header: t('name'), cell: ({ row }) => row.original.name },
    { id: 'symbol', header: t('communal.symbol'), cell: ({ row }) => row.original.symbol || '—' },
  ]
  const addFor: Record<string, string> = { reports: '/communal/reports/new', resources: '/communal/resources/new', tariffs: '/communal/tariffs/new', units: '/communal/units/new' }

  return (
    <Page title={t('menu.communal')} flow actions={<Button variant="primary" onClick={() => navigate(addFor[tab])}><Plus />{t('add')}</Button>}>
      <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="grid gap-3 sm:grid-cols-2">
          {summary.data?.map((s) => (
            <Card key={s.resource}>
              <p className="text-xs text-ink-3">{s.resource__name} · {year}</p>
              <p className="tabular text-xl font-semibold">{money(s.total)}</p>
              <p className={cn('tabular text-xs', s.debt > 0 ? 'text-bad' : 'text-ok')}>{t('communal.debt')}: {money(s.debt)}</p>
            </Card>
          ))}
        </div>
        <Card title={t('communal.by_month', { year })}>
          <div className="flex h-36 items-end gap-1.5">
            {totals.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1" title={money(v)}>
                <div className="w-full rounded-t bg-accent/80 transition-all hover:bg-accent" style={{ height: `${(v / max) * 100}%`, minHeight: v ? 3 : 0 }} />
                <span className="tabular text-[10px] text-ink-3">{i + 1}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'reports', label: t('communal.reports') }, { value: 'resources', label: t('communal.resources') }, { value: 'tariffs', label: t('communal.tariffs') }, { value: 'units', label: t('unit') }]}>
        <TabPanel value="reports"><ResourceList<Report> embedded title="communal.reports" url="/communal/reports" base="/communal/reports" columns={reports} writePermission="communal.manage" /></TabPanel>
        <TabPanel value="resources"><ResourceList<Resource> embedded title="communal.resources" url="/communal/resources" base="/communal/resources" columns={resources} writePermission="communal.manage" paginated={false} /></TabPanel>
        <TabPanel value="tariffs"><ResourceList<Tariff> embedded title="communal.tariffs" url="/communal/tariffs" base="/communal/tariffs" columns={tariffs} writePermission="communal.manage" paginated={false} /></TabPanel>
        <TabPanel value="units"><ResourceList<Unit> embedded title="unit" url="/communal/units" base="/communal/units" columns={units} writePermission="communal.manage" paginated={false} /></TabPanel>
      </Tabs>
    </Page>
  )
}

export const ReportForm = () => {
  const now = new Date()
  return (
    <ResourceForm title="communal.report" url="/communal/reports" back="/communal?tab=reports" defaults={{ year: now.getFullYear(), month: now.getMonth() + 1, amount_paid: 0 }} sections={[{ fields: [
      { name: 'resource', label: 'communal.resource', type: 'remote', url: '/communal/resources', hintOf: (r) => String(r.type), required: true },
      { name: 'year', label: 'communal.year', type: 'number', required: true, span: 6 },
      { name: 'month', label: 'communal.month', type: 'select', options: Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `month.${i + 1}` })), required: true, span: 6 },
      { name: 'meter_value', label: 'communal.meter', type: 'decimal', span: 6, hint: 'communal.meter_hint' },
      { name: 'consumption', label: 'communal.consumption', type: 'decimal', span: 6, hint: 'communal.consumption_hint' },
      { name: 'total_price', label: 'communal.total_electric', type: 'money', span: 6 },
      { name: 'amount_paid', label: 'communal.paid', type: 'money', span: 6 },
    ] }]} transform={(p) => ({ ...p, month: Number(p.month) })} />
  )
}

export const ResourceFormPage = () => (
  <ResourceForm title="communal.resource" url="/communal/resources" back="/communal?tab=resources" defaults={{ type: 'meter', currency: 'uzs' }} sections={[{ fields: [
    { name: 'name', label: 'name', required: true },
    { name: 'type', label: 'type', type: 'segments', options: TYPES },
    { name: 'unit', label: 'unit', type: 'remote', url: '/communal/units', span: 6 },
    { name: 'currency', label: 'communal.currency', type: 'segments', options: [{ value: 'uzs', label: 'currency.som' }, { value: 'usd', label: 'USD' }], span: 6 },
  ] }]} />
)

export const TariffForm = () => (
  <ResourceForm title="communal.tariff" url="/communal/tariffs" back="/communal?tab=tariffs" sections={[{ fields: [
    { name: 'resource', label: 'communal.resource', type: 'remote', url: '/communal/resources', required: true },
    { name: 'from_value', label: 'communal.from', type: 'decimal', span: 6 },
    { name: 'to_value', label: 'communal.to', type: 'decimal', span: 6, hint: 'communal.to_hint' },
    { name: 'price', label: 'sale.price', type: 'money', required: true, span: 6 },
    { name: 'label', label: 'communal.label', span: 6 },
  ] }]} />
)

export const UnitForm = () => (
  <ResourceForm title="unit" url="/communal/units" back="/communal?tab=units" sections={[{ fields: [
    { name: 'name', label: 'name', required: true, span: 8 },
    { name: 'symbol', label: 'communal.symbol', span: 4 },
  ] }]} />
)
