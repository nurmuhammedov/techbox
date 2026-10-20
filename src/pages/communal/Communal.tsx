import { Badge, Card, Group, SimpleGrid, Stack, Text } from '@mantine/core'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CrudPage } from '@/components/CrudPage'
import { PageHeader } from '@/components/PageHeader'
import { Segments } from '@/components/Segments'
import { money, num } from '@/lib/format'
import { useList } from '@/lib/queries'

interface Resource {
  id: number
  name: string
  unit_name: string | null
  type: 'meter' | 'fixed' | 'electric'
  currency: string
  tariffs: { id: number; from_value: number | null; to_value: number | null; price: number; label: string }[]
}

interface Report {
  id: number
  resource: number
  resource_name: string
  resource_type: Resource['type']
  year: number
  month: number
  meter_value: number | null
  consumption: number
  total_price: number
  amount_paid: number
  debt: number
}

const TYPES = [
  { value: 'meter', label: 'communal.type.meter' },
  { value: 'fixed', label: 'communal.type.fixed' },
  { value: 'electric', label: 'communal.type.electric' },
]

export default function Communal() {
  const { t } = useTranslation()
  const [section, setSection] = useState('reports')
  const year = new Date().getFullYear()
  const summary = useList<{ resource: number; resource__name: string; consumption: number; total: number; paid: number; debt: number }>('/communal/reports/summary', { year })
  return (
    <>
      <PageHeader title={t('menu.communal')} />
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="md">
        {summary.data?.map((s) => (
          <Card key={s.resource} withBorder radius="md" padding="sm">
            <Text fw={600} size="sm">
              {s.resource__name} · {year}
            </Text>
            <Text fz={20} fw={700}>
              {money(s.total)}
            </Text>
            <Text size="xs" c={s.debt > 0 ? 'red' : 'dimmed'}>
              {t('communal.debt')}: {money(s.debt)}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
      <Segments
        mb="md"
        value={section}
        onChange={setSection}
        data={[
          { value: 'reports', label: t('communal.reports') },
          { value: 'resources', label: t('communal.resources') },
          { value: 'tariffs', label: t('communal.tariffs') },
          { value: 'units', label: t('unit') },
        ]}
      />
      {section === 'reports' && (
        <CrudPage<Report>
          embedded
          title="communal.reports"
          url="/communal/reports"
          writePermission="communal.manage"
          searchable={false}
          columns={[
            { key: 'period', title: t('communal.period'), render: (r) => `${String(r.month).padStart(2, '0')}.${r.year}` },
            { key: 'resource_name', title: t('communal.resource') },
            { key: 'meter_value', title: t('communal.meter'), align: 'right', render: (r) => num(r.meter_value, 1) },
            { key: 'consumption', title: t('communal.consumption'), align: 'right', render: (r) => num(r.consumption, 1) },
            { key: 'total_price', title: t('communal.total'), align: 'right', render: (r) => money(r.total_price) },
            { key: 'amount_paid', title: t('communal.paid'), align: 'right', render: (r) => money(r.amount_paid) },
            { key: 'debt', title: t('communal.debt'), align: 'right', render: (r) => <Text size="sm" c={r.debt > 0 ? 'red' : undefined}>{money(r.debt)}</Text> },
          ]}
          fields={[
            { name: 'resource', label: 'communal.resource', type: 'remote', url: '/communal/resources', required: true },
            { name: 'year', label: 'communal.year', type: 'number', required: true, span: 6 },
            { name: 'month', label: 'communal.month', type: 'number', required: true, span: 6 },
            { name: 'meter_value', label: 'communal.meter', type: 'number', decimal: true, span: 6 },
            { name: 'consumption', label: 'communal.consumption', type: 'number', decimal: true, span: 6 },
            { name: 'total_price', label: 'communal.total_electric', type: 'number', decimal: true, span: 6 },
            { name: 'amount_paid', label: 'communal.paid', type: 'number', decimal: true, span: 6 },
          ]}
          defaults={{ year, month: new Date().getMonth() + 1, amount_paid: 0 }}
        />
      )}
      {section === 'resources' && (
        <CrudPage<Resource>
          embedded
          title="communal.resources"
          url="/communal/resources"
          writePermission="communal.manage"
          paginated={false}
          columns={[
            { key: 'name', title: t('name') },
            { key: 'type', title: t('type'), render: (r) => <Badge variant="light">{t(`communal.type.${r.type}`)}</Badge> },
            { key: 'unit_name', title: t('unit') },
            {
              key: 'tariffs',
              title: t('communal.tariffs'),
              render: (r) => (
                <Stack gap={0}>
                  {r.tariffs.map((tf) => (
                    <Text key={tf.id} size="xs">
                      {tf.label || `${num(tf.from_value)} – ${tf.to_value === null ? '∞' : num(tf.to_value)}`}: {money(tf.price)}
                    </Text>
                  ))}
                </Stack>
              ),
            },
          ]}
          fields={[
            { name: 'name', label: 'name', required: true },
            { name: 'type', label: 'type', type: 'select', options: TYPES, required: true, span: 6 },
            { name: 'unit', label: 'unit', type: 'remote', url: '/communal/units', span: 6 },
            { name: 'currency', label: 'communal.currency', type: 'select', options: [{ value: 'uzs', label: "so'm" }, { value: 'usd', label: 'USD' }], span: 6 },
          ]}
          defaults={{ type: 'meter', currency: 'uzs' }}
        />
      )}
      {section === 'tariffs' && (
        <CrudPage
          embedded
          title="communal.tariffs"
          url="/communal/tariffs"
          writePermission="communal.manage"
          paginated={false}
          searchable={false}
          columns={[
            { key: 'resource', title: t('communal.resource'), render: (r: Record<string, unknown>) => String(r.resource) },
            { key: 'range', title: t('communal.range'), render: (r: Record<string, unknown>) => (r.label as string) || `${num(r.from_value as number)} – ${r.to_value === null ? '∞' : num(r.to_value as number)}` },
            { key: 'price', title: t('sale.price'), align: 'right', render: (r: Record<string, unknown>) => money(r.price as number) },
          ]}
          fields={[
            { name: 'resource', label: 'communal.resource', type: 'remote', url: '/communal/resources', required: true },
            { name: 'from_value', label: 'communal.from', type: 'number', decimal: true, span: 6 },
            { name: 'to_value', label: 'communal.to', type: 'number', decimal: true, span: 6 },
            { name: 'price', label: 'sale.price', type: 'number', decimal: true, required: true, span: 6 },
            { name: 'label', label: 'communal.label', span: 6 },
          ]}
        />
      )}
      {section === 'units' && (
        <CrudPage
          embedded
          title="unit"
          url="/communal/units"
          writePermission="communal.manage"
          paginated={false}
          columns={[
            { key: 'name', title: t('name') },
            { key: 'symbol', title: t('communal.symbol') },
          ]}
          fields={[
            { name: 'name', label: 'name', required: true, span: 6 },
            { name: 'symbol', label: 'communal.symbol', span: 6 },
          ]}
        />
      )}
      <Group />
    </>
  )
}
