import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/cn'

/**
 * A cut through the board: flat liners and wavy flutes, outer layer on top. The picture of what
 * "5 ply: Mondy / b3 / b1 / b1 / kraft" means.
 */
export function LayersSection({ names, className }: { names: string[]; className?: string }) {
  const { t } = useTranslation()
  const W = 520
  const linerH = 7
  const fluteH = 26
  const rowH = (i: number) => (i % 2 ? fluteH : linerH)
  const heights = names.map((_, i) => rowH(i))
  const total = heights.reduce((a, b) => a + b, 0)
  const H = total + 16
  let y = 8
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn('w-full', className)} role="img" aria-label={t('drawing.layers')}>
      {names.map((name, i) => {
        const top = y
        const h = heights[i]
        y += h
        if (i % 2 === 0) {
          return (
            <g key={i}>
              <rect x={10} y={top} width={300} height={h} fill="var(--accent)" opacity={0.85} rx={1} />
              <text x={322} y={top + h / 2} dy="0.35em" fontSize="12" fill="var(--ink)">
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
            <text x={322} y={top + h / 2} dy="0.35em" fontSize="12" fill="var(--ink)">
              <tspan fontWeight={600}>{i + 1}.</tspan> {name || '—'} <tspan fill="var(--ink-3)">· {t('plan.flute')}</tspan>
            </text>
          </g>
        )
      })}
    </svg>
  )
}
