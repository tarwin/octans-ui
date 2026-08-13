import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { GlobalNav } from './index'

describe('GlobalNav', () => {
  // Same contract as everywhere else: `ActionType.onAction` takes no
  // parameters, so the click handler must not forward the MouseEvent.
  it('calls a prefix title action with no arguments', async () => {
    const onAction = vi.fn()
    const wrapper = mount(GlobalNav, {
      props: {
        title: 'Edit exhibition',
        logo: false,
        prefixTitleActions: [{ label: 'Exhibitions', onAction }]
      }
    })

    const action = wrapper
      .findAll('div')
      .find((d) => d.text() === 'Exhibitions')
    expect(action).toBeDefined()

    await action!.trigger('click')
    expect(onAction.mock.calls[0]).toEqual([])
  })

  // The colours used to be written onto `<html>` as inline custom properties,
  // where they were page-global and survived unmount. They are scoped to the
  // component root now.
  it('keeps its theme colours off the document element', () => {
    const wrapper = mount(GlobalNav, { props: { title: 'X', logo: false } })

    expect(
      document.documentElement.style.getPropertyValue('--ui-globalNav-bgColor')
    ).toBe('')
    expect(wrapper.attributes('style')).toContain('--ui-globalNav-bgColor')

    wrapper.unmount()
  })
})
