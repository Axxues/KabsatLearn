import { COMPETENCIES, COMPETENCY_LABELS } from './schema.js'
import { getCompetencyCourseProgress } from './courseProgress.js'

/** Roll answer events and course reading progress up into mastery figures per competency. */
export function masteryByCompetency(events, activeCompetencies = null, installedCapsules = []) {
  const buckets = new Map()

  for (const event of events) {
    if (event.type !== 'answer') continue
    const bucket = buckets.get(event.competency) ?? { attempts: 0, correct: 0 }
    bucket.attempts += 1
    if (event.correct) bucket.correct += 1
    buckets.set(event.competency, bucket)
  }

  const list = activeCompetencies
    ? COMPETENCIES.filter((c) => activeCompetencies.has(c))
    : COMPETENCIES

  return list.map((competency) => {
    const bucket = buckets.get(competency) ?? { attempts: 0, correct: 0 }
    const quizScore = bucket.attempts === 0 ? null : Math.round((bucket.correct / bucket.attempts) * 100)
    const courseProg = getCompetencyCourseProgress(competency, installedCapsules)

    let mastery = null
    if (bucket.attempts > 0 && courseProg?.hasActivity) {
      mastery = Math.round(courseProg.percent * 0.5 + quizScore * 0.5)
    } else if (bucket.attempts > 0) {
      mastery = quizScore
    } else if (courseProg?.hasActivity) {
      mastery = courseProg.percent
    }

    return {
      competency,
      label: COMPETENCY_LABELS[competency],
      attempts: bucket.attempts,
      correct: bucket.correct,
      quizMastery: quizScore,
      courseProgress: courseProg?.hasActivity ? courseProg.percent : null,
      mastery,
    }
  })
}

/** Competencies below the line, weakest first. These are what a facilitator acts on. */
export function proposedRemediations(events, threshold = 60, activeCompetencies = null, installedCapsules = []) {
  return masteryByCompetency(events, activeCompetencies, installedCapsules)
    .filter((row) => row.mastery !== null && row.mastery < threshold)
    .sort((a, b) => a.mastery - b.mastery)
    .map((row) => ({
      competency: row.competency,
      label: row.label,
      mastery: row.mastery,
      reason:
        row.attempts > 0
          ? `${row.label} mastery at ${row.mastery}% across ${row.attempts} answers`
          : `${row.label} course progress at ${row.mastery}%`,
    }))
}
