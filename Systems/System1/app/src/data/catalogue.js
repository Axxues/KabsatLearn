import capsule101 from './capsules/capsule-101.json'
import capsule102 from './capsules/capsule-102.json'
import capsule103 from './capsules/capsule-103.json'
import capsule104 from './capsules/capsule-104.json'
import capsule105 from './capsules/capsule-105.json'
import capsule106 from './capsules/capsule-106.json'

/** Presentation metadata keyed by capsule id. Add a line per new capsule. */
export const COURSE_META = {
  'capsule-101': { category: 'Digital Safety', code: 'KABSAT-101', tone: 'safety' },
  'capsule-102': { category: 'Hanapbuhay', code: 'KABSAT-102', tone: 'work' },
  'capsule-103': { category: 'Digital Literacy', code: 'KABSAT-103', tone: 'safety' },
  'capsule-104': { category: 'Perang Pamilya', code: 'KABSAT-104', tone: 'work' },
  'capsule-105': { category: 'Pamilya', code: 'KABSAT-105', tone: 'family' },
  'capsule-106': { category: 'Negosyo', code: 'KABSAT-106', tone: 'business' },
}

export const CAPSULES = [capsule101, capsule102, capsule103, capsule104, capsule105, capsule106]

export const CAPSULE_BY_ID = Object.fromEntries(
  CAPSULES.map((capsule) => [capsule.id, capsule])
)

export const CATALOG = CAPSULES.map((capsule) => ({
  id: capsule.id,
  title: capsule.title,
  subtitle: capsule.subtitle,
  competency: capsule.competency,
  cards: capsule.cards.length,
  questions: capsule.questions.length,
  kb: Math.max(1, Math.round(JSON.stringify(capsule).length / 1024)),
  ...COURSE_META[capsule.id],
}))

export const SEEDED_IDS = ['capsule-101']
