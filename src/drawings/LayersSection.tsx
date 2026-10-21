import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/cn'

import { flutedLayers } from './geometry'

/**
 * A cut through the board: flat liners and wavy flutes, outer layer on top. The picture of what
 * "5 ply: Mondy / b3 / b1 / b1 / kraft" means.
 */
export function LayersSection({ names, flutes, className }: { names: string[]; flutes?: number[] | null; className?: string }) {
  const { t } = useTranslation()
  const W = 520
  const linerH = 7
  const fluteH = 26
  const fluted = new Set(flutedLayers(names.length, flutes))
  const rowH = (i: number) => (fluted.has(i) ? fluteH : linerH)
  const heights = names.map((_, i) => rowH(i))
  const total = heights.reduce((a, b) => a + b, 0)
  // Labels keep their own line even where thin liners lie on top of each other.
  const labelY: number[] = []
  let acc = 8
  heights.forEach((h, i) => {
    const centre = acc + h / 2
    labelY.push(Math.max(centre, i ? labelY[i - 1] + 16 : 8))
    acc += h
  })
  const H = Math.max(total, (labelY[labelY.length - 1] ?? 0)) + 16
  let y = 8
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn('w-full', className)} role="img" aria-label={t('drawing.layers')}>
      {names.map((name, i) => {
        const top = y
        const h = heights[i]
        y += h
        if (!fluted.has(i)) {
          return (
            <g key={i}>
              <rect x={10} y={top} width={300} height={h} fill="var(--accent)" opacity={0.85} rx={1} />
              <path d={`M 312 ${top + h / 2} L 318 ${top + h / 2} L 326 ${labelY[i]} L 330 ${labelY[i]}`} fill="none" stroke="var(--line-strong)" />
              <text x={334} y={labelY[i]} dy="0.35em" fontSize="12" fill="var(--ink)">
                <tspan fontWeight={600}>{i + 1}.</tspan> {name || '—'} <tspan fill="var(--ink-3)">· {t('plan.liner')}</tspan>
              </text>
            </g>
          )
        }
        const waves = 10
        const step = 300 / waves
        let d = `M 10 ${top + h}`
        for (let k = 0; k < waves; k++) {
          const x = 10 + k * step
          d += ` C ${x + step * 0.25} ${top + h}, ${x + step * 0.25} ${top}, ${x + step * 0.5} ${top} S ${x + step * 0.75} ${top + h}, ${x + step} ${top + h}`
        }
        return (
          <g key={i}>
            <path d={d} fill="none" stroke="var(--warn)" strokeWidth="2.2" />
            <path d={`M 312 ${top + h / 2} L 318 ${top + h / 2} L 326 ${labelY[i]} L 330 ${labelY[i]}`} fill="none" stroke="var(--line-strong)" />
            <text x={334} y={labelY[i]} dy="0.35em" fontSize="12" fill="var(--ink)">
              <tspan fontWeight={600}>{i + 1}.</tspan> {name || '—'} <tspan fill="var(--ink-3)">· {t('plan.flute')}</tspan>
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Liner or flute for one layer: both choices side by side, the chosen one filled. */
export function LayerKind({ fluted, onChange }: { fluted: boolean; onChange?: (fluted: boolean) => void }) {
  const { t } = useTranslation()
  const option = (value: boolean, label: string) => (
    <button
      type="button"
      role="radio"
      aria-checked={fluted === value}
      disabled={!onChange}
      onClick={() => onChange?.(value)}
      className={cn(
        'h-6 rounded px-2 text-[11px] font-medium whitespace-nowrap transition-colors',
        fluted === value ? (value ? 'bg-warn text-white shadow-card' : 'bg-accent text-on-accent shadow-card') : 'text-ink-3 hover:text-ink',
      )}
    >
      {label}
    </button>
  )
  return (
    <span role="radiogroup" className="inline-flex shrink-0 gap-0.5 rounded-md border border-line-strong bg-sunken p-0.5">
      {option(false, t('plan.liner'))}
      {option(true, t('plan.flute'))}
    </span>
  )
}
