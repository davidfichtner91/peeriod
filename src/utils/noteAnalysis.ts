import { mid, bounds, avgPeriodLen, type PhaseKey } from './cycle'

const DAY = 864e5

export interface NoteInsight {
  content: string
  date: Date
  /** 1 = minulý cyklus, 2 = předminulý… Nikdy 0, aktuální cyklus se nezobrazuje. */
  cyclesAgo: number
}

export interface SymptomPattern {
  symptom: string
  /** v kolika uzavřených cyklech se příznak v této fázi objevil */
  cycles: number
  /** z kolika cyklů, ve kterých sis vůbec něco zaznamenal */
  tracked: number
}

interface CycleSpan {
  start: Date
  len: number
  menLen: number
}

/**
 * Uzavřené cykly seřazené od nejstaršího. Poslední (probíhající) cyklus se
 * vynechává — nemá známou délku a kazil by statistiku.
 */
function closedCycles(starts: Date[], ends?: (Date | null)[]): CycleSpan[] {
  const paired = starts.map((s, i) => ({ start: s, end: ends?.[i] ?? null }))
  const sorted = [...paired].sort((a, b) => a.start.getTime() - b.start.getTime())
  const fallbackMenLen = avgPeriodLen(starts, ends)

  const out: CycleSpan[] = []
  for (let i = 0; i < sorted.length - 1; i++) {
    const start = sorted[i].start
    const end = sorted[i].end
    out.push({
      start,
      len: Math.round((mid(sorted[i + 1].start) - mid(start)) / DAY),
      menLen: end ? Math.round((mid(end) - mid(start)) / DAY) + 1 : fallbackMenLen,
    })
  }
  return out
}

/** Kolikátý den cyklu připadá na dané datum, nebo null když leží mimo. */
function dayIn(cycle: CycleSpan, date: Date): number | null {
  const off = Math.round((mid(date) - mid(cycle.start)) / DAY)
  if (off < 0 || off >= cycle.len) return null
  return off + 1
}

/**
 * Poznámka ze stejného dne některého z PŘEDCHOZÍCH cyklů.
 *
 * Pozor na řazení: `starts` chodí z databáze sestupně, tahle funkce si ho
 * proto musí seřadit sama (dřív to nedělala a kvůli tomu nikdy nic nevrátila).
 */
export function getNotesForCycleDay(
  cycleDay: number,
  starts: Date[],
  allNotes: Array<{ date: Date; content: string }>,
  ends?: (Date | null)[]
): NoteInsight | null {
  if (cycleDay < 1 || !starts.length || !allNotes.length) return null

  const cycles = closedCycles(starts, ends)
  if (!cycles.length) return null

  // Poslední uzavřený cyklus je "minulý" (cyclesAgo 1), předchozí 2 atd.
  const matches: NoteInsight[] = []
  for (const note of allNotes) {
    for (let i = 0; i < cycles.length; i++) {
      if (dayIn(cycles[i], note.date) !== cycleDay) continue
      const text = trimToSentences(note.content)
      if (text) {
        matches.push({ content: text, date: note.date, cyclesAgo: cycles.length - i })
      }
      break
    }
  }

  if (!matches.length) return null
  // Nejbližší minulost je nejrelevantnější.
  return matches.reduce((a, b) => (b.cyclesAgo < a.cyclesAgo ? b : a))
}

/** Poslední jedna až dvě věty poznámky — delší text v hero sekci nedává smysl. */
function trimToSentences(content: string): string | null {
  const trimmed = content.trim()
  if (trimmed.length < 10) return null
  if (trimmed.length <= 160) return trimmed

  const sentences = trimmed.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0)
  const tail = sentences.slice(-2).join(' ').trim()
  return tail.length >= 10 ? tail : trimmed.slice(0, 160).trim() + '…'
}

/**
 * Jak často se u dané fáze napříč cykly opakovaly jednotlivé příznaky.
 *
 * Jmenovatel jsou cykly, ve kterých sis zaznamenal aspoň něco — cykly, kdy
 * appku vůbec nepoužíváš, by jinak statistiku uměle srážely.
 */
export function getSymptomPatterns(
  phaseKey: PhaseKey,
  starts: Date[],
  symptoms: Array<{ date: Date; symptom: string }>,
  ends?: (Date | null)[]
): SymptomPattern[] {
  if (!starts.length || !symptoms.length) return []

  const cycles = closedCycles(starts, ends)
  if (!cycles.length) return []

  const perCycle = cycles.map(() => ({ tracked: false, inPhase: new Set<string>() }))

  for (const entry of symptoms) {
    for (let i = 0; i < cycles.length; i++) {
      const day = dayIn(cycles[i], entry.date)
      if (day === null) continue

      perCycle[i].tracked = true
      const [from, to] = bounds(cycles[i].len, cycles[i].menLen)[phaseKey]
      if (day >= from && day <= to) perCycle[i].inPhase.add(entry.symptom)
      break
    }
  }

  const tracked = perCycle.filter((c) => c.tracked).length
  if (tracked < 2) return [] // z jediného cyklu se vzorec vyčíst nedá

  const counts = new Map<string, number>()
  for (const c of perCycle) {
    for (const s of c.inPhase) counts.set(s, (counts.get(s) ?? 0) + 1)
  }

  return [...counts.entries()]
    .filter(([, n]) => n >= 2)
    .map(([symptom, cycles]) => ({ symptom, cycles, tracked }))
    .sort((a, b) => b.cycles - a.cycles || a.symptom.localeCompare(b.symptom, 'cs'))
    .slice(0, 3)
}
