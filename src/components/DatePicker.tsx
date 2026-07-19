import { useEffect, useRef, useState } from 'react'

interface DatePickerProps {
  /** vybrané datum ve tvaru YYYY-MM-DD */
  value: string
  onChange: (value: string) => void
  /** nedovolí zvolit datum v budoucnosti */
  maxToday?: boolean
  id?: string
  label?: string
}

const MONTHS = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
]
const DOW = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']

const pad = (n: number) => String(n).padStart(2, '0')
const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const fromIso = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}
const mid = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
const fmt = (d: Date) => `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`

export function DatePicker({
  value,
  onChange,
  maxToday = true,
  id,
  label,
}: DatePickerProps) {
  const today = new Date()
  const selected = value ? fromIso(value) : today

  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1))
  const wrapRef = useRef<HTMLDivElement>(null)

  // zavření kliknutím vedle nebo Escapem
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const openPicker = () => {
    setView(new Date(selected.getFullYear(), selected.getMonth(), 1))
    setOpen(true)
  }

  const pick = (d: Date) => {
    onChange(toIso(d))
    setOpen(false)
  }

  // 42 buněk = 6 týdnů, aby výška okna neposkakovala mezi měsíci
  const first = new Date(view.getFullYear(), view.getMonth(), 1)
  const lead = (first.getDay() + 6) % 7
  const start = new Date(first)
  start.setDate(1 - lead)

  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })

  return (
    <div className="dpwrap" ref={wrapRef}>
      {label && <label htmlFor={id}>{label}</label>}

      <button
        type="button"
        id={id}
        className="dpfield"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => (open ? setOpen(false) : openPicker())}
      >
        <span>{value ? fmt(selected) : 'Vyber datum'}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M3 10h18" />
        </svg>
      </button>

      {open && (
        <div className="dp" role="dialog" aria-label="Výběr data">
          <div className="dphead">
            <button
              type="button"
              className="dpnav"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
              aria-label="Předchozí měsíc"
            >
              ‹
            </button>
            <b>{`${MONTHS[view.getMonth()]} ${view.getFullYear()}`}</b>
            <button
              type="button"
              className="dpnav"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
              aria-label="Další měsíc"
            >
              ›
            </button>
          </div>

          <div className="dpdow">
            {DOW.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div className="dpgrid">
            {days.map((d) => {
              const out = d.getMonth() !== view.getMonth()
              const disabled = maxToday && mid(d) > mid(today)
              const cls = [
                'dpday',
                out ? 'out' : '',
                mid(d) === mid(today) ? 'today' : '',
                value && mid(d) === mid(selected) ? 'sel' : '',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <button
                  type="button"
                  key={toIso(d)}
                  className={cls}
                  disabled={disabled}
                  onClick={() => pick(d)}
                  aria-label={fmt(d)}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>

          <div className="dpfoot">
            <button type="button" className="dplink" onClick={() => pick(today)}>
              Dnes
            </button>
            {maxToday && <span className="note--plain" style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>
              Budoucí data nelze zvolit
            </span>}
          </div>
        </div>
      )}
    </div>
  )
}
