import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useBackCloses } from '../lib/backButton'
import { Heart, INTIMACY_LABEL, type IntimacyKind } from './Heart'

// Názvy se ukládají do cycle_symptoms jako text, takže přejmenování by
// odtrhlo staré záznamy. Nové položky jen přidávat.
const BODY_SYMPTOMS = ['Bolest', 'Nausea', 'Nadýmání', 'Citlivá prsa', 'Bolest hlavy']

/** Nálada a energie po dvojicích. Zaškrtnutí jedné strany zruší druhou. */
const MOOD_PAIRS: [string, string][] = [
  ['Únava', 'Plno energie'],
  ['Nespavost', 'Dobrý spánek'],
  ['Podrážděnost', 'Pohoda'],
  ['Citlivost/plačtivost', 'Vyrovnanost'],
  ['Zvýšené libido', 'Snížené libido'],
]

const OPPOSITE = new Map(MOOD_PAIRS.flatMap(([a, b]) => [[a, b], [b, a]]))

const INTIMACY_KINDS: IntimacyKind[] = ['cuddle', 'sex']

// Lokální datum → YYYY-MM-DD. Ne toISOString() — ta převádí do UTC a v našem
// pásmu posune lokální půlnoc na předchozí den.
const iso = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

const short = (d: Date) => `${d.getDate()}. ${d.getMonth() + 1}.`

interface DayTrackingModalProps {
  date: Date
  /** dnešek, proti kterému se hlídá zápis do budoucnosti */
  today: Date
  onClose: () => void
  onSave?: () => void
  starts?: Date[]
  ends?: (Date | null)[]
  onPeriodStart?: (date: Date) => void
  onPeriodEnd?: (startDate: Date, endDate: Date) => void
  onPeriodDelete?: (startDate: Date) => void
}

