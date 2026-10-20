import { Checkbox, Grid, Group, NumberInput, SegmentedControl, Stack, TagsInput, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import type { MaterialType, Shape, Stage } from '@/api/types'
import { RemoteSelect, useRows } from '@/components/RemoteSelect'

export const EMPTY_SHAPE: Shape = {
  kind: 'box',
  length: null,
  width: null,
  height: null,
  joint: null,
  sheet_length: null,
  sheet_width: null,
  layers: [0, 0, 0],
  route: ['gofra', 'fleksa'],
  scores: [],
}

const EXTRA: Stage[] = ['fleksa', 'tikish', 'yelimlash']

export function ShapeFields({
  value,
  onChange,
  errors = {},
}: {
  value: Shape
  onChange: (patch: Partial<Shape>) => void
  errors?: Record<string, string>
}) {
  const { t } = useTranslation()
  const materials = useRows<MaterialType>('/catalog/materials')
  const n = (v: string | number) => (v === '' ? null : Number(v))
  const ply = value.layers.length

  const setPly = (count: number) => {
    const layers = [...value.layers]
    while (layers.length < count) layers.push(layers[layers.length - 2] ?? materials[0]?.id ?? 0)
    onChange({ layers: layers.slice(0, count) })
  }

  const toggleStage = (stage: Stage, on: boolean) => {
    let route = value.route.filter((s) => s !== stage)
    if (on) {
      if (stage === 'tikish') route = route.filter((s) => s !== 'yelimlash')
      if (stage === 'yelimlash') route = route.filter((s) => s !== 'tikish')
      route.push(stage)
    }
    onChange({ route: ['gofra', ...EXTRA.filter((s) => route.includes(s))] })
  }

  return (
    <Stack gap="sm">
      <SegmentedControl
        value={value.kind}
        onChange={(v) => onChange({ kind: v as Shape['kind'] })}
        data={[
          { value: 'box', label: t('product.kind.box') },
          { value: 'sheet', label: t('product.kind.sheet') },
        ]}
      />
      {value.kind === 'box' ? (
        <Grid gutter="xs">
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <NumberInput label={t('product.length')} value={value.length ?? ''} onChange={(v) => onChange({ length: n(v) })} error={errors.length} required rightSection={<Text size="xs">mm</Text>} />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <NumberInput label={t('product.width')} value={value.width ?? ''} onChange={(v) => onChange({ width: n(v) })} error={errors.width} required rightSection={<Text size="xs">mm</Text>} />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <NumberInput label={t('product.height')} value={value.height ?? ''} onChange={(v) => onChange({ height: n(v) })} error={errors.height} required rightSection={<Text size="xs">mm</Text>} />
          </Grid.Col>
          <Grid.Col span={{ base: 6, sm: 3 }}>
            <NumberInput label={t('product.joint')} placeholder="40" value={value.joint ?? ''} onChange={(v) => onChange({ joint: n(v) })} rightSection={<Text size="xs">mm</Text>} />
          </Grid.Col>
          <Grid.Col span={12}>
            <TagsInput
              label={t('product.scores')}
              description={t('product.scores_hint')}
              value={value.scores.map(String)}
              onChange={(v) => onChange({ scores: v.map(Number).filter((x) => x > 0) })}
              clearable
            />
          </Grid.Col>
        </Grid>
      ) : (
        <Grid gutter="xs">
          <Grid.Col span={6}>
            <NumberInput label={t('product.sheet_width')} value={value.sheet_width ?? ''} onChange={(v) => onChange({ sheet_width: n(v) })} error={errors.sheet_width} required rightSection={<Text size="xs">mm</Text>} />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput label={t('product.sheet_length')} value={value.sheet_length ?? ''} onChange={(v) => onChange({ sheet_length: n(v) })} error={errors.sheet_length} required rightSection={<Text size="xs">mm</Text>} />
          </Grid.Col>
        </Grid>
      )}
      <Stack gap={6}>
        <Group justify="space-between">
          <Text size="sm" fw={500}>
            {t('layers')}
          </Text>
          <SegmentedControl size="xs" value={String(ply)} onChange={(v) => setPly(Number(v))} data={['2', '3', '5', '7'].map((x) => ({ value: x, label: `${x} ${t('plan.ply')}` }))} />
        </Group>
        {errors.layers && <Text size="xs" c="red">{errors.layers}</Text>}
        <Grid gutter="xs">
          {value.layers.map((layer, i) => (
            <Grid.Col key={i} span={{ base: 12, sm: 6 }}>
              <RemoteSelect
                size="xs"
                label={`${i + 1}. ${i % 2 ? t('plan.flute') : t('plan.liner')}`}
                url="/catalog/materials"
                labelOf={(r) => `${r.name} · ${r.gsm} g/m²`}
                value={layer || null}
                onChange={(v) => onChange({ layers: value.layers.map((x, j) => (j === i ? v ?? 0 : x)) })}
                clearable={false}
              />
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
      <Stack gap={6}>
        <Text size="sm" fw={500}>
          {t('route')}
        </Text>
        <Group>
          <Checkbox label={t('stage.gofra')} checked disabled />
          {EXTRA.map((s) => (
            <Checkbox key={s} label={t(`stage.${s}`)} checked={value.route.includes(s)} onChange={(e) => toggleStage(s, e.currentTarget.checked)} />
          ))}
        </Group>
        {errors.route && <Text size="xs" c="red">{errors.route}</Text>}
      </Stack>
    </Stack>
  )
}
