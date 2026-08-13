import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Sticky from './Sticky.vue'

/**
 * The component renders two roots — the pinned element plus a zero-height
 * sentinel marking where that element sits in normal flow — so assertions go
 * through the pinned one rather than the wrapper. `UIElement` identifies it
 * without depending on a hashed CSS-module name.
 */
const sticky = (props = {}, options = {}) =>
  mount(Sticky, { props, ...options }).find('.UIElement')

const styleOf = (props = {}) => sticky(props).attributes('style') || ''

describe('pinning', () => {
  it('pins to the top edge by default', () => {
    // Regression: this used to read its own `offsetTop` on mount and pin there,
    // so anything not already at the top of its container parked where it
    // started and content scrolled through the gap above it.
    expect(styleOf()).toContain('position: sticky')
    expect(styleOf()).toContain('top: 0px')
  })

  it('takes a pixel offset as a number', () => {
    expect(styleOf({ offset: 16 })).toContain('top: 16px')
  })

  it('passes a string offset to CSS untouched', () => {
    // So `calc()`, custom properties and any other unit reach the browser
    // rather than being parsed here.
    expect(styleOf({ offset: '2rem' })).toContain('top: 2rem')
    expect(styleOf({ offset: 'var(--octans-space-4)' })).toContain(
      'top: var(--octans-space-4)'
    )
  })

  it('pins to the bottom edge when asked', () => {
    const style = styleOf({ position: 'bottom', offset: 8 })
    expect(style).toContain('bottom: 8px')
    expect(style).not.toContain('top:')
  })

  it('drops out of flow control entirely when disabled', () => {
    expect(styleOf({ disabled: true })).not.toContain('sticky')
  })
})

describe('the sentinel', () => {
  it('sits before the content when pinning to the top', () => {
    // Order is what makes it a marker: above the content for a top edge, below
    // it for a bottom one, so it is always on the side the content leaves from.
    const roots = mount(Sticky).findAll('div')
    expect(roots[0].classes()).not.toContain('UIElement')
    expect(roots[1].classes()).toContain('UIElement')
  })

  it('sits after the content when pinning to the bottom', () => {
    const roots = mount(Sticky, { props: { position: 'bottom' } }).findAll(
      'div'
    )
    expect(roots[0].classes()).toContain('UIElement')
    expect(roots[1].classes()).not.toContain('UIElement')
  })

  it('is hidden from assistive technology', () => {
    expect(mount(Sticky).findAll('div')[0].attributes('aria-hidden')).toBe(
      'true'
    )
  })
})

describe('stuck state', () => {
  it('exposes the state to the default slot', () => {
    const wrapper = mount(Sticky, {
      slots: {
        default: '<template #default="{ stuck }">{{ stuck }}</template>'
      }
    })
    // jsdom gives every rect zeros, so nothing measures as displaced here —
    // the binding being present and false is what this asserts.
    expect(wrapper.text()).toBe('false')
  })

  it('carries no stuck class until it is pinned', () => {
    expect(sticky().classes()).not.toContain('Sticky-stuck')
  })

  it('never reports stuck while disabled', async () => {
    const wrapper = mount(Sticky, { props: { disabled: true } })
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:stuck')).toBeUndefined()
    expect(wrapper.find('.UIElement').classes()).not.toContain('Sticky-stuck')
  })
})

describe('markup', () => {
  it('renders its content in a themed wrapper', () => {
    const el = sticky({}, { slots: { default: '<p>content</p>' } })
    // `UIElement` is what gives bare slot content the themed text colour.
    expect(el.find('p').text()).toBe('content')
  })

  it('places passed attributes on the pinned element, not the sentinel', () => {
    // Two roots means no automatic fallthrough, so `inheritAttrs: false` plus
    // an explicit `v-bind` is what keeps a caller's class off the sentinel.
    const el = sticky({}, { attrs: { class: 'mine', 'data-test': 'x' } })
    expect(el.classes()).toContain('mine')
    expect(el.attributes('data-test')).toBe('x')
  })
})
