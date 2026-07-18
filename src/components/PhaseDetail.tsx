import { calculateCycleInfo, PHASE_DATA, type CyclePhase } from '../utils/cycle'

interface PhaseDetailProps {
  phase: CyclePhase
  dayOfCycle: number
  selectedDate: Date | null
  startDate: string
  cycleLength: number
}

export function PhaseDetail({
  selectedDate,
  startDate,
  cycleLength,
}: PhaseDetailProps) {
  let phase: CyclePhase
  let dayOfCycle: number

  if (selectedDate) {
    const cycleInfo = calculateCycleInfo(startDate, cycleLength, selectedDate)
    phase = cycleInfo.phase
    dayOfCycle = cycleInfo.dayOfCycle
  } else {
    const cycleInfo = calculateCycleInfo(startDate, cycleLength)
    phase = cycleInfo.phase
    dayOfCycle = cycleInfo.dayOfCycle
  }

  const phaseData = PHASE_DATA[phase]

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 sticky top-8">
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">{phaseData.emoji}</div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          {phaseData.name}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Den {dayOfCycle} (Fáze: {phaseData.dayRange})
        </p>
      </div>

      <div className="space-y-6">
        {/* Co se děje */}
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">
            Co se děje biologicky?
          </h4>
          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            {phaseData.whatHappens}
          </p>
        </div>

        {/* Jak se cítí */}
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">
            Jak se cítí?
          </h4>
          <ul className="space-y-1">
            {phaseData.howSheFeel.map((feel, idx) => (
              <li key={idx} className="text-slate-700 dark:text-slate-300 text-sm">
                • {feel}
              </li>
            ))}
          </ul>
        </div>

        {/* Tipy */}
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">
            💡 Jak jí pomoci?
          </h4>
          <ul className="space-y-2">
            {phaseData.tips.map((tip, idx) => (
              <li key={idx} className="text-slate-700 dark:text-slate-300 text-sm">
                ✓ {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Education link */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <a
            href="/learn"
            className="inline-block text-purple-600 dark:text-purple-400 hover:underline text-sm font-medium"
          >
            Víc o cyklu →
          </a>
        </div>
      </div>
    </div>
  )
}
