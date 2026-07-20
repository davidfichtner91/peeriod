import { describe, it, expect } from 'vitest'
import {
  bounds,
  colorOf,
  phaseOf,
  avgLen,
  intervals,
  isOutlier,
  cycleAt,
  contentFor,
} from './cycle'

/** pomocník: datum bez času, ať testy nezávisí na časové zóně */
const d = (s: string) => new Date(s + 'T00:00:00')

describe('bounds — hranice fází', () => {
  it('u 28denního cyklu vychází ovulace na 13.–15. den', () => {
    const b = bounds(28)
    expect(b.mens).toEqual([1, 5])
    expect(b.foli).toEqual([6, 12])
    expect(b.ovul).toEqual([13, 15])
    expect(b.lute).toEqual([16, 28])
  })

  it('luteální fáze zůstává ~14 dní i u kratšího a delšího cyklu', () => {
    for (const len of [24, 26, 28, 31, 35]) {
      const b = bounds(len)
      const luteLen = b.lute[1] - b.lute[0] + 1
      expect(luteLen).toBeGreaterThanOrEqual(12)
      expect(luteLen).toBeLessThanOrEqual(14)
    }
  })

  it('fáze na sebe navazují bez děr a bez překryvů', () => {
    for (const len of [21, 24, 28, 30, 35]) {
      const b = bounds(len)
      expect(b.foli[0]).toBe(b.mens[1] + 1)
      expect(b.ovul[0]).toBe(b.foli[1] + 1)
      expect(b.lute[0]).toBe(b.ovul[1] + 1)
      expect(b.lute[1]).toBe(len)
    }
  })

  it('každý den cyklu spadá právě do jedné fáze', () => {
    for (const len of [22, 26, 28, 33]) {
      for (let day = 1; day <= len; day++) {
        expect(['mens', 'foli', 'ovul', 'lute']).toContain(phaseOf(day, len))
      }
    }
  })
})

describe('intervals a avgLen', () => {
  const starts = [d('2026-04-11'), d('2026-05-10'), d('2026-06-06'), d('2026-07-02')]

  it('spočítá rozdíly mezi záznamy', () => {
    expect(intervals(starts)).toEqual([29, 27, 26])
  })

  it('nezáleží na pořadí zadání', () => {
    const shuffled = [starts[2], starts[0], starts[3], starts[1]]
    expect(intervals(shuffled)).toEqual([29, 27, 26])
  })

  it('průměruje běžné cykly', () => {
    expect(avgLen(starts)).toBe(27) // (29+27+26)/3 = 27.33 → 27
  })

  it('bez záznamů padá na 28', () => {
    expect(avgLen([])).toBe(28)
    expect(avgLen([d('2026-07-02')])).toBe(28)
  })

  it('odchylku mimo 21–35 dní do průměru nezapočítá', () => {
    // překlep v datu vytvoří interval 96 dní
    const withTypo = [...starts, d('2026-10-06')]
    expect(intervals(withTypo)).toEqual([29, 27, 26, 96])
    expect(avgLen(withTypo)).toBe(27) // stejný průměr jako bez překlepu
  })

  it('když jsou všechny intervaly odchylky, vrátí výchozích 28', () => {
    expect(avgLen([d('2026-01-01'), d('2026-06-01')])).toBe(28)
  })

  it('isOutlier hlídá obě hranice včetně', () => {
    expect(isOutlier(20)).toBe(true)
    expect(isOutlier(21)).toBe(false)
    expect(isOutlier(35)).toBe(false)
    expect(isOutlier(36)).toBe(true)
  })
})

describe('cycleAt', () => {
  const starts = [d('2026-06-06'), d('2026-07-02')]
  const now = d('2026-07-19')

  it('den začátku menstruace je 1. den cyklu', () => {
    expect(cycleAt(d('2026-07-02'), starts, undefined, now).day).toBe(1)
  })

  it('dnešek spadá do probíhajícího cyklu', () => {
    const c = cycleAt(now, starts, undefined, now)
    expect(c.day).toBe(18)
    expect(c.predicted).toBe(false)
  })

  it('uzavřený cyklus používá skutečnou délku, ne průměr', () => {
    const c = cycleAt(d('2026-06-20'), starts, undefined, now)
    expect(c.len).toBe(26) // 6. 6. → 2. 7.
    expect(c.predicted).toBe(false)
  })

  it('budoucnost je označená jako předpověď', () => {
    expect(cycleAt(d('2026-08-15'), starts, undefined, now).predicted).toBe(true)
  })

  it('datum před prvním záznamem je taky jen odhad', () => {
    expect(cycleAt(d('2026-05-01'), starts, undefined, now).predicted).toBe(true)
  })

  it('bez záznamů nespadne', () => {
    const c = cycleAt(now, [], undefined, now)
    expect(c.day).toBe(1)
    expect(c.len).toBe(28)
  })
})

describe('contentFor — výběr podfáze', () => {
  it('vrátí jinou podfázi na začátku a na konci luteální fáze', () => {
    const early = contentFor(16, 28)
    const late = contentFor(28, 28)
    expect(early.key).toBe('lute')
    expect(late.key).toBe('lute')
    expect(early.stage.title).not.toBe(late.stage.title)
  })

  it('symptomy se liší podle podfáze, ne jen podle fáze', () => {
    expect(contentFor(16, 28).feels).not.toEqual(contentFor(28, 28).feels)
  })

  it('krajní dny cyklu nespadnou mimo rozsah', () => {
    for (const len of [21, 28, 35]) {
      for (const day of [1, len]) {
        const c = contentFor(day, len)
        expect(c.stage).toBeDefined()
        expect(c.stage.tips.length).toBeGreaterThan(0)
      }
    }
  })

  it('každý den má neprázdný text i sadu pocitů', () => {
    for (let day = 1; day <= 28; day++) {
      const c = contentFor(day, 28)
      expect(c.stage.title.length).toBeGreaterThan(0)
      expect(c.stage.bio.length).toBeGreaterThan(0)
      expect(c.feels.length).toBeGreaterThan(0)
    }
  })
})

describe('colorOf — barvy segmentů kruhu a kalendáře', () => {
  it('sousední dny uvnitř jedné fáze mají stejnou barvu', () => {
    // pojistka proti chybě, kdy se barvy přiřazovaly dokola po fázích
    expect(colorOf(1, 28)).toBe(colorOf(2, 28))
    expect(colorOf(7, 28)).toBe(colorOf(8, 28))
  })

  it('různé fáze mají různé barvy', () => {
    const unique = new Set([colorOf(1, 28), colorOf(8, 28), colorOf(14, 28), colorOf(22, 28)])
    expect(unique.size).toBe(4)
  })

  it('celý cyklus používá právě čtyři barvy, ne jednu', () => {
    const all = new Set(Array.from({ length: 28 }, (_, i) => colorOf(i + 1, 28)))
    expect(all.size).toBe(4)
  })
})
