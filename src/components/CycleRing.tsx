import { useRef, useCallback } from 'react'
import { colorOf, phaseFor } from '../utils/cycle'
import { Glyph } from './Glyph'

interface CycleRingProps {
  /** Očekávaná délka cyklu. Určuje barvy a hranice fází — nesmí růst se zpožděním. */
  len: number
  menLen: number
  selectedDay: number
  today: number
  /** Kolik dní cyklus přetáhl. O tolik segmentů kruh povyroste. */
  overdue?: number
  onDaySelect: (day: number) => void
}

const R = 120
const CX = 160
const CY = 160
const GAP = 2.6
/** Přes tolik dní po termínu už kruh neroste, jinak by se rozdrobil na vlásky. */
const MAX_OVERDUE_SEGMENTS = 14

const pt = (a: number, r: number): [number, number] => [
  CX + r * Math.cos(((a - 90) * Math.PI) / 180),
  CY + r * Math.sin(((a - 90) * Math.PI) / 180),
]

export function CycleRing({ len, menLen, selectedDay, today, overdue = 0, onDaySelect }: CycleRingProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const dragging = useRef(false)
  /* Kruh se o dny po termínu roztáhne, ale fáze se pořád počítají z `len` —
     `bounds()` kotví ovulaci od konce cyklu, takže delší `len` by ho přebarvil. */
  const total = len + Math.min(overdue, MAX_OVERDUE_SEGMENTS)
  const STEP = 360 / total
  // Při extrémním zpoždění může den přerůst kruh — značka pak zaparkuje na konci.
  const markDay = Math.min(selectedDay, total)

  /* Segmenty se vykreslují deklarativně a React je jen přepočítává.
     Nikdy se nepřemontují, takže se nespouští vstupní animace znovu. */
  const segments = Array.from({ length: total }, (_, i) => {
    const day = i + 1
    const [x0, y0] = pt(i * STEP + GAP / 2, R)
    const [x1, y1] = pt((i + 1) * STEP - GAP / 2, R)
    const d = `M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}`
    const isSel = day === markDay
    const isOverdue = day > len
    return {
      day,
      d,
      color: colorOf(day, len, menLen),
      // Dny po termínu tenčí a bledší — nestojí na žádném záznamu.
      // (Čárkovat nejde: kulaté zakončení tahu udělá z čárky kolečko
      // o průměru celé tloušťky a mezery se slijí.)
      width: isSel ? 21 : isOverdue ? 7 : 13,
      opacity: isSel ? 1 : isOverdue ? 0.55 : day <= today ? 0.95 : 0.28,
      name: isOverdue
        ? `Den ${day} — po očekávaném termínu`
        : `Den ${day} — ${phaseFor(day, len, menLen).name}`,
    }
  })

  const markAngle = (markDay - 0.5) * STEP
  const [mx, my] = pt(markAngle, R + 28)
  const selPhase = phaseFor(selectedDay, len, menLen)

  const pointToDay = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current
      if (!svg) return { day: selectedDay, dist: 0 }
      const rect = svg.getBoundingClientRect()
      const scale = 320 / rect.width
      const x = (clientX - rect.left) * scale - CX
      const y = (clientY - rect.top) * scale - CY
      const dist = Math.hypot(x, y)
      const ang = ((Math.atan2(y, x) * 180) / Math.PI + 90 + 360) % 360
      return { day: Math.min(total, Math.floor(ang / STEP) + 1), dist }
    },
    [total, STEP, selectedDay]
  )

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const { day, dist } = pointToDay(e.clientX, e.clientY)
    // mimo prstenec drag nezačíná, aby šla stránka na mobilu scrollovat
    if (dist < R - 34 || dist > R + 34) return
    dragging.current = true
    e.currentTarget.classList.add('dragging')
    e.currentTarget.setPointerCapture(e.pointerId)
    onDaySelect(day)
  }

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return
    e.preventDefault()
    const { day } = pointToDay(e.clientX, e.clientY)
    if (day !== selectedDay) onDaySelect(day)
  }

  const endDrag = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return
    dragging.current = false
    e.currentTarget.classList.remove('dragging')
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* pointer už mohl být uvolněn */
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      onDaySelect(((selectedDay - 2 + total) % total) + 1)
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      onDaySelect((selectedDay % total) + 1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      onDaySelect(today)
    }
  }

  return (
    <div className="ringcol">
      <div className="ringwrap">
        <svg
          ref={svgRef}
          className="ring"
          viewBox="0 0 320 320"
          tabIndex={0}
          role="slider"
          aria-label="Den cyklu"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={selectedDay}
          aria-valuetext={
            selectedDay > len
              ? `Den ${selectedDay} — ${selectedDay - len} po očekávaném termínu`
              : `Den ${selectedDay} z ${len} — ${selPhase.name}`
          }
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={handleKeyDown}
        >
          {segments.map((s) => (
            <g key={s.day}>
              <path className="hit" d={s.d}>
                <title>{s.name}</title>
              </path>
              <path
                className="seg"
                d={s.d}
                fill="none"
                stroke={s.color}
                strokeWidth={s.width}
                strokeLinecap="round"
                opacity={s.opacity}
              />
            </g>
          ))}

          <circle
            className="focus-ring"
            cx={CX}
            cy={CY}
            r={R + 26}
            fill="none"
            stroke="#a855f7"
            strokeWidth="2"
            strokeDasharray="4 6"
            strokeLinecap="round"
          />

          <g
            className="mark"
            opacity="0.85"
            transform={`translate(${mx} ${my}) rotate(${markAngle + 135})`}
          >
            <path
              d="M-8 8 L3.5 -3.5"
              stroke="var(--ink)"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M-2 -3.5 H3.5 V2"
              stroke="var(--ink)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        </svg>

        <div className="hub">
          <div className="hub-day tnum">{selectedDay}</div>
          <div className="hub-label">den cyklu</div>
          <div className="hub-phase">
            <Glyph type={selPhase.glyph} color={selPhase.color} />
            {selPhase.name}
          </div>
        </div>
      </div>
      <p className="hint">Táhni po kruhu nebo klepni na den</p>
    </div>
  )
}
