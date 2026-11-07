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
    const p2Button = [...container.querySelectorAll('button')].find(
      (button) => button.textContent.trim() === '2P'
    )
    if (p2Button) click(p2Button)

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

  test('does not swap question stem or options prematurely during the 1600ms reveal phase', () => {
    const soloButton = [...container.querySelectorAll('button')].find((button) =>
      button.textContent.replace(/\s+/g, ' ').trim().startsWith('Isahang Laro')
    )
    expect(soloButton).toBeTruthy()
    click(soloButton)

    // Initial question is question 1
    const h1 = container.querySelector('main h1')
    expect(h1).not.toBeNull()
    expect(h1.textContent).toBe(capsule.questions[0].stem)

    const initialButtons = [...container.querySelectorAll('main button')]
    expect(initialButtons.length).toBe(4)
    capsule.questions[0].options.forEach((opt) => {
      expect(initialButtons.some((b) => b.textContent.includes(opt))).toBe(true)
    })

    // Click an answer tile
    click(initialButtons[0])

    // Immediately in reveal state: stem and options MUST NOT change to question 2
    expect(container.querySelector('main [role="status"]')).not.toBeNull()
    expect(container.querySelector('main h1').textContent).toBe(capsule.questions[0].stem)
    const revealButtons = [...container.querySelectorAll('main button')]
    capsule.questions[0].options.forEach((opt) => {
      expect(revealButtons.some((b) => b.textContent.includes(opt))).toBe(true)
    })
    expect(container.querySelector('main h1').textContent).not.toBe(capsule.questions[1].stem)

    // Halfway through reveal (800ms)
    act(() => {
      vi.advanceTimersByTime(800)
    })
    expect(container.querySelector('main h1').textContent).toBe(capsule.questions[0].stem)

    // End of reveal (remaining 800ms -> total 1600ms)
    act(() => {
      vi.advanceTimersByTime(800)
    })
    // Now should advance to question 2
    expect(container.querySelector('main h1').textContent).toBe(capsule.questions[1].stem)
  })

  test('active quiz screen renders sparkles competency pill and tactile exit button', () => {
    const soloButton = [...container.querySelectorAll('button')].find((button) =>
      button.textContent.replace(/\s+/g, ' ').trim().startsWith('Isahang Laro')
    )
    click(soloButton)

    const sparklesIcon = container.querySelector('main svg.lucide-sparkles')
    expect(sparklesIcon).not.toBeNull()
    const exitButton = container.querySelector('header button[aria-label="Lumabas sa Quiz"]')
    expect(exitButton).not.toBeNull()
    expect(exitButton.querySelector('svg.lucide-x')).not.toBeNull()
  })

  test('allows customizing question time to 20s and reflects in active quiz', () => {
    const time20Button = [...container.querySelectorAll('button')].find(
      (b) => b.textContent.trim() === '20s'
    )
    expect(time20Button).toBeTruthy()
    click(time20Button)

    const soloButton = [...container.querySelectorAll('button')].find((button) =>
      button.textContent.replace(/\s+/g, ' ').trim().startsWith('Isahang Laro')
    )
    click(soloButton)

    // Countdown indicator in question card should display 20s
    expect(container.textContent).toContain('20s')

    // Advance by 5s -> should show 15s remaining
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(container.textContent).toContain('15s')
  })

  test('allows customizing amount of players to 3 and cycles turns through 3 players', () => {
    const p3Button = [...container.querySelectorAll('button')].find(
      (b) => b.textContent.trim() === '3P'
    )
    expect(p3Button).toBeTruthy()
    click(p3Button)

    const passButton = [...container.querySelectorAll('button')].find((button) =>
      button.textContent.replace(/\s+/g, ' ').trim().startsWith('Pass and Play')
    )
    expect(passButton).toBeTruthy()
    expect(passButton.textContent).toContain('3')
    click(passButton)

    // Player 1 turn
    expect(container.textContent).toContain('Turn ni Manlalaro 1')
    const firstOption = container.querySelector('main button')
    click(firstOption)
    act(() => {
      vi.advanceTimersByTime(1600)
    })

    // Player 2 turn
    expect(container.textContent).toContain('Turn ni Manlalaro 2')
    const secondOption = container.querySelector('main button')
    click(secondOption)
    act(() => {
      vi.advanceTimersByTime(1600)
    })

    // Player 3 turn
    expect(container.textContent).toContain('Turn ni Manlalaro 3')
    const thirdOption = container.querySelector('main button')
    click(thirdOption)
    act(() => {
      vi.advanceTimersByTime(1600)
    })

    // Done screen renders 3 players
    expect(container.textContent).toContain('#1')
    expect(container.textContent).toContain('#2')
    expect(container.textContent).toContain('#3')
  })

  test('renders a single unified start button at the bottom that adapts to selected players', () => {
    // By default 1 player is selected
    const soloStart = [...container.querySelectorAll('button')].find((button) =>
      button.textContent.replace(/\s+/g, ' ').trim().startsWith('Isahang Laro')
    )
    expect(soloStart).toBeTruthy()

    // Pass and Play button is NOT present as a second button
    const passButtonsBefore = [...container.querySelectorAll('button')].filter((button) =>
      button.textContent.replace(/\s+/g, ' ').trim().startsWith('Pass and Play')
    )
    expect(passButtonsBefore.length).toBe(0)

    // Selecting 2P switches the single button to Pass and Play
    const p2Button = [...container.querySelectorAll('button')].find(
      (button) => button.textContent.trim() === '2P'
    )
    click(p2Button)

    const passButtonAfter = [...container.querySelectorAll('button')].find((button) =>
      button.textContent.replace(/\s+/g, ' ').trim().startsWith('Pass and Play')
    )
    expect(passButtonAfter).toBeTruthy()
  })

  test('renders options stacked vertically in a single column rather than a 2-column grid', () => {
    const soloButton = [...container.querySelectorAll('button')].find((button) =>
      button.textContent.replace(/\s+/g, ' ').trim().startsWith('Isahang Laro')
    )
    click(soloButton)

    const buttons = [...container.querySelectorAll('main button')]
    expect(buttons.length).toBe(4)
    const optionsContainer = buttons[0].parentElement
    expect(optionsContainer.className).toContain('flex-col')
    expect(optionsContainer.className).not.toContain('grid-cols-2')

    buttons.forEach((btn) => {
      expect(btn.className).toContain('w-full')
    })
  })

  test('clicking X button during quiz opens confirmation modal, cancel dismisses it, and confirm triggers onExit', async () => {
    const onExitMock = vi.fn()
    await act(async () => {
      root.render(
        <I18nProvider>
          <QuizArena capsule={capsule} onExit={onExitMock} />
        </I18nProvider>,
      )
    })

    const soloButton = [...container.querySelectorAll('button')].find((button) =>
      button.textContent.replace(/\s+/g, ' ').trim().startsWith('Isahang Laro'),
    )
    click(soloButton)

    // Quiz is active
    expect(container.querySelector('main h1')).not.toBeNull()

    // Click the X exit button in header
    const exitButton = container.querySelector('header button[aria-label="Lumabas sa Quiz"]')
    expect(exitButton).not.toBeNull()
    click(exitButton)

    // Confirmation modal should be open in document.body
    const modal = document.body.querySelector('[aria-labelledby="confirm-exit-quiz-title"]')
    expect(modal).not.toBeNull()
    expect(modal.textContent).toContain('Lumabas sa Quiz?')
    expect(modal.textContent).toContain(capsule.title)
    expect(onExitMock).not.toHaveBeenCalled()

    // Click Cancel ("Magpatuloy")
    const cancelBtn = [...modal.querySelectorAll('button')].find((b) =>
      b.textContent.includes('Magpatuloy'),
    )
    expect(cancelBtn).not.toBeNull()
    click(cancelBtn)

    // Modal is dismissed, onExit was NOT called
    expect(document.body.querySelector('[aria-labelledby="confirm-exit-quiz-title"]')).toBeNull()
    expect(onExitMock).not.toHaveBeenCalled()
    expect(container.querySelector('main h1')).not.toBeNull()

    // Open modal again and Confirm ("Lumabas")
    click(exitButton)
    const modalAgain = document.body.querySelector('[aria-labelledby="confirm-exit-quiz-title"]')
    expect(modalAgain).not.toBeNull()

    const confirmBtn = [...modalAgain.querySelectorAll('button')].find((b) =>
      b.textContent.includes('Lumabas'),
    )
    expect(confirmBtn).not.toBeNull()
    click(confirmBtn)

    // onExit is now called
    expect(onExitMock).toHaveBeenCalledTimes(1)
  })
})
