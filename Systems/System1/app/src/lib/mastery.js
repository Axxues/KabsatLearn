import { COMPETENCIES, COMPETENCY_LABELS } from './schema.js'

/** Roll answer events up into one mastery figure per competency. */
export function masteryByCompetency(events) {
  const buckets = new Map()

  for (const event of events) {
    if (event.type !== 'answer') continue
    const bucket = buckets.get(event.competency) ?? { attempts: 0, correct: 0 }
    bucket.attempts += 1
    if (event.correct) bucket.correct += 1
    buckets.set(event.competency, bucket)
  }

  return COMPETENCIES.map((competency) => {
    const bucket = buckets.get(competency) ?? { attempts: 0, correct: 0 }
    return {
      competency,
      label: COMPETENCY_LABELS[competency],
      attempts: bucket.attempts,
      correct: bucket.correct,
      mastery: bucket.attempts === 0 ? null : Math.round((bucket.correct / bucket.attempts) * 100),
    }
  })
}

/** Competencies below the line, weakest first. These are what a facilitator acts on. */
export function proposedRemediations(events, threshold = 60) {
  return masteryByCompetency(events)
    .filter((row) => row.mastery !== null && row.mastery < threshold)
    .sort((a, b) => a.mastery - b.mastery)
    .map((row) => ({
      competency: row.competency,
      label: row.label,
      mastery: row.mastery,
      reason: `${row.label} mastery at ${row.mastery}% across ${row.attempts} answers`,
    }))
}
