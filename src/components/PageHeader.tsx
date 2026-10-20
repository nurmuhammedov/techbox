import { Group, Stack, Text, Title } from '@mantine/core'
import { ReactNode } from 'react'

export function PageHeader({ title, subtitle, actions }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <Group justify="space-between" align="flex-end" mb="md" gap="sm" wrap="wrap">
      <Stack gap={2}>
        <Title order={2} fz={{ base: 22, sm: 26 }}>
          {title}
        </Title>
        {subtitle && (
          <Text c="dimmed" size="sm">
            {subtitle}
          </Text>
        )}
      </Stack>
      {actions && <Group gap="xs">{actions}</Group>}
    </Group>
  )
}
