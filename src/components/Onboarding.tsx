import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export function Onboarding() {
  const [startDate, setStartDate] = useState('')
  const [cycleLength, setCycleLength] = useState('28')
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

      const { error: insertError } = await supabase
        .from('cycles')
        .insert({
          user_id: user.id,
          start_date: startDate,
          cycle_length: parseInt(cycleLength),
        })

      if (insertError) throw insertError

      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Chyba při ukládání')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-950 dark:to-purple-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-600 dark:text-purple-400">PEERIOD</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">Pojďme začít</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Např. 2026-07-01</p>
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
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Průměr je 28 dní, ale 21–35 je normální
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !startDate}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Načítám...' : 'Začít sledovat'}
          </button>
        </form>

        <p className="text-center text-slate-500 dark:text-slate-400 text-xs mt-6">
          Údaje můžeš kdykoli změnit v nastavení
        </p>
      </div>
    </div>
  )
}
