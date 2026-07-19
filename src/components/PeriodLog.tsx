import { useState } from 'react'
import { avgLen, intervals, isOutlier, MIN_LEN, MAX_LEN } from '../utils/cycle'
import { DatePicker } from './DatePicker'

interface PeriodLogProps {
  starts: Date[]
  onAdd: (date: Date) => void
  onDelete: (date: Date) => void
}

const fmt = (d: Date) => `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`
const iso = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function PeriodLog({ starts, onAdd, onDelete }: PeriodLogProps) {
  const [value, setValue] = useState(iso(new Date()))

  const sorted = [...starts].sort((a, b) => b.getTime() - a.getTime())
  const iv = intervals(starts)
  const used = iv.filter((n) => !isOutlier(n))
  const skipped = iv.length - used.length
  const spread = used.length > 1 ? `${Math.min(...used)}–${Math.max(...used)}` : '—'

  const add = (d: Date) => {
    if (isNaN(d.getTime())) return
    if (starts.some((s) => iso(s) === iso(d))) return
    onAdd(d)
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <h3>Záznamy menstruace</h3>
      <p className="note note--plain">
        Každý zadaný začátek přepočítá předpověď. Průměr se počítá z posledních
        šesti cyklů v rozsahu {MIN_LEN}–{MAX_LEN} dní.
      </p>

      <div className="logbar">
        <div style={{ minWidth: 200 }}>
          <DatePicker
            id="periodlog-date"
            value={value}
            onChange={setValue}
          />
        </div>
        <button className="btn" onClick={() => add(new Date(value + 'T00:00:00'))}>
          Zaznamenat začátek
        </button>
        <button className="btn ghost" onClick={() => add(new Date())}>
          Začalo dnes
        </button>
      </div>

      <div className="stats">
        <div className="stat">
          <b className="tnum">{avgLen(starts)}</b>
          <span>průměrná délka</span>
        </div>
        <div className="stat">
          <b className="tnum">{spread}</b>
          <span>rozptyl (dní)</span>
        </div>
        <div className="stat">
          <b className="tnum">{starts.length}</b>
          <span>záznamů</span>
        </div>
        {skipped > 0 && (
          <div className="stat">
            <b className="tnum">{skipped}</b>
            <span>mimo průměr</span>
          </div>
        )}
      </div>

      <ul className="log">
        {sorted.map((d, i) => {
          const prev = sorted[i + 1]
          const n = prev
            ? Math.round((d.getTime() - prev.getTime()) / 864e5)
            : null
          return (
            <li key={iso(d)}>
              <time dateTime={iso(d)}>{fmt(d)}</time>
              <span className="len">
                {n === null ? 'první záznam' : `cyklus ${n} dní`}
              </span>
              {n !== null && isOutlier(n) && (
                <span
                  className="flag"
                  title={`Mimo rozsah ${MIN_LEN}–${MAX_LEN} dní, do průměru se nepočítá`}
                >
                  mimo průměr
                </span>
              )}
              <button className="del" onClick={() => onDelete(d)}>
                Smazat
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
