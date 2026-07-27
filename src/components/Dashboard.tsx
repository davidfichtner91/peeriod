import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { cycleAt, contentFor, avgLen, intervals, isOutlier } from '../utils/cycle'
import { phaseRecommendations } from '../data/phaseRecommendations'
import { Logo } from './Logo'
import { ThemeSwitch } from './ThemeSwitch'
import { CycleRing } from './CycleRing'
import { PhaseContent } from './PhaseContent'
import { CalendarGrid } from './CalendarGrid'
import { DayTrackingModal } from './DayTrackingModal'
import { NotesLog } from './NotesLog'

const isoOf = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function Dashboard() {
  const { user, signOut } = useAuth()
  const [starts, setStarts] = useState<Date[]>([])
  const [ends, setEnds] = useState<(Date | null)[]>([])
  const [partnerName, setPartnerName] = useState<string>()
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(true)
  const now = new Date()
  const [trackingDate, setTrackingDate] = useState<Date | null>(null)
  const [allNotes, setAllNotes] = useState<Array<{ date: Date; content: string }>>([])


  useEffect(() => {
    const load = async () => {
      if (!user) return
      const [startsRes, profileRes, notesRes] = await Promise.all([
        supabase
          .from('period_starts')
          .select('start_date, end_date')
          .eq('user_id', user.id)
          .order('start_date', { ascending: false }),
        supabase.from('profiles').select('partner_name').eq('id', user.id).maybeSingle(),
        supabase
          .from('cycle_notes')
          .select('note_date, content')
          .eq('user_id', user.id)
          .order('note_date', { ascending: true }),
      ])

      if (startsRes.data?.length) {
        const startDates = startsRes.data.map((r) => new Date(r.start_date + 'T00:00:00'))
        const endDates = startsRes.data.map((r) => r.end_date ? new Date(r.end_date + 'T00:00:00') : null)
        setStarts(startDates)
        setEnds(endDates)
      }

      if (!profileRes.error && profileRes.data?.partner_name) {
        setPartnerName(profileRes.data.partner_name)
      }

      if (notesRes.data) {
        const notes = notesRes.data.map((n) => ({
          date: new Date(n.note_date + 'T00:00:00'),
          content: n.content,
        }))
        setAllNotes(notes)
      }

      setLoading(false)
    }
    load()
  }, [user])

  const addStart = async (date: Date) => {
    if (!user) return
    const dateStr = isoOf(date)
    const { error } = await supabase
      .from('period_starts')
      .insert({ user_id: user.id, start_date: dateStr })
    if (!error) {
      setStarts([...starts, new Date(dateStr + 'T00:00:00')])
      setEnds([...ends, null])
      setSelectedDay(null)
    }
  }

  const addEnd = async (startDate: Date, endDate: Date) => {
    if (!user) return
    const startStr = isoOf(startDate)
    const endStr = isoOf(endDate)
    const { error } = await supabase
      .from('period_starts')
      .update({ end_date: endStr })
      .eq('user_id', user.id)
      .eq('start_date', startStr)
    if (!error) {
      const idx = starts.findIndex((s) => isoOf(s) === startStr)
      if (idx !== -1) {
        const newEnds = [...ends]
        newEnds[idx] = new Date(endStr + 'T00:00:00')
        setEnds(newEnds)
      }
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <p style={{ color: 'var(--ink-2)' }}>Načítám…</p>
      </div>
    )
  }

  if (!starts.length) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--ink-2)', marginBottom: 16 }}>
            Zatím tu není žádný záznam.
          </p>
          <a href="/onboarding" style={{ color: 'var(--ink)' }}>
            Zadat začátek menstruace
          </a>
        </div>
      </div>
    )
  }

  const current = cycleAt(now, starts, ends, now)
  const day = selectedDay ?? current.day
  const content = contentFor(day, current.len, current.menLen)
  const isToday = day === current.day

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="wrap">
        <header className="bar">
          <div className="brand">
            <Logo variant="gradient" size={34} />
            <h1>Peeriod</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <p className="who">
              Cyklus: <b>{partnerName || 'partnerky'}</b> ·{' '}
              <span className="tnum">průměr {avgLen(starts)} dní</span>
            </p>
            <ThemeSwitch />
          </div>
        </header>

        <section className="hero">
          <CycleRing
            len={current.len}
            menLen={current.menLen}
            selectedDay={day}
            today={current.day}
            onDaySelect={(d) => {
              setDragging(true)
              setSelectedDay(d === current.day ? null : d)
              window.setTimeout(() => setDragging(false), 0)
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {!isToday && (
              <button className="back" onClick={() => setSelectedDay(null)}>
                ← Zpět na dnešek
              </button>
            )}
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: 8 }}>
              <PhaseContent
                eyebrow={
                  isToday
                    ? `Dnes · ${content.phase.name}`
                    : `Den ${day} · ${content.phase.name} (${content.from}.–${content.to}. den)`
                }
                title={content.stage.title}
                lede={content.stage.lede}
                tips={content.stage.tips}
                fadeKey={content.stage.title}
                animate={!dragging}
                phaseKey={content.key}
                recommendations={phaseRecommendations[content.key]}
                cycleDay={day}
                allNotes={allNotes}
                starts={starts}
              />
            </div>
          </div>
        </section>

        <div className="cols">
          <div className="card">
            <h3>Co se děje v jejím těle</h3>
            <p>{content.stage.bio}</p>
          </div>

          <div className="card">
            <h3>Jak se může cítit</h3>
            <ul className="chips">
              {content.feels.map((f) => (
                <li className="chip" key={f[0]}>
                  {f[0]}
                  <i>{f[1]}</i>
                </li>
              ))}
            </ul>
            <p className="note">
              Orientační, ne diagnóza. Každý cyklus je jiný — ptej se místo domýšlení.
            </p>
          </div>
        </div>

        {/* Stats card */}
        {(() => {
          const iv = intervals(starts)
          const used = iv.filter((n) => !isOutlier(n))
          const spread = used.length > 1 ? `${Math.min(...used)}–${Math.max(...used)}` : '—'

          // Calculate menstruation lengths only for completed periods (those with end_date)
          const completedPeriods = starts
            .map((start, i) => ({ start, end: ends[i], i }))
            .filter((p) => p.end !== null && p.end !== undefined)
          const menLengths = completedPeriods.map((p) => Math.round((p.end!.getTime() - p.start.getTime()) / 864e5))
          const menAvg = menLengths.length > 0 ? Math.round(menLengths.reduce((a, b) => a + b, 0) / menLengths.length) : null

          const fmt = (d: Date) => `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`

          return (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3>Přehled</h3>
              <div className="stats">
                <div className="stat">
                  <b className="tnum">{avgLen(starts)}</b>
                  <span>průměrná délka cyklu (dní)</span>
                </div>
                <div className="stat">
                  <b className="tnum">{spread}</b>
                  <span>rozptyl (dní)</span>
                </div>
                <div className="stat">
                  <b className="tnum">{starts.length}</b>
                  <span>záznamů</span>
                </div>
                {menAvg && (
                  <div className="stat">
                    <b className="tnum">{menAvg}</b>
                    <span>průměrná délka menstruace (dní)</span>
                  </div>
                )}
              </div>

              {starts.length > 0 && (
                <details style={{ marginTop: 16 }}>
                  <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: 'var(--ink)', userSelect: 'none' }}>
                    Všechny záznamy ({starts.length})
                  </summary>
                  <ul className="log" style={{ marginTop: 12 }}>
                    {[...starts].reverse().map((start, i) => {
                      const idx = starts.length - 1 - i
                      const end = ends[idx]
                      const len = end ? Math.round((end.getTime() - start.getTime()) / 864e5) : null
                      return (
                        <li key={isoOf(start)} style={{ opacity: end ? 0.9 : 0.6 }}>
                          <time dateTime={isoOf(start)}>{fmt(start)}</time>
                          <span className="len">
                            {end ? (
                              <>
                                {fmt(end)} <span style={{ fontSize: '12px', color: 'var(--ink-3)' }}>({len}d)</span>
                              </>
                            ) : (
                              <span style={{ fontStyle: 'italic', color: 'var(--ink-3)' }}>čeká na konec</span>
                            )}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </details>
              )}
            </div>
          )
        })()}

        <NotesLog starts={starts} ends={ends} now={now} />

        <CalendarGrid
          starts={starts}
          ends={ends}
          now={now}
          onDaySelect={(d) => setSelectedDay(d === current.day ? null : d)}
          onTrackingClick={setTrackingDate}
        />

        {/* FOOTER */}
        <footer style={{ marginTop: '32px', fontSize: '12.5px', color: 'var(--ink-3)', textAlign: 'center' }}>
          <a href="/settings" style={{ color: 'var(--ink-3)', textDecoration: 'underline', marginRight: '16px' }}>
            Upravit nastavení
          </a>
          <button
            onClick={signOut}
            style={{ background: 'none', border: 'none', font: 'inherit', cursor: 'pointer', color: 'var(--ink-3)', textDecoration: 'underline' }}
          >
            Odhlásit se
          </button>
        </footer>
      </div>

      {trackingDate && (
        <DayTrackingModal
          date={trackingDate}
          onClose={() => setTrackingDate(null)}
          onSave={() => setTrackingDate(null)}
          starts={starts}
          ends={ends}
          onPeriodStart={addStart}
          onPeriodEnd={addEnd}
        />
      )}
    </div>
  )
}
