import { Button, Card, Grid, Group, Stack, Table, Text, Title } from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconListCheck, IconPencil, IconPlus, IconX } from '@tabler/icons-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '@/api/client'
import type { Batch, BatchStatus } from '@/api/types'
import { BatchStatusBadge, ItemStateBadge, RouteSteps } from '@/components/Badges'
import { CutPlanDiagram } from '@/components/CutPlanDiagram'
import { DataTable } from '@/components/DataTable'
import { PageHeader } from '@/components/PageHeader'
import { Segments } from '@/components/Segments'
import { useAuth } from '@/auth/AuthContext'
import { dateTime, kg, num } from '@/lib/format'
import { useAction, useOne, usePage } from '@/lib/queries'

export function BatchList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { can } = useAuth()
  const [status, setStatus] = useState<string>('active')
  const [page, setPage] = useState(1)
  const statusParam = status === 'active' ? 'draft,ready,in_work' : status === 'all' ? undefined : status
  const query = usePage<Batch>('/production/batches', { page, status__in: statusParam, ordering: '-created_at' })
  return (
    <>
      <PageHeader
        title={t('menu.batches')}
        actions={can('production.plan') && <Button leftSection={<IconPlus size={18} />} onClick={() => navigate('/production/plan')}>{t('plan.create')}</Button>}
      />
      <Segments
        mb="sm"
        value={status}
        onChange={(v) => {
          setStatus(v)
          setPage(1)
        }}
        data={[
          { value: 'active', label: t('batch.active') },
          { value: 'draft', label: t('batch.status.draft') },
          { value: 'done', label: t('batch.status.done') },
          { value: 'all', label: t('all') },
        ]}
      />
      <DataTable
        rows={query.data?.results}
        loading={query.isLoading}
        page={page}
        pages={query.data?.pages}
        total={query.data?.count}
        onPage={setPage}
        onRowClick={(b) => navigate(`/production/batches/${b.id}`)}
        columns={[
          { key: 'number', title: '№', render: (b) => <Text fw={600}>{b.number}</Text> },
          { key: 'status', title: t('status'), render: (b) => <BatchStatusBadge status={b.status} /> },
          { key: 'format', title: t('format'), render: (b) => `${b.format_mm} mm` },
          { key: 'orders', title: t('menu.orders'), render: (b) => b.lines.map((l) => l.order_name).join(', ') },
          { key: 'operator', title: t('operator'), render: (b) => b.operator_name ?? '—', hideOnMobile: true },
          { key: 'created', title: t('created'), render: (b) => dateTime(b.created_at), hideOnMobile: true },
        ]}
      />
    </>
  )
}

export function BatchDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { can } = useAuth()
  const { data: b } = useOne<Batch>(`/production/batches/${id}`)
  const cancel = useAction(() => api.post(`/production/batches/${id}/cancel`), {
    invalidate: ['batches', 'orders'],
    onSuccess: () => navigate('/production/batches'),
  })
  if (!b) return null
  const editable = (['draft', 'ready'] as BatchStatus[]).includes(b.status)
  return (
    <>
      <PageHeader
        title={
          <Group gap="sm">
            {t('batch')} {b.number} <BatchStatusBadge status={b.status} />
          </Group>
        }
        subtitle={`${b.format_mm} mm · ${dateTime(b.created_at)}`}
        actions={
          <>
            {editable && can('inventory.allocate') && (
              <Button leftSection={<IconListCheck size={18} />} onClick={() => navigate(`/inventory/allocate/${b.id}`)}>
                {t('menu.allocate')}
              </Button>
            )}
            {editable && can('production.plan') && (
              <Button variant="default" leftSection={<IconPencil size={18} />} onClick={() => navigate(`/production/plan/${b.id}`)}>
                {t('edit')}
              </Button>
            )}
            {editable && can('production.plan') && (
              <Button
                color="red"
                variant="light"
                leftSection={<IconX size={18} />}
                onClick={() =>
                  modals.openConfirmModal({
                    title: t('batch.cancel_confirm'),
                    labels: { confirm: t('batch.cancel'), cancel: t('cancel') },
                    confirmProps: { color: 'red' },
                    onConfirm: () => cancel.mutate(undefined),
                  })
                }
              >
                {t('batch.cancel')}
              </Button>
            )}
          </>
        }
      />
      <Grid>
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Stack>
            {b.plan?.lines?.length > 0 && (
              <Card withBorder radius="md">
                <CutPlanDiagram plan={b.plan} />
              </Card>
            )}
            <Card withBorder radius="md" p={0}>
              <Title order={5} p="md" pb={0}>
                {t('batch.items')}
              </Title>
              <Table.ScrollContainer minWidth={560}>
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>{t('name')}</Table.Th>
                      <Table.Th>{t('route')}</Table.Th>
                      <Table.Th>{t('status')}</Table.Th>
                      <Table.Th ta="right">{t('qty')}</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {b.items.map((i) => (
                      <Table.Tr key={i.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/production/items/${i.id}`)}>
                        <Table.Td>
                          <Text fw={600} size="sm">
                            {i.name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {i.number} · {i.customer_name ?? t('item.kind.pallet')} · {i.size}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <RouteSteps route={i.route} step={i.step} />
                        </Table.Td>
                        <Table.Td>
                          <ItemStateBadge state={i.state} />
                        </Table.Td>
                        <Table.Td ta="right">
                          {num(i.qty)} / {num(i.planned_qty)}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Card>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Stack>
            <Card withBorder radius="md">
              <Title order={5} mb="xs">
                {t('batch.rolls')}
              </Title>
              {!b.allocations.length && <Text c="dimmed" size="sm">{t('batch.no_rolls')}</Text>}
              {b.allocations.map((a) => (
                <Group key={a.id} justify="space-between" py={4}>
                  <Text size="sm">
                    {t('layer')} {a.layer + 1}: {a.roll_label}
                  </Text>
                  <Text size="sm" fw={600}>
                    {a.consumed !== null ? `${t('batch.used')} ${kg(a.consumed)}` : kg(a.weight)}
                  </Text>
                </Group>
              ))}
            </Card>
            <Card withBorder radius="md">
              <Stack gap={6}>
                <Row label={t('operator')} value={b.operator_name ?? '—'} />
                <Row label={t('batch.started')} value={dateTime(b.started_at)} />
                <Row label={t('batch.finished')} value={dateTime(b.finished_at)} />
                <Row label={t('glue')} value={b.glue_name ? `${b.glue_name} · ${kg(b.glue_amount)}` : '—'} />
                <Row label={t('work.waste_kg')} value={kg(b.waste_kg)} />
                {b.comment && <Row label={t('note')} value={b.comment} />}
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </>
  )
}

export function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="md">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="sm" fw={500} ta="right">
        {value}
      </Text>
    </Group>
  )
}
