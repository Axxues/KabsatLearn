import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'vitest'
import OfflineBanner from './OfflineBanner.jsx'

const EMOJI = /\p{Extended_Pictographic}/u

describe('OfflineBanner', () => {
  test('renders nothing when online', () => {
    expect(renderToStaticMarkup(<OfflineBanner online />)).toBe('')
  })

  test('uses a lucide icon instead of an emoji when offline', () => {
    const html = renderToStaticMarkup(<OfflineBanner online={false} />)

    expect(html).not.toMatch(EMOJI)
    expect(html).toMatch(/<svg[^>]*class="[^"]*lucide-zap[^"]*"[^>]*aria-hidden="true"/)
    expect(html).toContain('Offline — your courses still work')
    expect(html).toMatch(/role="status"/)
  })
})
