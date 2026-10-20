import { ActionIcon, Alert, Badge, Button, Card, Group, NumberInput, Select, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { IconCheck, IconPlus, IconTrash } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '@/api/client'
import type { Batch, MaterialType, Roll } from '@/api/types'
import { BatchStatusBadge, Deadline } from '@/components/Badges'
import { PageHeader } from '@/components/PageHeader'
import { useRows } from '@/components/RemoteSelect'
import { kg } from '@/lib/format'
import { useAction, useOne, usePage } from '@/lib/queries'

export function AllocateList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const query = usePage<Batch>('/production/batches', { status__in: 'draft,ready', page_size: 100, ordering: '-priority' })
  return (
    <>
      <PageHeader title={t('menu.allocate')} subtitle={t('allocate.subtitle')} />
      <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>
        {query.data?.results.map((b) => (
          <Card key={b.id} withBorder radius="md" style={{ cursor: 'pointer' }} onClick={() => navigate(`/inventory/allocate/${b.id}`)}>
            <Group justify="space-between">
              <Title order={5}>{b.number}</Title>
              <BatchStatusBadge status={b.status} />
            </Group>
            <Text size="sm">
              {t('format')}: {b.format_mm} mm · {b.layers.length} {t('plan.ply')}
            </Text>
            <Text size="sm" c="dimmed" lineClamp={2}>
              {b.lines.map((l) => l.order_name).join(', ')}
            </Text>
            <Group justify="space-between" mt="xs">
              <Deadline value={b.items.map((i) => i.deadline).filter(Boolean).sort()[0] ?? null} />
              <Text size="sm" fw={600}>
                {kg(b.plan?.materials?.reduce((s, m) => s + m.kg, 0) ?? 0)}
              </Text>
            </Group>
          </Card>
        ))}
      </SimpleGrid>
      {query.data && !query.data.results.length && <Text c="dimmed">{t('allocate.none')}</Text>}
    </>
  )
}

interface Pick {
  roll: number | null
  weight: number | string
}

export function AllocateBatch() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: batch } = useOne<Batch>(`/production/batches/${id}`)
  const materials = useRows<MaterialType>('/catalog/materials')
  const rolls = useRows<Roll>('/inventory/rolls', batch ? { format: batch.format, status: 'in_stock' } : { format: -1 })
  const [picks, setPicks] = useState<Record<number, Pick[]>>({})

  useEffect(() => {
    if (!batch) return
    const initial: Record<number, Pick[]> = {}
    batch.layers.forEach((_m, layer) => {
      const existing = batch.allocations.filter((a) => a.layer === layer)
      const need = batch.plan?.materials?.find((m) => m.layer === layer)?.kg ?? ''
      initial[layer] = existing.length ? existing.map((a) => ({ roll: a.roll, weight: a.weight })) : [{ roll: null, weight: need }]
    })
    setPicks(initial)
  }, [batch])

  const save = useAction(
    () =>
      api.post(`/production/batches/${id}/allocate`, {
        allocations: Object.entries(picks).flatMap(([layer, list]) =>
          list.filter((p) => p.roll && p.weight !== '').map((p) => ({ layer: Number(layer), roll: p.roll, weight: Number(p.weight) })),
        ),
      }),
    { success: t('allocate.saved'), invalidate: ['batches', 'rolls', 'stock'], onSuccess: () => navigate('/inventory/allocate') },
  )

  if (!batch) return null
  const editable = batch.status === 'draft' || batch.status === 'ready'
  const update = (layer: number, i: number, patch: Partial<Pick>) =>
    setPicks((s) => ({ ...s, [layer]: s[layer].map((p, j) => (j === i ? { ...p, ...patch } : p)) }))
  const ownReserved = (rollId: number) => batch.allocations.filter((a) => a.roll === rollId).reduce((s, a) => s + Number(a.weight), 0)

  return (
    <>
      <PageHeader
        title={
          <Group gap="sm">
            {t('menu.allocate')}: {batch.number} <BatchStatusBadge status={batch.status} />
          </Group>
        }
        subtitle={`${t('format')} ${batch.format_mm} mm · ${batch.lines.map((l) => l.order_name).join(', ')}`}
      />
      {!editable && <Alert color="yellow" mb="md">{t('allocate.locked')}</Alert>}
      <Stack>
        {batch.layers.map((materialId, layer) => {
          const material = materials.find((m) => m.id === materialId)
          const need = batch.plan?.materials?.find((m) => m.layer === layer)?.kg
          const options = rolls.filter((r) => r.material === materialId)
          const chosen = (picks[layer] ?? []).reduce((s, p) => s + (Number(p.weight) || 0), 0)
          return (
            <Card key={layer} withBorder radius="md">
              <Group justify="space-between" mb="xs">
                <Group gap="xs">
                  <Title order={5}>
                    {t('layer')} {layer + 1}: {material?.name ?? `#${materialId}`}
                  </Title>
                  {layer % 2 === 1 && <Badge variant="light">{t('plan.flute')}</Badge>}
                </Group>
                <Text size="sm" c={need && chosen < need ? 'orange' : 'teal'}>
                  {t('allocate.need', { need: kg(need ?? 0), chosen: kg(chosen) })}
                </Text>
              </Group>
              {!options.length && <Alert color="red">{t('allocate.no_rolls')}</Alert>}
              <Stack gap="xs">
                {(picks[layer] ?? []).map((p, i) => (
                  <Group key={i} align="flex-end" wrap="nowrap">
                    <Select
                      style={{ flex: 1 }}
                      label={i === 0 ? t('roll') : undefined}
                      data={options.map((r) => ({
                        value: String(r.id),
                        label: `${r.code || '#' + r.id} · ${kg(Number(r.available_weight) + ownReserved(r.id))}${r.supplier_name ? ' · ' + r.supplier_name : ''}`,
                      }))}
                      value={p.roll ? String(p.roll) : null}
                      onChange={(v) => update(layer, i, { roll: v ? Number(v) : null })}
                      searchable
                      disabled={!editable}
                    />
                    <NumberInput w={140} label={i === 0 ? t('weight') : undefined} value={p.weight} onChange={(v) => update(layer, i, { weight: v })} min={0} decimalScale={2} rightSection={<Text size="xs">kg</Text>} disabled={!editable} />
                    {(picks[layer]?.length ?? 0) > 1 && (
                      <ActionIcon variant="subtle" color="red" mb={6} onClick={() => setPicks((s) => ({ ...s, [layer]: s[layer].filter((_x, j) => j !== i) }))}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    )}
                  </Group>
                ))}
                {editable && (
                  <Button variant="subtle" size="xs" leftSection={<IconPlus size={14} />} w="fit-content" onClick={() => setPicks((s) => ({ ...s, [layer]: [...(s[layer] ?? []), { roll: null, weight: '' }] }))}>
                    {t('allocate.add_roll')}
                  </Button>
                )}
              </Stack>
            </Card>
          )
        })}
        {editable && (
          <Group justify="flex-end">
            <Button size="md" leftSection={<IconCheck />} loading={save.isPending} onClick={() => save.mutate(undefined)}>
              {t('allocate.confirm')}
            </Button>
          </Group>
        )}
      </Stack>
    </>
  )
}
