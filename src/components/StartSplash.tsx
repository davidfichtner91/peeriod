import { useEffect, useState } from 'react'
import { Logo } from './Logo'

const SEEN_KEY = 'peeriod-splash-seen'
/** Jak dlouho úvod nejméně svítí, i když data dorazí dřív. */
const MIN_MS = 1700
const FADE_MS = 450

/** Úvod jen jednou za spuštění: po návratu z nastavení už nezdržuje.
 *  Jen čte, zápis dělá komponenta po připojení (StrictMode volá
 *  inicializátor stavu dvakrát a druhé volání by vrátilo false). */
export function shouldShowSplash(): boolean {
  try {
    return !sessionStorage.getItem(SEEN_KEY)
  } catch {
    // Bez úložiště (anonymní okno) se úvod ukáže pokaždé, nic se nerozbije.
    return true
  }
}

function markSplashSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    // viz shouldShowSplash
  }
}

interface StartSplashProps {
  /** oslovení v 5. pádě, prázdné = „chlape“ */
  name?: string
  /** data dashboardu načtená, pozdrav už se nezmění */
  ready: boolean
  onDone: () => void
}

export function StartSplash({ name, ready, onDone }: StartSplashProps) {
  const [minElapsed, setMinElapsed] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    markSplashSeen()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = window.setTimeout(() => setMinElapsed(true), reduce ? 900 : MIN_MS)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!ready || !minElapsed) return
    setLeaving(true)
    const t = window.setTimeout(onDone, FADE_MS)
    return () => window.clearTimeout(t)
  }, [ready, minElapsed, onDone])

  return (
    <div className={`splash${leaving ? ' splash--out' : ''}`} role="status" aria-live="polite">
      <Logo variant="gradient" size={88} className="logo-draw" />
      {/* Pozdrav až s načteným profilem, ať se „chlape“ nepřepíše na jméno. */}
      <p className={`splash-hi${ready ? ' splash-hi--in' : ''}`}>
        {ready ? `Ahoj ${name?.trim() || 'chlape'}!` : ' '}
      </p>
    </div>
  )
}