export function DayTrackingModal({ date, today, onClose, onSave, starts = [], ends = [], onPeriodStart, onPeriodEnd, onPeriodDelete }: DayTrackingModalProps) {
  const { user } = useAuth()
  const [notes, setNotes] = useState('')
  const [symptoms, setSymptoms] = useState<Set<string>>(new Set())
  const [intimacy, setIntimacy] = useState<IntimacyKind | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [recordingPeriod, setRecordingPeriod] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  useBackCloses(onClose)

  const dateStr = iso(date)
  // Začátek, konec ani příznaky nejdou zapsat dopředu: budoucí začátek by
  // přepsal průměrnou délku cyklu a s ní celou předpověď.
  const isFuture = dateStr > iso(today)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      setLoading(true)

      const [notesRes, symptomsRes, intimacyRes] = await Promise.all([
        supabase
          .from('cycle_notes')
          .select('content')
          .eq('user_id', user.id)
          .eq('note_date', dateStr)
          .maybeSingle(),
        supabase
          .from('cycle_symptoms')
          .select('symptom')
          .eq('user_id', user.id)
          .eq('symptom_date', dateStr),
        supabase
          .from('cycle_intimacy')
          .select('kind')
          .eq('user_id', user.id)
          .eq('intimacy_date', dateStr)
          .maybeSingle(),
      ])

      setIntimacy((intimacyRes.data?.kind as IntimacyKind | undefined) ?? null)

      if (notesRes.data?.content) {
        setNotes(notesRes.data.content)
      }

      if (symptomsRes.data) {
        setSymptoms(new Set(symptomsRes.data.map((s) => s.symptom)))
      }

      setLoading(false)
    }

    load()
  }, [user, dateStr])

  const toggleSymptom = (symptom: string) => {
    const next = new Set(symptoms)
    if (next.has(symptom)) {
      next.delete(symptom)
    } else {
      next.add(symptom)
      const opposite = OPPOSITE.get(symptom)
      if (opposite) next.delete(opposite)
    }
    setSymptoms(next)
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setSaveError(false)

    try {
      if (intimacy) {
        const { error } = await supabase
          .from('cycle_intimacy')
          .upsert(
            { user_id: user.id, intimacy_date: dateStr, kind: intimacy },
            { onConflict: 'user_id,intimacy_date' }
          )
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('cycle_intimacy')
          .delete()
          .eq('user_id', user.id)
          .eq('intimacy_date', dateStr)
        if (error) throw error
      }

      // Save/update notes
      if (notes) {
        const { error } = await supabase
          .from('cycle_notes')
          .upsert(
            { user_id: user.id, note_date: dateStr, content: notes },
            { onConflict: 'user_id,note_date' }
          )
        if (error) throw error
      } else {
        // Delete note if empty
        await supabase
          .from('cycle_notes')
          .delete()
          .eq('user_id', user.id)
          .eq('note_date', dateStr)
      }

      // Delete all symptoms for this date, then add the selected ones
      const { error: clearError } = await supabase
        .from('cycle_symptoms')
        .delete()
        .eq('user_id', user.id)
        .eq('symptom_date', dateStr)
      if (clearError) throw clearError

      if (symptoms.size > 0) {
        const { error } = await supabase
          .from('cycle_symptoms')
          .insert(
            Array.from(symptoms).map((symptom) => ({
              user_id: user.id,
              symptom_date: dateStr,
              symptom,
            }))
          )
        if (error) throw error
      }

      onSave?.()
      onClose()
    } catch {
      // Okno zůstane otevřené s vyplněnými údaji, ať jde uložit znovu.
      setSaveError(true)
    } finally {
      setSaving(false)
    }
  }

  const symptomBox = (symptom: string) => (
    <label key={symptom} className="symptom-checkbox">
      <input
        type="checkbox"
        checked={symptoms.has(symptom)}
        disabled={isFuture}
        onChange={() => toggleSymptom(symptom)}
      />
      {symptom}
    </label>
  )

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <p style={{ color: 'var(--ink-2)' }}>Načítám…</p>
        </div>
      </div>
    )
  }

  const fmt = (d: Date) => {
    const opts: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
    return d.toLocaleDateString('cs-CZ', opts)
  }

  const hasStartToday = starts.some((s) => iso(s) === iso(date))
  const lastUnclosed = starts.reduce((acc, s, i) => {
    const end = ends[i]
    return (!end && (!acc || s.getTime() > acc.getTime())) ? s : acc
  }, null as Date | null)

  // Find if this day is part of any cycle period, or if it's after the last one
  const cycleContainingDate = starts.findIndex((s, i) => {
    const end = ends[i]
    return iso(s) <= iso(date) && (!end || iso(date) <= iso(end))
  })

  // Find last closed period that could be extended to this date
  const extendableEnd = (() => {
    if (cycleContainingDate !== -1) return cycleContainingDate
    // If not in any period, find the latest one with an end_date that's before this date
    let lastClosed = -1
    for (let i = 0; i < starts.length; i++) {
      if (ends[i] && iso(ends[i]!) < iso(date)) {
        if (lastClosed === -1 || starts[i].getTime() > starts[lastClosed].getTime()) {
          lastClosed = i
        }
      }
    }
    return lastClosed
  })()

  const handleRecordStart = async () => {
    if (!onPeriodStart) return
    setRecordingPeriod(true)
    try {
      onPeriodStart(date)
      onSave?.()
      onClose()
    } finally {
      setRecordingPeriod(false)
    }
  }

  const handleDeleteStart = () => {
    if (!onPeriodDelete) return
    onPeriodDelete(date)
    onClose()
  }

  const nothingToEnd = cycleContainingDate === -1 && extendableEnd === -1 && !lastUnclosed

  const handleRecordEnd = async () => {
    if (!onPeriodEnd) return
    const startToRecord = cycleContainingDate !== -1 ? starts[cycleContainingDate] : (extendableEnd !== -1 ? starts[extendableEnd] : lastUnclosed)
    if (!startToRecord) return
    setRecordingPeriod(true)
    try {
      onPeriodEnd(startToRecord, date)
      onSave?.()
      onClose()
    } finally {
      setRecordingPeriod(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{fmt(date)}</h2>

        <div style={{ marginTop: 24, marginBottom: 24 }}>
          <p className="eyebrow">Menstruace</p>
          {isFuture ? (
            <p className="hint">
              Tenhle den ještě nenastal. Začátek, konec, příznaky i srdíčko jdou zapsat, až přijde.
              Poznámku si můžeš uložit už teď.
            </p>
          ) : confirmingDelete ? (
            <div className="confirm">
              <p>
                Smazat záznam začátku z <b>{short(date)}</b>? Přepočítá se průměrná délka
                cyklu i předpověď a vrátit to jde jen novým zápisem.
              </p>
              <div className="logbar">
                <button className="btn danger" onClick={handleDeleteStart}>
                  Smazat záznam
                </button>
                <button className="btn ghost" onClick={() => setConfirmingDelete(false)}>
                  Nechat
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="logbar">
                {hasStartToday ? (
                  <button className="btn ghost" onClick={() => setConfirmingDelete(true)}>
                    Smazat začátek
                  </button>
                ) : (
                  <button className="btn" onClick={handleRecordStart} disabled={recordingPeriod}>
                    Zaznamenat začátek
                  </button>
                )}
                <button
                  className="btn ghost"
                  onClick={handleRecordEnd}
                  disabled={recordingPeriod || nothingToEnd}
                >
                  {cycleContainingDate !== -1 && ends[cycleContainingDate] ? 'Změnit konec' : (extendableEnd !== -1 && ends[extendableEnd] ? 'Posunout konec' : 'Zaznamenat konec')}
                </button>
              </div>
              {hasStartToday && (
                <p className="hint">Začátek menstruace je pro tento den zapsaný.</p>
              )}
              {nothingToEnd && (
                <p className="hint">Konec jde zapsat, až bude zapsaný začátek.</p>
              )}
            </>
          )}
        </div>

        <div style={{ marginTop: 24, marginBottom: 24 }}>
          <p className="eyebrow">Tělo</p>
          <div className="symptom-grid">{BODY_SYMPTOMS.map(symptomBox)}</div>
        </div>

        <div style={{ marginTop: 24, marginBottom: 24 }}>
          <p className="eyebrow">Nálada a energie</p>
          <div className="symptom-grid symptom-pairs">
            {MOOD_PAIRS.flatMap((pair) => pair.map(symptomBox))}
          </div>
        </div>

        <div style={{ marginTop: 24, marginBottom: 24 }}>
          <p className="eyebrow">Intimita</p>
          <div className="intimacy" role="group" aria-label="Intimita">
            {INTIMACY_KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                className="btn ghost"
                aria-pressed={intimacy === kind}
                disabled={isFuture}
                onClick={() => setIntimacy(intimacy === kind ? null : kind)}
              >
                <Heart kind={kind} />
                {INTIMACY_LABEL[kind]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <p className="eyebrow">Poznámky</p>
          <textarea
            className="input"
            style={{ minHeight: 120 }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Cokoliv, co si chceš poznamenat…"
          />
        </div>

        {saveError && (
          <p className="hint" role="alert" style={{ color: '#B42318' }}>
            Uložit se nepodařilo, zkontroluj připojení a zkus to znovu.
          </p>
        )}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn ghost" onClick={onClose}>
            Zavřít
          </button>
          <button className="btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Ukládám…' : 'Uložit'}
          </button>
        </div>
      </div>
    </div>
  )
}
