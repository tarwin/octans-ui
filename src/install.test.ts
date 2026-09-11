import { createApp } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Octans from './lib'
import { getTimezone, setTimezone } from './utils/date'

/**
 * `locale` has been an install option since the plugin existed and `timezone`
 * had not, so an app configuring both installed the plugin and then made a
 * second, separate call. Leaving it out failed quietly — dates fall back to
 * the viewer's own clock, which looks correct to whoever is testing from the
 * same country as the server.
 */
function install(options?: Record<string, unknown>) {
  createApp({ render: () => null }).use(Octans as any, options)
}

afterEach(() => {
  setTimezone(undefined)
  vi.restoreAllMocks()
})

describe('plugin install options', () => {
  it('sets the display time zone', () => {
    install({ timezone: 'Australia/Sydney' })
    expect(getTimezone()).toBe('Australia/Sydney')
  })

  it('leaves the viewer on their own clock when unset', () => {
    install()
    expect(getTimezone()).toBeUndefined()
  })

  it('warns and falls back on a zone the runtime does not know', () => {
    // A typo here is the kind that survives review — `Sidney` reads fine.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    install({ timezone: 'Australia/Sidney' })
    expect(getTimezone()).toBeUndefined()
    expect(warn).toHaveBeenCalled()
  })

  it('still applies the locale alongside it', () => {
    install({ locale: 'en', timezone: 'Europe/Paris' })
    expect(getTimezone()).toBe('Europe/Paris')
  })
})
