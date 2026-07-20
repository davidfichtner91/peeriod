import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { cycleAt, contentFor, avgLen, avgPeriodLen } from '../utils/cycle'
import { Logo } from './Logo'
import { ThemeSwitch } from './ThemeSwitch'
import { CycleRing } from './CycleRing'
import { PhaseContent } from './PhaseContent'
import { PeriodLog } from './PeriodLog'
import { CalendarGrid } from './CalendarGrid'
import { DayTrackingModal } from './DayTrackingModal'

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
  const [now] = useState(() => new Date())
  const [trackingDate, setTrackingDate] = useState<Date | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      const [startsRes, profileRes] = await Promise.all([
        supabase
          .from('period_starts')
          .select('start_date, end_date')
          .eq('user_id', user.id)
          .order('start_date', { ascending: false }),
        supabase.from('profiles').select('partner_name').eq('id', user.id).maybeSingle(),
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

  const deleteStart = async (date: Date) => {
    if (!user) return
    const dateStr = isoOf(date)
    const { error } = await supabase
      .from('period_starts')
      .delete()
      .eq('user_id', user.id)
      .eq('start_date', dateStr)
    if (!error) {
      const idx = starts.findIndex((s) => isoOf(s) === dateStr)
      const newStarts = starts.filter((s) => isoOf(s) !== dateStr)
      const newEnds = ends.filter((_, i) => i !== idx)
      setStarts(newStarts)
      setEnds(newEnds)
      setSelectedDay(null)
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

  const current = cycleAt(now, starts, now)
  const periodLen = avgPeriodLen(starts, ends.map(e => e || undefined))
  const day = selectedDay ?? current.day
  const content = contentFor(day, current.len, periodLen)
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
            selectedDay={day}
            today={current.day}
            onDaySelect={(d) => {
              setDragging(true)
              setSelectedDay(d === current.day ? null : d)
              window.setTimeout(() => setDragging(false), 0)
            }}
          />

          <div>
            {!isToday && (
              <button className="back" onClick={() => setSelectedDay(null)}>
                ← Zpět na dnešek
              </button>
            )}
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
            />
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

        <PeriodLog
          starts={starts}
          ends={ends}
          onAdd={addStart}
          onDelete={deleteStart}
          onEndAdd={addEnd}
        />

        <CalendarGrid
          starts={starts}
          now={now}
          onDaySelect={(d) => setSelectedDay(d === current.day ? null : d)}
          onTrackingClick={setTrackingDate}
          periodLen={periodLen}
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
        />
      )}
    </div>
  )
}
