import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Logo } from './Logo'

export function Settings() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [startDate, setStartDate] = useState('')
  const [partnerName, setPartnerName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      const [startsRes, profileRes] = await Promise.all([
        supabase
          .from('period_starts')
          .select('start_date')
          .eq('user_id', user.id)
          .order('start_date', { ascending: false })
          .limit(1),
        supabase
          .from('profiles')
          .select('partner_name')
          .eq('id', user.id)
          .single(),
      ])

      if (startsRes.data?.length) {
        setStartDate(startsRes.data[0].start_date)
      }

      if (profileRes.data?.partner_name) {
        setPartnerName(profileRes.data.partner_name)
      }

      setLoading(false)
    }

    fetchData()
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate) return

    setSaving(true)
    setMessage(null)

    try {
      if (!user) throw new Error('User not found')

      const [err1] = await Promise.all([
        (async () => {
          const { error } = await supabase
            .from('period_starts')
            .insert({
              user_id: user.id,
              start_date: startDate,
            })
          return error
        })(),
        (async () => {
          await supabase
            .from('profiles')
            .update({ partner_name: partnerName })
            .eq('id', user.id)
        })(),
      ])

      if (err1) {
        if (err1.code === '23505') {
          setMessage({ type: 'error', text: 'Tento den je již zaznamenán' })
        } else {
          throw err1
        }
      } else {
        setMessage({ type: 'success', text: 'Nastavení uloženo!' })
        setTimeout(() => navigate('/dashboard'), 1500)
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Chyba při ukládání' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--paper)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-line-2 border-t-ink rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: 'var(--ink-2)' }}>Načítám...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--paper)', color: 'var(--ink)' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 16px' }}>
        <div className="mb-8 flex items-center gap-2">
          <Logo variant="gradient" size={32} />
          <a
            href="/dashboard"
            className="underline text-sm font-medium"
            style={{ color: 'var(--ink-2)', textDecorationOffset: '3px' }}
          >
            ← Zpět na dashboard
          </a>
        </div>

        <div
          style={{
            backgroundColor: 'var(--card)',
            borderRadius: 'var(--r)',
            border: '1px solid var(--line)',
            padding: '32px',
          }}
        >
          <h1 className="text-3xl font-bold font-display mb-8" style={{ letterSpacing: '-0.015em' }}>
            Nastavení
          </h1>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--ink)' }}
              >
                Kdy začala poslední menstruace?
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-4 py-2 font-body text-sm"
                style={{
                  border: '1px solid var(--line-2)',
                  borderRadius: '9px',
                  backgroundColor: 'var(--card)',
                  color: 'var(--ink)',
                }}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--ink)' }}
              >
                Jméno partnerky (volitelné)
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

            {message && (
              <div
                className="p-4 text-sm rounded-lg"
                style={{
                  backgroundColor:
                    message.type === 'success'
                      ? 'rgba(34, 197, 94, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
                  color:
                    message.type === 'success'
                      ? '#166534'
                      : '#991b1b',
                  border:
                    message.type === 'success'
                      ? '1px solid rgba(34, 197, 94, 0.3)'
                      : '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                {message.text}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving || !startDate}
                className="flex-1 font-medium py-3 rounded-lg transition font-body cursor-pointer"
                style={{
                  backgroundColor:
                    saving || !startDate ? 'var(--line-2)' : 'var(--ink)',
                  color:
                    saving || !startDate ? 'var(--ink-3)' : 'var(--paper)',
                  opacity: saving || !startDate ? 0.5 : 1,
                }}
              >
                {saving ? 'Ukládám...' : 'Uložit změny'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 font-medium py-3 rounded-lg transition font-body cursor-pointer border"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--ink-2)',
                  borderColor: 'var(--line-2)',
                }}
              >
                Zrušit
              </button>
            </div>

            <button
              type="button"
              onClick={signOut}
              className="w-full font-medium py-3 rounded-lg transition font-body cursor-pointer"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--ink-3)',
                fontSize: '14px',
                textDecoration: 'underline',
                textDecorationOffset: '3px',
              }}
            >
              Odhlásit se
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
