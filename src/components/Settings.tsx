import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Logo } from './Logo'

interface Cycle {
  id: string
  start_date: string
  cycle_length: number
}

export function Settings() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [cycle, setCycle] = useState<Cycle | null>(null)
  const [startDate, setStartDate] = useState('')
  const [cycleLength, setCycleLength] = useState('28')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const fetchCycle = async () => {
      if (!user) return

      const { data } = await supabase
        .from('cycles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setCycle(data)
        setStartDate(data.start_date)
        setCycleLength(data.cycle_length.toString())
      }

      setLoading(false)
    }

    fetchCycle()
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cycle) return

    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('cycles')
        .update({
          start_date: startDate,
          cycle_length: parseInt(cycleLength),
          updated_at: new Date().toISOString(),
        })
        .eq('id', cycle.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Nastavení uloženo!' })
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Chyba při ukládání' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Načítám...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-950 dark:to-purple-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8 flex items-center gap-2">
          <Logo variant="gradient" size={32} />
          <a
            href="/dashboard"
            className="text-purple-600 dark:text-purple-400 hover:underline text-sm font-medium"
          >
            ← Zpět na dashboard
          </a>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Nastavení</h1>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Kdy začala poslední menstruace?
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Jak dlouhý je jejího cyklus? (dny)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="21"
                  max="35"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(e.target.value)}
                  className="flex-1"
                />
                <div className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-lg font-medium min-w-16 text-center">
                  {cycleLength}
                </div>
              </div>
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg text-sm font-medium ${
                  message.type === 'success'
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                    : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Ukládám...' : 'Uložit změny'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-3 rounded-lg transition"
              >
                Zrušit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
