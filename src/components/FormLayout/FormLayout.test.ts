import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import ToggleForm from './FormLayout.fixture.vue'

describe('FormLayout', () => {
  it('keeps static labels with their fields when a v-if above them toggles', async () => {
    const wrapper = mount(ToggleForm)
    const labels = () => wrapper.findAll('[data-field]').map((f) => f.text())
    const expected = ['Type: Contact', 'First Name: David', 'Last Name: Ogburn']
    expect(labels()).toEqual(expected)

    ;(wrapper.vm as any).showConnection = true
    await nextTick()
    expect(wrapper.find('[data-connection]').exists()).toBe(true)
    expect(labels()).toEqual(expected)

    ;(wrapper.vm as any).showConnection = false
    await nextTick()
    expect(labels()).toEqual(expected)
  })

  it('renders no empty item wrapper for a hidden v-if', () => {
    const wrapper = mount(ToggleForm)
    // one wrapper per visible field; the placeholder stays a bare comment
    expect(wrapper.element.children).toHaveLength(3)
  })
})
