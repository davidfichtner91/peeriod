import { useEffect, useState } from 'react'

interface PhaseContentProps {
  title: string
  lede: string
  tips: [string, string][]
  feels: [string, string][]
  animated?: boolean
}

export function PhaseContent({
  title,
  lede,
  tips,
  feels,
  animated = false,
}: PhaseContentProps) {
  const [showOut, setShowOut] = useState(false)

  useEffect(() => {
    if (animated) {
      setShowOut(true)
      const timer = setTimeout(() => setShowOut(false), 150)
      return () => clearTimeout(timer)
    }
  }, [title, animated])

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  return (
    <div
      className={`transition-all ${
        showOut && !prefersReducedMotion
          ? 'opacity-0 translate-y-1.25'
          : 'opacity-100 translate-y-0'
      } ${showOut && !prefersReducedMotion ? 'duration-150' : 'duration-0'}`}
    >
      <p className="text-xs uppercase tracking-widest text-ink-3 mb-2.5">
        Dnes
      </p>
      <h2 className="text-2xl leading-tight font-display mb-2.25" style={{ letterSpacing: '-0.015em' }}>
        {title}
      </h2>
      <p className="text-ink-2 mb-5.5 leading-1.5 max-w-52ch">{lede}</p>

      <p className="text-xs uppercase tracking-widest text-ink-3 mb-2.5">
        Co dnes pomůže
      </p>
      <ul className="border-t border-line">
        {tips.map((tip, idx) => (
          <li
            key={idx}
            className="flex gap-3.5 py-3.25 border-b border-line"
          >
            <span className="text-xs font-bold text-ink-3 pt-0.75 min-w-4.5">
              {String(idx + 1).padStart(2, '0')}
            </span>
            <div>
              <b className="block font-bold">{tip[0]}</b>
              <span className="text-sm text-ink-2">{tip[1]}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-2 gap-5 mt-5">
        <div className="border border-line rounded-3.5 p-6">
          <h3 className="text-base font-bold mb-3.5">Co se děje v jejím těle</h3>
          {/* Bio bude z contentFor */}
        </div>
        <div className="border border-line rounded-3.5 p-6">
          <h3 className="text-base font-bold mb-3.5">Jak se může cítit</h3>
          <ul className="flex flex-wrap gap-2">
            {feels.map((feel, idx) => (
              <li
                key={idx}
                className="text-sm border border-line-2 rounded-full py-1.25 px-3 text-ink-2"
              >
                {feel[0]}
                <i className="not-italic text-xs text-ink-3 ml-1.5">{feel[1]}</i>
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink-3 mt-5 pt-4 border-t border-line">
            Orientační, ne diagnóza. Každý cyklus je jiný — ptej se místo domýšlení.
          </p>
        </div>
      </div>
    </div>
  )
}
