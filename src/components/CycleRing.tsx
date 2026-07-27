import { useRef, useCallback } from 'react'
import { colorOf, phaseFor } from '../utils/cycle'
import { Glyph } from './Glyph'

interface CycleRingProps {
  len: number
  menLen: number
  selectedDay: number
  today: number
  onDaySelect: (day: number) => void
}

const R = 120
const CX = 160
const CY = 160
const GAP = 2.6

const pt = (a: number, r: number): [number, number] => [
  CX + r * Math.cos(((a - 90) * Math.PI) / 180),
  CY + r * Math.sin(((a - 90) * Math.PI) / 180),
]

export function CycleRing({ len, menLen, selectedDay, today, onDaySelect }: CycleRingProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const dragging = useRef(false)
  const STEP = 360 / len

  /* Segmenty se vykreslují deklarativně a React je jen přepočítává.
     Nikdy se nepřemontují, takže se nespouští vstupní animace znovu. */
  const segments = Array.from({ length: len }, (_, i) => {
    const day = i + 1
    const [x0, y0] = pt(i * STEP + GAP / 2, R)
    const [x1, y1] = pt((i + 1) * STEP - GAP / 2, R)
    const d = `M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}`
    const isSel = day === selectedDay
    return {
      day,
      d,
      color: colorOf(day, len, menLen),
      width: isSel ? 21 : 13,
      opacity: isSel ? 1 : day <= today ? 0.95 : 0.28,
      name: phaseFor(day, len, menLen).name,
    }
  })

  const markAngle = (selectedDay - 0.5) * STEP
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
      return { day: Math.min(len, Math.floor(ang / STEP) + 1), dist }
    },
    [len, STEP, selectedDay]
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
      onDaySelect(((selectedDay - 2 + len) % len) + 1)
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      onDaySelect((selectedDay % len) + 1)
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
          aria-valuemax={len}
          aria-valuenow={selectedDay}
          aria-valuetext={`Den ${selectedDay} z ${len} — ${selPhase.name}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={handleKeyDown}
        >
          {segments.map((s) => (
            <g key={s.day}>
              <path className="hit" d={s.d}>
                <title>{`Den ${s.day} — ${s.name}`}</title>
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
