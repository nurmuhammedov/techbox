import { Badge, Card, Group, Paper, ScrollArea, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { STAGES, type Stage, type WorkItem } from '@/api/types'
import { Deadline, ItemStateBadge, STAGE_COLORS } from '@/components/Badges'
import { PageHeader } from '@/components/PageHeader'
import { num } from '@/lib/format'

interface Board {
  columns: Record<Stage, WorkItem[]>
  orders: { new: number; planned: number; in_production: number; overdue: number }
  batches: { draft: number; ready: number; in_work: number }
  week: { stage: Stage; qty: number | null; waste: number | null; count: number }[]
  finished_stock: number
}

function Kpi({ label, value, color, to }: { label: string; value: number | string; color?: string; to?: string }) {
  const navigate = useNavigate()
  return (
    <Paper withBorder p="md" radius="md" onClick={() => to && navigate(to)} style={{ cursor: to ? 'pointer' : undefined }}>
      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
        {label}
      </Text>
      <Text fz={28} fw={700} c={color}>
        {value}
      </Text>
    </Paper>
  )
}

export default function Board() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data } = useQuery({ queryKey: ['board'], queryFn: () => api.get<Board>('/production/board') })
  const weekOf = (stage: Stage) => data?.week.find((w) => w.stage === stage)

  return (
    <>
      <PageHeader title={t('menu.board')} subtitle={t('board.subtitle')} />
      <SimpleGrid cols={{ base: 2, sm: 3, lg: 6 }} mb="lg">
        <Kpi label={t('order.status.new')} value={data?.orders.new ?? '—'} color="blue" to="/production/plan" />
        <Kpi label={t('order.status.planned')} value={data?.orders.planned ?? '—'} to="/production/batches" />
        <Kpi label={t('order.status.in_production')} value={data?.orders.in_production ?? '—'} color="orange" />
        <Kpi label={t('board.overdue')} value={data?.orders.overdue ?? '—'} color={data?.orders.overdue ? 'red' : undefined} to="/sales/orders?overdue=1" />
        <Kpi label={t('board.waiting_rolls')} value={data?.batches.draft ?? '—'} color={data?.batches.draft ? 'yellow.8' : undefined} to="/inventory/allocate" />
        <Kpi label={t('menu.finished')} value={data?.finished_stock ?? '—'} color="teal" to="/production/stock" />
      </SimpleGrid>
      <ScrollArea type="auto" offsetScrollbars>
        <Group align="flex-start" wrap="nowrap" gap="md">
          {STAGES.map((stage) => {
            const items = data?.columns[stage] ?? []
            const week = weekOf(stage)
            return (
              <Paper key={stage} withBorder radius="md" p="sm" w={300} miw={280} bg="white">
                <Group justify="space-between" mb="xs">
                  <Group gap={6}>
                    <Badge color={STAGE_COLORS[stage]} variant="filled" size="lg" radius="sm">
                      {t(`stage.${stage}`)}
                    </Badge>
                    <Badge variant="light" circle>
                      {items.length}
                    </Badge>
                  </Group>
                  <Text size="xs" c="dimmed">
                    {t('board.week', { qty: num(week?.qty ?? 0) })}
                  </Text>
                </Group>
                <Stack gap="xs">
                  {items.map((item) => (
                    <Card
                      key={item.id}
                      withBorder
                      padding="xs"
                      radius="sm"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/production/items/${item.id}`)}
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <Text size="sm" fw={600} truncate>
                          {item.name}
                        </Text>
                        <ItemStateBadge state={item.state} />
                      </Group>
                      <Text size="xs" c="dimmed">
                        {item.number} · {item.customer_name ?? t('item.kind.pallet')}
                      </Text>
                      <Group justify="space-between" mt={4}>
                        <Text size="sm" fw={700}>
                          {num(item.qty || item.planned_qty)}
                        </Text>
                        <Deadline value={item.deadline} />
                      </Group>
                      {item.operator_name && (
                        <Text size="xs" c="orange.8">
                          {item.operator_name}
                        </Text>
                      )}
                    </Card>
                  ))}
                  {!items.length && (
                    <Text size="sm" c="dimmed" ta="center" py="md">
                      {t('empty')}
                    </Text>
                  )}
                </Stack>
              </Paper>
            )
          })}
        </Group>
      </ScrollArea>
      <Title order={5} mt="lg" mb="xs" c="dimmed">
        {t('board.week_title')}
      </Title>
      <SimpleGrid cols={{ base: 2, md: 4 }}>
        {STAGES.map((s) => {
          const w = weekOf(s)
          return (
            <Paper key={s} withBorder p="sm" radius="md">
              <Text size="sm" fw={600}>
                {t(`stage.${s}`)}
              </Text>
              <Text size="xs" c="dimmed">
                {t('board.week_line', { qty: num(w?.qty ?? 0), runs: w?.count ?? 0, waste: num(w?.waste ?? 0, 1) })}
              </Text>
            </Paper>
          )
        })}
      </SimpleGrid>
    </>
  )
}
