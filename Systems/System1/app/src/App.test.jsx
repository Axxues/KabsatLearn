import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import App from './App.jsx'

beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    })
  }
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {}
  }
})

function renderHeader() {
  const html = renderToStaticMarkup(<App />)
  const header = html.match(/<header[\s\S]*?<\/header>/)
  expect(header).not.toBeNull()
  return header[0]
}

describe('app header', () => {
  test('shows no connectivity status chip', () => {
    const header = renderHeader()
    expect(header).not.toMatch(/\b(online|offline)\b/i)
  })

  test('keeps the brand, region badge, page title and theme toggle', () => {
    const header = renderHeader()
    expect(header).toContain('KabsatLearn')
    expect(header).toContain('La Union')
    expect(header).toContain('Mga Kurso')
    expect(header).toContain('alt="KabsatLearn logo"')
    expect(header).toMatch(/aria-label="Switch to dark mode"/)
  })
})

describe('theme toggle', () => {
  let container
  let root

  beforeEach(async () => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    await act(async () => {
      root.render(<App />)
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
  })

  test('toggles theme to dark and sets data-theme and localStorage', async () => {
    const toggleBtn = container.querySelector('button[aria-label="Switch to dark mode"]')
    expect(toggleBtn).not.toBeNull()

    await act(async () => {
      toggleBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('kabsat_theme')).toBe('dark')
    expect(toggleBtn.getAttribute('aria-label')).toBe('Switch to light mode')
  })
})

describe('bottom navigation', () => {
  let container
  let root

  beforeEach(async () => {
    localStorage.clear()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    await act(async () => {
      root.render(<App />)
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    vi.useRealTimers()
  })

  function nav() {
    return container.querySelector('nav[aria-label="Main Navigation"]')
  }

  function buttonStartingWith(text) {
    return [...container.querySelectorAll('button')].find((button) =>
      button.textContent.replace(/\s+/g, ' ').trim().startsWith(text)
    )
  }

  function click(element) {
    act(() => {
      element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
  }

  test('stays visible on the Kabsat AI page', () => {
    click(buttonStartingWith('Kabsat AI'))

    expect(nav()).not.toBeNull()
    expect(container.textContent).toContain('Kabsat AI')
  })

  test('stays visible on the quiz intro and hides only while the quiz runs', () => {
    click(buttonStartingWith('Quiz'))
    expect(nav()).not.toBeNull()

    vi.useFakeTimers()
    click(buttonStartingWith('Isahang Laro'))
    expect(nav()).toBeNull()

    for (let question = 0; question < 10; question += 1) {
      const tile = [...container.querySelectorAll('main button')].find((button) =>
        button.className.includes('bg-gradient-to-br')
      )
      click(tile)
      expect(nav()).toBeNull()

      act(() => {
        vi.advanceTimersByTime(1600)
      })
    }

    expect(nav()).not.toBeNull()
  })
})
