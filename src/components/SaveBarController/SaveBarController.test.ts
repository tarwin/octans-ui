import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { saveBar } from '@/components/SaveBar'
import SaveBarController from './SaveBarController.vue'

afterEach(() => {
  saveBar.setState('unchanged')
})

describe('SaveBarController', () => {
  // The documented `v-if="dirty"` contract: mounting shows the bar,
  // unmounting hides it. The event-bus version never actually did this —
  // mounting with no props set the state to its 'unchanged' default.
  it('shows the bar on mount and hides it on unmount when given no state', () => {
    const wrapper = mount(SaveBarController)
    expect(saveBar.state).toBe('changed')

    wrapper.unmount()
    expect(saveBar.state).toBe('unchanged')
  })

  it('mirrors an explicit state prop instead', async () => {
    const wrapper = mount(SaveBarController, { props: { state: 'saving' } })
    expect(saveBar.state).toBe('saving')

    await wrapper.setProps({ state: 'changed' })
    expect(saveBar.state).toBe('changed')

    // With the state owned by the prop, unmounting is not a statement.
    wrapper.unmount()
    expect(saveBar.state).toBe('changed')
  })

  it('re-emits save and discard clicks', () => {
    const wrapper = mount(SaveBarController)

    saveBar.save()
    expect(wrapper.emitted('save')).toHaveLength(1)
    expect(wrapper.emitted('update')).toEqual([[true]])

    saveBar.discard()
    expect(wrapper.emitted('discard')).toHaveLength(1)

    wrapper.unmount()
  })
})
