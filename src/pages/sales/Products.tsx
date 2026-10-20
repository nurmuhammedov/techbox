import { Button, Drawer, FileInput, Group, Stack, Switch, Text, TextInput } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/api/client'
import type { Product, Shape } from '@/api/types'
import { RouteSteps } from '@/components/Badges'
import { CrudPage } from '@/components/CrudPage'
import { RemoteSelect } from '@/components/RemoteSelect'
import { fail, ok } from '@/lib/notify'
import { EMPTY_SHAPE, ShapeFields } from './ShapeFields'

type State = Shape & { customer: number | null; name: string; note: string; is_active: boolean; logo: File | null }

function ProductForm({ product, onDone }: { product: Product | null; onDone: () => void }) {
  const { t } = useTranslation()
  const [v, setV] = useState<State>(
    product
      ? { ...product, logo: null }
      : { ...EMPTY_SHAPE, customer: null, name: '', note: '', is_active: true, logo: null },
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const set = (patch: Partial<State>) => setV((s) => ({ ...s, ...patch }))

  const submit = async () => {
    setBusy(true)
    const { logo, ...rest } = v
    const body = {
      customer: rest.customer, name: rest.name, note: rest.note, is_active: rest.is_active, kind: rest.kind,
      length: rest.length, width: rest.width, height: rest.height, joint: rest.joint, sheet_length: rest.sheet_length,
      sheet_width: rest.sheet_width, layers: rest.layers, route: rest.route, scores: rest.scores,
    }
    let payload: unknown = body
    if (logo) {
      const form = new FormData()
      for (const [k, val] of Object.entries(body)) {
        if (val === null || val === undefined) continue
        if (Array.isArray(val)) val.forEach((x) => form.append(k, String(x)))
        else form.append(k, String(val))
      }
      form.append('logo', logo)
      payload = form
    }
    try {
      if (product) await api.patch(`/catalog/products/${product.id}`, payload)
      else await api.post('/catalog/products', payload)
      ok()
      onDone()
    } catch (e) {
      if (e instanceof ApiError) setErrors(e.fieldErrors())
      fail(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Stack>
      <RemoteSelect label={t('customer')} url="/sales/customers" labelOf={(r) => String(r.company)} value={v.customer} onChange={(id) => set({ customer: id })} />
      <TextInput label={t('name')} value={v.name} onChange={(e) => set({ name: e.currentTarget.value })} error={errors.name} required />
      <ShapeFields value={v} onChange={set} errors={errors} />
      <FileInput label={t('logo')} accept="image/*" value={v.logo} onChange={(f) => set({ logo: f })} clearable />
      <TextInput label={t('note')} value={v.note} onChange={(e) => set({ note: e.currentTarget.value })} />
      <Switch label={t('active')} checked={v.is_active} onChange={(e) => set({ is_active: e.currentTarget.checked })} />
      <Group justify="flex-end">
        <Button loading={busy} onClick={submit}>
          {t('save')}
        </Button>
      </Group>
    </Stack>
  )
}

export default function Products() {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const mobile = useMediaQuery('(max-width: 48em)')
  const [editing, setEditing] = useState<Product | 'new' | null>(null)
  const size = (p: Product) => (p.kind === 'box' ? `${p.length}×${p.width}×${p.height}` : `${p.sheet_width}×${p.sheet_length}`)
  return (
    <>
      <CrudPage<Product>
        title="menu.products"
        url="/catalog/products"
        writePermission="products.manage"
        fields={[]}
        onEdit={setEditing}
        columns={[
          { key: 'name', title: t('name'), render: (p) => <Stack gap={0}><Text fw={600} size="sm">{p.name}</Text><Text size="xs" c="dimmed">{p.customer_name ?? '—'}</Text></Stack> },
          { key: 'kind', title: t('type'), render: (p) => t(`product.kind.${p.kind}`) },
          { key: 'size', title: t('size'), render: size },
          { key: 'layers', title: t('layers'), render: (p) => `${p.layers.length} ${t('plan.ply')}` },
          { key: 'route', title: t('route'), render: (p) => <RouteSteps route={p.route} step={-1} />, hideOnMobile: true },
        ]}
      />
      <Drawer opened={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? t('add') : t('edit')} position={mobile ? 'bottom' : 'right'} size={mobile ? '94%' : 'xl'}>
        {editing !== null && (
          <ProductForm
            product={editing === 'new' ? null : editing}
            onDone={() => {
              setEditing(null)
              void qc.invalidateQueries({ queryKey: ['catalog/products'] })
            }}
          />
        )}
      </Drawer>
    </>
  )
}
