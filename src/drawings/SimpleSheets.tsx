import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/cn'

import { blankOf, fmt, type BoxSize } from './geometry'
import { Defs, Dim } from './parts'

/** A flat sheet (or a pallet piece) with its two sizes. */
export function SheetDrawing({
  width,
  length,
  className,
  hatched,
  title,
}: {
  width: number | null
  length: number | null
  className?: string
  hatched?: boolean
  title?: string
}) {
  const { t } = useTranslation()
  const id = useId().replace(/:/g, '')
  const Wd = width || 1
  const L = length || 1
  const box = 300
  const k = box / Math.max(Wd, L)
  const w = L * k
  const h = Wd * k
  const x = 62
  const y = 20
  return (
    <svg viewBox={`0 0 ${w + 90} ${h + 70}`} className={cn('w-full', className)} role="img" aria-label={title ?? t('drawing.sheet')}>
      <Defs id={id} />
      <rect x={x} y={y} width={w} height={h} fill={hatched ? `url(#${id}-hatch)` : 'var(--accent-soft)'} stroke="var(--draw-cut)" strokeWidth="1.6" rx="2" />
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id}-flute)`} opacity={hatched ? 0 : 1} />
      <Dim id={id} x1={x} y1={y + h} x2={x + w} y2={y + h} offset={26} label={fmt(length ?? 0)} fontSize={13} />
      <Dim id={id} x1={x} y1={y} x2={x} y2={y + h} offset={-30} label={fmt(width ?? 0)} fontSize={13} />
      {title ? (
        <text x={x + w / 2} y={y + h / 2} dy="0.35em" textAnchor="middle" fontSize="14" fontWeight={600} fill="var(--ink-2)">
          {title}
        </text>
      ) : null}
    </svg>
  )
}

/**
 * A big box made from several pieces (1/2, 1/3, 1/4): the full length is split and each piece
 * gets its own glue flap. Shows how many pieces are cut per box and how many in total.
 */
export function PartsDrawing({
  size,
  parts,
  quantity,
  className,
}: {
  size: BoxSize
  parts: number
  quantity: number
  className?: string
}) {
  const { t } = useTranslation()
  const id = useId().replace(/:/g, '')
  const b = blankOf(size, parts)
  const total = 2 * (b.l1 + b.l5)
  const piece = b.along - b.joint
  const W = 1000
  const k = (W - 60) / (total + parts * b.joint + (parts - 1) * 40)
  const h = Math.max(70, b.l0 * k)
  const y = 50
  let x = 30
  const pieces = Array.from({ length: parts }, (_, i) => {
    const start = x
    x += (piece + b.joint) * k + 40 * k
    return { i, start }
  })
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <svg viewBox={`0 0 ${W} ${h + 100}`} className="w-full" role="img" aria-label={t('drawing.parts')}>
        <Defs id={id} />
        {pieces.map(({ i, start }) => {
          const jw = b.joint * k
          const pw = piece * k
          return (
            <g key={i}>
              <rect x={start} y={y} width={pw} height={h} fill="var(--accent-soft)" stroke="var(--draw-cut)" strokeWidth="1.4" />
              <path d={`M ${start + pw} ${y} L ${start + pw + jw} ${y + 8} L ${start + pw + jw} ${y + h - 8} L ${start + pw} ${y + h} Z`} fill="var(--draw-fill)" stroke="var(--draw-cut)" strokeWidth="1.4" />
              <text x={start + pw / 2} y={y + h / 2} dy="0.35em" textAnchor="middle" fontSize="18" fontWeight={700} fill="var(--accent-ink)">
                {i + 1}/{parts}
              </text>
              <Dim id={id} x1={start} y1={y + h} x2={start + jw + pw} y2={y + h} offset={26} label={fmt(b.along)} fontSize={13} />
            </g>
          )
        })}
        <Dim id={id} x1={30} y1={y} x2={30} y2={y + h} offset={-14} label="" />
      </svg>
      <p className="tabular text-xs text-ink-2">
        {t('drawing.parts_line', { parts, each: fmt(b.along), pieces: Math.ceil(quantity * parts).toLocaleString('ru-RU') })}
      </p>
    </div>
  )
}
