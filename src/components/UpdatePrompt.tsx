import { useEffect, useState } from 'react'

export function UpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false)

  useEffect(() => {
    // Načti service worker z Vite PWA pluginu
    const checkForUpdates = async () => {
      if (!navigator.serviceWorker) return

      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) return

      // Poslouchej na waiting service worker (nová verze je ready)
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Nová verze je ready a máme starou verzi
            setShowUpdate(true)
          }
        })
      })

      // Zkontroluj každých 60 sekund
      setInterval(() => {
        registration.update()
      }, 60000)
    }

    checkForUpdates()
  }, [])

  if (!showUpdate) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        right: 20,
        maxWidth: 400,
        background: 'var(--card)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r)',
        padding: '16px 20px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        justifyContent: 'space-between',
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
          Nová verze je dostupná
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
          Reload pro instalaci aktualizace
        </div>
      </div>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '8px 16px',
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Reload
      </button>
    </div>
  )
}
