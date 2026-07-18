import { useId, useRef, useEffect, useState } from 'react'
import { PHASES } from '../data/phases'

interface CycleRingProps {
  len: number
  selectedDay: number
  onDaySelect: (day: number) => void
  today: number
}

export function CycleRing({
  len,
  selectedDay,
  onDaySelect,
  today,
}: CycleRingProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragging, setDragging] = useState(false)
  const [builtLen, setBuiltLen] = useState(0)
  const focusId = useId()

  const R = 120
  const CX = 160
  const CY = 160
  const GAP = 2.6

  const pt = (a: number, r: number): [number, number] => [
    CX + r * Math.cos(((a - 90) * Math.PI) / 180),
    CY + r * Math.sin(((a - 90) * Math.PI) / 180),
  ]

  const STEP = 360 / len

  useEffect(() => {
    if (builtLen !== len && svgRef.current) {
      let s = ''
      const phaseKeys = Object.keys(PHASES)
      for (let i = 0; i < len; i++) {
        const d = i + 1
        const phaseKeyIdx = i % phaseKeys.length
        const phaseKey = phaseKeys[phaseKeyIdx]
        const phase = (PHASES as any)[phaseKey]
        const color = phase.color

        const x0 = CX + R * Math.cos(((i * STEP + GAP / 2 - 90) * Math.PI) / 180)
        const y0 = CY + R * Math.sin(((i * STEP + GAP / 2 - 90) * Math.PI) / 180)
        const x1 = CX + R * Math.cos((((i + 1) * STEP - GAP / 2 - 90) * Math.PI) / 180)
        const y1 = CY + R * Math.sin((((i + 1) * STEP - GAP / 2 - 90) * Math.PI) / 180)
        const dd = `M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}`

        s += `<path class="hit" d="${dd}"><title>Den ${d}</title></path>`
        s += `<path class="seg" id="seg${d}" d="${dd}" fill="none" stroke="${color}" stroke-width="13" stroke-linecap="round" style="pointer-events:none;transition:stroke-width .16s ease, opacity .16s ease;"/>`
      }
      s += `<circle id="focusRing" cx="${CX}" cy="${CY}" r="${R + 26}" fill="none" stroke="#a855f7" stroke-width="2" stroke-dasharray="4 6" stroke-linecap="round" style="opacity:0;transition:opacity .15s;"/>`
      s += `<g id="mark" opacity=".85" style="transition:transform .22s cubic-bezier(.3,.8,.3,1)"><path d="M-8 8 L3.5 -3.5" stroke="var(--ink)" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M-2 -3.5 H3.5 V2" stroke="var(--ink)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`

      svgRef.current.innerHTML = s
      setBuiltLen(len)
    }
  }, [len, STEP])

  useEffect(() => {
    if (svgRef.current && builtLen === len) {
      for (let d = 1; d <= len; d++) {
        const el = document.getElementById('seg' + d) as SVGPathElement
        if (el) {
          const isSel = d === selectedDay
          el.setAttribute('stroke-width', isSel ? '21' : '13')
          el.setAttribute('opacity', isSel ? '1' : d <= today ? '0.95' : '0.28')
        }
      }

      const ang = (selectedDay - 0.5) * STEP
      const [mx, my] = pt(ang, R + 28)
      const mark = svgRef.current.getElementById('mark')
      if (mark) {
        mark.setAttribute('transform', `translate(${mx} ${my}) rotate(${ang + 135})`)
      }

      const focusRing = svgRef.current.getElementById('focusRing') as SVGCircleElement
      if (focusRing) {
        focusRing.style.opacity = document.activeElement === svgRef.current ? '1' : '0'
      }
    }
  }, [selectedDay, len, today, STEP, builtLen])

  const dayFromPoint = (clientX: number, clientY: number): number => {
    if (!svgRef.current) return selectedDay
    const rect = svgRef.current.getBoundingClientRect()
    const scale = 320 / rect.width
    const x = (clientX - rect.left) * scale - CX
    const y = (clientY - rect.top) * scale - CY
    const ang = (Math.atan2(y, x) * 180) / Math.PI + 90 + 360
    const ang360 = ang % 360
    return Math.min(len, Math.floor(ang360 / STEP) + 1)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    const day = dayFromPoint(e.clientX, e.clientY)
    if (!svgRef.current) return

    const rect = svgRef.current.getBoundingClientRect()
    const scale = 320 / rect.width
    const x = (e.clientX - rect.left) * scale - CX
    const y = (e.clientY - rect.top) * scale - CY
    const dist = Math.hypot(x, y)

    if (dist < R - 34 || dist > R + 34) return

    setDragging(true)
    svgRef.current.classList.add('dragging')
    svgRef.current.setPointerCapture(e.pointerId)
    onDaySelect(day)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !svgRef.current) return
    e.preventDefault()
    const day = dayFromPoint(e.clientX, e.clientY)
    onDaySelect(day)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragging || !svgRef.current) return
    setDragging(false)
    svgRef.current.classList.remove('dragging')
    try {
      svgRef.current.releasePointerCapture(e.pointerId)
    } catch {}
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      const next = ((selectedDay - 2 + len) % len) + 1
      onDaySelect(next)
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      const next = (selectedDay % len) + 1
      onDaySelect(next)
    } else if (e.key === 'Home') {
      e.preventDefault()
      onDaySelect(today)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        ref={svgRef}
        viewBox="0 0 320 320"
        className="w-full h-auto cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
        tabIndex={0}
        role="slider"
        aria-label="Den cyklu"
        aria-valuemin={1}
        aria-valuemax={len}
        aria-valuenow={selectedDay}
        aria-valuetext={`Den ${selectedDay} z ${len}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      />
      <div className="text-center pointer-events-none">
        <div className="text-4xl font-bold font-display" style={{ letterSpacing: '-0.04em' }}>
          {selectedDay}
        </div>
        <div className="text-xs uppercase tracking-widest text-ink-3">den cyklu</div>
      </div>
      <p className="text-xs text-ink-3 text-center">Táhni po kruhu nebo klepni na den</p>
    </div>
  )
}
