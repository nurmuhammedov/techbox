import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import type { Plan } from '@/api/types'
import { cn } from '@/lib/cn'
import { num } from '@/lib/format'

import { fmt } from './geometry'
import { Defs, Dim, Legend } from './parts'

const COLORS = ['#3b82f6', '#8b5cf6', '#f97316', '#10b981', '#ec4899', '#06b6d4', '#eab308']

/**
 * The corrugated web seen from above: its width is the paper format, it runs to the right.
 * Each order takes lanes (one per blank side by side); what is left is the pallet strip or offcut,
 * and the edge trim. A few blanks of each lane are drawn so the operator sees how they repeat.
 */
export function CorrugatorLayout({ plan, className }: { plan: Plan; className?: string }) {
  const { t } = useTranslation()
  const id = useId().replace(/:/g, '')
  const W = 1000
  const left = 70
  const right = 150
  const top = 26
  const longest = Math.max(...plan.lines.map((l) => l.blank_along), 1)
  const windowMm = longest * 2.6
  const kx = (W - left - right) / windowMm
  const ky = Math.min(kx, 300 / Math.max(plan.format_mm, 1)) * 1.4
  const h = plan.format_mm * ky
  const H = h + top + 64

  const lanes: { y: number; height: number; color: string; name: string; blank: number; along: number; index: number }[] = []
  let y = top
  plan.lines.forEach((line, i) => {
    for (let u = 0; u < line.ups; u++) {
      lanes.push({ y, height: line.blank_across * ky, color: COLORS[i % COLORS.length], name: line.name, blank: line.blank_across, along: line.blank_along, index: i })
      y += line.blank_across * ky
    }
  })
  const offcutY = y
  const offcutH = plan.offcut_mm * ky
  const trimY = offcutY + offcutH
  const trimH = plan.trim_mm * ky
  const x0 = left
  const x1 = W - right

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t('drawing.layout')}>
        <Defs id={id} />
        <rect x={x0} y={top} width={x1 - x0} height={h} fill="var(--surface)" stroke="var(--draw-cut)" strokeWidth="1.2" />
        {lanes.map((lane, i) => {
          const count = Math.ceil((x1 - x0) / (lane.along * kx)) + 1
          return (
            <g key={i}>
              <clipPath id={`${id}-lane-${i}`}>
                <rect x={x0} y={lane.y} width={x1 - x0} height={lane.height} />
              </clipPath>
              <g clipPath={`url(#${id}-lane-${i})`}>
                {Array.from({ length: count }, (_, k) => {
                  const bx = x0 + k * lane.along * kx
                  return (
                    <rect
                      key={k}
                      x={bx + 1.5}
                      y={lane.y + 1.5}
                      width={lane.along * kx - 3}
                      height={lane.height - 3}
                      rx="2"
                      fill={lane.color}
                      fillOpacity={k % 2 ? 0.16 : 0.24}
                      stroke={lane.color}
                      strokeWidth="1.2"
                    />
                  )
                })}
              </g>
              {lane.height > 16 ? (
                <text x={x0 + 10} y={lane.y + lane.height / 2} dy="0.35em" fontSize={Math.min(14, lane.height * 0.45)} fontWeight={600} fill="var(--ink)">
                  {lane.name}
                </text>
              ) : null}
              <Dim id={id} x1={x1} y1={lane.y} x2={x1} y2={lane.y + lane.height} offset={18} label={fmt(lane.blank)} fontSize={12} />
            </g>
          )
        })}
        {offcutH > 0 ? (
          <g>
            <rect x={x0} y={offcutY} width={x1 - x0} height={offcutH} fill={`url(#${id}-hatch)`} stroke="var(--line-strong)" />
            {offcutH > 14 ? (
              <text x={x0 + 10} y={offcutY + offcutH / 2} dy="0.35em" fontSize={Math.min(14, offcutH * 0.5)} fontWeight={600} fill="var(--ink-2)">
                {plan.pallet ? `${t('plan.pallet')} ${fmt(plan.pallet.width)}×${fmt(plan.pallet.length)}` : t('plan.offcut')}
              </text>
            ) : null}
            <Dim id={id} x1={x1} y1={offcutY} x2={x1} y2={offcutY + offcutH} offset={18} label={fmt(plan.offcut_mm)} fontSize={12} />
          </g>
        ) : null}
        <rect x={x0} y={trimY} width={x1 - x0} height={trimH} fill="var(--bad-soft)" stroke="var(--bad)" strokeWidth="0.8" />
        <Dim id={id} x1={x1} y1={trimY} x2={x1} y2={trimY + trimH} offset={70} label={fmt(plan.trim_mm)} fontSize={11} />
        <Dim id={id} x1={x0} y1={top} x2={x0} y2={top + h} offset={-34} label={`${fmt(plan.format_mm)}`} fontSize={13} />
        <g>
          <line x1={x0} y1={top + h + 30} x2={x0 + 120} y2={top + h + 30} stroke="var(--draw-dim)" markerEnd={`url(#${id}-arrow)`} />
          <text x={x0 + 130} y={top + h + 30} dy="0.35em" fontSize="12" fill="var(--ink-3)">
            {t('drawing.machine_direction')}
          </text>
          <text x={x1} y={top + h + 30} dy="0.35em" textAnchor="end" fontSize="12" fill="var(--ink-2)" fontFamily="var(--font-mono)">
            {t('plan.run')}: {num(plan.run_m, 1)} m
          </text>
        </g>
      </svg>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Legend
          items={[
            { kind: 'fill', label: t('drawing.blank') },
            { kind: 'hatch', label: plan.pallet ? t('plan.pallet') : t('plan.offcut') },
          ]}
        />
        <p className="tabular text-xs text-ink-2">
          {t('plan.format')} {fmt(plan.format_mm)} mm · {t('plan.used')} {fmt(plan.used_mm)} mm ·{' '}
          <span className="text-bad">{t('plan.trim')} {fmt(plan.trim_mm)}</span>
        </p>
      </div>
    </div>
  )
}
