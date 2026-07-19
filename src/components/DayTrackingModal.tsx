import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const SYMPTOMS = [
  'Bolest',
  'Únava',
  'Nausea',
  'Nadýchání',
  'Citlivá prsa',
  'Bolest hlavy',
  'Nespavost',
  'Zvýšená libido',
]

interface DayTrackingModalProps {
  date: Date
  onClose: () => void
  onSave?: () => void
}

export function DayTrackingModal({ date, onClose, onSave }: DayTrackingModalProps) {
  const { user } = useAuth()
  const [notes, setNotes] = useState('')
  const [symptoms, setSymptoms] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const dateStr = date.toISOString().split('T')[0]

  useEffect(() => {
    const load = async () => {
      if (!user) return
      setLoading(true)

      const [notesRes, symptomsRes] = await Promise.all([
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
      ])

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
    }
    setSymptoms(next)
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)

    try {
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
      await supabase
        .from('cycle_symptoms')
        .delete()
        .eq('user_id', user.id)
        .eq('symptom_date', dateStr)

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
    } finally {
      setSaving(false)
    }
  }

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{fmt(date)}</h2>

        <div style={{ marginTop: 24, marginBottom: 24 }}>
          <p className="eyebrow">Příznaky</p>
          <div className="symptom-grid">
            {SYMPTOMS.map((symptom) => (
              <label key={symptom} className="symptom-checkbox">
                <input
                  type="checkbox"
                  checked={symptoms.has(symptom)}
                  onChange={() => toggleSymptom(symptom)}
                />
                {symptom}
              </label>
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
