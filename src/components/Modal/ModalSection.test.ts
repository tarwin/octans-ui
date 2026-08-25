import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Modal, ModalSection } from './index'

describe('ModalSection', () => {
  it('marks itself so the modal body can stand its padding down', () => {
    // The attribute is the contract between the two stylesheets — they are
    // separate CSS modules, so a class name cannot cross between them.
    const wrapper = mount(ModalSection, { slots: { default: 'Body' } })
    expect(wrapper.attributes('data-modal-section')).toBeDefined()
  })

  it('renders a title from either the prop or the slot', () => {
    expect(mount(ModalSection, { props: { title: 'Account' } }).text()).toBe(
      'Account'
    )
    expect(
      mount(ModalSection, { slots: { title: 'Custom' } }).text()
    ).toContain('Custom')
  })

  it('stacks inside a modal body without extra API', () => {
    // The point of the design: Modal's body is a plain slot, so sections are
    // just children. Nothing on Modal had to learn about them.
    const wrapper = mount(Modal, {
      props: { visible: true, title: 'Settings' },
      slots: {
        default: `
          <div data-modal-section>One</div>
          <div data-modal-section>Two</div>
        `
      },
      global: { stubs: { Teleport: true } }
    })
    expect(wrapper.findAll('[data-modal-section]')).toHaveLength(2)
  })
})
