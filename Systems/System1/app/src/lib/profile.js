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

export const REGION_1_PROVINCES = [
  'Ilocos Norte',
  'Ilocos Sur',
  'La Union',
  'Pangasinan',
]

export const REGION_1_MUNICIPALITIES = {
  'Ilocos Norte': [
    'Adams',
    'Bacarra',
    'Badoc',
    'Bangui',
    'Banna',
    'Batac City',
    'Burgos',
    'Carasi',
    'Currimao',
    'Dingras',
    'Dumalneg',
    'Laoag City',
    'Marcos',
    'Nueva Era',
    'Pagudpud',
    'Paoay',
    'Pasuquin',
    'Piddig',
    'Pinili',
    'San Nicolas',
    'Sarrat',
    'Solsona',
    'Vintar',
  ],
  'Ilocos Sur': [
    'Alilem',
    'Banayoyo',
    'Bantay',
    'Burgos',
    'Cabugao',
    'Candon City',
    'Caoayan',
    'Cervantes',
    'Galimuyod',
    'Gregorio del Pilar',
    'Lidlidda',
    'Magsingal',
    'Nagbukel',
    'Narvacan',
    'Quirino',
    'Salcedo',
    'San Emilio',
    'San Esteban',
    'San Ildefonso',
    'San Juan',
    'San Vicente',
    'Santa',
    'Santa Catalina',
    'Santa Cruz',
    'Santa Lucia',
    'Santa Maria',
    'Santiago',
    'Santo Domingo',
    'Sigay',
    'Sinait',
    'Sugpon',
    'Suyo',
    'Tagudin',
    'Vigan City',
  ],
  'La Union': [
    'Agoo',
    'Aringay',
    'Bacnotan',
    'Bagulin',
    'Balaoan',
    'Bangar',
    'Bauang',
    'Burgos',
    'Caba',
    'Luna',
    'Naguilian',
    'Pugo',
    'Rosario',
    'San Fernando City',
    'San Gabriel',
    'San Juan',
    'Santo Tomas',
    'Santol',
    'Sudipen',
    'Tubao',
  ],
  'Pangasinan': [
    'Agno',
    'Aguilar',
    'Alaminos City',
    'Alcala',
    'Anda',
    'Asingan',
    'Balungao',
    'Bani',
    'Basista',
    'Bautista',
    'Bayambang',
    'Binalonan',
    'Binmaley',
    'Bolinao',
    'Bugallon',
    'Burgos',
    'Calasiao',
    'Dagupan City',
    'Dasol',
    'Infanta',
    'Labrador',
    'Laoac',
    'Lingayen',
    'Mabini',
    'Malasiqui',
    'Manaoag',
    'Mangaldan',
    'Mangatarem',
    'Mapandan',
    'Natividad',
    'Pozorrubio',
    'Rosales',
    'San Carlos City',
    'San Fabian',
    'San Jacinto',
    'San Manuel',
    'San Nicolas',
    'San Quintin',
    'Santa Barbara',
    'Santa Maria',
    'Santo Tomas',
    'Sison',
    'Sual',
    'Tayug',
    'Umingan',
    'Urbiztondo',
    'Urdaneta City',
    'Villasis',
  ],
}

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
    province: '',
    municipality: '',
    language: '',
    accessibility: { voice: false, largeText: false, highContrast: false },
    updatedAt: null,
  }
}

export function normalizeProfile(stored) {
  const merged = { ...emptyProfile(), ...stored }
  if (!merged.province && merged.municipality) {
    for (const prov of REGION_1_PROVINCES) {
      if (merged.municipality.includes(prov)) {
        merged.province = prov
        merged.municipality = merged.municipality.replace(new RegExp(`,\\s*${prov}$`), '').trim()
        break
      }
    }
  }
  return merged
}

/**
 * The profile is stored on this device only. It is never written to telemetry
 * and never sent anywhere. The pseudonymous learner id used by the dashboard is
 * separate and contains none of these fields.
 */
export async function loadProfile() {
  try {
    const stored = await db.profile.get('me')
    if (stored) return normalizeProfile(stored)
  } catch {
    // IndexedDB unavailable: fall back to the localStorage mirror
  }
  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      try {
        return normalizeProfile(JSON.parse(raw))
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
  return Boolean(profile?.sector && profile?.ageBand && (profile?.province || profile?.municipality))
}
