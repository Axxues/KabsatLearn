import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { I18nProvider, useI18n } from './i18n.jsx'

const EMOJI = /\p{Extended_Pictographic}/u

/** Flatten every translated string (nested arrays included) into [path, text] pairs. */
function translatedStrings(value, path = '', out = []) {
  if (typeof value === 'string') out.push([path, value])
  else if (Array.isArray(value)) value.forEach((item, i) => translatedStrings(item, `${path}[${i}]`, out))
  return out
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
})

/** Exposes the live dictionary and two formatted labels to the test through the DOM. */
function Probe() {
  const { setLang, t, translations } = useI18n()
  return (
    <div>
      <pre data-probe="translations">{JSON.stringify(translations)}</pre>
      <span data-probe="turn">{t('turnIndicator', { n: 1 })}</span>
      <span data-probe="streak">{t('streakIndicator', { n: 3 })}</span>
      <button type="button" data-probe="to-en" onClick={() => setLang('en')}>
        en
      </button>
    </div>
  )
}

function dictionary(container) {
  return JSON.parse(container.querySelector('[data-probe="translations"]').textContent)
}

function probeText(container, name) {
  return container.querySelector(`[data-probe="${name}"]`).textContent
}

describe('i18n emoji scan', () => {
  let container
  let root

  beforeEach(async () => {
    localStorage.clear()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    await act(async () => {
      root.render(
        <I18nProvider>
          <Probe />
        </I18nProvider>
      )
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
  })

  test('no Filipino translation contains an emoji', () => {
    for (const [path, text] of translatedStrings(dictionary(container))) {
      expect(text, `fil.${path}`).not.toMatch(EMOJI)
    }
  })

  test('no English translation contains an emoji', async () => {
    act(() => {
      container.querySelector('[data-probe="to-en"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    for (const [path, text] of translatedStrings(dictionary(container))) {
      expect(text, `en.${path}`).not.toMatch(EMOJI)
    }
  })

  test('turn and streak labels keep their {n} placeholder', async () => {
    expect(probeText(container, 'turn')).toBe('Turn ni Manlalaro 1')
    expect(probeText(container, 'streak')).toBe('3x Streak (+Puntos!)')

    act(() => {
      container.querySelector('[data-probe="to-en"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(probeText(container, 'turn')).toBe("Player 1's Turn")
    expect(probeText(container, 'streak')).toBe('3x Streak (+Points!)')
  })
})
