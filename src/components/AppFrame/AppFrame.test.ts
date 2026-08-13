import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { AppFrame } from './index'
import { GlobalNav } from '@/components/GlobalNav'
import { Navigation } from '@/components/Navigation'

type MediaListener = (event: { matches: boolean }) => void

/**
 * jsdom has no `matchMedia`; this stands one in and hands back the listener
 * so a test can flip the viewport width mid-flight.
 */
function stubMatchMedia(matches: boolean) {
  const listeners: MediaListener[] = []
  const media = {
    matches,
    addEventListener: (_: string, fn: MediaListener) => listeners.push(fn),
    removeEventListener: (_: string, fn: MediaListener) => {
      const index = listeners.indexOf(fn)
      if (index >= 0) listeners.splice(index, 1)
    }
  }
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => media)
  )
  return {
    setMatches(value: boolean) {
      media.matches = value
      for (const fn of [...listeners]) fn({ matches: value })
    }
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

const SIDEBAR = { sidebar: '<nav>side</nav>' }
const TOPBAR = { topbar: '<header>top</header>' }

describe('AppFrame layouts', () => {
  it('renders the topbar row only when there is topbar content', () => {
    const withTopbar = mount(AppFrame, { slots: { ...TOPBAR, ...SIDEBAR } })
    expect(withTopbar.find('[data-app-frame-global-nav]').exists()).toBe(true)

    const withoutTopbar = mount(AppFrame, { slots: SIDEBAR })
    expect(withoutTopbar.find('[data-app-frame-global-nav]').exists()).toBe(
      false
    )

    withTopbar.unmount()
    withoutTopbar.unmount()
  })

  it('sidebarOnly drops the topbar even when the slot is filled, and hosts the save/loading bars', () => {
    const wrapper = mount(AppFrame, {
      props: { layout: 'sidebarOnly' },
      slots: { ...TOPBAR, ...SIDEBAR }
    })

    expect(wrapper.find('[data-app-frame-global-nav]').exists()).toBe(false)
    // The outlets register as hosts even while hidden — their mounting is
    // what stops the auto-mounted fallbacks from doubling up.
    expect(wrapper.findComponent({ name: 'SaveBar' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'LoadingBar' }).exists()).toBe(true)

    wrapper.unmount()
  })

  it('maps the deprecated layoutMode onto the presets', () => {
    const wrapper = mount(AppFrame, {
      props: { layoutMode: 'alternate' },
      slots: SIDEBAR
    })
    expect(wrapper.find('[data-app-frame]').attributes('class')).toContain(
      'Layout__sidebar'
    )
    wrapper.unmount()
  })
})

describe('AppFrame layout context', () => {
  it("lets Navigation's minimize chevron collapse the frame column", async () => {
    const wrapper = mount(AppFrame, {
      slots: {
        sidebar: () =>
          h(Navigation, {
            allowMinimize: true,
            sections: [{ id: 's', items: [{ id: 'a', label: 'A' }] }]
          })
      }
    })
    expect(wrapper.find('[data-app-frame]').attributes('class')).not.toContain(
      'Min'
    )

    await wrapper
      .findComponent(Navigation)
      .find('[class*="Min_Button"]')
      .trigger('click')

    expect(wrapper.find('[data-app-frame]').attributes('class')).toContain(
      'Min'
    )
    wrapper.unmount()
  })

  it('hide mode: the toggle moves into the GlobalNav, hides the sidebar, and peeks on hover', async () => {
    const wrapper = mount(AppFrame, {
      props: { layout: 'sidebar', sidebarCollapse: 'hide' },
      slots: {
        topbar: () => h(GlobalNav, { logo: false }),
        sidebar: () =>
          h(Navigation, {
            allowMinimize: true,
            sections: [{ id: 's', items: [{ id: 'a', label: 'A' }] }]
          })
      },
      attachTo: document.body
    })

    // Navigation's own chevron stands down — the bar owns the control.
    expect(
      wrapper.findComponent(Navigation).find('[class*="Min_Button"]').exists()
    ).toBe(false)

    const collapse = wrapper.find('[aria-label="Collapse sidebar"]')
    expect(collapse.exists()).toBe(true)
    await collapse.trigger('click')
    expect(wrapper.find('[data-app-frame]').attributes('class')).toContain(
      'Hidden'
    )

    // Hovering the (now) expand toggle peeks the sidebar as an overlay.
    const expand = wrapper.find('[aria-label="Expand sidebar"]')
    expect(expand.exists()).toBe(true)
    await expand.trigger('mouseenter')
    expect(wrapper.find('[class*="drawerOpen"]').exists()).toBe(true)

    // Clicking restores it for real.
    await expand.trigger('click')
    expect(wrapper.find('[data-app-frame]').attributes('class')).not.toContain(
      'Hidden'
    )
    expect(wrapper.find('[class*="drawerOpen"]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('gives GlobalNav a hamburger on narrow viewports that opens the drawer', async () => {
    const media = stubMatchMedia(true)
    const wrapper = mount(AppFrame, {
      slots: {
        topbar: () => h(GlobalNav, { logo: false }),
        ...SIDEBAR
      },
      attachTo: document.body
    })

    const hamburger = wrapper.find('[aria-label="Menu"]')
    expect(hamburger.exists()).toBe(true)
    expect(wrapper.find('[class*="Backdrop"]').exists()).toBe(false)

    await hamburger.trigger('click')
    expect(wrapper.find('[class*="Backdrop"]').exists()).toBe(true)

    // Escape closes the drawer.
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(wrapper.find('[class*="Backdrop"]').exists()).toBe(false)

    // Widening the viewport clears narrow mode and the hamburger with it.
    media.setMatches(false)
    await nextTick()
    expect(wrapper.find('[aria-label="Menu"]').exists()).toBe(false)

    wrapper.unmount()
  })
})
