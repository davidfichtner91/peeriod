import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { calculateCycleInfo, PHASE_DATA } from '../utils/cycle'
import { Calendar } from './Calendar'
import { PhaseDetail } from './PhaseDetail'
import { Logo } from './Logo'

interface Cycle {
  id: string
  start_date: string
  cycle_length: number
}

export function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [cycle, setCycle] = useState<Cycle | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    const fetchCycle = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from('cycles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!error && data) {
        setCycle(data)
      }

      setLoading(false)
    }

    fetchCycle()
  }, [user])

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

  if (!cycle) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Nemáš noch žádný cyklus</p>
          <a href="/onboarding" className="text-purple-600 hover:underline font-medium">
            Vytvořit cyklus
          </a>
        </div>
      </div>
    )
  }

  const cycleInfo = calculateCycleInfo(cycle.start_date, cycle.cycle_length)
  const phaseData = PHASE_DATA[cycleInfo.phase]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-950 dark:to-purple-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 hover:opacity-80 transition"
          >
            <Logo variant="gradient" size={40} />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">PEERIOD</span>
          </button>
          <div className="flex items-center gap-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Ahoj, chlape!</h2>
            <button
              onClick={signOut}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition text-sm"
            >
              Odhlásit se
            </button>
          </div>
        </div>

        {/* Current phase card */}
        <div
          className={`${phaseData.color} rounded-lg shadow-lg p-6 mb-8 text-white`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-4xl mb-2">{phaseData.emoji}</div>
              <h2 className="text-2xl font-bold mb-1">{phaseData.name}</h2>
              <p className="text-white/80 text-sm">Den {cycleInfo.dayOfCycle} z {cycle.cycle_length}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{cycleInfo.percentThroughPhase}%</div>
              <p className="text-white/80 text-xs">Fáze</p>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${cycleInfo.percentThroughPhase}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Calendar
              startDate={cycle.start_date}
              cycleLength={cycle.cycle_length}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>

          {/* Phase detail */}
          <div className="lg:col-span-1">
            <PhaseDetail
              phase={cycleInfo.phase}
              dayOfCycle={cycleInfo.dayOfCycle}
              selectedDate={selectedDate}
              startDate={cycle.start_date}
              cycleLength={cycle.cycle_length}
            />
          </div>
        </div>

        {/* Settings link */}
        <div className="mt-8 text-center">
          <a
            href="/settings"
            className="text-purple-600 dark:text-purple-400 hover:underline text-sm font-medium"
          >
            Upravit nastavení →
          </a>
        </div>
      </div>
    </div>
  )
}
