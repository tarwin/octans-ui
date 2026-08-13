import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { PageActions } from './index'

describe('PageActions', () => {
  it('renders the primary action and any secondary ones', () => {
    const wrapper = mount(PageActions, {
      props: {
        primaryAction: { label: 'Save' },
        secondaryActions: [{ label: 'Discard' }]
      }
    })
    expect(wrapper.text()).toContain('Save')
    expect(wrapper.text()).toContain('Discard')
  })

  // The primary action is the reason to use this component, but it is often
  // computed from state that has not loaded yet — render what we have.
  it('renders without a primary action', () => {
    const wrapper = mount(PageActions, {
      props: { secondaryActions: [{ label: 'Discard' }] }
    })
    expect(wrapper.text()).toContain('Discard')
    expect(wrapper.findAll('button')).toHaveLength(1)
  })

  it('renders with no actions at all', () => {
    expect(mount(PageActions).findAll('button')).toHaveLength(0)
  })

  // `ActionType.onAction` declares no parameters, so it must not be handed
  // any. Binding it straight to `@click` used to pass the MouseEvent, which
  // silently filled in the first optional argument of anything you passed by
  // reference — `onAction: save` where `save(force = false)`.
  it('calls onAction with no arguments', async () => {
    const primary = vi.fn()
    const secondary = vi.fn()
    const wrapper = mount(PageActions, {
      props: {
        primaryAction: { label: 'Save', onAction: primary },
        secondaryActions: [{ label: 'Discard', onAction: secondary }]
      }
    })
    const buttons = wrapper.findAll('button')
    await buttons[0].trigger('click')
    await buttons[1].trigger('click')

    expect(secondary.mock.calls[0]).toEqual([])
    expect(primary.mock.calls[0]).toEqual([])
  })
})
