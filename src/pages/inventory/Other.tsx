import { Badge, Button, Card, Group, Modal, NumberInput, SimpleGrid, Stack, Text, TextInput } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@/api/client'
import { CrudPage } from '@/components/CrudPage'
import { PageHeader } from '@/components/PageHeader'
import { dateTime, kg, money } from '@/lib/format'
import { useAction } from '@/lib/queries'

interface Outlay {
  id: number
  roll_label: string
  weight: number
  count: number
  price: number
  organization_name: string | null
  service_type_name: string | null
  note: string
  created_at: string
}

export function Outlays() {
  const { t } = useTranslation()
  return (
    <CrudPage<Outlay>
      title="menu.outlays"
      subtitle="outlay.subtitle"
      url="/inventory/outlays"
      writePermission="inventory.manage"
      canDelete={false}
      searchable={false}
      columns={[
        { key: 'created_at', title: t('date'), render: (o) => dateTime(o.created_at) },
        { key: 'roll_label', title: t('roll') },
        { key: 'weight', title: t('weight'), align: 'right', render: (o) => kg(o.weight) },
        { key: 'organization_name', title: t('outlay.organization') },
        { key: 'service_type_name', title: t('outlay.service') },
        { key: 'price', title: t('sale.price'), align: 'right', render: (o) => money(o.price) },
        { key: 'note', title: t('note'), hideOnMobile: true },
      ]}
      fields={[
        { name: 'roll', label: 'roll', type: 'remote', url: '/inventory/rolls', params: { status: 'in_stock' }, labelOf: (r) => `${r.code || '#' + r.id} · ${r.material_name} · ${r.format_mm} · ${r.available_weight} kg`, required: true },
        { name: 'weight', label: 'weight', type: 'number', decimal: true, required: true, span: 6 },
        { name: 'count', label: 'qty', type: 'number', span: 6 },
        { name: 'organization', label: 'outlay.organization', type: 'remote', url: '/inventory/organizations', span: 6 },
        { name: 'service_type', label: 'outlay.service', type: 'remote', url: '/inventory/service-types', span: 6 },
        { name: 'price', label: 'sale.price', type: 'number', span: 6 },
        { name: 'note', label: 'note', type: 'textarea' },
      ]}
    />
  )
}

interface WasteRow {
  id: number
  kind: 'in' | 'sale' | 'adjust'
  weight: number
  price: number
  stage: string
  item_number: string | null
  batch_number: string | null
  note: string
  created_by_name: string | null
  created_at: string
}

function SellWaste({ balance, onClose }: { balance: number; onClose: () => void }) {
  const { t } = useTranslation()
  const [weight, setWeight] = useState<number | string>('')
  const [price, setPrice] = useState<number | string>('')
  const [note, setNote] = useState('')
  const act = useAction(() => api.post('/inventory/waste', { kind: 'sale', weight: Number(weight), price: Number(price || 0), note }), {
    invalidate: ['waste'],
    onSuccess: onClose,
  })
  return (
    <Modal opened onClose={onClose} title={t('waste.sell')} centered>
      <Stack>
        <NumberInput label={t('weight')} description={t('waste.in_stock', { kg: kg(balance) })} value={weight} onChange={setWeight} min={0} max={balance} decimalScale={2} />
        <NumberInput label={t('waste.price_total')} value={price} onChange={setPrice} min={0} thousandSeparator=" " />
        <TextInput label={t('note')} value={note} onChange={(e) => setNote(e.currentTarget.value)} />
        <Button disabled={!weight} loading={act.isPending} onClick={() => act.mutate(undefined)}>
          {t('waste.sell')}
        </Button>
      </Stack>
    </Modal>
  )
}

export function Waste() {
  const { t } = useTranslation()
  const [selling, setSelling] = useState(false)
  const { data } = useQuery({ queryKey: ['waste', 'balance'], queryFn: () => api.get<{ collected: number; sold: number; balance: number }>('/inventory/waste/balance') })
  return (
    <>
      <PageHeader title={t('menu.waste')} subtitle={t('waste.subtitle')} actions={<Button onClick={() => setSelling(true)}>{t('waste.sell')}</Button>} />
      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="md">
        <Card withBorder radius="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>{t('waste.balance')}</Text>
          <Text fz={26} fw={700}>{kg(data?.balance)}</Text>
        </Card>
        <Card withBorder radius="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>{t('waste.collected')}</Text>
          <Text fz={26} fw={700}>{kg(data?.collected)}</Text>
        </Card>
        <Card withBorder radius="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>{t('waste.sold')}</Text>
          <Text fz={26} fw={700}>{kg(data?.sold)}</Text>
        </Card>
      </SimpleGrid>
      <CrudPage<WasteRow>
        embedded
        title="menu.waste"
        url="/inventory/waste"
        writePermission="__none__"
        searchable={false}
        columns={[
          { key: 'created_at', title: t('date'), render: (w) => dateTime(w.created_at) },
          { key: 'kind', title: t('type'), render: (w) => <Badge color={w.kind === 'sale' ? 'teal' : 'gray'} variant="light">{t(`waste.kind.${w.kind}`)}</Badge> },
          { key: 'weight', title: t('weight'), align: 'right', render: (w) => kg(w.weight) },
          { key: 'source', title: t('waste.source'), render: (w) => [w.stage && t(`stage.${w.stage}`, { defaultValue: w.stage }), w.batch_number, w.item_number].filter(Boolean).join(' · ') || '—' },
          { key: 'price', title: t('sale.price'), align: 'right', render: (w) => (w.kind === 'sale' ? money(w.price) : '—') },
          { key: 'by', title: t('created_by'), hideOnMobile: true, render: (w) => w.created_by_name ?? '—' },
        ]}
        fields={[]}
      />
      {selling && <SellWaste balance={data?.balance ?? 0} onClose={() => setSelling(false)} />}
    </>
  )
}

export { Group }
