import { useState } from 'react'
import { calculateCycleInfo, PHASE_DATA } from '../utils/cycle'

interface CalendarProps {
  startDate: string
  cycleLength: number
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
}

export function Calendar({
  startDate,
  cycleLength,
  selectedDate,
  onSelectDate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getDayPhaseColor = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const cycleInfo = calculateCycleInfo(startDate, cycleLength, date)
    const phaseData = PHASE_DATA[cycleInfo.phase]

    // Extrahuj barvu z className
    const colorMap: Record<string, string> = {
      'bg-menstrual': '#dc2626',
      'bg-follicular': '#3b82f6',
      'bg-ovulation': '#a855f7',
      'bg-luteal': '#f59e0b',
    }

    return {
      bgColor: colorMap[phaseData.color] || '#e0e7ff',
      dayOfCycle: cycleInfo.dayOfCycle,
    }
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const days: (number | null)[] = Array(firstDay)
    .fill(null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1))

  const monthName = currentMonth.toLocaleDateString('cs-CZ', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          {monthName}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() =>
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
            }
            className="px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-sm"
          >
            ←
          </button>
          <button
            onClick={() =>
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
            }
            className="px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-sm"
          >
            →
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-slate-600 dark:text-slate-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="aspect-square"></div>
          }

          const { bgColor } = getDayPhaseColor(day)
          const isSelected =
            selectedDate &&
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === currentMonth.getMonth() &&
            selectedDate.getFullYear() === currentMonth.getFullYear()

          return (
            <button
              key={day}
              onClick={() =>
                onSelectDate(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                )
              }
              className={`aspect-square rounded-lg font-medium text-sm flex items-center justify-center transition cursor-pointer
                ${
                  isSelected
                    ? 'ring-2 ring-offset-2 ring-purple-600 dark:ring-offset-slate-900'
                    : ''
                }
              `}
              style={{
                backgroundColor: bgColor,
                color: ['#dc2626', '#a855f7'].includes(bgColor) ? 'white' : 'white',
              }}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">
          Fáze cyklu
        </p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(PHASE_DATA).map(([key, data]) => (
            <div key={key} className="flex items-center gap-2 text-sm">
              <div
                className={`w-4 h-4 rounded ${data.color}`}
              ></div>
              <span className="text-slate-700 dark:text-slate-300">{data.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
