import { Button, Center, Group, Pagination, ScrollArea, Stack, Text, ThemeIcon, UnstyledButton } from '@mantine/core'
import { IconAlertTriangle, IconCircleCheck, IconInfoCircle, IconX } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import type { Notification } from '@/api/types'
import { dateTime } from '@/lib/format'
import { useNotifications } from './useNotifications'

const ICONS = {
  info: { icon: IconInfoCircle, color: 'blue' },
  success: { icon: IconCircleCheck, color: 'teal' },
  warning: { icon: IconAlertTriangle, color: 'yellow' },
  danger: { icon: IconX, color: 'red' },
}

export function NotificationList({ compact }: { compact?: boolean }) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const { data } = useNotifications(page)
  const qc = useQueryClient()
  const navigate = useNavigate()

  const markRead = async (ids?: number[]) => {
    await api.post('/notifications/read', ids ? { ids } : {})
    await qc.invalidateQueries({ queryKey: ['notifications'] })
  }

  const open = async (n: Notification) => {
    if (!n.read_at) await markRead([n.id])
    if (n.link) navigate(n.link)
  }

  const list = (
    <Stack gap={0}>
      {data?.results.map((n) => {
        const meta = ICONS[n.level]
        return (
          <UnstyledButton
            key={n.id}
            onClick={() => open(n)}
            p="sm"
            style={{
              borderBottom: '1px solid var(--mantine-color-gray-2)',
              background: n.read_at ? undefined : 'var(--mantine-color-blue-0)',
            }}
          >
            <Group align="flex-start" wrap="nowrap" gap="sm">
              <ThemeIcon variant="light" color={meta.color} radius="xl">
                <meta.icon size={16} />
              </ThemeIcon>
              <Stack gap={2} style={{ flex: 1 }}>
                <Text size="sm" fw={n.read_at ? 400 : 600}>
                  {n.title}
                </Text>
                {n.body && (
                  <Text size="xs" c="dimmed">
                    {n.body}
                  </Text>
                )}
                <Text size="xs" c="dimmed">
                  {dateTime(n.created_at)}
                </Text>
              </Stack>
            </Group>
          </UnstyledButton>
        )
      })}
      {data && data.results.length === 0 && (
        <Center p="xl">
          <Text c="dimmed" size="sm">
            {t('notifications.empty')}
          </Text>
        </Center>
      )}
    </Stack>
  )

  return (
    <Stack gap={0}>
      <Group justify="space-between" p="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
        <Text fw={600}>{t('notifications')}</Text>
        <Group gap={4}>
          <Button size="compact-xs" variant="subtle" disabled={!data?.unread} onClick={() => markRead()}>
            {t('notifications.read_all')}
          </Button>
          {compact && (
            <Button size="compact-xs" variant="subtle" onClick={() => navigate('/notifications')}>
              {t('all')}
            </Button>
          )}
        </Group>
      </Group>
      {compact ? <ScrollArea.Autosize mah={420}>{list}</ScrollArea.Autosize> : list}
      {!compact && data && data.pages > 1 && (
        <Group justify="center" p="sm">
          <Pagination size="sm" value={page} total={data.pages} onChange={setPage} />
        </Group>
      )}
    </Stack>
  )
}
