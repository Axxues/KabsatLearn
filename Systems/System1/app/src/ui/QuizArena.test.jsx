import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import { I18nProvider } from '../lib/i18n.jsx'
import QuizArena from './QuizArena.jsx'

const EMOJI = /\p{Extended_Pictographic}/u

const capsule = {
  title: 'Test Capsule',
  questions: [
    {
      id: 'q1',
      stem: 'Which message is a scam?',
      options: ['A', 'B', 'C', 'D'],
      answer: 0,
      competency: 'scam-spotting',
      band: 'core',
    },
    {
      id: 'q2',
      stem: 'What should you do next?',
      options: ['A', 'B', 'C', 'D'],
      answer: 1,
      competency: 'scam-spotting',
      band: 'core',
    },
    {
      id: 'q3',
      stem: 'Who do you report to?',
      options: ['A', 'B', 'C', 'D'],
      answer: 2,
      competency: 'reporting',
      band: 'core',
    },
  ],
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
})

function click(element) {
  act(() => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

describe('QuizArena two-player header', () => {
  let container
  let root

  beforeEach(async () => {
    vi.useFakeTimers()
    localStorage.clear()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    await act(async () => {
      root.render(
        <I18nProvider>
          <QuizArena capsule={capsule} onExit={() => {}} />
        </I18nProvider>
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

  test('intro header renders back button and no Offline Quiz badge', () => {
    const header = container.querySelector('header')
    expect(header).not.toBeNull()
    const backButton = header.querySelector('button')
    expect(backButton).not.toBeNull()
    expect(header.textContent).not.toMatch(/Offline Quiz/i)
    expect(header.querySelector('svg.lucide-zap')).toBeNull()
  })

  test('intro card does not render 15 seconds or adaptive stat badges', () => {
    expect(container.textContent).not.toContain('15 Seconds')
    expect(container.textContent).not.toContain('15 Segundo')
    expect(container.textContent).not.toContain('Adaptive')
    expect(container.querySelector('svg.lucide-timer')).toBeNull()
    expect(container.querySelector('svg.lucide-trending-up')).toBeNull()
  })

  test('turn label has a leading Users icon and no emoji', () => {
    const passButton = [...container.querySelectorAll('button')].find((button) =>
      button.textContent.replace(/\s+/g, ' ').trim().startsWith('Pass and Play')
    )
    expect(passButton).toBeTruthy()
    click(passButton)

    const header = container.querySelector('header')
    expect(header).not.toBeNull()

    const label = [...header.querySelectorAll('span')].find((span) =>
      span.textContent.includes('Manlalaro')
    )
    expect(label, 'turn label').toBeTruthy()

    expect(label.className).toContain('inline-flex')
    const icon = label.firstElementChild
    expect(icon?.tagName.toLowerCase()).toBe('svg')
    expect(icon.className.baseVal ?? icon.getAttribute('class')).toContain('lucide-users')
    expect(icon.getAttribute('aria-hidden')).toBe('true')

    const text = label.textContent.replace(/\s+/g, ' ').trim()
    expect(text).toBe('Turn ni Manlalaro 1')
    expect(text).not.toMatch(EMOJI)
  })

  test('streak label next to the Flame icon has no emoji', () => {
    const soloButton = [...container.querySelectorAll('button')].find((button) =>
      button.textContent.replace(/\s+/g, ' ').trim().startsWith('Isahang Laro')
    )
    expect(soloButton).toBeTruthy()
    click(soloButton)

    // Answer two questions correctly to reach a streak of 2.
    for (let question = 0; question < 2; question += 1) {
      const correctTile = [...container.querySelectorAll('main button')].find((button) =>
        button.textContent.includes(capsule.questions[question].options[capsule.questions[question].answer])
      )
      expect(correctTile, `correct tile for question ${question + 1}`).toBeTruthy()
      click(correctTile)
      if (question === 0) {
        act(() => {
          vi.advanceTimersByTime(1600)
        })
      }
    }

    const streak = [...container.querySelectorAll('span')].find((span) =>
      span.textContent.includes('Streak')
    )
    expect(streak, 'streak label').toBeTruthy()

    const text = streak.textContent.replace(/\s+/g, ' ').trim()
    expect(text).toBe('2x Streak (+Puntos!)')
    expect(text).not.toMatch(EMOJI)
    expect(streak.parentElement.querySelector('svg.lucide-flame')).not.toBeNull()
  })

  test('lobby card uses elevated surface styling and trophy badge', () => {
    const trophyIcon = container.querySelector('svg.lucide-trophy')
    expect(trophyIcon).not.toBeNull()

    const badge = trophyIcon.parentElement
    expect(badge.className).toContain('bg-[var(--color-accent-subtle)]')
    expect(badge.className).toContain('border-[var(--color-accent-border)]')
  })
})
