import type { ReactNode } from 'react'

/** Arrowheads and hatching shared by every drawing on the page; each drawing defines them under its own id. */
export function Defs({ id }: { id: string }) {
  return (
    <defs>
      <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 1 L10 5 L0 9 z" fill="var(--draw-dim)" />
      </marker>
      <pattern id={`${id}-hatch`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="8" height="8" fill="var(--draw-fill)" />
        <line x1="0" y1="0" x2="0" y2="8" stroke="var(--line-strong)" strokeWidth="3" />
      </pattern>
      <pattern id={`${id}-flute`} width="10" height="6" patternUnits="userSpaceOnUse">
        <path d="M0 3 Q2.5 0 5 3 T10 3" fill="none" stroke="var(--line-strong)" strokeWidth="0.8" opacity="0.6" />
      </pattern>
    </defs>
  )
}

interface DimProps {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  /** Distance of the dimension line from the measured edge; negative = above/left. */
  offset: number
  label: ReactNode
  /** Label colour: accent when the value was typed, dim when it was worked out. */
  strong?: boolean
  fontSize?: number
}

/** A dimension: two extension lines, a line with arrows between them and the value on a pill in the middle. */
export function Dim({ id, x1, y1, x2, y2, offset, label, strong, fontSize = 13 }: DimProps) {
  const horizontal = Math.abs(y1 - y2) < Math.abs(x1 - x2)
  const [ax, ay, bx, by] = horizontal ? [x1, y1 + offset, x2, y2 + offset] : [x1 + offset, y1, x2 + offset, y2]
  const mx = (ax + bx) / 2
  const my = (ay + by) / 2
  const text = typeof label === 'string' || typeof label === 'number' ? String(label) : ''
  const pillW = Math.max(30, text.length * fontSize * 0.62 + 12)
  const pillH = fontSize + 8
  const short = horizontal ? Math.abs(bx - ax) < pillW + 14 : Math.abs(by - ay) < pillH + 14
  return (
    <g>
      <line x1={x1} y1={y1} x2={ax} y2={ay} stroke="var(--draw-dim)" strokeWidth="0.75" strokeDasharray="2 2" />
      <line x1={x2} y1={y2} x2={bx} y2={by} stroke="var(--draw-dim)" strokeWidth="0.75" strokeDasharray="2 2" />
      <line
        x1={ax}
        y1={ay}
        x2={bx}
        y2={by}
        stroke="var(--draw-dim)"
        strokeWidth="1"
        markerStart={short ? undefined : `url(#${id}-arrow)`}
        markerEnd={short ? undefined : `url(#${id}-arrow)`}
      />
      {text ? (
        <g transform={horizontal ? undefined : `rotate(-90 ${mx} ${my})`}>
          <rect
            x={mx - pillW / 2}
            y={my - pillH / 2}
            width={pillW}
            height={pillH}
            rx={pillH / 2}
            fill={strong ? 'var(--accent)' : 'var(--surface)'}
            stroke={strong ? 'none' : 'var(--line-strong)'}
            strokeWidth="1"
          />
          <text
            x={mx}
            y={my}
            dy="0.35em"
            textAnchor="middle"
            fontSize={fontSize}
            fontWeight={600}
            fontFamily="var(--font-mono)"
            fill={strong ? 'var(--on-accent)' : 'var(--ink)'}
          >
            {text}
          </text>
        </g>
      ) : null}
    </g>
  )
}

export function Legend({ items }: { items: { kind: 'cut' | 'score' | 'hatch' | 'fill' | 'color'; label: string; color?: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-3">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <svg width="22" height="10" aria-hidden>
            {item.kind === 'cut' ? <line x1="0" y1="5" x2="22" y2="5" stroke="var(--draw-cut)" strokeWidth="2" /> : null}
            {item.kind === 'score' ? (
              <line x1="0" y1="5" x2="22" y2="5" stroke="var(--draw-score)" strokeWidth="1.5" strokeDasharray="4 3" />
            ) : null}
            {item.kind === 'hatch' ? (
              <rect x="1" y="1" width="20" height="8" fill="var(--draw-fill)" stroke="var(--line-strong)" />
            ) : null}
            {item.kind === 'color' ? <rect x="1" y="1" width="20" height="8" rx="2" fill={item.color} stroke="var(--line-strong)" /> : null}
            {item.kind === 'fill' ? (
              <rect x="1" y="1" width="20" height="8" rx="2" fill="var(--accent-soft)" stroke="var(--accent)" />
            ) : null}
          </svg>
          {item.label}
        </span>
      ))}
    </div>
  )
}
