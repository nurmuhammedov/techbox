import { Box, Group, Stack, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import type { Plan } from '@/api/types'
import { num } from '@/lib/format'

const PALETTE = ['#4dabf7', '#9775fa', '#ff922b', '#51cf66', '#f06595', '#22b8cf', '#fcc419']

export function CutPlanDiagram({ plan }: { plan: Plan }) {
  const { t } = useTranslation()
  const width = plan.format_mm
  const segments: { label: string; sub: string; mm: number; color: string; striped?: boolean }[] = []
  plan.lines.forEach((line, i) => {
    for (let u = 0; u < line.ups; u++) {
      segments.push({
        label: line.name,
        sub: `${line.blank_across} mm${line.orientation === 'vertical' ? ' ↻' : ''}${line.parts > 1 ? ` · 1/${line.parts}` : ''}`,
        mm: line.blank_across,
        color: PALETTE[i % PALETTE.length],
      })
    }
  })
  if (plan.offcut_mm > 0) {
    segments.push({
      label: plan.pallet ? t('plan.pallet') : t('plan.offcut'),
      sub: `${plan.offcut_mm} mm`,
      mm: plan.offcut_mm,
      color: plan.pallet ? '#868e96' : '#dee2e6',
      striped: true,
    })
  }
  segments.push({ label: t('plan.trim'), sub: `${plan.trim_mm} mm`, mm: plan.trim_mm, color: '#495057' })

  return (
    <Stack gap={6}>
      <Group justify="space-between">
        <Text size="sm" fw={600}>
          {t('plan.format')}: {width} mm
        </Text>
        <Text size="sm" c="dimmed">
          {t('plan.used')}: {plan.used_mm} mm · {t('plan.run')}: {num(plan.run_m, 1)} m
        </Text>
      </Group>
      <Box style={{ display: 'flex', height: 86, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--mantine-color-gray-4)' }}>
        {segments.map((s, i) => (
          <Box
            key={i}
            title={`${s.label} — ${s.sub}`}
            style={{
              width: `${(s.mm / width) * 100}%`,
              minWidth: 4,
              background: s.striped
                ? `repeating-linear-gradient(45deg, ${s.color}, ${s.color} 6px, #f1f3f5 6px, #f1f3f5 12px)`
                : s.color,
              borderRight: i < segments.length - 1 ? '2px dashed rgba(255,255,255,.9)' : undefined,
              color: '#fff',
              padding: 6,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Text size="xs" fw={700} truncate c={s.striped ? 'dark' : 'white'}>
              {s.label}
            </Text>
            <Text size="xs" truncate c={s.striped ? 'dark' : 'white'}>
              {s.sub}
            </Text>
          </Box>
        ))}
      </Box>
    </Stack>
  )
}
