import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Logo } from './Logo'
import { DatePicker } from './DatePicker'

export function Onboarding() {
  const [startDate, setStartDate] = useState('')
  const [partnerName, setPartnerName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!user) throw new Error('User not found')

      const dateStr = startDate.split('T')[0]

      const { error: startErr } = await supabase
        .from('period_starts')
        .insert({ user_id: user.id, start_date: dateStr })
      if (startErr) throw startErr

      if (partnerName.trim()) {
        // upsert, ne update: řádek v profiles nemusí existovat
        const { error: profErr } = await supabase
          .from('profiles')
          .upsert({ id: user.id, partner_name: partnerName.trim() })
        if (profErr) throw profErr
      }

      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Chyba při ukládání')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'var(--paper)',
        color: 'var(--ink)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '448px',
          backgroundColor: 'var(--card)',
          borderRadius: 'var(--r)',
          border: '1px solid var(--line)',
          padding: '32px',
        }}
      >
        <div className="text-center mb-8">
          <Logo variant="gradient" size={48} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold font-display" style={{ letterSpacing: '-0.015em' }}>
            PEERIOD
          </h1>
          <p style={{ color: 'var(--ink-2)', fontSize: '14px', marginTop: '8px' }}>
            Pojďme začít
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--ink)' }}
            >
              Kdy začala poslední menstruace?
            </label>
            <DatePicker
  value={startDate}
  onChange={setStartDate}
/>
            <p style={{ fontSize: '12px', color: 'var(--ink-3)', marginTop: '4px' }}>
              Např. 2026-07-01
            </p>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--ink)' }}
            >
              Jak se jmenuje vaše partnerka? (volitelné)
            </label>
            <input
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="Např. Tereza"
              className="w-full px-4 py-2 font-body text-sm"
              style={{
                border: '1px solid var(--line-2)',
                borderRadius: '9px',
                backgroundColor: 'var(--card)',
                color: 'var(--ink)',
              }}
            />
          </div>

          {error && (
            <div
              className="p-3 text-sm rounded-lg"
              style={{
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #fecaca',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !startDate}
            className="w-full font-medium py-3 rounded-lg transition cursor-pointer font-body"
            style={{
              backgroundColor: loading || !startDate ? 'var(--line-2)' : 'var(--ink)',
              color: loading || !startDate ? 'var(--ink-3)' : 'var(--paper)',
              opacity: loading || !startDate ? 0.5 : 1,
            }}
          >
            {loading ? 'Načítám...' : 'Začít sledovat'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: '12px', marginTop: '24px' }}>
          Údaje můžeš kdykoli změnit v nastavení
        </p>
      </div>
    </div>
  )
}
