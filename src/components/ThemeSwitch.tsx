import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'auto'

export function ThemeSwitch() {
  const [theme, setTheme] = useState<Theme>('auto')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = (localStorage.getItem('peeriod-theme') as Theme) || 'auto'
    setTheme(saved)
    applyTheme(saved)
    setMounted(true)
  }, [])

  function applyTheme(mode: Theme) {
    if (mode === 'auto') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', mode)
    }
    try {
      localStorage.setItem('peeriod-theme', mode)
    } catch {}
  }

  const handleChange = (newTheme: Theme) => {
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  if (!mounted) return null

  return (
    <div className="flex border border-line-2 rounded-full p-0.5 gap-0.5" role="radiogroup" aria-label="Motiv">
      {(['light', 'dark', 'auto'] as const).map((t) => (
        <button
          key={t}
          onClick={() => handleChange(t)}
          aria-pressed={theme === t}
          aria-label={
            t === 'light'
              ? 'Světlý motiv'
              : t === 'dark'
                ? 'Tmavý motiv'
                : 'Podle systému'
          }
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            theme === t
              ? 'bg-ink text-paper'
              : 'bg-transparent text-ink-3 hover:text-ink-2'
          }`}
        >
          {t === 'light' ? 'Světlý' : t === 'dark' ? 'Tmavý' : 'Auto'}
        </button>
      ))}
    </div>
  )
}
