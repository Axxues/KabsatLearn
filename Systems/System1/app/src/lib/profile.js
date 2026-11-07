import { db } from './capsuleStore.js'

const KEY = 'kabsat_profile'

export const SECTORS = [
  { id: 'osy', tl: 'Out-of-school youth', en: 'Out-of-school youth' },
  { id: 'student', tl: 'Mag-aaral', en: 'Student' },
  { id: 'working', tl: 'May trabaho', en: 'Working adult' },
  { id: 'unemployed', tl: 'Walang trabaho', en: 'Unemployed' },
  { id: 'women', tl: 'Babae', en: 'Woman' },
  { id: 'senior', tl: 'Senior citizen', en: 'Senior citizen' },
  { id: 'pwd', tl: 'Person with disability', en: 'Person with disability' },
  { id: 'other', tl: 'Iba pa', en: 'Other' },
]

export const AGE_BANDS = ['13-17', '18-24', '25-39', '40-59', '60+']

export const MUNICIPALITIES = [
  'San Fernando City, La Union',
  'Dagupan City, Pangasinan',
  'Laoag City, Ilocos Norte',
  'Batac City, Ilocos Norte',
  'Vigan City, Ilocos Sur',
  'Candon City, Ilocos Sur',
  'Urdaneta City, Pangasinan',
  'San Carlos City, Pangasinan',
  'Alaminos City, Pangasinan',
  'Other municipality, Region 1',
]

export function emptyProfile() {
  return {
    id: 'me',
    nickname: '',
    sector: '',
    ageBand: '',
    municipality: '',
    language: '',
    accessibility: { voice: false, largeText: false, highContrast: false },
    updatedAt: null,
  }
}

/**
 * The profile is stored on this device only. It is never written to telemetry
 * and never sent anywhere. The pseudonymous learner id used by the dashboard is
 * separate and contains none of these fields.
 */
export async function loadProfile() {
  try {
    const stored = await db.profile.get('me')
    if (stored) return { ...emptyProfile(), ...stored }
  } catch {
    // IndexedDB unavailable: fall back to the localStorage mirror
  }
  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      try {
        return { ...emptyProfile(), ...JSON.parse(raw) }
      } catch {
        return emptyProfile()
      }
    }
  }
  return emptyProfile()
}

export async function saveProfile(profile) {
  const record = { ...emptyProfile(), ...profile, id: 'me', updatedAt: Date.now() }
  try {
    await db.profile.put(record)
  } catch {
    // ignore, localStorage still holds it
  }
  if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(record))
  return record
}

export async function clearProfile() {
  try {
    await db.profile.delete('me')
  } catch {
    // ignore
  }
  if (typeof localStorage !== 'undefined') localStorage.removeItem(KEY)
  return emptyProfile()
}

export function isComplete(profile) {
  return Boolean(profile?.sector && profile?.ageBand && profile?.municipality)
}
