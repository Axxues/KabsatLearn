import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import { I18nProvider } from '../lib/i18n.jsx'
import capsule101 from '../data/capsules/capsule-101.json'
import KabsatAI from './KabsatAI.jsx'

let explainResolve = null

vi.mock('../lib/llm.js', () => ({
  engineReady: vi.fn(() => true),
  isModelCached: vi.fn(async () => true),
  loadEngine: vi.fn(async () => ({})),
  explain: vi.fn(
    ({ onToken, signal }) =>
      new Promise((resolve) => {
        explainResolve = (result) => {
          if (signal?.aborted) {
            resolve({ text: '', ok: false, aborted: true })
          } else {
            resolve(result)
          }
        }
        onToken?.('Unang sagot')
      }),
  ),
}))

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {}
  }
})

describe('Kabsat AI send and stop button', () => {
  let container
  let root

  beforeEach(async () => {
    vi.useFakeTimers()
    explainResolve = null
    localStorage.clear()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    await act(async () => {
      root.render(
        <I18nProvider>
          <KabsatAI capsule={capsule101} onExit={() => {}} />
        </I18nProvider>,
      )
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    vi.useRealTimers()
  })

  function getSendButton() {
    return [...container.querySelectorAll('form button')].find((btn) =>
      btn.textContent.includes('Send'),
    )
  }

  function getStopButton() {
    return [...container.querySelectorAll('form button')].find((btn) =>
      btn.textContent.includes('Stop') ||
      btn.textContent.includes('Itigil') ||
      btn.getAttribute('aria-label') === 'Stop' ||
      btn.getAttribute('aria-label') === 'Itigil',
    )
  }

  function setInputValue(input, value) {
    act(() => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
      nativeSetter.call(input, value)
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
  }

  test('initially displays the Send button and no Stop button', () => {
    expect(getSendButton()).not.toBeNull()
    expect(getStopButton()).toBeUndefined()
  })

  test('replaces Send button with Stop button while query is processing, and clicking Stop aborts it', async () => {
    const input = container.querySelector('#ask')
    expect(input).not.toBeNull()

    // Type a content question into the input
    setInputValue(input, 'Paano protektahan ang OTP?')

    const sendBtn = getSendButton()
    expect(sendBtn).not.toBeNull()

    // Submit the form
    await act(async () => {
      const form = input.closest('form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })

    // While query is processing: Send button is replaced by Stop button
    const stopBtn = getStopButton()
    expect(stopBtn).toBeDefined()
    expect(getSendButton()).toBeUndefined()
    expect(stopBtn.querySelector('svg')).not.toBeNull()

    // Click the Stop button
    await act(async () => {
      stopBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    // After stopping: Stop button is replaced back with Send button
    expect(getStopButton()).toBeUndefined()
    expect(getSendButton()).not.toBeNull()
  })

  test('replaces Stop button back with Send button when query finishes normally', async () => {
    const input = container.querySelector('#ask')
    expect(input).not.toBeNull()

    setInputValue(input, 'Ligtas ba ang wallet ko?')

    await act(async () => {
      const form = input.closest('form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })

    // Stop button is visible while processing
    expect(getStopButton()).toBeDefined()

    // Complete the query
    await act(async () => {
      if (explainResolve) {
        explainResolve({ text: 'Ligtas ang iyong wallet kapag maingat.', ok: true })
      }
      await vi.advanceTimersByTimeAsync(1500)
    })

    // After completion, Send button is restored
    expect(getStopButton()).toBeUndefined()
    expect(getSendButton()).not.toBeNull()
  })
})
