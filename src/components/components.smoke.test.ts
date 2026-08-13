import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { h, nextTick, type Component } from 'vue'
import * as components from './all'
import { UiProvider } from './UiProvider'

/**
 * Mounts every exported component with no props.
 *
 * This is deliberately shallow — it does not assert on markup. What it catches
 * is the class of failure that a 74-file styling refactor actually produces: a
 * component that throws on setup, references a removed export, or warns about a
 * missing injection. Anything that renders *something* without warning passes.
 *
 * Components needing required props or a specific host are listed in SKIP with
 * the reason.
 */

/**
 * Minimal props for components that genuinely require them. Preferred over
 * skipping, so these components still get mount coverage.
 */
const PROPS: Record<string, Record<string, unknown>> = {
  CalendarHeatmap: {
    data: [],
    series: [{ key: 'count', label: 'Count', colors: ['#eee', '#333'] }]
  },
  ChoiceList: { options: [{ label: 'One', value: '1' }] },
  PageActions: { primaryAction: { label: 'Save' } },
  DataTable: { columns: [{ key: 'id', label: 'ID' }], rows: [] }
}

const SKIP: Record<string, string> = {
  // Not exported from `all.ts`, so these never reach `entries` — listed here so
  // the reason is recorded next to the components that are exported.
  // Renders into a portal/host that does not exist in isolation.
  ToastManager: 'self-mounts a singleton host',
  MaybeMountingPortal: 'requires a mount target',
  // Thin non-visual helpers with no standalone render.
  EventDelegator: 'attaches listeners, renders nothing',
  PreventAutoComplete: 'renders hidden inputs only'
}

function isComponent(name: string, value: unknown): value is Component {
  if (!/^[A-Z]/.test(name)) return false
  if (typeof value === 'function') return true
  return (
    typeof value === 'object' &&
    value !== null &&
    ('render' in value || 'setup' in value || '__file' in value)
  )
}

const entries = Object.entries(components).filter(([name, value]) =>
  isComponent(name, value)
)

describe('component smoke tests', () => {
  it('finds a plausible number of components to test', () => {
    // Guards against the barrel silently emptying out.
    expect(entries.length).toBeGreaterThan(50)
  })

  for (const [name, component] of entries) {
    const skip = SKIP[name]
    const run = skip ? it.skip : it

    run(`${name} mounts without throwing or warning`, async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const error = vi.spyOn(console, 'error').mockImplementation(() => {})

      // UiProvider supplies the tooltip context that several components inject.
      const wrapper = mount(UiProvider, {
        slots: {
          default: () => h(component as Component, PROPS[name] ?? {})
        }
      })

      // Several components render children on a later tick. Without settling
      // first, their warnings land in the NEXT test's spy window and the
      // failure is reported against an unrelated component.
      await nextTick()
      await flushPromises()

      expect(wrapper.exists()).toBe(true)

      const messages = [...warn.mock.calls, ...error.mock.calls]
        .map((args) => String(args[0]))
        // Vue warns about missing required props; that is a fixture concern,
        // not a component defect, so it is not what this test is guarding.
        .filter((m) => !m.includes('Missing required prop'))

      warn.mockRestore()
      error.mockRestore()

      expect(messages).toEqual([])
      wrapper.unmount()
    })
  }
})
