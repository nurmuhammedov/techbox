import { Check, Warehouse } from 'lucide-react'
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'

import type { MaterialType, Shape, Stage } from '@/api/types'
import { Box3D } from '@/drawings/Box3D'
import { BoxBlank } from '@/drawings/BoxBlank'
import { DEFAULT_JOINT, flutedLayers, suggestedScores, toggleFlute, type ScoreKey } from '@/drawings/geometry'
import { LayerKind, LayersSection } from '@/drawings/LayersSection'
import { SheetDrawing } from '@/drawings/SimpleSheets'
import { STAGE_TONE } from '@/kit/badges'
import { RemoteCombo, useOptions } from '@/kit/fields'
import { cn } from '@/lib/cn'
import { Button } from '@/ui/button'
import { Segments } from '@/ui/controls'
import { Field } from '@/ui/field'
import { NumberInput } from '@/ui/number-input'
import { Card } from '@/ui/page'

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
  holds: [],
  flutes: [],
  l0: null,
  l1: null,
  l2: null,
  l3: null,
  l4: null,
  l5: null,
}

const EXTRA: Stage[] = ['fleksa', 'tikish', 'yelimlash']

/**
 * The shape of a box or a sheet, told the way the factory thinks of it: size, layers of board,
 * the stages it goes through, and the score sizes typed onto the blank itself.
 */
