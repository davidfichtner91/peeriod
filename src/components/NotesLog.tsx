import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { cycleAt } from '../utils/cycle'

interface Note {
  date: Date
  content: string
  phase: string
}

const iso = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

interface NotesLogProps {
  starts: Date[]
  ends?: (Date | null)[]
  now: Date
}

export function NotesLog({ starts, ends = [], now }: NotesLogProps) {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadNotes = async () => {
      if (!user) return
      setLoading(true)

      const { data } = await supabase
        .from('cycle_notes')
        .select('note_date, content')
        .eq('user_id', user.id)
        .order('note_date', { ascending: false })

      if (data) {
        const notesWithPhase: Note[] = data.map((note) => {
          const noteDate = new Date(note.note_date + 'T00:00:00')
          const cycle = cycleAt(noteDate, starts, ends, now)

          // Determine phase based on day
          let phaseName = 'Neznámé'
          if (cycle.day <= 5) phaseName = 'Menstruace'
          else if (cycle.day <= 12) phaseName = 'Folikulární'
          else if (cycle.day <= 15) phaseName = 'Ovulace'
          else phaseName = 'Luteální'

          return {
            date: noteDate,
            content: note.content,
            phase: phaseName,
          }
        })
        setNotes(notesWithPhase)
      }
      setLoading(false)
    }

    loadNotes()
  }, [user, starts, ends, now])

  if (loading || notes.length === 0) return null

  const fmt = (d: Date) => {
    const opts: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }
    return d.toLocaleDateString('cs-CZ', opts)
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <details style={{ marginTop: 0 }}>
        <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: 'var(--ink)', userSelect: 'none' }}>
          <h3 style={{ display: 'inline', margin: 0, marginRight: 8 }}>Moje poznámky</h3>
          <span style={{ color: 'var(--ink-3)' }}>({notes.length})</span>
        </summary>
        <ul
          style={{
            listStyle: 'none',
            margin: '16px 0 0',
            padding: 0,
            fontSize: '13px',
          }}
        >
          {notes.map((note, i) => (
            <li
              key={`${iso(note.date)}-${i}`}
              style={{
                paddingBottom: 12,
                marginBottom: 12,
                borderBottom: i === notes.length - 1 ? 'none' : '1px solid var(--line)',
              }}
            >
              <div style={{ display: 'flex', gap: 12, marginBottom: 6, alignItems: 'baseline' }}>
                <time
                  dateTime={iso(note.date)}
                  style={{ fontVariantNumeric: 'tabular-nums', minWidth: 100, color: 'var(--ink-3)' }}
                >
                  {fmt(note.date)}
                </time>
                <span
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-2)',
                    fontWeight: 500,
                  }}
                >
                  {note.phase}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  color: 'var(--ink-2)',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {note.content}
              </p>
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
