import { describe, expect, it } from 'vitest'
import { matchPersona, personaAnswer } from './persona.js'

describe('matchPersona', () => {
  it('recognises a Tagalog identity question', () => {
    expect(matchPersona('sino ka?')?.id).toBe('identity')
    expect(matchPersona('Sino ka ba?')?.id).toBe('identity')
  })

  it('recognises an English identity question', () => {
    expect(matchPersona('who are you?')?.id).toBe('identity')
  })

  it('recognises greetings, thanks and capability questions', () => {
    expect(matchPersona('kumusta ka')?.id).toBe('greeting')
    expect(matchPersona('salamat!')?.id).toBe('thanks')
    expect(matchPersona('what can you do?')?.id).toBe('capability')
    expect(matchPersona('kailangan ba ng internet?')?.id).toBe('offline')
  })

  it('does not mistake content questions for persona questions', () => {
    expect(matchPersona('ano ang OTP')).toBeNull()
    expect(matchPersona('paano kung hinihingi ang OTP ko')).toBeNull()
    expect(matchPersona('totoo ba ang ayuda ng DSWD')).toBeNull()
  })

  it('prefers the more specific phrase', () => {
    expect(matchPersona('sino gumawa sayo')?.id).toBe('creator')
  })
})

describe('personaAnswer', () => {
  it('answers in the requested language', () => {
    const intent = matchPersona('sino ka?')
    expect(personaAnswer(intent, 'tl')).toContain('Kabsat')
    expect(personaAnswer(intent, 'en')).toContain('Kabsat')
    expect(personaAnswer(intent, 'tl')).not.toBe(personaAnswer(intent, 'en'))
  })
})
