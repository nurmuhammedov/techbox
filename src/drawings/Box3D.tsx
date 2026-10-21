import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/cn'

import { fmt } from './geometry'

/** An isometric sketch of the box with its three sizes: what the customer ordered. */
export function Box3D({
  length,
  width,
  height,
  className,
  logo,
}: {
  length: number | null
  width: number | null
  height: number | null
  className?: string
  logo?: string | null
}) {
  const { t } = useTranslation()
  const empty = !(length && width && height)
  const L = empty ? 400 : length!
  const Wd = empty ? 300 : width!
  const Hh = empty ? 250 : height!
  const max = Math.max(L, Wd, Hh)
  const k = 120 / max
  const l = L * k
  const w = Wd * k
  const h = Hh * k
  const c = Math.cos(Math.PI / 6)
  const s = Math.sin(Math.PI / 6)
  const ox = 30 + w * c
  const oy = 30 + h
  const p = (x: number, y: number, z: number) => [ox + (x - y) * c, oy + (x + y) * s - z]
  const pt = (q: number[]) => q.join(',')
  const B = p(l, 0, 0)
  const C = p(l, w, 0)
  const D = p(0, w, 0)
  const A2 = p(0, 0, h)
  const B2 = p(l, 0, h)
  const C2 = p(l, w, h)
  const D2 = p(0, w, h)
  const vbW = ox + l * c + 40
  const vbH = oy + (l + w) * s + 34
  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} className={cn('w-full', empty && 'opacity-40', className)} role="img" aria-label={t('drawing.box3d')}>
      <polygon points={[A2, B2, C2, D2].map(pt).join(' ')} fill="var(--accent-soft)" stroke="var(--draw-cut)" strokeWidth="1.4" />
      <polygon points={[D, C, C2, D2].map(pt).join(' ')} fill="var(--draw-fill)" stroke="var(--draw-cut)" strokeWidth="1.4" />
      <polygon points={[B, C, C2, B2].map(pt).join(' ')} fill="var(--surface)" stroke="var(--draw-cut)" strokeWidth="1.4" />
      <line x1={(A2[0] + B2[0]) / 2} y1={(A2[1] + B2[1]) / 2} x2={(D2[0] + C2[0]) / 2} y2={(D2[1] + C2[1]) / 2} stroke="var(--draw-score)" strokeDasharray="4 3" />
      {logo ? (
        <image href={logo} x={(D[0] + C2[0]) / 2 - 18} y={(D[1] + C2[1]) / 2 - 12} width="36" height="24" preserveAspectRatio="xMidYMid meet" />
      ) : null}
      <text x={(D[0] + C[0]) / 2 - 6} y={(D[1] + C[1]) / 2 + 16} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--ink-2)">
        {length ? fmt(length) : 'L'}
      </text>
      <text x={(B[0] + C[0]) / 2 + 8} y={(B[1] + C[1]) / 2 + 16} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--ink-2)">
        {width ? fmt(width) : 'W'}
      </text>
      <text x={C[0] + 8} y={(C[1] + C2[1]) / 2} fontSize="11" fontFamily="var(--font-mono)" fill="var(--ink-2)">
        {height ? fmt(height) : 'H'}
      </text>
    </svg>
  )
}
