import { useEffect, useState } from 'react'

export function UpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false)

  useEffect(() => {
    // PWA je jen v produkci
    if (import.meta.env.DEV) return

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
        top: 16,
        right: 16,
        background: 'linear-gradient(135deg, var(--accent), #a855f7)',
        borderRadius: '12px',
        padding: '14px 18px',
        boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        justifyContent: 'space-between',
        maxWidth: 380,
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>
          ✨ Aktualizace dostupná
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.85)' }}>
          Klikni na tlačítko pro instalaci
        </div>
      </div>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '6px 14px',
          background: 'rgba(255, 255, 255, 0.25)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)'
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
        }}
      >
        Aktualizovat
      </button>
    </div>
  )
}
