import { avgLen, intervals, isOutlier } from '../utils/cycle'

interface PeriodLogProps {
  starts: Date[]
  onAdd: (date: Date) => void
  onDelete: (date: Date) => void
  onToday: () => void
}

const fmt = (d: Date) =>
  `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`
const iso = (d: Date) => d.toISOString().slice(0, 10)

export function PeriodLog({
  starts,
  onAdd,
  onDelete,
  onToday,
}: PeriodLogProps) {
  const MIN_LEN = 21
  const MAX_LEN = 35

  const s = [...starts].sort((a, b) => b.getTime() - a.getTime())
  const iv = intervals(starts)
  const used = iv.filter((n) => !isOutlier(n))
  const skipped = iv.length - used.length
  const spread =
    used.length > 1 ? `${Math.min(...used)}–${Math.max(...used)}` : '—'

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onAdd(new Date(e.target.value + 'T00:00:00'))
    }
  }

  return (
    <div className="border border-line rounded-3.5 p-6 mt-5">
      <h3 className="text-base font-bold mb-3.5">Záznamy menstruace</h3>
      <p className="text-xs text-ink-3 mb-5 pb-5 border-b border-line">
        Každý zadaný začátek přepočítá předpověď. Průměr se počítá z posledních
        šesti cyklů v rozsahu {MIN_LEN}–{MAX_LEN} dní.
      </p>

      <div className="flex gap-2.5 flex-wrap mb-4">
        <input
          type="date"
          defaultValue={iso(new Date())}
          onChange={handleDateChange}
          className="px-3 py-2 border border-line-2 rounded-2.25 bg-card text-ink font-body text-sm"
        />
        <button
          onClick={() => onToday()}
          className="px-3 py-2 border border-ink bg-ink text-paper font-body text-sm font-medium rounded-2.25 cursor-pointer hover:opacity-90"
        >
          Začalo dnes
        </button>
      </div>

      <div className="flex gap-6.5 flex-wrap mb-4.5">
        <div>
          <b className="block font-display text-2xl font-bold tnum">
            {avgLen(starts)}
          </b>
          <span className="text-xs text-ink-3">průměrná délka</span>
        </div>
        <div>
          <b className="block font-display text-2xl font-bold tnum">
            {spread}
          </b>
          <span className="text-xs text-ink-3">rozptyl (dní)</span>
        </div>
        <div>
          <b className="block font-display text-2xl font-bold tnum">
            {starts.length}
          </b>
          <span className="text-xs text-ink-3">záznamů</span>
        </div>
        {skipped > 0 && (
          <div>
            <b className="block font-display text-2xl font-bold tnum">
              {skipped}
            </b>
            <span className="text-xs text-ink-3">mimo průměr</span>
          </div>
        )}
      </div>

      <ul className="list-none m-0 p-0 text-sm">
        {s.map((d, i) => {
          const prev = s[i + 1]
          if (!prev) {
            return (
              <li
                key={iso(d)}
                className="flex items-center gap-3 py-2.25 border-b border-line"
              >
                <time className="tnum min-w-22">{fmt(d)}</time>
                <span className="text-ink-2 text-xs">první záznam</span>
                <button
                  onClick={() => onDelete(d)}
                  className="ml-auto bg-none border-0 text-ink-3 cursor-pointer font-body text-xs underline"
                  style={{ textDecorationOffset: '3px' }}
                >
                  Smazat
                </button>
              </li>
            )
          }

          const n = Math.round(
            (d.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
          )
          const flag = isOutlier(n) ? (
            <span
              className="text-xs uppercase tracking-widest text-p-lute border border-p-lute rounded-full px-2.25 py-0.5"
              title={`Mimo rozsah ${MIN_LEN}–${MAX_LEN} dní, do průměru se nepočítá`}
            >
              mimo průměr
            </span>
          ) : null

          return (
            <li
              key={iso(d)}
              className="flex items-center gap-3 py-2.25 border-b border-line"
            >
              <time className="tnum min-w-22">{fmt(d)}</time>
              <span className="text-ink-2 text-xs">cyklus {n} dní</span>
              {flag}
              <button
                onClick={() => onDelete(d)}
                className="ml-auto bg-none border-0 text-ink-3 cursor-pointer font-body text-xs underline"
              >
                Smazat
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
