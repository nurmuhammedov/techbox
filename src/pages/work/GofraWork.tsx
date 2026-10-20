import { Badge, Button, Card, Divider, Group, Modal, NumberInput, SimpleGrid, Stack, Table, Text, Textarea, Title } from '@mantine/core'
import { IconCheck, IconPlayerPlay } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@/api/client'
import type { Batch } from '@/api/types'
import { BatchStatusBadge, Deadline } from '@/components/Badges'
import { CutPlanDiagram } from '@/components/CutPlanDiagram'
import { PageHeader } from '@/components/PageHeader'
import { RemoteSelect, useRows } from '@/components/RemoteSelect'
import { kg, num } from '@/lib/format'
import { useAction } from '@/lib/queries'
import type { MaterialType } from '@/api/types'

interface Queue {
  waiting: Batch[]
  drafts: Batch[]
  mine: Batch[]
  others: Batch[]
  done_today: Batch[]
}

export function BatchCard({ batch, children }: { batch: Batch; children?: React.ReactNode }) {
  const { t } = useTranslation()
  const materials = useRows<MaterialType>('/catalog/materials')
  const nameOf = (id: number) => materials.find((m) => m.id === id)?.name ?? `#${id}`
  const earliest = batch.items.map((i) => i.deadline).filter(Boolean).sort()[0] ?? null
  return (
    <Card withBorder radius="md" padding="md" style={{ borderLeft: '4px solid var(--mantine-color-orange-6)' }}>
      <Stack gap="sm">
        <Group justify="space-between">
          <Group gap="xs">
            <Title order={4}>{batch.number}</Title>
            <BatchStatusBadge status={batch.status} />
            {batch.priority > 0 && <Badge color="red">{t('batch.priority')}</Badge>}
          </Group>
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              {t('deadline')}:
            </Text>
            <Deadline value={earliest} />
          </Group>
        </Group>
        {batch.plan?.lines?.length ? <CutPlanDiagram plan={batch.plan} /> : <Text size="sm">{t('plan.format')}: {batch.format_mm} mm</Text>}
        <Text size="sm">
          <b>{t('layers')}:</b> {batch.layers.map(nameOf).join(' / ')}
        </Text>
        <Table withRowBorders={false} verticalSpacing={4}>
          <Table.Tbody>
            {batch.items.map((i) => (
              <Table.Tr key={i.id}>
                <Table.Td>
                  <Text size="sm" fw={600}>
                    {i.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {i.number} · {i.customer_name ?? t('item.kind.pallet')} · {i.size}
                  </Text>
                </Table.Td>
                <Table.Td ta="right">
                  <Text fw={700}>{num(i.planned_qty)}</Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        {batch.allocations.length > 0 && (
          <Text size="xs" c="dimmed">
            {t('batch.rolls')}: {batch.allocations.map((a) => `${t('layer')} ${a.layer + 1}: ${a.roll_label} (${kg(a.weight)})`).join(' · ')}
          </Text>
        )}
        {batch.comment && <Text size="sm" c="orange.8">{batch.comment}</Text>}
        {children}
      </Stack>
    </Card>
  )
}

function FinishBatch({ batch, onClose }: { batch: Batch; onClose: () => void }) {
  const { t } = useTranslation()
  const [qty, setQty] = useState<Record<number, number | string>>(Object.fromEntries(batch.items.map((i) => [i.id, i.planned_qty])))
  const rolls = Object.values(
    batch.allocations.reduce<Record<number, { roll: number; label: string; before: number; layers: number[] }>>((acc, a) => {
      acc[a.roll] ??= { roll: a.roll, label: a.roll_label, before: Number(a.weight_before), layers: [] }
      acc[a.roll].layers.push(a.layer + 1)
      return acc
    }, {}),
  )
  const [left, setLeft] = useState<Record<number, number | string>>(Object.fromEntries(rolls.map((r) => [r.roll, ''])))
  const [glue, setGlue] = useState<number | null>(null)
  const [glueAmount, setGlueAmount] = useState<number | string>('')
  const [comment, setComment] = useState('')
  const ready = Object.values(left).every((v) => v !== '') && Object.values(qty).every((v) => v !== '')
  const finish = useAction(
    () =>
      api.post(`/production/batches/${batch.id}/finish`, {
        items: batch.items.map((i) => ({ work_item: i.id, qty: Number(qty[i.id]) })),
        rolls: rolls.map((r) => ({ roll: r.roll, weight_after: Number(left[r.roll]) })),
        glue,
        glue_amount: glueAmount === '' ? null : Number(glueAmount),
        comment,
      }),
    { success: t('work.finished'), invalidate: ['queue', 'batches'], onSuccess: onClose },
  )
  return (
    <Modal opened onClose={onClose} title={`${batch.number} — ${t('work.finish')}`} size="lg" centered>
      <Stack>
        <Title order={6}>{t('work.result')}</Title>
        {batch.items.map((i) => (
          <NumberInput
            key={i.id}
            label={`${i.name} (${i.size})`}
            description={t('work.planned', { n: num(i.planned_qty) })}
            value={qty[i.id]}
            onChange={(v) => setQty((s) => ({ ...s, [i.id]: v }))}
            min={0}
            size="md"
            thousandSeparator=" "
          />
        ))}
        <Divider />
        <Title order={6}>{t('work.rolls_left')}</Title>
        {rolls.map((r) => (
          <NumberInput
            key={r.roll}
            label={`${r.label} — ${t('layer')} ${r.layers.join(', ')}`}
            description={t('work.roll_before', { kg: kg(r.before) })}
            value={left[r.roll]}
            onChange={(v) => setLeft((s) => ({ ...s, [r.roll]: v }))}
            min={0}
            max={r.before}
            decimalScale={2}
            size="md"
            rightSection={<Text size="xs">kg</Text>}
          />
        ))}
        <Divider />
        <Group grow align="flex-end">
          <RemoteSelect
            label={t('glue')}
            url="/chemicals/glue"
            params={{ in_stock: 1 }}
            labelOf={(r) => `${r.type_name} · ${kg(r.remaining as number)}`}
            value={glue}
            onChange={setGlue}
          />
          <NumberInput label={t('glue.amount')} value={glueAmount} onChange={setGlueAmount} min={0} decimalScale={2} disabled={!glue} />
        </Group>
        <Textarea label={t('note')} value={comment} onChange={(e) => setComment(e.currentTarget.value)} />
        <Button size="lg" color="teal" leftSection={<IconCheck />} disabled={!ready} loading={finish.isPending} onClick={() => finish.mutate(undefined)}>
          {t('work.finish')}
        </Button>
      </Stack>
    </Modal>
  )
}

export default function GofraWork() {
  const { t } = useTranslation()
  const [finishing, setFinishing] = useState<Batch | null>(null)
  const { data } = useQuery({ queryKey: ['queue', 'gofra'], queryFn: () => api.get<Queue>('/production/queue/gofra') })
  const start = useAction((id: number) => api.post(`/production/batches/${id}/start`), { success: t('work.started'), invalidate: ['queue'] })

  return (
    <>
      <PageHeader title={t('stage.gofra')} subtitle={t('work.subtitle_gofra')} />
      <Stack gap="xl">
        {!!data?.mine.length && (
          <Stack>
            <Title order={4}>{t('work.mine')}</Title>
            <SimpleGrid cols={{ base: 1, lg: 2 }}>
              {data.mine.map((b) => (
                <BatchCard key={b.id} batch={b}>
                  <Button size="lg" color="teal" leftSection={<IconCheck />} onClick={() => setFinishing(b)}>
                    {t('work.finish')}
                  </Button>
                </BatchCard>
              ))}
            </SimpleGrid>
          </Stack>
        )}
        <Stack>
          <Title order={4}>
            {t('work.waiting')} <Badge circle>{data?.waiting.length ?? 0}</Badge>
          </Title>
          <SimpleGrid cols={{ base: 1, lg: 2 }}>
            {data?.waiting.map((b) => (
              <BatchCard key={b.id} batch={b}>
                <Button size="lg" leftSection={<IconPlayerPlay />} loading={start.isPending && start.variables === b.id} onClick={() => start.mutate(b.id)}>
                  {t('work.start')}
                </Button>
              </BatchCard>
            ))}
          </SimpleGrid>
          {data && !data.waiting.length && <Text c="dimmed">{t('work.queue_empty')}</Text>}
        </Stack>
        {!!data?.others.length && (
          <Stack>
            <Title order={5} c="dimmed">
              {t('work.others')}
            </Title>
            <SimpleGrid cols={{ base: 1, lg: 2 }}>
              {data.others.map((b) => (
                <BatchCard key={b.id} batch={b}>
                  <Text size="sm" c="dimmed">
                    {t('work.by', { name: b.operator_name })}
                  </Text>
                </BatchCard>
              ))}
            </SimpleGrid>
          </Stack>
        )}
        {!!data?.drafts.length && (
          <Stack>
            <Title order={5} c="dimmed">
              {t('work.drafts')}
            </Title>
            <SimpleGrid cols={{ base: 1, lg: 2 }}>
              {data.drafts.map((b) => (
                <BatchCard key={b.id} batch={b} />
              ))}
            </SimpleGrid>
          </Stack>
        )}
        {!!data?.done_today.length && (
          <Stack>
            <Title order={5} c="dimmed">
              {t('work.done_today')}
            </Title>
            <SimpleGrid cols={{ base: 1, lg: 2 }}>
              {data.done_today.map((b) => (
                <BatchCard key={b.id} batch={b} />
              ))}
            </SimpleGrid>
          </Stack>
        )}
      </Stack>
      {finishing && <FinishBatch batch={finishing} onClose={() => setFinishing(null)} />}
    </>
  )
}
