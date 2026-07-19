import { useState } from 'react'

type Theme = 'light' | 'auto' | 'dark'

const LABELS: Record<Theme, string> = {
  light: 'Světlý',
  auto: 'Auto',
  dark: 'Tmavý',
}

function read(): Theme {
  try {
    const v = localStorage.getItem('peeriod-theme')
    if (v === 'light' || v === 'dark' || v === 'auto') return v
  } catch {
    /* localStorage nemusí být dostupné */
  }
  return 'auto'
}

export function applyTheme(mode: Theme) {
  if (mode === 'auto') document.documentElement.removeAttribute('data-theme')
  else document.documentElement.setAttribute('data-theme', mode)
  try {
    localStorage.setItem('peeriod-theme', mode)
  } catch {
    /* ignore */
  }
}

export function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme>(read)

  const change = (t: Theme) => {
    setTheme(t)
    applyTheme(t)
  }

  return (
    <div className="themeswitch" role="radiogroup" aria-label="Motiv">
      {(['light', 'auto', 'dark'] as Theme[]).map((t) => (
        <button
          key={t}
          onClick={() => change(t)}
          aria-pressed={theme === t}
          aria-label={`${LABELS[t]} motiv`}
        >
          {LABELS[t]}
        </button>
      ))}
    </div>
  )
}
