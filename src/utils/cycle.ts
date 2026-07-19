import { PHASES, FEELS } from '../data/phases'

const DAY = 864e5
export const MIN_LEN = 21
export const MAX_LEN = 35

export type PhaseKey = 'mens' | 'foli' | 'ovul' | 'lute'
export type GlyphType = 'disc' | 'ring' | 'diamond' | 'half'
export type Pair = [string, string]

export interface Stage {
  title: string
  lede: string
  bio: string
  tips: Pair[]
}

export interface Phase {
  name: string
  color: string
  glyph: GlyphType
  feels: Pair[]
  stages: Stage[]
}

export interface CycleInfo {
  day: number
  len: number
  predicted: boolean
}

export interface ContentInfo {
  key: PhaseKey
  phase: Phase
  stage: Stage
  feels: Pair[]
  from: number
  to: number
}

export type PhaseBounds = Record<PhaseKey, [number, number]>

export const ORDER: PhaseKey[] = ['mens', 'foli', 'ovul', 'lute']

const mid = (d: Date): number =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

/**
 * Luteální fáze trvá stabilně ~14 dní, folikulární se protahuje a zkracuje.
 * Ovulace se proto kotví od KONCE cyklu, ne pevným číslem dne.
 */
export function bounds(len: number): PhaseBounds {
  const ovul = Math.max(8, len - 14)
  return {
    mens: [1, 5],
    foli: [6, ovul - 2],
    ovul: [ovul - 1, ovul + 1],
    lute: [ovul + 2, len],
  }
}

export function phaseOf(day: number, len: number): PhaseKey {
  const b = bounds(len)
  return ORDER.find((k) => day >= b[k][0] && day <= b[k][1]) ?? 'lute'
}

/** Barva fáze pro daný den — používá ji kruh i kalendář. */
export function colorOf(day: number, len: number): string {
  return (PHASES as Record<PhaseKey, Phase>)[phaseOf(day, len)].color
}

export function phaseFor(day: number, len: number): Phase {
  return (PHASES as Record<PhaseKey, Phase>)[phaseOf(day, len)]
}

export function isOutlier(n: number): boolean {
  return n < MIN_LEN || n > MAX_LEN
}

export function intervals(starts: Date[]): number[] {
  const s = [...starts].sort((a, b) => a.getTime() - b.getTime())
  const out: number[] = []
  for (let i = 1; i < s.length; i++) {
    out.push(Math.round((mid(s[i]) - mid(s[i - 1])) / DAY))
  }
  return out
}

/** Průměr z posledních šesti cyklů, odchylky mimo 21–35 dní se nepočítají. */
export function avgLen(starts: Date[]): number {
  const usable = intervals(starts)
    .filter((n) => !isOutlier(n))
    .slice(-6)
  if (!usable.length) return 28
  return Math.round(usable.reduce((a, b) => a + b, 0) / usable.length)
}

export function cycleAt(
  date: Date,
  starts: Date[],
  now: Date = new Date()
): CycleInfo {
  const L = avgLen(starts)
  if (!starts.length) return { day: 1, len: L, predicted: true }

  const s = [...starts].sort((a, b) => a.getTime() - b.getTime())
  const t = mid(date)

  for (let i = s.length - 1; i >= 0; i--) {
    const st = mid(s[i])
    if (t >= st) {
      const next = s[i + 1] ? mid(s[i + 1]) : null
      if (next !== null && t < next) {
        return {
          day: Math.round((t - st) / DAY) + 1,
          len: Math.round((next - st) / DAY),
          predicted: false,
        }
      }
      if (next === null) {
        const off = Math.round((t - st) / DAY)
        return { day: (off % L) + 1, len: L, predicted: t > mid(now) }
      }
    }
  }

  // datum před prvním záznamem — dopočítáno zpětně, tedy odhad
  const st = mid(s[0])
  const off = Math.round((t - st) / DAY)
  return { day: (((off % L) + L) % L) + 1, len: L, predicted: true }
}

export function isStart(date: Date, starts: Date[]): boolean {
  return starts.some((s) => mid(s) === mid(date))
}

/**
 * Vybere fázi i podfázi podle RELATIVNÍ pozice ve fázi,
 * takže texty sedí i u 24denního nebo 33denního cyklu.
 */
export function contentFor(day: number, len: number): ContentInfo {
  const key = phaseOf(day, len)
  const phase = (PHASES as Record<PhaseKey, Phase>)[key]
  const b = bounds(len)[key]
  const span = Math.max(1, b[1] - b[0] + 1)
  const prog = (day - b[0]) / span
  const idx = Math.min(
    phase.stages.length - 1,
    Math.max(0, Math.floor(prog * phase.stages.length))
  )
  const feelsMap = FEELS as Record<PhaseKey, Pair[][]>
  const feels = feelsMap[key]?.[idx] ?? phase.feels
  return { key, phase, stage: phase.stages[idx], feels, from: b[0], to: b[1] }
}