export function ShapeEditor({
  value,
  onChange,
  errors = {},
  locked,
}: {
  value: Shape
  onChange: (patch: Partial<Shape>) => void
  errors?: Record<string, string>
  locked?: boolean
}) {
  const { t } = useTranslation()
  const materials = (useOptions('/catalog/materials').data ?? []) as unknown as MaterialType[]
  const name = (id: number) => materials.find((m) => m.id === id)?.name ?? ''
  const n = (key: keyof Shape) => (v: number | null) => onChange({ [key]: v } as Partial<Shape>)

  const setPly = (count: number) => {
    const layers = [...value.layers]
    while (layers.length < count) layers.push(layers[layers.length - 2] ?? 0)
    onChange({ layers: layers.slice(0, count), flutes: [] })
  }

  const toggleStage = (stage: Stage) => {
    let route: Stage[] = value.route.filter((s) => s !== 'gofra')
    if (route.includes(stage)) route = route.filter((s) => s !== stage)
    else {
      if (stage === 'tikish') route = route.filter((s) => s !== 'yelimlash')
      if (stage === 'yelimlash') route = route.filter((s) => s !== 'tikish')
      route.push(stage)
    }
    const next: Stage[] = ['gofra', ...EXTRA.filter((s) => route.includes(s))]
    onChange({ route: next, holds: (value.holds ?? []).filter((s) => next.slice(0, -1).includes(s)) })
  }

  const resetScores = () => onChange({ l0: null, l1: null, l2: null, l3: null, l4: null, l5: null })
  const typedScores = (['l0', 'l1', 'l2', 'l3', 'l4', 'l5'] as ScoreKey[]).some((k) => value[k])
  const suggested = suggestedScores(value)

  return (
    <fieldset disabled={locked} className="flex min-w-0 flex-col gap-4">
      <Card title={t('shape.title')}>
        <div className="flex flex-col gap-4">
          <Segments
            value={value.kind}
            onChange={(kind) => onChange({ kind })}
            options={[
              { value: 'box', label: t('product.kind.box') },
              { value: 'sheet', label: t('product.kind.sheet') },
            ]}
            className="w-fit"
          />
          {value.kind === 'box' ? (
            <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_200px]">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Field label={t('product.length')} required error={errors.length}>
                  {(id) => <NumberInput id={id} value={value.length} onChange={n('length')} suffix="mm" invalid={!!errors.length} />}
                </Field>
                <Field label={t('product.width')} required error={errors.width}>
                  {(id) => <NumberInput id={id} value={value.width} onChange={n('width')} suffix="mm" invalid={!!errors.width} />}
                </Field>
                <Field label={t('product.height')} required error={errors.height}>
                  {(id) => <NumberInput id={id} value={value.height} onChange={n('height')} suffix="mm" invalid={!!errors.height} />}
                </Field>
                <Field label={t('product.joint')} hint={t('shape.joint_hint')}>
                  {(id) => <NumberInput id={id} value={value.joint} onChange={n('joint')} suffix="mm" placeholder={String(DEFAULT_JOINT)} />}
                </Field>
              </div>
              <Box3D length={value.length} width={value.width} height={value.height} className="max-w-[200px] justify-self-center" />
            </div>
          ) : (
            <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
              <div className="grid grid-cols-2 gap-3">
                <Field label={t('product.sheet_width')} required error={errors.sheet_width}>
                  {(id) => <NumberInput id={id} value={value.sheet_width} onChange={n('sheet_width')} suffix="mm" invalid={!!errors.sheet_width} />}
                </Field>
                <Field label={t('product.sheet_length')} required error={errors.sheet_length}>
                  {(id) => <NumberInput id={id} value={value.sheet_length} onChange={n('sheet_length')} suffix="mm" invalid={!!errors.sheet_length} />}
                </Field>
              </div>
              <SheetDrawing width={value.sheet_width} length={value.sheet_length} />
            </div>
          )}
        </div>
      </Card>

      {value.kind === 'box' ? (
        <Card title={t('shape.blank')}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-ink-3">{t('shape.blank_hint')}</p>
              {typedScores ? (
                <Button size="sm" variant="ghost" onClick={resetScores}>
                  {t('shape.reset_scores')}
                </Button>
              ) : null}
            </div>
            <BoxBlank size={value} onChange={(key, v) => onChange({ [key]: v } as Partial<Shape>)} />
            {value.length && value.width && value.height ? (
              <p className="text-[11px] text-ink-3">
                {t('shape.suggested', { l2: suggested.l2, l3: suggested.l3, l0: suggested.l0 })}
              </p>
            ) : null}
          </div>
        </Card>
      ) : null}

      <Card title={t('layers')}>
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-3">
            <Segments
              value={String(value.layers.length)}
              onChange={(v) => setPly(Number(v))}
              options={['2', '3', '4', '5', '6', '7'].map((x) => ({ value: x, label: x }))}
              className="w-fit"
            />
            {value.layers.length % 2 === 0 && value.layers.length > 2 ? (
              <p className="rounded-md bg-warn-soft px-3 py-2 text-xs text-warn">{t('shape.ply_unusual', { n: value.layers.length })}</p>
            ) : null}
            {errors.layers ? <p className="text-xs text-bad">{errors.layers}</p> : null}
            <div className="flex flex-col gap-2">
              {value.layers.map((layer, i) => (
                <div key={i} className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-ink-2">
                    <b>{i + 1}.</b>
                    <LayerKind
                      fluted={flutedLayers(value.layers.length, value.flutes).includes(i)}
                      blocked={toggleFlute(value.layers.length, value.flutes, i) === null}
                      onToggle={() => {
                        const next = toggleFlute(value.layers.length, value.flutes, i)
                        if (next) onChange({ flutes: next })
                      }}
                    />
                  </span>
                  <RemoteCombo
                    url="/catalog/materials"
                    value={layer || null}
                    labelOf={(r) => `${r.name}`}
                    hintOf={(r) => `${r.gsm} g/m²`}
                    onChange={(v) => onChange({ layers: value.layers.map((x, j) => (j === i ? (v ?? 0) : x)) })}
                    invalid={!!errors.layers && !layer}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-line bg-sunken/50 p-3">
            <LayersSection names={value.layers.map(name)} flutes={value.flutes} />
          </div>
        </div>
      </Card>

      <Card title={t('route')}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-accent bg-accent-soft px-3 text-[13px] font-medium text-accent-ink">
            <Check className="size-4" />
            {t('stage.gofra')}
          </span>
          <span className="text-ink-3">→</span>
          {EXTRA.map((stage) => {
            const on = value.route.includes(stage)
            return (
              <button
                key={stage}
                type="button"
                aria-pressed={on}
                onClick={() => toggleStage(stage)}
                className={cn(
                  'inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors',
                  on ? 'border-accent bg-accent text-on-accent' : 'border-line-strong text-ink-2 hover:bg-sunken',
                )}
              >
                {on ? <Check className="size-4" /> : null}
                {t(`stage.${stage}`)}
              </button>
            )
          })}
          <span className="text-ink-3">→</span>
          <span className="inline-flex h-9 items-center rounded-full border border-dashed border-line-strong px-3 text-[13px] text-ink-3">
            {t('stage.short.store')}
          </span>
        </div>
        <p className="mt-2 text-xs text-ink-3">{t('shape.route_hint')}</p>
        <div className="mt-4 border-t border-line pt-4">
          <p className="text-[13px] font-medium">{t('ymo.flow')}</p>
          <p className="mt-0.5 text-xs text-ink-3">{t('ymo.flow_hint')}</p>
          <HoldsFlow route={value.route} holds={value.holds ?? []} onChange={(holds) => onChange({ holds })} />
          {errors.holds ? <p className="mt-1 text-xs text-bad">{errors.holds}</p> : null}
        </div>
        {errors.route ? <p className="mt-1 text-xs text-bad">{errors.route}</p> : null}
      </Card>
    </fieldset>
  )
}

/** The stages in order with a YMO switch between each two: where marked, the goods stop in the warehouse. */
export function HoldsFlow({ route, holds, onChange }: { route: Stage[]; holds: Stage[]; onChange: (holds: Stage[]) => void }) {
  const { t } = useTranslation()
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      {route.map((stage, i) => {
        const last = i === route.length - 1
        const held = holds.includes(stage)
        return (
          <Fragment key={stage}>
            <span className="inline-flex h-8 items-center gap-1.5 rounded-md bg-sunken px-2.5 text-[13px] font-medium">
              <span className={cn('size-2 rounded-full', STAGE_TONE[stage])} />
              {t(`stage.${stage}`)}
            </span>
            <span className="text-ink-3">→</span>
            {last ? null : (
              <>
                <button
                  type="button"
                  aria-pressed={held}
                  title={t('ymo.toggle', { stage: t(`stage.${stage}`) })}
                  onClick={() => onChange(held ? holds.filter((s) => s !== stage) : [...holds, stage])}
                  className={cn(
                    'inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs font-semibold transition-colors',
                    held ? 'border-warn bg-warn-soft text-warn' : 'border-dashed border-line-strong text-ink-3 hover:border-warn hover:text-warn',
                  )}
                >
                  <Warehouse className="size-3.5" />
                  {held ? t('ymo.short') : `+ ${t('ymo.short')}`}
                </button>
                <span className="text-ink-3">→</span>
              </>
            )}
          </Fragment>
        )
      })}
      <span className="inline-flex h-8 items-center rounded-md border border-dashed border-line-strong px-2.5 text-[13px] text-ink-3">{t('stage.short.store')}</span>
    </div>
  )
}
