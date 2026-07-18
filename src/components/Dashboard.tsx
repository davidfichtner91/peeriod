import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { cycleAt, contentFor } from '../utils/cycle'
import { PHASES, FEELS } from '../data/phases'
import { DashboardHeader } from './DashboardHeader'
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
        setStarts(startsRes.data.map((r) => new Date(r.start_date + 'T00:00:00')))
        const c = cycleAt(now, startsRes.data.map((r) => new Date(r.start_date + 'T00:00:00')), now)
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--paper)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-line-2 border-t-ink rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: 'var(--ink-2)' }}>Načítám...</p>
        </div>
      </div>
    )
  }

  if (!starts.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--paper)' }}>
        <div className="text-center">
          <p style={{ color: 'var(--ink-2)' }} className="mb-4">
            Nemáš žádný cyklus
          </p>
          <a
            href="/onboarding"
            className="underline font-medium"
            style={{ color: 'var(--ink)' }}
          >
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
    const { error } = await supabase.from('period_starts').insert({
      user_id: user.id,
      start_date: dateStr,
    })
    if (!error) {
      setStarts([...starts, new Date(dateStr + 'T00:00:00')])
    }
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
    <div style={{ backgroundColor: 'var(--paper)', color: 'var(--ink)', minHeight: '100vh' }} className="font-body">
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 20px 72px' }}>
        <DashboardHeader partnerName={partnerName} starts={starts} />

        <section
          style={{
            background: 'var(--card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r)',
            padding: '26px 28px',
            display: 'grid',
            gridTemplateColumns: '210px 1fr',
            gap: '34px',
            alignItems: 'center',
            marginTop: '20px',
          }}
        >
          <div>
            <CycleRing
              len={c.len}
              selectedDay={selectedDay}
              onDaySelect={setSelectedDay}
              today={c.day}
            />
          </div>
          <div>
            <button
              onClick={() => setSelectedDay(c.day)}
              hidden={selectedDay === c.day}
              className="bg-none border-0 px-0 py-0 font-body text-sm underline cursor-pointer"
              style={{
                color: 'var(--ink-2)',
                textDecorationOffset: '3px',
                marginBottom: '12px',
              }}
            >
              ← Zpět na dnešek
            </button>
            <PhaseContent
              title={content.stage.title}
              lede={content.stage.lede}
              tips={content.stage.tips}
              feels={content.feels}
              phaseKey={content.key}
              animated={selectedDay !== c.day}
            />
          </div>
        </section>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginTop: '20px',
          }}
        >
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '14px', fontFamily: 'var(--font-display)' }}>
              Co se děje v jejím těle
            </h3>
            <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: '14px' }}>
              {content.stage.bio}
            </p>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '14px', fontFamily: 'var(--font-display)' }}>
              Jak se může cítit
            </h3>
            <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', listStyle: 'none', margin: 0, padding: 0 }}>
              {content.feels.map((feel, idx) => (
                <li
                  key={idx}
                  style={{
                    fontSize: '13px',
                    border: '1px solid var(--line-2)',
                    borderRadius: '999px',
                    padding: '5px 12px',
                    color: 'var(--ink-2)',
                  }}
                >
                  {feel[0]}
                  <i style={{ fontStyle: 'normal', color: 'var(--ink-3)', marginLeft: '6px', fontSize: '11px' }}>
                    {feel[1]}
                  </i>
                </li>
              ))}
            </ul>
            <p style={{ fontSize: '12.5px', color: 'var(--ink-3)', lineHeight: 1.55, marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
              Orientační, ne diagnóza. Každý cyklus je jiný — ptej se místo domýšlení.
            </p>
          </div>
        </div>

        <PeriodLog
          starts={starts}
          onAdd={handleAddStart}
          onDelete={handleDeleteStart}
          onToday={() => handleAddStart(new Date())}
        />

        <CalendarGrid starts={starts} onDaySelect={setSelectedDay} now={now} />

        <footer style={{ marginTop: '32px', fontSize: '12.5px', color: 'var(--ink-3)', textAlign: 'center' }}>
          <button
            onClick={signOut}
            className="bg-none border-0 font-body text-sm cursor-pointer underline"
            style={{ color: 'var(--ink-3)', textDecoration: 'underline', textDecorationColor: 'var(--ink-3)' } as any}
          >
            Odhlásit se
          </button>
        </footer>
      </div>
    </div>
  )
}
