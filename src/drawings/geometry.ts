/**
 * Sizes of a regular slotted box (FEFCO 0201) blank, in millimetres.
 *
 * Across the corrugator (the blank's height): l2 top flap + l3 body + l4 bottom flap = l0.
 * Along the corrugator (the blank's length): joint + l1 + l5 + l1 + l5.
 * Flaps are half the short side of the box; the legacy system stored the same six numbers.
 */
export interface BoxSize {
  length: number | null
  width: number | null
  height: number | null
  joint: number | null
  l0?: number | null
  l1?: number | null
  l2?: number | null
  l3?: number | null
  l4?: number | null
  l5?: number | null
}

export type ScoreKey = 'l0' | 'l1' | 'l2' | 'l3' | 'l4' | 'l5'

export const DEFAULT_JOINT = 70

export interface Blank {
  l0: number
  l1: number
  l2: number
  l3: number
  l4: number
  l5: number
  joint: number
  along: number
  across: number
  /** Which of the six came from the box size rather than being typed in. */
  auto: Record<ScoreKey, boolean>
}

export function suggestedScores(size: BoxSize): Record<ScoreKey, number> {
  const length = size.length ?? 0
  const width = size.width ?? 0
  const height = size.height ?? 0
  const flap = Math.ceil(Math.min(length || width, width || length) / 2)
  return { l1: length, l5: width, l2: flap, l3: height, l4: flap, l0: flap * 2 + height }
}

export function blankOf(size: BoxSize, parts = 1): Blank {
  const suggested = suggestedScores(size)
  const pick = (key: ScoreKey) => (size[key] && size[key]! > 0 ? size[key]! : suggested[key])
  const auto = Object.fromEntries(
    (['l0', 'l1', 'l2', 'l3', 'l4', 'l5'] as ScoreKey[]).map((k) => [k, !(size[k] && size[k]! > 0)]),
  ) as Record<ScoreKey, boolean>
  const l1 = pick('l1')
  const l5 = pick('l5')
  const l2 = pick('l2')
  const l3 = pick('l3')
  const l4 = pick('l4')
  const l0 = size.l0 && size.l0 > 0 ? size.l0 : l2 + l3 + l4
  const joint = size.joint && size.joint > 0 ? size.joint : DEFAULT_JOINT
  const along = Math.ceil((2 * (l1 + l5)) / parts) + joint
  return { l0, l1, l2, l3, l4, l5, joint, along, across: l0, auto }
}

export const fmt = (mm: number) => (Number.isFinite(mm) ? String(Math.round(mm)) : '—')

/** Which layers are fluted. Every second one by default; with an even count the last two are both liners. */
export function flutedLayers(count: number, flutes?: number[] | null): number[] {
  if (flutes?.length) return [...new Set(flutes)].filter((i) => i >= 0 && i < count).sort((a, b) => a - b)
  if (count <= 2) return count === 2 ? [1] : []
  const out: number[] = []
  for (let i = 1; i < count - 1; i += 2) out.push(i)
  return out
}

/**
 * Turns one layer between liner and flute. A liner next to a flute takes the flute over, so a flute can be moved
 * by clicking where it should go; the last flute stays, since board without one is not board.
 */
export function toggleFlute(count: number, flutes: number[] | null | undefined, index: number): number[] | null {
  const now = flutedLayers(count, flutes)
  if (now.includes(index)) return now.length > 1 ? now.filter((i) => i !== index) : null
  return [...now.filter((i) => i !== index - 1 && i !== index + 1), index].sort((a, b) => a - b)
}
