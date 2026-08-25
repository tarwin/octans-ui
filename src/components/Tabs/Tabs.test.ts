import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Tabs from './Tabs.vue'

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft', badge: '3' }
]

/**
 * Which indicator preset the root element is carrying. The class names are
 * CSS-module hashed, so this matches on the LOCAL part, which the hash embeds.
 */
const preset = (wrapper: ReturnType<typeof mount>) =>
  wrapper.classes().find((c) => c.includes('indicator')) ?? null

describe('Tabs indicator', () => {
  it('carries no preset when the prop is unset', () => {
    // The point of the geometry tokens: with no preset class, the mark is
    // whatever `--octans-tabs-*` says, so a theme owns the app-wide choice.
    expect(preset(mount(Tabs, { props: { tabs: TABS } }))).toBeNull()
  })

  it('applies the bar preset', () => {
    const wrapper = mount(Tabs, { props: { tabs: TABS, indicator: 'bar' } })
    expect(preset(wrapper)).toContain('indicatorBar')
  })

  it('applies the underline preset', () => {
    // Not a no-op: it restates the token defaults so an instance can opt out
    // of a theme that moved every Tabs to the bar.
    const wrapper = mount(Tabs, {
      props: { tabs: TABS, indicator: 'underline' }
    })
    expect(preset(wrapper)).toContain('indicatorUnderline')
  })

  it('follows the prop when it changes', async () => {
    const wrapper = mount(Tabs, { props: { tabs: TABS, indicator: 'bar' } })
    await wrapper.setProps({ indicator: 'underline' })
    expect(preset(wrapper)).toContain('indicatorUnderline')
  })
})

describe('Tabs content', () => {
  it('renders a badge beside the label', () => {
    const wrapper = mount(Tabs, { props: { tabs: TABS } })
    expect(wrapper.text()).toContain('All')
    expect(wrapper.text()).toContain('3')
  })

  it('renders the tab slot in place of the label', () => {
    const wrapper = mount(Tabs, {
      props: { tabs: TABS },
      slots: { tab: '<span class="custom">{{ params.tab.label }}!</span>' }
    })
    expect(wrapper.findAll('.custom')).toHaveLength(TABS.length)
    expect(wrapper.text()).toContain('All!')
  })
})
