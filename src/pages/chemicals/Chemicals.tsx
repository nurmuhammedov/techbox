import { ActionIcon, Button, Group, Modal, NumberInput, Stack, Text } from '@mantine/core'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@/api/client'
import { CrudPage } from '@/components/CrudPage'
import { PageHeader } from '@/components/PageHeader'
import { Segments } from '@/components/Segments'
import { RemoteSelect } from '@/components/RemoteSelect'
import { dateTime, money, num } from '@/lib/format'
import { useAction } from '@/lib/queries'

interface Lot {
  id: number
  type_name: string
  unit: string
  amount: number
  remaining: number
  price: number
  supplier: string
  created_at: string
}

interface GlueRow {
  id: number
  type_name: string
  amount: number
  remaining: number
  cost: number
  ingredients: { chemical: number; chemical_name: string; amount: number }[]
  created_at: string
}

function MakeGlue({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [type, setType] = useState<number | null>(null)
  const [amount, setAmount] = useState<number | string>('')
  const [items, setItems] = useState<{ chemical: number | null; amount: number | string }[]>([{ chemical: null, amount: '' }])
  const act = useAction(
    () =>
      api.post('/chemicals/glue', {
        glue_type: type,
        amount: Number(amount),
        ingredients: items.filter((i) => i.chemical && i.amount !== '').map((i) => ({ chemical: i.chemical, amount: Number(i.amount) })),
      }),
    {
      success: t('glue.made'),
      onSuccess: () => {
        void qc.invalidateQueries({ queryKey: ['chemicals/glue'] })
        void qc.invalidateQueries({ queryKey: ['chemicals/lots'] })
        onClose()
      },
    },
  )
  return (
    <Modal opened onClose={onClose} title={t('glue.make')} size="lg" centered>
      <Stack>
        <Group grow>
          <RemoteSelect label={t('glue.type')} url="/chemicals/glue-types" value={type} onChange={setType} required />
          <NumberInput label={t('glue.amount')} value={amount} onChange={setAmount} min={0} decimalScale={3} required />
        </Group>
        <Text size="sm" fw={500}>
          {t('glue.ingredients')}
        </Text>
        {items.map((it, i) => (
          <Group key={i} align="flex-end" wrap="nowrap">
            <RemoteSelect
              style={{ flex: 1 }}
              aria-label={t('chem.type')}
              url="/chemicals/lots"
              params={{ in_stock: 1 }}
              labelOf={(r) => `${r.type_name} #${r.id} · ${num(r.remaining as number, 1)} ${r.unit}`}
              value={it.chemical}
              onChange={(v) => setItems((s) => s.map((x, j) => (j === i ? { ...x, chemical: v } : x)))}
            />
            <NumberInput w={130} aria-label={t('chem.amount')} value={it.amount} onChange={(v) => setItems((s) => s.map((x, j) => (j === i ? { ...x, amount: v } : x)))} min={0} decimalScale={3} />
            <ActionIcon variant="subtle" color="red" mb={6} onClick={() => setItems((s) => s.filter((_x, j) => j !== i))} disabled={items.length === 1}>
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        ))}
        <Button variant="subtle" size="xs" w="fit-content" leftSection={<IconPlus size={14} />} onClick={() => setItems((s) => [...s, { chemical: null, amount: '' }])}>
          {t('glue.add_ingredient')}
        </Button>
        <Button disabled={!type || !amount} loading={act.isPending} onClick={() => act.mutate(undefined)}>
          {t('glue.make')}
        </Button>
      </Stack>
    </Modal>
  )
}

export default function Chemicals() {
  const { t } = useTranslation()
  const [section, setSection] = useState('lots')
  const [making, setMaking] = useState(false)
  return (
    <>
      <PageHeader
        title={t('menu.chemicals')}
        actions={<Button onClick={() => setMaking(true)}>{t('glue.make')}</Button>}
      />
      <Segments
        mb="md"
        value={section}
        onChange={setSection}
        data={[
          { value: 'lots', label: t('chem.lots') },
          { value: 'glue', label: t('glue') },
          { value: 'types', label: t('chem.types') },
        ]}
      />
      {section === 'lots' && (
        <CrudPage<Lot>
          embedded
          title="chem.lots"
          url="/chemicals/lots"
          writePermission="chemicals.manage"
          columns={[
            { key: 'created_at', title: t('date'), render: (l) => dateTime(l.created_at) },
            { key: 'type_name', title: t('name') },
            { key: 'amount', title: t('chem.amount'), align: 'right', render: (l) => `${num(l.amount, 1)} ${l.unit}` },
            { key: 'remaining', title: t('chem.remaining'), align: 'right', render: (l) => <Text fw={600} size="sm">{num(l.remaining, 1)} {l.unit}</Text> },
            { key: 'price', title: t('chem.price_total'), align: 'right', render: (l) => money(l.price) },
            { key: 'supplier', title: t('roll.supplier'), hideOnMobile: true },
          ]}
          fields={[
            { name: 'chemical_type', label: 'chem.type', type: 'remote', url: '/chemicals/types', required: true },
            { name: 'amount', label: 'chem.amount', type: 'number', decimal: true, required: true, span: 6 },
            { name: 'price', label: 'chem.price_total', type: 'number', span: 6 },
            { name: 'supplier', label: 'roll.supplier' },
          ]}
        />
      )}
      {section === 'glue' && (
        <CrudPage<GlueRow>
          embedded
          title="glue"
          url="/chemicals/glue"
          writePermission="__none__"
          searchable={false}
          columns={[
            { key: 'created_at', title: t('date'), render: (g) => dateTime(g.created_at) },
            { key: 'type_name', title: t('glue.type') },
            { key: 'amount', title: t('glue.amount'), align: 'right', render: (g) => num(g.amount, 1) },
            { key: 'remaining', title: t('chem.remaining'), align: 'right', render: (g) => <Text fw={600} size="sm">{num(g.remaining, 1)}</Text> },
            { key: 'cost', title: t('glue.cost'), align: 'right', render: (g) => money(g.cost) },
            { key: 'ingredients', title: t('glue.ingredients'), hideOnMobile: true, render: (g) => g.ingredients.map((i) => `${i.chemical_name} ${num(i.amount, 1)}`).join(', ') },
          ]}
          fields={[]}
        />
      )}
      {section === 'types' && (
        <Stack>
          <CrudPage
            embedded
            title="chem.types"
            url="/chemicals/types"
            writePermission="chemicals.manage"
            paginated={false}
            columns={[
              { key: 'name', title: t('chem.type') },
              { key: 'unit', title: t('unit') },
            ]}
            fields={[
              { name: 'name', label: 'chem.type', required: true },
              { name: 'unit', label: 'unit', type: 'select', options: [{ value: 'kg', label: 'kg' }, { value: 'l', label: 'unit.litre' }], required: true },
            ]}
            defaults={{ unit: 'kg' }}
          />
          <CrudPage
            embedded
            title="glue.type"
            url="/chemicals/glue-types"
            writePermission="chemicals.manage"
            paginated={false}
            columns={[{ key: 'name', title: t('glue.type') }]}
            fields={[{ name: 'name', label: 'glue.type', required: true }]}
          />
        </Stack>
      )}
      {making && <MakeGlue onClose={() => setMaking(false)} />}
    </>
  )
}
