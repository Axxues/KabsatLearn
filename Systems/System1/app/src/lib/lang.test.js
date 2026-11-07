import { describe, expect, it } from 'vitest'
import { detectLanguage, matchesLanguage } from './lang.js'

describe('detectLanguage', () => {
  it('detects Tagalog questions', () => {
    expect(detectLanguage('Paano kung hinihingi ang OTP ko?')).toBe('tl')
    expect(detectLanguage('Totoo ba ang ayuda ng DSWD?')).toBe('tl')
    expect(detectLanguage('Nabiktima ako, ano gagawin?')).toBe('tl')
  })

  it('treats Taglish as Tagalog', () => {
    expect(detectLanguage('Paano i-check ang GCash balance ko?')).toBe('tl')
  })

  it('detects English questions', () => {
    expect(detectLanguage('What should I do if someone asks for my OTP?')).toBe('en')
    expect(detectLanguage('How can I tell if this job posting is a scam?')).toBe('en')
  })

  it('defaults to Tagalog when there is nothing to judge', () => {
    expect(detectLanguage('')).toBe('tl')
    expect(detectLanguage('   ')).toBe('tl')
  })
})

describe('matchesLanguage', () => {
  it('rejects an English answer to a Tagalog question', () => {
    expect(matchesLanguage('An OTP is a one-time password.', 'tl')).toBe(false)
  })

  it('accepts a Tagalog answer to a Tagalog question', () => {
    expect(matchesLanguage('Ang OTP ay hindi dapat ibigay kahit kanino.', 'tl')).toBe(true)
  })
})
