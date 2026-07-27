/**
 * Extract insights from notes for a specific cycle day
 */
export function getNotesForCycleDay(
  _noteDate: Date,
  cycleDay: number,
  starts: Date[],
  allNotes: Array<{ date: Date; content: string }>
): string | null {
  if (cycleDay < 1 || cycleDay > 28) return null

  // Find all notes from the same cycle day (not calendar day, but position in cycle)
  const notesForDay = allNotes.filter((note) => {
    // Find which cycle this note belongs to
    const noteTime = note.date.getTime()
    for (let i = 0; i < starts.length; i++) {
      const cycleStart = starts[i].getTime()
      const nextCycleStart = i + 1 < starts.length ? starts[i + 1].getTime() : cycleStart + 28 * 864e5

      if (noteTime >= cycleStart && noteTime < nextCycleStart) {
        const dayInCycle = Math.floor((noteTime - cycleStart) / 864e5) + 1
        return dayInCycle === cycleDay
      }
    }
    return false
  })

  if (notesForDay.length === 0) return null

  // Extract last 1-2 sentences from the most recent note
  const mostRecentNote = notesForDay[notesForDay.length - 1]
  const sentences = mostRecentNote.content
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  if (sentences.length === 0) return null

  // Get last 1-2 sentences
  const relevantSentences = sentences.slice(-2).join('. ')

  if (relevantSentences.length < 10) return null // Too short to be meaningful

  return relevantSentences
}
