import { Button, Modal, NumberInput, Stack, Switch, Text, TextInput } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { IconArrowBackUp, IconSearch } from '@tabler/icons-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@/api/client'
import { DataTable } from '@/components/DataTable'
import { PageHeader } from '@/components/PageHeader'
import { dateTime, money, num } from '@/lib/format'
import { useAction, usePage } from '@/lib/queries'

interface Sale {
  id: number
  customer_name: string
  item_number: string
  item_name: string
  item_kind: string
  quantity: number
  returned: number
  price: number
  note: string
  created_by_name: string | null
  created_at: string
}

function ReturnModal({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  const { t } = useTranslation()
  const [qty, setQty] = useState<number | string>('')
  const [toWaste, setToWaste] = useState(false)
  const [weight, setWeight] = useState<number | string>('')
  const max = sale.quantity - sale.returned
  const act = useAction(() => api.post(`/sales/sales/${sale.id}/return`, { quantity: Number(qty), to_waste: toWaste, weight: weight === '' ? null : Number(weight) }), {
    success: t('sale.returned'),
    invalidate: ['sales', 'items', 'waste'],
    onSuccess: onClose,
  })
  return (
    <Modal opened onClose={onClose} title={`${t('sale.return')}: ${sale.item_name}`} centered>
      <Stack>
        <NumberInput label={t('qty')} description={t('sale.max_return', { n: max })} value={qty} onChange={setQty} min={1} max={max} />
        <Switch label={t('sale.to_waste')} checked={toWaste} onChange={(e) => setToWaste(e.currentTarget.checked)} />
        {toWaste && <NumberInput label={t('work.waste_kg')} value={weight} onChange={setWeight} min={0} decimalScale={2} />}
        <Button loading={act.isPending} disabled={!qty || (toWaste && !weight)} onClick={() => act.mutate(undefined)}>
          {t('sale.return')}
        </Button>
      </Stack>
    </Modal>
  )
}

export default function Sales() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debounced] = useDebouncedValue(search, 300)
  const [returning, setReturning] = useState<Sale | null>(null)
  const query = usePage<Sale>('/sales/sales', { page, search: debounced || undefined })
  return (
    <>
      <PageHeader title={t('menu.sales_list')} subtitle={t('sale.subtitle')} />
      <TextInput mb="sm" leftSection={<IconSearch size={16} />} placeholder={t('search')} value={search} onChange={(e) => setSearch(e.currentTarget.value)} w={{ base: '100%', sm: 280 }} />
      <DataTable
        rows={query.data?.results}
        loading={query.isLoading}
        page={page}
        pages={query.data?.pages}
        total={query.data?.count}
        onPage={setPage}
        columns={[
          { key: 'created_at', title: t('date'), render: (s) => dateTime(s.created_at) },
          { key: 'customer_name', title: t('customer') },
          { key: 'item', title: t('name'), render: (s) => <Stack gap={0}><Text size="sm">{s.item_name}</Text><Text size="xs" c="dimmed">{s.item_number}</Text></Stack> },
          { key: 'quantity', title: t('qty'), align: 'right', render: (s) => num(s.quantity) },
          { key: 'returned', title: t('sale.returned_qty'), align: 'right', render: (s) => (s.returned ? num(s.returned) : '—') },
          { key: 'price', title: t('sale.price'), align: 'right', render: (s) => money(s.price) },
          { key: 'sum', title: t('sale.sum'), align: 'right', hideOnMobile: true, render: (s) => money(s.price * (s.quantity - s.returned)) },
          { key: 'by', title: t('created_by'), hideOnMobile: true, render: (s) => s.created_by_name ?? '—' },
          {
            key: '_r',
            title: '',
            align: 'right',
            render: (s) =>
              s.quantity > s.returned && (
                <Button size="xs" variant="light" leftSection={<IconArrowBackUp size={14} />} onClick={() => setReturning(s)}>
                  {t('sale.return')}
                </Button>
              ),
          },
        ]}
      />
      {returning && <ReturnModal sale={returning} onClose={() => setReturning(null)} />}
    </>
  )
}
