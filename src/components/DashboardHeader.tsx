import { Logo } from './Logo'
import { ThemeSwitch } from './ThemeSwitch'
import { avgLen } from '../utils/cycle'

interface DashboardHeaderProps {
  partnerName?: string
  starts: Date[]
}

export function DashboardHeader({ partnerName, starts }: DashboardHeaderProps) {
  const cycleName = partnerName || 'Partnerky'
  const len = avgLen(starts)

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap py-5 px-0 border-b border-line pb-6.5">
      <div className="flex items-center gap-2.75">
        <Logo variant="gradient" size={34} />
        <h1 className="text-lg font-bold font-display tracking-widest">
          PEERIOD
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <p className="text-sm text-ink-2">
          Cyklus: <b className="font-bold text-ink">{cycleName}</b> · průměr{' '}
          <span className="font-mono">{len}</span> dní
        </p>
        <ThemeSwitch />
      </div>
    </div>
  )
}
