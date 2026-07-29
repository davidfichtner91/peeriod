import { useEffect, useState } from 'react'

export function UpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false)

  useEffect(() => {
    const checkForUpdates = async () => {
      if (!navigator.serviceWorker) {
        console.log('Service Worker not supported')
        return
      }

      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })
        console.log('Service Worker registered:', registration)

        // Poslouchej na waiting service worker (nová verze je ready)
        registration.addEventListener('updatefound', () => {
          console.log('Update found!')
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            console.log('Service Worker state changed:', newWorker.state)
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nová verze je ready a máme starou verzi
              console.log('New version available, showing update prompt')
              setShowUpdate(true)
            }
          })
        })

        // Zkontroluj hned a pak každých 30 sekund
        registration.update()
        const interval = setInterval(() => {
          console.log('Checking for updates...')
          registration.update()
        }, 30000)

        return () => clearInterval(interval)
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }

    checkForUpdates()
  }, [])

  const handleForceRefresh = async () => {
    try {
      // Unregister all service workers
      if (navigator.serviceWorker) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        for (const registration of registrations) {
          await registration.unregister()
          console.log('Service Worker unregistered')
        }
      }

      // Clear all caches
      if (caches) {
        const cacheNames = await caches.keys()
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName)
          console.log('Cache deleted:', cacheName)
        }
      }

      // Clear localStorage
      localStorage.clear()
      sessionStorage.clear()
      console.log('Storage cleared')

      // Hard refresh
      window.location.href = window.location.href
    } catch (error) {
      console.error('Force refresh failed:', error)
      window.location.reload()
    }
  }

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
        onClick={handleForceRefresh}
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
