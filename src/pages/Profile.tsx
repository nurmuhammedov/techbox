import { Badge, Button, Card, Group, PasswordInput, Select, Stack, Switch, Text, Title } from '@mantine/core'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@/api/client'
import { useAuth } from '@/auth/AuthContext'
import { PageHeader } from '@/components/PageHeader'
import { Lang, LANGUAGES, setLanguage } from '@/i18n'
import { NotificationList } from '@/layout/NotificationList'
import { fail, ok } from '@/lib/notify'
import { disablePush, enablePush, pushStatus } from '@/realtime/push'
import { playChime, setSoundEnabled, soundEnabled } from '@/realtime/sound'

export function Profile() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [oldPassword, setOld] = useState('')
  const [newPassword, setNew] = useState('')
  const [push, setPush] = useState<string>('off')
  const [sound, setSound] = useState(soundEnabled())

  useEffect(() => {
    void pushStatus().then(setPush)
  }, [])

  const changeLang = async (lang: Lang) => {
    await setLanguage(lang)
    await api.patch('/core/me', { language: lang }).catch(() => undefined)
  }

  const changePassword = async () => {
    try {
      await api.post('/core/me/password', { old_password: oldPassword, new_password: newPassword })
      ok(t('profile.password_changed'))
      setOld('')
      setNew('')
    } catch (e) {
      fail(e)
    }
  }

  const togglePush = async (on: boolean) => {
    try {
      if (on) {
        const done = await enablePush()
        if (!done) fail(t('profile.push_denied'))
      } else await disablePush()
    } catch (e) {
      fail(e)
    }
    setPush(await pushStatus())
  }

  return (
    <>
      <PageHeader title={t('profile')} />
      <Stack maw={640}>
        <Card withBorder radius="md">
          <Title order={5}>{user?.display_name}</Title>
          <Text c="dimmed" size="sm">
            {user?.username} · {user?.is_superuser ? t('admin') : user?.role?.name}
          </Text>
        </Card>
        <Card withBorder radius="md">
          <Stack>
            <Select label={t('language')} data={LANGUAGES.map((l) => ({ value: l.value, label: l.label }))} value={i18n.language} onChange={(v) => v && changeLang(v as Lang)} />
            <Group justify="space-between">
              <Stack gap={0}>
                <Text fw={500}>{t('profile.push')}</Text>
                <Text size="xs" c="dimmed">
                  {t('profile.push_hint')}
                </Text>
              </Stack>
              {push === 'unsupported' || push === 'denied' ? (
                <Badge color="gray">{t(`profile.push_${push}`)}</Badge>
              ) : (
                <Switch checked={push === 'on'} onChange={(e) => togglePush(e.currentTarget.checked)} />
              )}
            </Group>
            <Group justify="space-between">
              <Text fw={500}>{t('profile.sound')}</Text>
              <Group gap="xs">
                <Button size="compact-sm" variant="subtle" onClick={() => playChime('info')}>
                  {t('profile.test_sound')}
                </Button>
                <Switch
                  checked={sound}
                  onChange={(e) => {
                    setSound(e.currentTarget.checked)
                    setSoundEnabled(e.currentTarget.checked)
                  }}
                />
              </Group>
            </Group>
          </Stack>
        </Card>
        <Card withBorder radius="md">
          <Stack>
            <Title order={6}>{t('profile.change_password')}</Title>
            <PasswordInput label={t('profile.old_password')} value={oldPassword} onChange={(e) => setOld(e.currentTarget.value)} />
            <PasswordInput label={t('profile.new_password')} value={newPassword} onChange={(e) => setNew(e.currentTarget.value)} />
            <Group justify="flex-end">
              <Button disabled={!oldPassword || newPassword.length < 6} onClick={changePassword}>
                {t('save')}
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </>
  )
}

export function Notifications() {
  const { t } = useTranslation()
  return (
    <>
      <PageHeader title={t('notifications')} />
      <Card withBorder radius="md" p={0} maw={760}>
        <NotificationList />
      </Card>
    </>
  )
}
