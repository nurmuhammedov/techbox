import { Alert, Avatar, Button, Center, Group, Paper, PasswordInput, SegmentedControl, Stack, Text, TextInput, Title } from '@mantine/core'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { Lang, LANGUAGES, setLanguage } from '@/i18n'

export default function Login() {
  const { t, i18n } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(username.trim(), password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Center mih="100vh" bg="var(--mantine-color-gray-0)" p="md">
      <Paper withBorder shadow="sm" p="xl" radius="md" w="100%" maw={400}>
        <form onSubmit={submit}>
          <Stack>
            <Group gap="sm">
              <Avatar color="blue" radius="sm" size={44}>
                G
              </Avatar>
              <Stack gap={0}>
                <Title order={3}>Gofra Business</Title>
                <Text size="sm" c="dimmed">
                  {t('login.subtitle')}
                </Text>
              </Stack>
            </Group>
            {error && <Alert color="red">{error}</Alert>}
            <TextInput label={t('login.username')} value={username} onChange={(e) => setUsername(e.currentTarget.value)} autoFocus required autoComplete="username" />
            <PasswordInput label={t('login.password')} value={password} onChange={(e) => setPassword(e.currentTarget.value)} required autoComplete="current-password" />
            <Button type="submit" loading={busy} size="md">
              {t('login.submit')}
            </Button>
            <SegmentedControl
              size="xs"
              value={i18n.language}
              onChange={(v) => setLanguage(v as Lang)}
              data={LANGUAGES.map((l) => ({ value: l.value, label: l.label }))}
            />
          </Stack>
        </form>
      </Paper>
    </Center>
  )
}
