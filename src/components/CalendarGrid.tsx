import { useState } from 'react'
import { cycleAt, isStart, phaseFor, ORDER, PhaseKey, Phase } from '../utils/cycle'
import { PHASES } from '../data/phases'
import { Glyph } from './Glyph'

interface CalendarGridProps {
  starts: Date[]
  now: Date
  onDaySelect: (day: number) => void
}

const MONTHS = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
]
const DOW = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']

const mid = (d: Date): number =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

export function CalendarGrid({ starts, now, onDaySelect }: CalendarGridProps) {
  const [offset, setOffset] = useState(0)
  const phases = PHASES as Record<PhaseKey, Phase>

  const months = []
  for (let m = -1 + offset; m < 3 + offset; m++) {
    const first = new Date(now.getFullYear(), now.getMonth() + m, 1)
    const dim = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
    const lead = (first.getDay() + 6) % 7

    const cells = []
    for (let i = 0; i < lead; i++) {
      cells.push(<div key={`b${i}`} className="cell blank" />)
    }

    for (let d = 1; d <= dim; d++) {
      const date = new Date(first.getFullYear(), first.getMonth(), d)
      const c = cycleAt(date, starts, now)
      const phase = phaseFor(c.day, c.len)
      const startish = isStart(date, starts) || (c.predicted && c.day === 1)
      const isToday = mid(date) === mid(now)

      const cls = [
        'cell',
        c.predicted ? 'pred' : '',
        isToday ? 'today' : '',
        startish ? 'start' : '',
      ]
        .filter(Boolean)
        .join(' ')

      cells.push(
        <button
          key={d}
          className={cls}
          style={{ ['--c' as string]: phase.color }}
          onClick={() => onDaySelect(c.day)}
          aria-label={`${d}. ${MONTHS[first.getMonth()].toLowerCase()}, den ${c.day} — ${phase.name}${c.predicted ? ', předpověď' : ''}`}
        >
          <Glyph type={phase.glyph} color={phase.color} />
          <span className="num">{d}</span>
        </button>
      )
    }

    months.push(
      <div className="month" key={`${first.getFullYear()}-${first.getMonth()}`}>
        <h4>{`${MONTHS[first.getMonth()]} ${first.getFullYear()}`}</h4>
        <div className="dow">
          {DOW.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
        <div className="grid">{cells}</div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="calhead">
        <h3>Kalendář</h3>
        <ul className="legend">
          {ORDER.map((k) => (
            <li key={k}>
              <Glyph type={phases[k].glyph} color={phases[k].color} />
              {phases[k].name}
            </li>
          ))}
        </ul>
        <div className="logbar" style={{ margin: 0 }}>
          <button className="btn ghost" onClick={() => setOffset(offset - 1)} aria-label="Předchozí měsíc">‹</button>
          {offset !== 0 && (
            <button className="btn ghost" onClick={() => setOffset(0)}>Dnes</button>
          )}
          <button className="btn ghost" onClick={() => setOffset(offset + 1)} aria-label="Další měsíc">›</button>
        </div>
      </div>

      <div className="months">{months}</div>

      <p className="note">
        Plná políčka vycházejí ze zaznamenaných cyklů, čárkovaná jsou předpověď.
        Sytě vybarvený den je zaznamenaný začátek menstruace, čárkovaný rámeček
        bez výplně je předpokládaný začátek dalšího.
      </p>
    </div>
  )
}
