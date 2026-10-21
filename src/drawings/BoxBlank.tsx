import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/cn'

import { blankOf, fmt, type BoxSize, type ScoreKey } from './geometry'
import { Defs, Dim, Legend } from './parts'

interface Props {
  size: BoxSize
  /** When given, the six score sizes are typed straight onto the drawing. */
  onChange?: (key: ScoreKey, value: number | null) => void
  /** Drawn for the big view: no limit on its height. */
  large?: boolean
  className?: string
}

const W = 1000
const MAX_H = 360
/** The drawing never gets taller than this on screen, however wide the card is. */
const MAX_SCREEN_H = 440
const TEMPLATE = { length: 400, width: 300, height: 250, joint: null }
const M = { left: 118, right: 24, top: 84, bottom: 70 }

/**
 * The flat blank of a regular slotted box as the corrugator cuts it: glue flap, four panels,
 * top and bottom flaps. Solid lines are cuts, dashed lines are score (bend) lines.
 */
export function BoxBlank({ size, onChange, large, className }: Props) {
  const { t } = useTranslation()
  const id = useId().replace(/:/g, '')
  const real = blankOf(size)
  const empty = !(real.l1 > 0 && real.l5 > 0 && real.l3 > 0)
  const b = empty ? blankOf({ ...TEMPLATE, joint: size.joint }) : real
  const editable = !!onChange
  const along = b.joint + 2 * (b.l1 + b.l5)
  const flaps = b.l2 + b.l3 + b.l4
  const across = Math.max(b.l0, flaps, 1)
  const mismatch = !empty && b.l0 !== flaps
  const room = W - M.left - M.right
  const scale = Math.min(room / Math.max(along, 1), MAX_H / across)
  const H = across * scale + M.top + M.bottom
  const ky = scale
  const x0 = M.left + (room - along * scale) / 2
  const y0 = M.top
  const yTop = y0 + b.l2 * ky
  const yBody = yTop + b.l3 * ky
  const yEnd = yBody + b.l4 * ky
  const yL0 = y0 + b.l0 * ky
  const xEnd = x0 + along * scale
  const panels = [b.l1, b.l5, b.l1, b.l5]
  const xs = panels.reduce<number[]>((acc, p) => [...acc, acc[acc.length - 1] + p * scale], [x0])
  const slot = 3
  const fs = 13

  const pos = (x: number, y: number) => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` })
  const field = (key: ScoreKey, x: number, y: number, vertical = false) => {
    if (!editable) return null
    const value = size[key]
    return (
      <input
        key={key}
        inputMode="numeric"
        aria-label={`${key.toUpperCase()} — ${t(`drawing.${key}`)}`}
        title={t(`drawing.${key}`)}
        value={value ?? ''}
        placeholder={empty ? key.toUpperCase() : fmt(b[key])}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '')
          onChange!(key, digits ? Number(digits) : null)
        }}
        className={cn(
          'tabular absolute h-7 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border text-center font-code text-[12.5px] font-semibold shadow-card outline-none transition',
          'focus:border-accent focus:ring-2 focus:ring-accent/30',
          value ? 'border-accent bg-accent text-on-accent placeholder:text-on-accent' : 'border-line-strong bg-surface text-ink placeholder:text-ink-3',
          vertical && '-rotate-90',
        )}
        style={pos(x, y)}
      />
    )
  }

  const label = (key: ScoreKey) => (editable ? '' : empty ? key.toUpperCase() : fmt(b[key]))
  const num = (key: ScoreKey) => (empty ? key.toUpperCase() : fmt(b[key]))

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* On a phone the blank keeps a size the score fields fit on, and scrolls sideways. */}
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <div className={cn('relative mx-auto w-full', editable && 'min-w-[600px]')} style={{ aspectRatio: `${W} / ${H}`, maxWidth: large ? undefined : `${Math.round((MAX_SCREEN_H * W) / H)}px` }}>
        <svg viewBox={`0 0 ${W} ${H}`} className={cn('absolute inset-0 size-full', empty && 'opacity-45')} role="img" aria-label={t('drawing.blank')}>
          <Defs id={id} />
          {/* Glue flap: a trapezoid on the body height only. */}
          <path
            d={`M ${xs[4]} ${yTop} L ${xEnd} ${yTop + 12} L ${xEnd} ${yBody - 12} L ${xs[4]} ${yBody} Z`}
            fill="var(--draw-fill)"
            stroke="var(--draw-cut)"
            strokeWidth="1.6"
          />
          {/* Panels with their flaps. */}
          {panels.map((_, i) => {
            const a = xs[i]
            const z = xs[i + 1]
            return (
              <g key={i}>
                <rect x={a} y={yTop} width={z - a} height={yBody - yTop} fill={`url(#${id}-flute)`} />
                <rect x={a} y={yTop} width={z - a} height={yBody - yTop} fill={i % 2 === 0 ? 'var(--draw-long)' : 'var(--draw-short)'} opacity="0.75" />
                <rect x={a + (i ? slot : 0)} y={y0} width={z - a - (i ? slot : 0) - (i < 3 ? slot : 0)} height={yTop - y0} fill="var(--draw-top)" stroke="var(--draw-cut)" strokeWidth="1.6" />
                <rect x={a + (i ? slot : 0)} y={yBody} width={z - a - (i ? slot : 0) - (i < 3 ? slot : 0)} height={yEnd - yBody} fill="var(--draw-bottom)" stroke="var(--draw-cut)" strokeWidth="1.6" />
              </g>
            )
          })}
          {/* Body outline and score lines. */}
          <line x1={x0} y1={yTop} x2={xs[4]} y2={yTop} stroke="var(--draw-score)" strokeWidth="1.6" strokeDasharray="7 5" />
          <line x1={x0} y1={yBody} x2={xs[4]} y2={yBody} stroke="var(--draw-score)" strokeWidth="1.6" strokeDasharray="7 5" />
          {xs.slice(1, 5).map((x, i) => (
            <line key={i} x1={x} y1={yTop} x2={x} y2={yBody} stroke="var(--draw-score)" strokeWidth="1.6" strokeDasharray="7 5" />
          ))}
          <line x1={x0} y1={yTop} x2={x0} y2={yBody} stroke="var(--draw-cut)" strokeWidth="1.6" />

          {/* Sizes along: panels on top, the whole blank above them, the glue flap below. */}
          <Dim id={id} x1={xs[0]} y1={y0} x2={xs[1]} y2={y0} offset={-26} label={label('l1')} strong={!b.auto.l1} fontSize={fs} />
          <Dim id={id} x1={xs[1]} y1={y0} x2={xs[2]} y2={y0} offset={-26} label={label('l5')} strong={!b.auto.l5} fontSize={fs} />
          <Dim id={id} x1={xs[2]} y1={y0} x2={xs[3]} y2={y0} offset={-26} label={num('l1')} fontSize={fs} />
          <Dim id={id} x1={xs[3]} y1={y0} x2={xs[4]} y2={y0} offset={-26} label={num('l5')} fontSize={fs} />
          <Dim id={id} x1={x0} y1={y0} x2={xEnd} y2={y0} offset={-64} label={empty ? '—' : `${fmt(along)} mm`} fontSize={fs} />
          <Dim id={id} x1={xs[4]} y1={yEnd} x2={xEnd} y2={yEnd} offset={34} label={fmt(b.joint)} fontSize={fs - 1} />

          {/* Sizes across: flaps and body, then the whole height (l0). */}
          <Dim id={id} x1={x0} y1={y0} x2={x0} y2={yTop} offset={-30} label={label('l2')} strong={!b.auto.l2} fontSize={fs} />
          <Dim id={id} x1={x0} y1={yTop} x2={x0} y2={yBody} offset={-30} label={label('l3')} strong={!b.auto.l3} fontSize={fs} />
          <Dim id={id} x1={x0} y1={yBody} x2={x0} y2={yEnd} offset={-30} label={label('l4')} strong={!b.auto.l4} fontSize={fs} />
          <Dim id={id} x1={x0} y1={y0} x2={x0} y2={yL0} offset={-84} label={label('l0')} strong={!b.auto.l0} fontSize={fs} />
        </svg>
        {field('l1', (xs[0] + xs[1]) / 2, y0 - 26)}
        {field('l5', (xs[1] + xs[2]) / 2, y0 - 26)}
        {field('l2', x0 - 30, (y0 + yTop) / 2, true)}
        {field('l3', x0 - 30, (yTop + yBody) / 2, true)}
        {field('l4', x0 - 30, (yBody + yEnd) / 2, true)}
        {field('l0', x0 - 84, (y0 + yL0) / 2, true)}
      </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Legend
          items={[
            { kind: 'cut', label: t('drawing.cut_line') },
            { kind: 'score', label: t('drawing.score_line') },
            { kind: 'color', color: 'var(--draw-long)', label: t('drawing.part_length') },
            { kind: 'color', color: 'var(--draw-short)', label: t('drawing.part_width') },
            { kind: 'color', color: 'var(--draw-top)', label: t('drawing.part_top') },
            { kind: 'color', color: 'var(--draw-bottom)', label: t('drawing.part_bottom') },
          ]}
        />
        {mismatch ? (
          <p className="text-xs text-bad">{t('drawing.l0_mismatch', { l0: fmt(b.l0), sum: fmt(flaps) })}</p>
        ) : empty ? (
          <p className="text-xs text-warn">{t('drawing.enter_size')}</p>
        ) : (
          <p className="tabular text-xs text-ink-2">
            {t('drawing.blank_size')}: <b className="font-code">{fmt(b.across)} × {fmt(b.along)}</b> mm
          </p>
        )}
      </div>
    </div>
  )
}
