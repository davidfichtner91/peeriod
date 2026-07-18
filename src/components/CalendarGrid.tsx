import { cycleAt, isStart } from '../utils/cycle'
import { PHASES } from '../data/phases'
import { Glyph } from './Glyph'

interface CalendarGridProps {
  starts: Date[]
  onDaySelect: (day: number) => void
  now: Date
}

const MONTHS = [
  'Leden',
  'Únor',
  'Březen',
  'Duben',
  'Květen',
  'Červen',
  'Červenec',
  'Srpen',
  'Září',
  'Říjen',
  'Listopad',
  'Prosinec',
]

const mid = (d: Date): number =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

export function CalendarGrid({ starts, onDaySelect, now }: CalendarGridProps) {
  const months = []

  for (let m = -1; m < 3; m++) {
    const first = new Date(now.getFullYear(), now.getMonth() + m, 1)
    const dim = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
    const lead = (first.getDay() + 6) % 7

    const cells = []

    for (let i = 0; i < lead; i++) {
      cells.push(<div key={`blank-${i}`} className="aspect-square"></div>)
    }

    for (let d = 1; d <= dim; d++) {
      const date = new Date(first.getFullYear(), first.getMonth(), d)
      const c = cycleAt(date, starts, now)
      const phaseKey = Object.keys(PHASES).find((k) => {
        const phase = (PHASES as any)[k]
        return true
      })
      const p = (PHASES as any)[phaseKey]
      const startish = isStart(date, starts) || (c.predicted && c.day === 1)
      const isToday = mid(date) === mid(now)
      const isPredicted = c.predicted

      let cellClass =
        'aspect-square border border-transparent rounded-2 cursor-pointer flex items-center justify-center font-body text-sm font-body transition-transform hover:scale-107'

      if (isToday) {
        cellClass += ' border-2 border-ink font-bold'
      }

      if (startish && !isPredicted) {
        cellClass += ' font-bold'
      }

      if (startish && isPredicted) {
        cellClass += ' border border-dashed font-bold'
      }

      if (isPredicted && !startish) {
        cellClass += ' border border-dashed'
      }

      return (
        <button
          key={d}
          onClick={() => onDaySelect(c.day)}
          className={cellClass}
          style={{
            backgroundColor: isPredicted
              ? `color-mix(in srgb, ${p.color} ${9}%, transparent)`
              : `color-mix(in srgb, ${p.color} ${24}%, transparent)`,
            color: startish && !isPredicted ? 'var(--on-fill)' : 'var(--ink)',
          }}
          aria-label={`${d}. ${MONTHS[first.getMonth()].toLowerCase()}, den ${c.day}`}
        >
          <div className="flex items-center justify-center gap-1">
            {!startish && (
              <Glyph
                type={p.glyph}
                color={p.color}
                className="absolute top-0.75 right-0.75"
              />
            )}
            <span className="tnum">{d}</span>
          </div>
        </button>
      )
    }

    months.push(
      <div key={m} className="pb-1">
        <h4 className="text-xs font-bold tracking-widest text-ink-2 mb-3">
          {MONTHS[first.getMonth()]} {first.getFullYear()}
        </h4>
        <div className="flex gap-1 mb-1">
          {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map((day) => (
            <span
              key={day}
              className="w-1/7 text-center text-xs uppercase tracking-widest text-ink-3"
            >
              {day}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{cells}</div>
      </div>
    )
  }

  return (
    <div className="border border-line rounded-3.5 p-6 mt-5">
      <h3 className="text-base font-bold mb-5.5">Kalendář</h3>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(65,1fr))] gap-7">
        {months}
      </div>
      <p className="text-xs text-ink-3 mt-5 pt-4 border-t border-line">
        Plná políčka vycházejí ze zaznamenaných cyklů, čárkovaná jsou předpověď.
        Sytě vybarvený den je zaznamenaný začátek menstruace, čárkovaný rámeček
        bez výplně je předpokládaný začátek dalšího.
      </p>
    </div>
  )
}
