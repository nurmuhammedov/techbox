import {
  ActionIcon,
  AppShell,
  Avatar,
  Badge,
  Burger,
  Group,
  Indicator,
  Menu,
  NavLink,
  Popover,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconBell, IconLanguage, IconLogout, IconUser, IconWifi, IconWifiOff } from '@tabler/icons-react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/auth/AuthContext'
import { api } from '@/api/client'
import { Lang, LANGUAGES, setLanguage } from '@/i18n'
import { useRealtime } from '@/realtime/RealtimeProvider'
import { MENU } from './menu'
import { NotificationList } from './NotificationList'
import { useNotifications } from './useNotifications'

export function Shell() {
  const { t } = useTranslation()
  const { user, can, logout } = useAuth()
  const [opened, { toggle, close }] = useDisclosure()
  const location = useLocation()
  const navigate = useNavigate()
  const { connected } = useRealtime()
  const { data } = useNotifications()
  const unread = data?.unread ?? 0

  const groups = MENU.map((g) => ({ ...g, items: g.items.filter((i) => can(...i.perms)) })).filter((g) => g.items.length)

  const changeLang = async (lang: Lang) => {
    await setLanguage(lang)
    await api.patch('/core/me', { language: lang }).catch(() => undefined)
  }

  return (
    <AppShell header={{ height: 60 }} navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <UnstyledButton onClick={() => navigate('/')}>
              <Group gap={8} wrap="nowrap">
                <Avatar color="blue" radius="sm" size={34}>
                  G
                </Avatar>
                <Text fw={700} visibleFrom="xs">
                  Gofra Business
                </Text>
              </Group>
            </UnstyledButton>
          </Group>
          <Group gap={6} wrap="nowrap">
            <Tooltip label={connected ? t('online') : t('offline')}>
              <ActionIcon variant="subtle" color={connected ? 'teal' : 'gray'} visibleFrom="xs">
                {connected ? <IconWifi size={18} /> : <IconWifiOff size={18} />}
              </ActionIcon>
            </Tooltip>
            <Menu position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="subtle" size="lg" aria-label={t('language')}>
                  <IconLanguage size={20} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {LANGUAGES.map((l) => (
                  <Menu.Item key={l.value} onClick={() => changeLang(l.value)}>
                    {l.label}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
            <Popover position="bottom-end" width={360} shadow="md">
              <Popover.Target>
                <Indicator label={unread} size={16} disabled={!unread} offset={4} color="red">
                  <ActionIcon variant="subtle" size="lg" aria-label={t('notifications')}>
                    <IconBell size={20} />
                  </ActionIcon>
                </Indicator>
              </Popover.Target>
              <Popover.Dropdown p={0}>
                <NotificationList compact />
              </Popover.Dropdown>
            </Popover>
            <Menu position="bottom-end">
              <Menu.Target>
                <UnstyledButton>
                  <Group gap={8} wrap="nowrap">
                    <Avatar radius="xl" size={32} color="blue">
                      {user?.display_name?.[0] ?? '?'}
                    </Avatar>
                    <Stack gap={0} visibleFrom="md">
                      <Text size="sm" fw={600} lh={1.2}>
                        {user?.display_name}
                      </Text>
                      <Text size="xs" c="dimmed" lh={1.2}>
                        {user?.is_superuser ? t('admin') : user?.role?.name}
                      </Text>
                    </Stack>
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconUser size={16} />} onClick={() => navigate('/profile')}>
                  {t('profile')}
                </Menu.Item>
                <Menu.Item leftSection={<IconLogout size={16} />} color="red" onClick={logout}>
                  {t('logout')}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar>
        <ScrollArea p="sm">
          {groups.map((g) => (
            <Stack key={g.label} gap={2} mb="sm">
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm" mb={2}>
                {t(g.label)}
              </Text>
              {g.items.map((item) => {
                const active = item.to === '/production' || item.to === '/inventory'
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to)
                return (
                  <NavLink
                    key={item.to}
                    active={active}
                    label={t(item.label)}
                    leftSection={<item.icon size={20} stroke={1.6} />}
                    rightSection={item.to === '/notifications' && unread ? <Badge size="xs">{unread}</Badge> : undefined}
                    onClick={() => {
                      navigate(item.to)
                      close()
                    }}
                    style={{ borderRadius: 8 }}
                  />
                )
              })}
            </Stack>
          ))}
        </ScrollArea>
      </AppShell.Navbar>
      <AppShell.Main bg="var(--mantine-color-gray-0)">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
