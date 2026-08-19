import { useEffect, useRef, useState } from 'react'
import type { Pair, PhaseKey } from '../utils/cycle'
import type { PhaseActivities } from '../data/phaseRecommendations'
import { getNotesForCycleDay, getSymptomPatterns } from '../utils/noteAnalysis'

/** „Minulý cyklus sis…" zní líp než „Před 1 cyklem sis…" */
function agoLabel(cyclesAgo: number): string {
  if (cyclesAgo === 1) return 'Minulý cyklus sis v tenhle den poznamenal'
  if (cyclesAgo === 2) return 'Předminulý cyklus sis v tenhle den poznamenal'
  return `Před ${cyclesAgo} cykly sis v tenhle den poznamenal`
}

interface PhaseContentProps {
  eyebrow: string
  title: string
  lede: string
  tips: Pair[]
  /** klíč, jehož změna spustí fade — typicky vybraný den */
  fadeKey: number | string
  /** během tažení po kruhu fade vypnout, jinak to bliká */
  animate?: boolean
  phaseKey?: PhaseKey
  recommendations?: PhaseActivities
  cycleDay?: number
  allNotes?: Array<{ date: Date; content: string }>
  allSymptoms?: Array<{ date: Date; symptom: string }>
  starts?: Date[]
  ends?: (Date | null)[]
}

export function PhaseContent({
  eyebrow,
  title,
  lede,
  tips,
  fadeKey,
  animate = true,
  phaseKey,
  recommendations,
  cycleDay,
  allNotes = [],
  allSymptoms = [],
  starts = [],
  ends,
}: PhaseContentProps) {
  const [out, setOut] = useState(false)
  const [tab, setTab] = useState<'feelings' | 'activities'>('feelings')
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (!animate) return
    setOut(true)
    const t = setTimeout(() => setOut(false), 150)
    return () => clearTimeout(t)
  }, [fadeKey, animate])

  const noteInsight = cycleDay ? getNotesForCycleDay(cycleDay, starts, allNotes, ends) : null
  const patterns = phaseKey ? getSymptomPatterns(phaseKey, starts, allSymptoms, ends) : []

  return (
    <div className={`fade${out ? ' out' : ''}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="lede">{lede}</p>

      {(noteInsight || patterns.length > 0) && (
        <div className="recall">
          {noteInsight && (
            <div className="recall-note">
              <p className="eyebrow">{agoLabel(noteInsight.cyclesAgo)}</p>
              <blockquote>{noteInsight.content}</blockquote>
            </div>
          )}

          {patterns.length > 0 && (
            <div className="recall-symptoms">
              <p className="eyebrow">Co se u ní v téhle fázi opakuje</p>
              <ul>
                {patterns.map((p) => (
                  <li key={p.symptom}>
                    <span>{p.symptom}</span>
                    <b className="tnum">
                      {p.cycles} z {p.tracked} cyklů
                    </b>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tab navigation */}
      {recommendations && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, borderBottom: '1px solid var(--line)', paddingBottom: 0 }}>
          <button
            onClick={() => setTab('feelings')}
            style={{
              background: 'none',
              border: 'none',
              padding: '12px 0',
              fontSize: '14px',
              fontWeight: tab === 'feelings' ? 600 : 500,
              color: tab === 'feelings' ? 'var(--ink)' : 'var(--ink-2)',
              cursor: 'pointer',
              borderBottom: tab === 'feelings' ? '2px solid var(--accent)' : 'none',
              marginBottom: '-1px',
            }}
          >
            Co dnes pomůže
          </button>
          <button
            onClick={() => setTab('activities')}
            style={{
              background: 'none',
              border: 'none',
              padding: '12px 0',
              fontSize: '14px',
              fontWeight: tab === 'activities' ? 600 : 500,
              color: tab === 'activities' ? 'var(--ink)' : 'var(--ink-2)',
              cursor: 'pointer',
              borderBottom: tab === 'activities' ? '2px solid var(--accent)' : 'none',
              marginBottom: '-1px',
            }}
          >
            Aktivity & Potraviny
          </button>
        </div>
      )}

      {/* Tab content */}
      {tab === 'feelings' && (
        <>
          <p className="eyebrow">Co dnes pomůže</p>
          <ul className="tips">
            {tips.map((t, i) => (
              <li key={t[0]}>
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <b>{t[0]}</b>
                  <span>{t[1]}</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {tab === 'activities' && recommendations && (
        <>
          <div style={{ marginBottom: 24 }}>
            <p className="eyebrow">Cvičení & Pohyb</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>✓ Vhodné</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px' }}>
                  {recommendations.exercise.do.map((item) => (
                    <li key={item} style={{ marginBottom: 6, color: 'var(--ink-2)' }}>
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>✗ Vyhnout se</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px' }}>
                  {recommendations.exercise.avoid.map((item) => (
                    <li key={item} style={{ marginBottom: 6, color: 'var(--ink-3)' }}>
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div>
            <p className="eyebrow">Jídlo & Nápoje</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>✓ Vhodné</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px' }}>
                  {recommendations.nutrition.do.map((item) => (
                    <li key={item} style={{ marginBottom: 6, color: 'var(--ink-2)' }}>
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>✗ Vyhnout se</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px' }}>
                  {recommendations.nutrition.avoid.map((item) => (
                    <li key={item} style={{ marginBottom: 6, color: 'var(--ink-3)' }}>
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
