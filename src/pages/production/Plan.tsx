import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Grid,
  Group,
  MultiSelect,
  NumberInput,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useDebouncedValue } from '@mantine/hooks'
import { IconAlertTriangle, IconDeviceFloppy, IconTrash } from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api, ApiError } from '@/api/client'
import type { Batch, Format, MaterialType, Order, Plan as PlanT, Stage } from '@/api/types'
import { Deadline } from '@/components/Badges'
import { CutPlanDiagram } from '@/components/CutPlanDiagram'
import { PageHeader } from '@/components/PageHeader'
import { useRows } from '@/components/RemoteSelect'
import { isoDate, kg, num } from '@/lib/format'
import { fail, ok } from '@/lib/notify'
import { useOne, usePage } from '@/lib/queries'
import { useQueryClient } from '@tanstack/react-query'

interface Line {
  order: number
  quantity: number
  ups: number
  parts: number
  orientation: 'horizontal' | 'vertical'
}

const STAGE_OPTIONS: Stage[] = ['fleksa', 'tikish', 'yelimlash']

export default function Plan() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [params] = useSearchParams()
  const editing = useOne<Batch>(id ? `/production/batches/${id}` : null)
  const formats = useRows<Format>('/catalog/formats')
  const materials = useRows<MaterialType>('/catalog/materials')
  const [search, setSearch] = useState('')
  const [debounced] = useDebouncedValue(search, 300)
  const orders = usePage<Order>('/sales/orders', { status__in: 'new', page_size: 100, search: debounced || undefined, ordering: 'deadline' })
  const [picked, setPicked] = useState<Record<number, Order>>({})
  const [lines, setLines] = useState<Line[]>([])
  const [format, setFormat] = useState<number | null>(null)
  const [layers, setLayers] = useState<number[]>([])
  const [usePallet, setUsePallet] = useState(false)
  const [pallet, setPallet] = useState<{ length: number | string; route: Stage[]; deadline: Date | null }>({ length: 1000, route: [], deadline: null })
  const [comment, setComment] = useState('')
  const [priority, setPriority] = useState(false)
  const [plan, setPlan] = useState<PlanT | null>(null)
  const [planError, setPlanError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const b = editing.data
    if (!b) return
    setFormat(b.format)
    setLayers(b.layers)
    setLines(b.lines.map((l) => ({ order: l.order, quantity: l.quantity, ups: l.ups, parts: l.parts, orientation: l.orientation })))
    setPicked(Object.fromEntries(b.lines.map((l) => [l.order, { id: l.order, name: l.order_name, number: l.order_number, customer_name: l.customer_name } as Order])))
    const p = b.items.find((i) => i.kind === 'pallet')
    if (p) {
      setUsePallet(true)
      setPallet({ length: p.length ?? 1000, route: p.route.filter((s) => s !== 'gofra'), deadline: p.deadline ? new Date(p.deadline) : null })
    }
    setComment(b.comment)
    setPriority(b.priority > 0)
  }, [editing.data])

  useEffect(() => {
    const pre = Number(params.get('order'))
    const o = orders.data?.results.find((r) => r.id === pre)
    if (o && !lines.length) toggle(o)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders.data])

  const toggle = (o: Order) => {
    if (picked[o.id]) {
      const { [o.id]: _removed, ...rest } = picked
      setPicked(rest)
      setLines((ls) => ls.filter((l) => l.order !== o.id))
      return
    }
    setPicked((p) => ({ ...p, [o.id]: o }))
    setLines((ls) => [...ls, { order: o.id, quantity: o.quantity, ups: 1, parts: 1, orientation: 'horizontal' }])
    if (!layers.length) setLayers(o.layers)
  }

  const payload = useMemo(
    () =>
      format && layers.length >= 2 && lines.length
        ? {
            format,
            layers,
            lines,
            pallet: usePallet ? { length: Number(pallet.length), route: pallet.route, deadline: isoDate(pallet.deadline) } : null,
            comment,
            priority: priority ? 1 : 0,
          }
        : null,
    [format, layers, lines, usePallet, pallet, comment, priority],
  )
  const [debouncedPayload] = useDebouncedValue(payload, 400)

  useEffect(() => {
    if (!debouncedPayload) {
      setPlan(null)
      setPlanError('')
      return
    }
    api
      .post<PlanT>('/production/batches/preview', { ...debouncedPayload, batch: id ? Number(id) : undefined })
      .then((p) => {
        setPlan(p)
        setPlanError('')
      })
      .catch((e) => {
        setPlan(null)
        setPlanError(e instanceof ApiError ? e.message : String(e))
      })
  }, [debouncedPayload])

  const bestFormat = async () => {
    if (!lines.length || layers.length < 2) return
    try {
      const r = await api.post<{ format: number; stock_ok: boolean }>('/production/batches/fit', { layers, lines })
      setFormat(r.format)
      if (!r.stock_ok) fail(t('plan.no_stock_format'))
    } catch (e) {
      fail(e)
    }
  }

  const save = async () => {
    if (!payload) return
    setSaving(true)
    try {
      const b = id ? await api.put<Batch>(`/production/batches/${id}`, payload) : await api.post<Batch>('/production/batches', payload)
      ok(t('plan.saved', { n: b.number }))
      await qc.invalidateQueries({ queryKey: ['orders'] })
      navigate(`/production/batches/${b.id}`)
    } catch (e) {
      fail(e)
    } finally {
      setSaving(false)
    }
  }

  const setLine = (orderId: number, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.order === orderId ? { ...l, ...patch } : l)))
  const materialName = (mid: number) => materials.find((m) => m.id === mid)?.name ?? `#${mid}`
  const available = [
    ...Object.values(picked).filter((p) => !orders.data?.results.some((o) => o.id === p.id)),
    ...(orders.data?.results ?? []),
  ]

  return (
    <>
      <PageHeader title={id ? t('plan.edit', { n: editing.data?.number ?? '' }) : t('menu.plan')} subtitle={t('plan.subtitle')} />
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Card withBorder radius="md">
            <Group justify="space-between" mb="sm">
              <Title order={5}>{t('plan.new_orders')}</Title>
              <TextInput size="xs" placeholder={t('search')} value={search} onChange={(e) => setSearch(e.currentTarget.value)} />
            </Group>
            <Stack gap={6}>
              {available.map((o) => (
                <Card key={o.id} withBorder padding="xs" radius="sm" bg={picked[o.id] ? 'blue.0' : undefined} style={{ cursor: 'pointer' }} onClick={() => toggle(o)}>
                  <Group wrap="nowrap" align="flex-start">
                    <Checkbox checked={!!picked[o.id]} readOnly mt={4} />
                    <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
                      <Group justify="space-between" wrap="nowrap">
                        <Text fw={600} size="sm" truncate>
                          {o.name}
                        </Text>
                        <Text fw={700} size="sm">
                          {num(o.quantity)}
                        </Text>
                      </Group>
                      <Text size="xs" c="dimmed">
                        {o.number} · {o.customer_name}
                        {o.kind === 'box' && o.length ? ` · ${o.length}×${o.width}×${o.height}` : ''}
                        {o.kind === 'sheet' && o.sheet_length ? ` · ${o.sheet_width}×${o.sheet_length}` : ''}
                      </Text>
                      <Group gap={6}>
                        {o.layers?.length > 0 && <Badge size="xs" variant="light">{o.layers.length} {t('plan.ply')}</Badge>}
                        {o.deadline && <Deadline value={o.deadline} />}
                      </Group>
                    </Stack>
                  </Group>
                </Card>
              ))}
              {!available.length && <Text c="dimmed" size="sm">{t('plan.no_new_orders')}</Text>}
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Stack>
            <Card withBorder radius="md">
              <Grid>
                <Grid.Col span={{ base: 12, sm: 5 }}>
                  <Group gap="xs" align="flex-end" wrap="nowrap">
                    <Select
                      label={t('format')}
                      data={formats.map((f) => ({ value: String(f.id), label: `${f.width_mm} mm` }))}
                      value={format ? String(format) : null}
                      onChange={(v) => setFormat(v ? Number(v) : null)}
                      searchable
                      style={{ flex: 1 }}
                    />
                    <Button variant="light" onClick={bestFormat} disabled={!lines.length}>
                      {t('plan.auto')}
                    </Button>
                  </Group>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 7 }}>
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>
                      {t('layers')}
                    </Text>
                    <SegmentedControl
                      size="xs"
                      value={String(layers.length || 3)}
                      onChange={(v) => {
                        const n = Number(v)
                        setLayers((ls) => {
                          const out = [...ls]
                          while (out.length < n) out.push(out[out.length - 2] ?? materials[0]?.id ?? 0)
                          return out.slice(0, n)
                        })
                      }}
                      data={['2', '3', '5', '7'].map((x) => ({ value: x, label: x }))}
                    />
                  </Group>
                  <Text size="xs" c="dimmed">
                    {t('plan.layers_hint')}
                  </Text>
                </Grid.Col>
                {layers.map((l, i) => (
                  <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4 }}>
                    <Select
                      size="xs"
                      label={`${i + 1}. ${i % 2 ? t('plan.flute') : t('plan.liner')}`}
                      data={materials.map((m) => ({ value: String(m.id), label: `${m.name} · ${m.gsm}` }))}
                      value={l ? String(l) : null}
                      onChange={(v) => setLayers((ls) => ls.map((x, j) => (j === i ? Number(v) || 0 : x)))}
                      searchable
                    />
                  </Grid.Col>
                ))}
              </Grid>
            </Card>

            <Card withBorder radius="md">
              <Title order={5} mb="sm">
                {t('plan.lines')}
              </Title>
              {!lines.length && <Text c="dimmed" size="sm">{t('plan.pick_orders')}</Text>}
              <Stack gap="sm">
                {lines.map((l) => {
                  const o = picked[l.order]
                  const lp = plan?.lines.find((x) => x.order_id === l.order)
                  return (
                    <Card key={l.order} withBorder padding="sm" radius="sm">
                      <Group justify="space-between" mb={6} wrap="nowrap">
                        <Text fw={600} truncate>
                          {o?.name} <Text span c="dimmed" size="sm">{o?.number}</Text>
                        </Text>
                        <ActionIcon variant="subtle" color="red" onClick={() => o && toggle(o)}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                      <Grid gutter="xs" align="flex-end">
                        <Grid.Col span={{ base: 6, sm: 3 }}>
                          <NumberInput size="xs" label={t('qty')} value={l.quantity} min={1} thousandSeparator=" " onChange={(v) => setLine(l.order, { quantity: Number(v) || 1 })} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6, sm: 2 }}>
                          <NumberInput size="xs" label={t('plan.ups')} value={l.ups} min={1} max={20} onChange={(v) => setLine(l.order, { ups: Number(v) || 1 })} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6, sm: 3 }}>
                          <Select
                            size="xs"
                            label={t('plan.parts')}
                            data={[1, 2, 3, 4].map((n) => ({ value: String(n), label: n === 1 ? t('plan.whole') : `1/${n}` }))}
                            value={String(l.parts)}
                            onChange={(v) => setLine(l.order, { parts: Number(v) || 1 })}
                          />
                        </Grid.Col>
                        <Grid.Col span={{ base: 6, sm: 4 }}>
                          <SegmentedControl
                            size="xs"
                            fullWidth
                            value={l.orientation}
                            onChange={(v) => setLine(l.order, { orientation: v as Line['orientation'] })}
                            data={[
                              { value: 'horizontal', label: t('plan.horizontal') },
                              { value: 'vertical', label: t('plan.vertical') },
                            ]}
                          />
                        </Grid.Col>
                      </Grid>
                      {lp && (
                        <Text size="xs" c="dimmed" mt={6}>
                          {t('plan.line_info', { across: lp.blank_across, along: lp.blank_along, lane: lp.lane_width, sheets: num(lp.sheets), run: num(lp.run_m, 1) })}
                        </Text>
                      )}
                    </Card>
                  )
                })}
              </Stack>
            </Card>

            <Card withBorder radius="md">
              <Switch label={t('plan.make_pallet')} checked={usePallet} onChange={(e) => setUsePallet(e.currentTarget.checked)} mb={usePallet ? 'sm' : 0} />
              {usePallet && (
                <Grid gutter="xs">
                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <NumberInput label={t('plan.pallet_length')} value={pallet.length} min={50} onChange={(v) => setPallet((p) => ({ ...p, length: v }))} rightSection={<Text size="xs">mm</Text>} />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 5 }}>
                    <MultiSelect
                      label={t('route')}
                      data={STAGE_OPTIONS.map((s) => ({ value: s, label: t(`stage.${s}`) }))}
                      value={pallet.route}
                      onChange={(v) => setPallet((p) => ({ ...p, route: v as Stage[] }))}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 3 }}>
                    <DateInput label={t('deadline')} value={pallet.deadline} onChange={(d) => setPallet((p) => ({ ...p, deadline: d }))} clearable valueFormat="DD.MM.YYYY" />
                  </Grid.Col>
                </Grid>
              )}
            </Card>

            <Card withBorder radius="md">
              <Title order={5} mb="sm">
                {t('plan.result')}
              </Title>
              {planError && (
                <Alert color="red" icon={<IconAlertTriangle />} mb="sm">
                  {planError}
                </Alert>
              )}
              {plan ? (
                <Stack>
                  <CutPlanDiagram plan={plan} />
                  {plan.warnings.map((w) => (
                    <Alert key={w} color="yellow" icon={<IconAlertTriangle />}>
                      {w}
                    </Alert>
                  ))}
                  {usePallet && !plan.pallet && <Alert color="yellow">{t('plan.no_pallet', { mm: plan.offcut_mm })}</Alert>}
                  {plan.pallet && (
                    <Text size="sm">
                      {t('plan.pallet_info', { w: plan.pallet.width, l: plan.pallet.length, n: num(plan.pallet.count) })}
                    </Text>
                  )}
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>{t('layer')}</Table.Th>
                        <Table.Th>{t('material')}</Table.Th>
                        <Table.Th ta="right">{t('plan.need')}</Table.Th>
                        <Table.Th ta="right">{t('plan.in_stock')}</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {plan.materials.map((m) => (
                        <Table.Tr key={m.layer}>
                          <Table.Td>
                            {m.layer + 1} {m.fluted && <Badge size="xs" variant="light">{t('plan.flute')}</Badge>}
                          </Table.Td>
                          <Table.Td>{materialName(m.material_id)}</Table.Td>
                          <Table.Td ta="right">{kg(m.kg)}</Table.Td>
                          <Table.Td ta="right">
                            <Text size="sm" c={m.enough === false ? 'red' : 'teal'} fw={600}>
                              {kg(m.available ?? 0)}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                  <Text size="sm" c="dimmed">
                    {t('plan.glue_area', { m2: num(plan.glue_m2, 1) })}
                  </Text>
                </Stack>
              ) : (
                !planError && <Text c="dimmed" size="sm">{t('plan.fill_hint')}</Text>
              )}
            </Card>

            <Card withBorder radius="md">
              <Stack>
                <Textarea label={t('note')} value={comment} onChange={(e) => setComment(e.currentTarget.value)} />
                <Group justify="space-between">
                  <Switch label={t('batch.priority')} checked={priority} onChange={(e) => setPriority(e.currentTarget.checked)} />
                  <Button size="md" leftSection={<IconDeviceFloppy />} disabled={!plan} loading={saving} onClick={save}>
                    {id ? t('save') : t('plan.create')}
                  </Button>
                </Group>
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </>
  )
}
