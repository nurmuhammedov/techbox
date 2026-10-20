import {
  Badge,
  Button,
  Card,
  Group,
  Image,
  Modal,
  NumberInput,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core'
import { IconArrowBackUp, IconCheck, IconPlayerPlay } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { api } from '@/api/client'
import type { Batch, Stage, WorkItem } from '@/api/types'
import { Deadline, RouteSteps, STAGE_COLORS } from '@/components/Badges'
import { PageHeader } from '@/components/PageHeader'
import { useAction } from '@/lib/queries'
import { num } from '@/lib/format'
import GofraWork from './GofraWork'

interface Queue {
  waiting: WorkItem[]
  mine: WorkItem[]
  others: WorkItem[]
  done_today: WorkItem[]
}

export function ItemCard({ item, children }: { item: WorkItem; children?: React.ReactNode }) {
  const { t } = useTranslation()
  return (
    <Card withBorder radius="md" padding="md" style={{ borderLeft: `4px solid var(--mantine-color-${item.stage ? STAGE_COLORS[item.stage] : 'teal'}-6)` }}>
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <Stack gap={0} style={{ minWidth: 0 }}>
            <Text fw={700} size="lg" truncate>
              {item.name}
            </Text>
            <Text size="sm" c="dimmed">
              {item.number} · {item.customer_name ?? t('item.kind.pallet')} · {item.size}
            </Text>
          </Stack>
          {item.logo && <Image src={item.logo} h={44} w={44} fit="contain" radius="sm" />}
        </Group>
        <Group gap="lg">
          <Stack gap={0}>
            <Text size="xs" c="dimmed">
              {t('qty')}
            </Text>
            <Text fw={700} size="xl">
              {num(item.qty || item.planned_qty)}
            </Text>
          </Stack>
          <Stack gap={0}>
            <Text size="xs" c="dimmed">
              {t('format')}
            </Text>
            <Text fw={600}>{item.format_mm} mm</Text>
          </Stack>
          <Stack gap={0}>
            <Text size="xs" c="dimmed">
              {t('deadline')}
            </Text>
            <Deadline value={item.deadline} />
          </Stack>
        </Group>
        <RouteSteps route={item.route} step={item.step} />
        {item.note && (
          <Text size="sm" c="orange.8">
            {item.note}
          </Text>
        )}
        {children}
      </Stack>
    </Card>
  )
}

function FinishModal({ item, onClose }: { item: WorkItem; onClose: () => void }) {
  const { t } = useTranslation()
  const [qty, setQty] = useState<number | string>(item.qty)
  const [waste, setWaste] = useState<number | string>('')
  const [note, setNote] = useState('')
  const finish = useAction(
    () => api.post(`/production/items/${item.id}/finish`, { qty: Number(qty), waste_kg: waste === '' ? null : Number(waste), note }),
    { success: item.next_stage ? t('work.finished') : t('work.to_store'), invalidate: ['queue'], onSuccess: onClose },
  )
  return (
    <Modal opened onClose={onClose} title={item.name} centered>
      <Stack>
        <NumberInput
          label={t('work.good_qty')}
          description={t('work.max_qty', { n: item.qty })}
          value={qty}
          onChange={setQty}
          max={item.qty}
          min={0}
          size="lg"
          thousandSeparator=" "
          data-autofocus
        />
        <NumberInput label={t('work.waste_kg')} value={waste} onChange={setWaste} min={0} decimalScale={2} size="lg" />
        <Textarea label={t('note')} value={note} onChange={(e) => setNote(e.currentTarget.value)} />
        <Button size="lg" leftSection={<IconCheck />} loading={finish.isPending} onClick={() => finish.mutate(undefined)} disabled={qty === '' || Number(qty) > item.qty}>
          {t('work.finish')}
        </Button>
      </Stack>
    </Modal>
  )
}

function ItemStageWork({ stage }: { stage: Stage }) {
  const { t } = useTranslation()
  const [finishing, setFinishing] = useState<WorkItem | null>(null)
  const { data } = useQuery({ queryKey: ['queue', stage], queryFn: () => api.get<Queue>(`/production/queue/${stage}`) })
  const take = useAction((id: number) => api.post(`/production/items/${id}/take`), { success: t('work.taken'), invalidate: ['queue'] })
  const release = useAction((id: number) => api.post(`/production/items/${id}/release`), { success: t('work.released'), invalidate: ['queue'] })

  return (
    <>
      <PageHeader title={t(`stage.${stage}`)} subtitle={t('work.subtitle')} />
      <Stack gap="xl">
        {!!data?.mine.length && (
          <Stack>
            <Title order={4}>{t('work.mine')}</Title>
            <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>
              {data.mine.map((item) => (
                <ItemCard key={item.id} item={item}>
                  <Group grow>
                    <Button size="md" color="teal" leftSection={<IconCheck />} onClick={() => setFinishing(item)}>
                      {t('work.finish')}
                    </Button>
                    <Button size="md" variant="default" leftSection={<IconArrowBackUp />} loading={release.isPending} onClick={() => release.mutate(item.id)}>
                      {t('work.release')}
                    </Button>
                  </Group>
                </ItemCard>
              ))}
            </SimpleGrid>
          </Stack>
        )}
        <Stack>
          <Title order={4}>
            {t('work.waiting')} <Badge circle>{data?.waiting.length ?? 0}</Badge>
          </Title>
          <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>
            {data?.waiting.map((item) => (
              <ItemCard key={item.id} item={item}>
                <Button size="md" leftSection={<IconPlayerPlay />} loading={take.isPending && take.variables === item.id} onClick={() => take.mutate(item.id)}>
                  {t('work.take')}
                </Button>
              </ItemCard>
            ))}
          </SimpleGrid>
          {data && !data.waiting.length && <Text c="dimmed">{t('work.queue_empty')}</Text>}
        </Stack>
        {!!data?.others.length && (
          <Stack>
            <Title order={5} c="dimmed">
              {t('work.others')}
            </Title>
            <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>
              {data.others.map((item) => (
                <ItemCard key={item.id} item={item}>
                  <Text size="sm" c="dimmed">
                    {t('work.by', { name: item.operator_name })}
                  </Text>
                </ItemCard>
              ))}
            </SimpleGrid>
          </Stack>
        )}
        {!!data?.done_today.length && (
          <Stack>
            <Title order={5} c="dimmed">
              {t('work.done_today')}
            </Title>
            <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>
              {data.done_today.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </SimpleGrid>
          </Stack>
        )}
      </Stack>
      {finishing && <FinishModal item={finishing} onClose={() => setFinishing(null)} />}
    </>
  )
}

export default function StageWork() {
  const { stage } = useParams<{ stage: Stage }>()
  if (stage === 'gofra') return <GofraWork />
  return <ItemStageWork key={stage} stage={stage!} />
}

export type { Batch }
