import { useEffect, useRef, useState } from 'react'
import type { Pair } from '../utils/cycle'

interface PhaseContentProps {
  eyebrow: string
  title: string
  lede: string
  tips: Pair[]
  /** klíč, jehož změna spustí fade — typicky vybraný den */
  fadeKey: number | string
  /** během tažení po kruhu fade vypnout, jinak to bliká */
  animate?: boolean
}

export function PhaseContent({
  eyebrow,
  title,
  lede,
  tips,
  fadeKey,
  animate = true,
}: PhaseContentProps) {
  const [out, setOut] = useState(false)
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

  return (
    <div className={`fade${out ? ' out' : ''}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="lede">{lede}</p>

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
    </div>
  )
}
