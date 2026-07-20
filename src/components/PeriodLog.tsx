import { useState } from 'react'
import { avgLen, intervals, isOutlier, MIN_LEN, MAX_LEN } from '../utils/cycle'
import { DatePicker } from './DatePicker'

interface PeriodLogProps {
  starts: Date[]
  ends?: (Date | null)[]
  onAdd: (date: Date) => void
  onDelete: (date: Date) => void
  onEndAdd?: (startDate: Date, endDate: Date) => void
}

const fmt = (d: Date) => `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`
const iso = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

interface RenderLogItemProps {
  d: Date
  i: number
  sorted: Date[]
  ends: (Date | null)[]
  endingDate: string | null
  endingStart: Date | null
  setEndingDate: (date: string | null) => void
  setEndingStart: (date: Date | null) => void
  onDelete: (date: Date) => void
  onEndAdd?: (startDate: Date, endDate: Date) => void
}

function RenderLogItem({
  d, i, sorted, ends, endingDate, endingStart, setEndingDate, setEndingStart, onDelete, onEndAdd,
}: RenderLogItemProps) {
  const prev = sorted[i + 1]
  const n = prev ? Math.round((d.getTime() - prev.getTime()) / 864e5) : null
  const endDate = ends[i]
  const hasEnd = endDate !== null && endDate !== undefined
  const dayLen = hasEnd ? Math.round((endDate.getTime() - d.getTime()) / 864e5) : null
  const isEditing = endingStart?.getTime() === d.getTime()

  return (
    <div key={iso(d)}>
      <li style={{ opacity: hasEnd ? 0.9 : 1 }}>
        <time dateTime={iso(d)}>{fmt(d)}</time>
        <span className="len">
          {hasEnd ? (
            <>
              {fmt(endDate)} <span style={{ fontSize: '12px', color: 'var(--ink-3)' }}>({dayLen}d)</span>
            </>
          ) : (
            n === null ? 'první záznam' : `cyklus ${n} dní`
          )}
        </span>
        {n !== null && isOutlier(n) && !hasEnd && (
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

      {!hasEnd && !isEditing && (
        <div className="logbar" style={{ margin: '8px 0' }}>
          <button className="btn" onClick={() => {
            setEndingDate(iso(d))
            setEndingStart(d)
          }}>
            Zaznamenat konec
          </button>
          <button className="btn ghost" onClick={() => {
            onEndAdd?.(d, new Date())
          }}>
            Skončilo dnes
          </button>
        </div>
      )}

      {isEditing && (
        <div className="logbar" style={{ margin: '8px 0' }}>
          <div style={{ minWidth: 200 }}>
            <DatePicker
              id={`end-date-${iso(d)}`}
              value={endingDate || iso(new Date())}
              onChange={setEndingDate}
            />
          </div>
          <button className="btn" onClick={() => {
            if (endingDate) {
              onEndAdd?.(d, new Date(endingDate + 'T00:00:00'))
              setEndingDate(null)
              setEndingStart(null)
            }
          }}>
            OK
          </button>
          <button className="btn ghost" onClick={() => {
            setEndingDate(null)
            setEndingStart(null)
          }}>
            Zrušit
          </button>
        </div>
      )}

      {hasEnd && !isEditing && (
        <div className="logbar" style={{ margin: '8px 0' }}>
          <button className="btn ghost" onClick={() => {
            setEndingDate(iso(endDate))
            setEndingStart(d)
          }}>
            Upravit konec
          </button>
        </div>
      )}
    </div>
  )
}

export function PeriodLog({ starts, ends = [], onAdd, onDelete, onEndAdd }: PeriodLogProps) {
  const [value, setValue] = useState(iso(new Date()))
  const [endingDate, setEndingDate] = useState<string | null>(null)
  const [endingStart, setEndingStart] = useState<Date | null>(null)
  const [showOlder, setShowOlder] = useState(false)

  const sorted = [...starts].sort((a, b) => b.getTime() - a.getTime())
  const latest = sorted[0]
  const older = sorted.slice(1)
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

      <p className="note note--plain" style={{ fontSize: '13px', marginBottom: 12 }}>
        Průměr: <b>{avgLen(starts)} dní</b> · Rozptyl: <b>{spread}</b> · Záznamů: <b>{starts.length}</b>
        {skipped > 0 && ` · Mimo průměr: ${skipped}`}
      </p>

      {latest && (
        <div style={{ marginBottom: 16 }}>
          <ul className="log">
            <RenderLogItem
              d={latest}
              i={0}
              sorted={sorted}
              ends={ends}
              endingDate={endingDate}
              endingStart={endingStart}
              setEndingDate={setEndingDate}
              setEndingStart={setEndingStart}
              onDelete={onDelete}
              onEndAdd={onEndAdd}
            />
          </ul>
        </div>
      )}

      {older.length > 0 && (
        <details style={{ marginTop: 16 }} open={showOlder} onChange={(e) => setShowOlder(e.currentTarget.open)}>
          <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: 'var(--ink)', marginBottom: 12, userSelect: 'none' }}>
            Starší záznamy ({older.length})
          </summary>
          <ul className="log">
            {older.map((d, i) => (
              <RenderLogItem
                key={iso(d)}
                d={d}
                i={i + 1}
                sorted={sorted}
                ends={ends}
                endingDate={endingDate}
                endingStart={endingStart}
                setEndingDate={setEndingDate}
                setEndingStart={setEndingStart}
                onDelete={onDelete}
                onEndAdd={onEndAdd}
              />
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
