export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal'

export interface CycleInfo {
  phase: CyclePhase
  dayOfCycle: number
  phaseStartDay: number
  phaseEndDay: number
  percentThroughPhase: number
}

export interface PhaseData {
  name: string
  color: string
  emoji: string
  dayRange: string
  whatHappens: string
  howSheFeel: string[]
  tips: string[]
  sexTips?: string[]
}

export const PHASE_DATA: Record<CyclePhase, PhaseData> = {
  menstrual: {
    name: 'Menstruace',
    color: 'bg-menstrual',
    emoji: '🩸',
    dayRange: '1–5',
    whatHappens:
      'Klesající estrogen a progesteron. Tělo se vyprazdňuje. Fyzická únava, někdy bolest. Hormonální nálada.',
    howSheFeel: [
      'Energeticky nižší',
      'Občas depresivnější',
      'Více potřebuje samotu',
      'Bolest (různá intenzita)',
    ],
    tips: [
      'Vyjádři empatii bez vědeckého vysvětlování',
      'Neplánuj velké akce či rozhovory',
      'Zeptej se: "Jak se cítíš? Co ti pomůže?"',
      'Nabídni domácí pohodlí, teplo',
      'Fyzická blízkost (ne sex) je OK, pokud ona chce',
    ],
  },
  follicular: {
    name: 'Folikulární',
    color: 'bg-follicular',
    emoji: '⚡',
    dayRange: '6–13',
    whatHappens:
      'Rostoucí estrogen. Mozek je aktivní, tělo je silné. Sebevědomí roste. Energetický vzestup.',
    howSheFeel: [
      'Optimistická',
      'Sociální',
      'Motivovaná',
      'Fyzicky silnější',
      'Sebevědomá',
    ],
    tips: [
      'Plánuj nové projekty, výzvy, dobrodružství',
      'Podpoř její ambice a nápady',
      'Sex/blízkost: její libido stoupá',
      'Zvij ji na společenské akce',
      'Jednoduše si užij její energii!',
    ],
  },
  ovulation: {
    name: 'Ovulace',
    color: 'bg-ovulation',
    emoji: '💥',
    dayRange: '14–15',
    whatHappens:
      'Špička estrogenů, vrchol LH. Testosteron také mírně stoupá. Fyzická a mentální kondice na vrcholu. Nejvyšší sexuální přitažlivost.',
    howSheFeel: [
      'Nejpevnější',
      'Nejsexy',
      'Nejodvážnější',
      'Nejcharismatičtější',
      'Fyzicky nejsilnější',
    ],
    tips: [
      'Nejlepší čas pro sex – máte oba nejvyšší libido',
      'Urbi ji k něčemu fyzicky náročnému',
      'Fyzická přitažlivost je oboustranná – užijte si to',
      'Romantika + vášeň funguje teď nejlépe',
      'Buď sebevědomý – ona tě teď vidí nejvíc atraktivního',
    ],
  },
  luteal: {
    name: 'Luteální',
    color: 'bg-luteal',
    emoji: '🌙',
    dayRange: '16–28',
    whatHappens:
      'Progesteron stoupá. Usedlost, klidnost. Energie klesá. Někdy se objevuje napětí či dráždivost (PMS). Je to normální – není to o tobě!',
    howSheFeel: [
      'Méně sociální',
      'Introvertní',
      'Více emoční',
      'Někdy dráždivá',
      'Potřebuje více klidu',
    ],
    tips: [
      'Vypořádej se s její "introvertností" – není to zaměřeno na tebe',
      'Přijmi jejího prostor bez osobního orachu',
      'Pokud je dráždivá: "Vidím, že máš složitý týden. Jak ti pomůžu?"',
      'Fyzické cvičení a zde jí pomáhá – podpoř ji',
      'Menší plány, větší pohodlí',
    ],
  },
}

export function calculateCycleInfo(
  startDate: string | Date,
  cycleLength: number,
  referenceDate: string | Date = new Date()
): CycleInfo {
  const start = new Date(startDate)
  const reference = new Date(referenceDate)

  // Dny od začátku
  const diffTime = reference.getTime() - start.getTime()
  const daysSinceStart = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  // Zjisti který den cyklu (1-based)
  const dayOfCycle = (daysSinceStart % cycleLength) + 1

  // Fáze
  let phase: CyclePhase
  let phaseStartDay: number
  let phaseEndDay: number

  if (dayOfCycle <= 5) {
    phase = 'menstrual'
    phaseStartDay = 1
    phaseEndDay = 5
  } else if (dayOfCycle <= 13) {
    phase = 'follicular'
    phaseStartDay = 6
    phaseEndDay = 13
  } else if (dayOfCycle <= 15) {
    phase = 'ovulation'
    phaseStartDay = 14
    phaseEndDay = 15
  } else {
    phase = 'luteal'
    phaseStartDay = 16
    phaseEndDay = cycleLength
  }

  const phaseDayRange = phaseEndDay - phaseStartDay + 1
  const daysIntoPhase = dayOfCycle - phaseStartDay + 1
  const percentThroughPhase = Math.round((daysIntoPhase / phaseDayRange) * 100)

  return {
    phase,
    dayOfCycle,
    phaseStartDay,
    phaseEndDay,
    percentThroughPhase,
  }
}

export function getNextCycleStart(
  startDate: string | Date,
  cycleLength: number
): Date {
  const start = new Date(startDate)
  const now = new Date()
  const diffTime = now.getTime() - start.getTime()
  const daysSinceStart = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const cyclesSinceStart = Math.floor(daysSinceStart / cycleLength)
  const nextCycleStart = new Date(start)
  nextCycleStart.setDate(start.getDate() + (cyclesSinceStart + 1) * cycleLength)
  return nextCycleStart
}

export function getDaysUntilMenstruation(
  startDate: string | Date,
  cycleLength: number
): number {
  const info = calculateCycleInfo(startDate, cycleLength)
  return cycleLength - info.dayOfCycle + 1
}
