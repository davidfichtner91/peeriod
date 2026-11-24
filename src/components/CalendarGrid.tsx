import { useState } from 'react'
import { cycleAt, isStart, phaseFor, ORDER, PhaseKey, Phase } from '../utils/cycle'
import { PHASES } from '../data/phases'
import { Glyph } from './Glyph'
import { PhaseTooltip } from './PhaseTooltip'
import { Heart, INTIMACY_LABEL, type IntimacyKind } from './Heart'

interface CalendarGridProps {
  starts: Date[]
  ends?: (Date | null)[]
  /** klíč je lokální datum YYYY-MM-DD */
  intimacy?: Map<string, IntimacyKind>
  now: Date
  onDaySelect: (day: number) => void
  onTrackingClick?: (date: Date) => void
}

const MONTHS = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
]
const DOW = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']

const mid = (d: Date): number =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

const pad = (n: number) => String(n).padStart(2, '0')

export function CalendarGrid({ starts, ends, intimacy, now, onDaySelect, onTrackingClick }: CalendarGridProps) {
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
      const c = cycleAt(date, starts, ends, now)
      const phase = phaseFor(c.day, c.len, c.menLen)
      const startish = isStart(date, starts) || (c.predicted && c.day === 1)
      const isToday = mid(date) === mid(now)
      const heart = intimacy?.get(`${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(d)}`)

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
          onClick={() => {
            onDaySelect(c.day)
            onTrackingClick?.(date)
          }}
          aria-label={`${d}. ${MONTHS[first.getMonth()].toLowerCase()}, den ${c.day} — ${phase.name}${c.predicted ? ', předpověď' : ''}${heart ? `, ${INTIMACY_LABEL[heart].toLowerCase()}` : ''}`}
        >
          <Glyph type={phase.glyph} color={phase.color} />
          <span className="num">{d}</span>
          {heart && <Heart kind={heart} className="heart" />}
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
              <PhaseTooltip name={phases[k].name} description={phases[k].description}>
                <Glyph type={phases[k].glyph} color={phases[k].color} />
                <span>{phases[k].name}</span>
              </PhaseTooltip>
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
        {intimacy && intimacy.size > 0 && ' Plné srdíčko je sex, obrysové mazlení.'}
      </p>
    </div>
  )
}
