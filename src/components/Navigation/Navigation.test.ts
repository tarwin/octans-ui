import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { Navigation } from './index'
import type { NavigationSectionType } from './types'

const SETTINGS_SECTIONS: NavigationSectionType[] = [
  {
    id: 'settings',
    title: 'Settings',
    items: [
      { id: 'org', label: 'Organization' },
      { id: 'billing', label: 'Billing' }
    ]
  }
]

const SECTIONS: NavigationSectionType[] = [
  {
    id: 'main',
    items: [
      { id: 'home', label: 'Home' },
      {
        id: 'settings-opener',
        label: 'Settings',
        subMenu: { title: 'Settings', sections: SETTINGS_SECTIONS }
      }
    ]
  }
]

describe('Navigation drill-down', () => {
  it('drills into a subMenu and comes back', async () => {
    const wrapper = mount(Navigation, {
      props: { sections: SECTIONS, backLabel: 'Main menu' }
    })
    expect(wrapper.text()).toContain('Home')

    const opener = wrapper
      .findAll('a')
      .find((a) => a.text().includes('Settings'))
    await opener!.trigger('click')

    // The top level is replaced by the sub-menu, with a way back.
    expect(wrapper.text()).not.toContain('Home')
    expect(wrapper.text()).toContain('Organization')
    expect(wrapper.text()).toContain('Main menu')
    expect(wrapper.emitted('open-menu')).toHaveLength(1)
    // Opening a menu is not a navigation.
    expect(wrapper.emitted('update:location')).toBeUndefined()

    await wrapper.find('[role="button"]').trigger('click')
    expect(wrapper.text()).toContain('Home')
    expect(wrapper.text()).not.toContain('Organization')
    expect(wrapper.emitted('back')).toHaveLength(1)

    wrapper.unmount()
  })

  it('navigates normally inside a sub-menu', async () => {
    const wrapper = mount(Navigation, { props: { sections: SECTIONS } })
    await wrapper
      .findAll('a')
      .find((a) => a.text().includes('Settings'))!
      .trigger('click')

    const billing = wrapper
      .findAll('a')
      .find((a) => a.text().includes('Billing'))
    await billing!.trigger('click')

    expect(wrapper.emitted('update:location')).toEqual([['billing']])
    wrapper.unmount()
  })
})

describe('Navigation chrome', () => {
  it('marks the active item with the highlight bar only when asked', () => {
    const sections = [
      { id: 's', items: [{ id: 'home', label: 'Home' }] }
    ] as NavigationSectionType[]

    const plain = mount(Navigation, {
      props: { sections, location: 'home' }
    })
    expect(plain.find('[class*="Item__highlight"]').exists()).toBe(false)

    const highlighted = mount(Navigation, {
      props: { sections, location: 'home', highlight: true }
    })
    expect(highlighted.find('[class*="Item__highlight"]').exists()).toBe(true)

    plain.unmount()
    highlighted.unmount()
  })

  it('draws the accent stripe when asked, in a colour of choice', async () => {
    const wrapper = mount(Navigation, {
      props: { sections: [], accentStripe: true }
    })
    expect(wrapper.attributes('class')).toContain('Navigation__stripe')
    expect(wrapper.attributes('style') ?? '').not.toContain(
      '--ui-nav-accentStripeColor'
    )

    await wrapper.setProps({ accentStripe: '#e07a30' })
    expect(wrapper.attributes('style')).toContain(
      '--ui-nav-accentStripeColor: #e07a30'
    )

    await wrapper.setProps({ accentStripe: false })
    expect(wrapper.attributes('class')).not.toContain('Navigation__stripe')

    wrapper.unmount()
  })

  it('renders the edge minimize button by default, and the other positions on request', async () => {
    const wrapper = mount(Navigation, {
      props: { allowMinimize: true, sections: [] }
    })
    expect(wrapper.find('[class*="Min_Button__edge"]').exists()).toBe(true)

    await wrapper.setProps({ minimizePosition: 'bottom' })
    expect(wrapper.find('[class*="Min_Button__edge"]').exists()).toBe(false)
    expect(wrapper.find('[class*="Min_Button__bottom"]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('swaps the logo slot for logoMin while minimized', async () => {
    const wrapper = mount(Navigation, {
      props: { logo: true, allowMinimize: true, sections: [] },
      slots: {
        logo: '<span id="wide">WIDE</span>',
        logoMin: '<span id="square">SQ</span>'
      }
    })
    expect(wrapper.find('#wide').exists()).toBe(true)
    expect(wrapper.find('#square').exists()).toBe(false)

    // Collapsing swaps immediately; expanding lags behind the width animation.
    await wrapper.find('[class*="Min_Button"]').trigger('click')
    expect(wrapper.find('#square').exists()).toBe(true)
    expect(wrapper.find('#wide').exists()).toBe(false)

    wrapper.unmount()
  })

  it('renders a pinned footer with the minimized state exposed', () => {
    const wrapper = mount(Navigation, {
      props: { sections: [] },
      slots: {
        footer: ({ min }: { min: boolean }) =>
          h('span', { id: 'foot' }, min ? 'MIN' : 'FULL')
      }
    })
    expect(wrapper.find('#foot').text()).toBe('FULL')
    expect(wrapper.find('[class*="Footer"]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('shows section icons on the minimized rail, where titles cannot fit', async () => {
    const wrapper = mount(Navigation, {
      props: {
        allowMinimize: true,
        sections: [
          {
            id: 's',
            title: 'Assessments',
            icon: 'mdi:clipboard-outline',
            items: [{ id: 'a', label: 'A' }]
          }
        ] as NavigationSectionType[]
      }
    })
    expect(wrapper.text()).toContain('Assessments')

    await wrapper.find('[class*="Min_Button"]').trigger('click')
    expect(wrapper.text()).not.toContain('Assessments')
    expect(wrapper.find('[class*="Section_headerIcon"]').exists()).toBe(true)

    wrapper.unmount()
  })
})
