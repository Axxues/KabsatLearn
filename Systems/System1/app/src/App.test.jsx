import { beforeAll, describe, expect, test } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
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
