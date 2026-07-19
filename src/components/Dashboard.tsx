import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { cycleAt, contentFor } from '../utils/cycle'
import { PHASES, FEELS } from '../data/phases'
import { Logo } from './Logo'
import { ThemeSwitch } from './ThemeSwitch'
import { CycleRing } from './CycleRing'
import { PhaseContent } from './PhaseContent'
import { PeriodLog } from './PeriodLog'
import { CalendarGrid } from './CalendarGrid'

export function Dashboard() {
  const { user, signOut } = useAuth()
  const [starts, setStarts] = useState<Date[]>([])
  const [partnerName, setPartnerName] = useState<string>()
  const [selectedDay, setSelectedDay] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [now] = useState(new Date())

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      const [startsRes, profileRes] = await Promise.all([
        supabase
          .from('period_starts')
          .select('start_date')
          .eq('user_id', user.id)
          .order('start_date', { ascending: false }),
        supabase
          .from('profiles')
          .select('partner_name')
          .eq('id', user.id)
          .single(),
      ])

      if (startsRes.data?.length) {
        const dates = startsRes.data.map((r) => new Date(r.start_date + 'T00:00:00'))
        setStarts(dates)
        const c = cycleAt(now, dates, now)
        setSelectedDay(c.day)
      }

      if (profileRes.data?.partner_name) {
        setPartnerName(profileRes.data.partner_name)
      }

      setLoading(false)
    }

    fetchData()
  }, [user, now])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--paper)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid var(--line-2)', borderTopColor: 'var(--ink)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--ink-2)' }}>Načítám...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  if (!starts.length) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: 'var(--paper)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--ink-2)', marginBottom: '16px' }}>Nemáš žádný cyklus</p>
          <a href="/onboarding" style={{ color: 'var(--ink)', textDecoration: 'underline' }}>
            Vytvořit cyklus
          </a>
        </div>
      </div>
    )
  }

  const c = cycleAt(now, starts, now)
  const content = contentFor(selectedDay, c.len, PHASES, FEELS)

  const handleAddStart = async (date: Date) => {
    if (!user) return
    const dateStr = date.toISOString().slice(0, 10)
    await supabase.from('period_starts').insert({
      user_id: user.id,
      start_date: dateStr,
    })
    setStarts([...starts, new Date(dateStr + 'T00:00:00')])
  }

  const handleDeleteStart = async (date: Date) => {
    if (!user) return
    const dateStr = date.toISOString().slice(0, 10)
    await supabase
      .from('period_starts')
      .delete()
      .eq('user_id', user.id)
      .eq('start_date', dateStr)
    setStarts(starts.filter((s) => s.toISOString().slice(0, 10) !== dateStr))
  }

  return (
    <div style={{ backgroundColor: 'var(--paper)', color: 'var(--ink)', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 20px 72px' }}>
        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '20px 0 26px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
            <Logo variant="gradient" size={34} />
            <h1 style={{ fontSize: '19px', letterSpacing: '0.15em', fontWeight: 700, fontFamily: 'var(--font-display)', margin: 0 }}>
              PEERIOD
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--ink-2)', margin: 0 }}>
              Cyklus: <b style={{ color: 'var(--ink)', fontWeight: 600 }}>{partnerName || 'Partnerky'}</b> · průměr <span style={{ fontFamily: 'monospace' }}>28</span> dní
            </p>
            <ThemeSwitch />
          </div>
        </div>

        {/* HERO */}
        <section style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: '26px 28px', display: 'grid', gridTemplateColumns: '210px 1fr', gap: '34px', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <CycleRing len={c.len} selectedDay={selectedDay} onDaySelect={setSelectedDay} today={c.day} />
          </div>
          <div>
            {selectedDay !== c.day && (
              <button
                onClick={() => setSelectedDay(c.day)}
                style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', fontSize: '13px', color: 'var(--ink-2)', cursor: 'pointer', textDecoration: 'underline', , marginBottom: '12px', display: 'block' }}
              >
                ← Zpět na dnešek
              </button>
            )}
            <PhaseContent
              title={content.stage.title}
              lede={content.stage.lede}
              tips={content.stage.tips}
              feels={content.feels}
              animated={selectedDay !== c.day}
            />
          </div>
        </section>

        {/* BIO + FEELS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '14px', fontFamily: 'var(--font-display)', fontWeight: 600, margin: 0 }}>
              Co se děje v jejím těle
            </h3>
            <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: '14px' }}>
              {content.stage.bio}
            </p>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '14px', fontFamily: 'var(--font-display)', fontWeight: 600, margin: 0 }}>
              Jak se může cítit
            </h3>
            <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', listStyle: 'none', margin: 0, padding: 0 }}>
              {content.feels.map((feel, idx) => (
                <li key={idx} style={{ fontSize: '13px', border: '1px solid var(--line-2)', borderRadius: '999px', padding: '5px 12px', color: 'var(--ink-2)' }}>
                  {feel[0]}
                  <i style={{ fontStyle: 'normal', color: 'var(--ink-3)', marginLeft: '6px', fontSize: '11px' }}>
                    {feel[1]}
                  </i>
                </li>
              ))}
            </ul>
            <p style={{ fontSize: '12.5px', color: 'var(--ink-3)', lineHeight: 1.55, marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--line)', margin: '20px 0 0 0' }}>
              Orientační, ne diagnóza. Každý cyklus je jiný — ptej se místo domýšlení.
            </p>
          </div>
        </div>

        {/* PERIOD LOG */}
        <PeriodLog starts={starts} onAdd={handleAddStart} onDelete={handleDeleteStart} onToday={() => handleAddStart(new Date())} />

        {/* CALENDAR */}
        <CalendarGrid starts={starts} onDaySelect={setSelectedDay} now={now} />

        {/* FOOTER */}
        <footer style={{ marginTop: '32px', fontSize: '12.5px', color: 'var(--ink-3)', textAlign: 'center' }}>
          <button
            onClick={signOut}
            style={{ background: 'none', border: 'none', font: 'inherit', cursor: 'pointer', color: 'var(--ink-3)', textDecoration: 'underline',  }}
          >
            Odhlásit se
          </button>
        </footer>
      </div>
    </div>
  )
}
