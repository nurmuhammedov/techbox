import { ActionIcon, Badge, Button, Card, Group, Modal, NumberInput, Select, SimpleGrid, Stack, Table, Text, TextInput } from '@mantine/core'
import { IconAdjustmentsHorizontal, IconHistory, IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@/api/client'
import type { Roll } from '@/api/types'
import { useAuth } from '@/auth/AuthContext'
import { CrudPage } from '@/components/CrudPage'
import { PageHeader } from '@/components/PageHeader'
import { useRows } from '@/components/RemoteSelect'
import { dateTime, kg } from '@/lib/format'
import { useAction, useList, useOne } from '@/lib/queries'

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

function AdjustModal({ roll, onClose }: { roll: Roll; onClose: () => void }) {
  const { t } = useTranslation()
  const [value, setValue] = useState<number | string>(roll.remaining_weight)
  const [note, setNote] = useState('')
  const act = useAction(() => api.post(`/inventory/rolls/${roll.id}/adjust`, { remaining_weight: Number(value), note }), {
    invalidate: ['rolls', 'stock'],
    onSuccess: onClose,
  })
  return (
    <Modal opened onClose={onClose} title={`${t('roll.adjust')}: ${roll.material_name} · ${roll.format_mm}`} centered>
      <Stack>
        <NumberInput label={t('roll.remaining')} value={value} onChange={setValue} min={0} decimalScale={2} rightSection={<Text size="xs">kg</Text>} />
        <TextInput label={t('roll.reason')} value={note} onChange={(e) => setNote(e.currentTarget.value)} required />
        <Button disabled={!note} loading={act.isPending} onClick={() => act.mutate(undefined)}>
          {t('save')}
        </Button>
      </Stack>
    </Modal>
  )
}

function MovementsModal({ roll, onClose }: { roll: Roll; onClose: () => void }) {
  const { t } = useTranslation()
  const { data } = useOne<{ id: number; kind: string; weight: number; batch_number: string | null; note: string; user_name: string | null; created_at: string }[]>(
    `/inventory/rolls/${roll.id}/movements`,
  )
  return (
    <Modal opened onClose={onClose} title={`${t('roll.history')}: ${roll.material_name} · ${roll.format_mm}`} size="lg" centered>
      <Table.ScrollContainer minWidth={500}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('date')}</Table.Th>
              <Table.Th>{t('type')}</Table.Th>
              <Table.Th ta="right">{t('weight')}</Table.Th>
              <Table.Th>{t('batch')}</Table.Th>
              <Table.Th>{t('created_by')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data?.map((m) => (
              <Table.Tr key={m.id}>
                <Table.Td>{dateTime(m.created_at)}</Table.Td>
                <Table.Td>
                  {t(`movement.${m.kind}`)}
                  {m.note && <Text size="xs" c="dimmed">{m.note}</Text>}
                </Table.Td>
                <Table.Td ta="right">{kg(m.weight)}</Table.Td>
                <Table.Td>{m.batch_number ?? '—'}</Table.Td>
                <Table.Td>{m.user_name ?? '—'}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Modal>
  )
}

export default function Stock() {
  const { t } = useTranslation()
  const { can } = useAuth()
  const summary = useList<StockRow>('/inventory/stock')
  const materials = useRows<{ id: number; name: string }>('/catalog/materials')
  const formats = useRows<{ id: number; width_mm: number }>('/catalog/formats')
  const [material, setMaterial] = useState<string | null>(null)
  const [format, setFormat] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>('in_stock')
  const [adjusting, setAdjusting] = useState<Roll | null>(null)
  const [history, setHistory] = useState<Roll | null>(null)
  const manage = can('inventory.manage')

  return (
    <>
      <PageHeader title={t('menu.stock')} subtitle={t('stock.subtitle')} />
      <SimpleGrid cols={{ base: 1, xs: 2, md: 3, xl: 4 }} mb="lg">
        {summary.data?.map((r) => (
          <Card
            key={`${r.material}-${r.format}`}
            withBorder
            radius="md"
            padding="sm"
            style={{ cursor: 'pointer', borderColor: r.low ? 'var(--mantine-color-red-4)' : undefined }}
            onClick={() => {
              setMaterial(String(r.material))
              setFormat(String(r.format))
            }}
          >
            <Group justify="space-between" wrap="nowrap">
              <Text fw={600} size="sm" truncate>
                {r.material_name}
              </Text>
              <Badge variant="light">{r.format_mm}</Badge>
            </Group>
            <Text fz={22} fw={700} c={r.low ? 'red' : undefined}>
              {kg(r.available)}
            </Text>
            <Text size="xs" c="dimmed">
              {t('stock.line', { rolls: r.rolls, reserved: kg(r.reserved) })}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
      <CrudPage<Roll>
        embedded
        title="menu.stock"
        url="/inventory/rolls"
        writePermission="inventory.manage"
        canDelete={false}
        params={{ material: material ?? undefined, format: format ?? undefined, status: status ?? undefined, ordering: '-created_at' }}
        filters={
          <>
            <Select placeholder={t('material')} data={materials.map((m) => ({ value: String(m.id), label: m.name }))} value={material} onChange={setMaterial} clearable searchable w={180} />
            <Select placeholder={t('format')} data={formats.map((f) => ({ value: String(f.id), label: String(f.width_mm) }))} value={format} onChange={setFormat} clearable w={120} />
            <Select
              data={[
                { value: 'in_stock', label: t('roll.status.in_stock') },
                { value: 'empty', label: t('roll.status.empty') },
              ]}
              value={status}
              onChange={setStatus}
              clearable
              placeholder={t('all')}
              w={150}
            />
          </>
        }
        columns={[
          { key: 'code', title: t('roll.code'), render: (r) => r.code || `#${r.id}` },
          { key: 'material', title: t('material'), render: (r) => `${r.material_name} · ${r.gsm}` },
          { key: 'format_mm', title: t('format') },
          { key: 'available', title: t('roll.available'), align: 'right', render: (r) => <Text fw={600} size="sm">{kg(r.available_weight)}</Text> },
          { key: 'reserved', title: t('roll.reserved'), align: 'right', render: (r) => (r.reserved_weight ? kg(r.reserved_weight) : '—'), hideOnMobile: true },
          { key: 'initial', title: t('roll.initial'), align: 'right', render: (r) => kg(r.initial_weight), hideOnMobile: true },
          { key: 'supplier', title: t('roll.supplier'), render: (r) => [r.supplier_name, r.country_name].filter(Boolean).join(' · ') || '—', hideOnMobile: true },
          { key: 'warehouse_name', title: t('warehouse'), hideOnMobile: true },
          { key: 'created', title: t('roll.received'), render: (r) => dateTime(r.created_at), hideOnMobile: true },
        ]}
        rowActions={(r) => (
          <>
            <ActionIcon variant="subtle" color="gray" onClick={() => setHistory(r)} aria-label={t('roll.history')}>
              <IconHistory size={18} />
            </ActionIcon>
            {manage && (
              <ActionIcon variant="subtle" color="orange" onClick={() => setAdjusting(r)} aria-label={t('roll.adjust')}>
                <IconAdjustmentsHorizontal size={18} />
              </ActionIcon>
            )}
          </>
        )}
        fields={[
          { name: 'material', label: 'material', type: 'remote', url: '/catalog/materials', labelOf: (r) => `${r.name} · ${r.gsm}`, required: true, span: 6 },
          { name: 'format', label: 'format', type: 'remote', url: '/catalog/formats', labelOf: (r) => `${r.width_mm} mm`, required: true, span: 6 },
          { name: 'initial_weight', label: 'roll.initial', type: 'number', decimal: true, required: true, span: 6 },
          { name: 'price_per_kg', label: 'roll.price', type: 'number', decimal: true, span: 6 },
          { name: 'warehouse', label: 'warehouse', type: 'remote', url: '/inventory/warehouses', required: true, span: 6 },
          { name: 'code', label: 'roll.code', span: 6 },
          { name: 'supplier', label: 'roll.supplier', type: 'remote', url: '/catalog/suppliers', span: 6 },
          { name: 'country', label: 'roll.country', type: 'remote', url: '/catalog/countries', span: 6 },
        ]}
      />
      {adjusting && <AdjustModal roll={adjusting} onClose={() => setAdjusting(null)} />}
      {history && <MovementsModal roll={history} onClose={() => setHistory(null)} />}
    </>
  )
}

export { IconPlus }
