import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Divider from './Divider.vue'

/**
 * CSS-module class names are hashed, so `has()` looks for the readable part
 * inside the hashed name rather than matching it whole. `UIElement`, `role` and
 * `Divider-label` are the unhashed anchors, and the ones a consumer can rely on
 * too.
 */
const divider = (props = {}, slots = {}) => mount(Divider, { props, slots })

const classes = (wrapper: ReturnType<typeof divider>) =>
  wrapper.get('.UIElement').classes().join(' ')

const has = (wrapper: ReturnType<typeof divider>, name: string) =>
  wrapper
    .get('.UIElement')
    .classes()
    .some((className) => className.includes(name))

describe('orientation', () => {
  it('is horizontal by default', () => {
    const wrapper = divider()
    expect(has(wrapper, 'horizontal')).toBe(true)
    expect(has(wrapper, 'vertical')).toBe(false)
  })

  it('turns the rule on its side when asked', () => {
    const wrapper = divider({ vertical: true })
    expect(has(wrapper, 'vertical')).toBe(true)
    expect(has(wrapper, 'horizontal')).toBe(false)
  })
})

describe('accessibility', () => {
  it('announces a plain divider as a separator', () => {
    expect(divider().attributes('role')).toBe('separator')
  })

  it('only says which way a separator runs when it is not the default', () => {
    // `separator` is horizontal unless told otherwise, so the attribute would
    // be noise on a horizontal one.
    expect(divider().attributes('aria-orientation')).toBeUndefined()
    expect(divider({ vertical: true }).attributes('aria-orientation')).toBe(
      'vertical'
    )
  })

  it('drops the separator role once there is a label', () => {
    // `separator` makes its children presentational, so keeping the role here
    // would hide the very text the divider exists to show.
    const wrapper = divider({}, { default: () => 'or' })
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('aria-orientation')).toBeUndefined()
    expect(wrapper.text()).toBe('or')
  })
})

describe('label', () => {
  it('renders nothing inside a divider with no label', () => {
    // One box, no nested lines — the element's own border is the rule.
    expect(divider().element.children).toHaveLength(0)
  })

  it('splits the rule in two around the label', () => {
    const wrapper = divider({}, { default: () => 'or' })
    expect(has(wrapper, 'labelled')).toBe(true)
    expect(wrapper.element.children).toHaveLength(3)
  })

  it('centres the label unless told otherwise', () => {
    expect(has(divider({}, { default: () => 'or' }), 'placementCenter')).toBe(
      true
    )
    expect(
      has(
        divider({ placement: 'left' }, { default: () => 'or' }),
        'placementLeft'
      )
    ).toBe(true)
    expect(
      has(
        divider({ placement: 'right' }, { default: () => 'or' }),
        'placementRight'
      )
    ).toBe(true)
  })

  it('ignores placement when there is nothing to place', () => {
    expect(has(divider({ placement: 'left' }), 'placementLeft')).toBe(false)
  })

  it('drops the near-side line entirely for start and end', () => {
    // What separates these from left/right: left keeps a short run of line
    // before the label, start has none at all. Shortening it to zero would
    // leave the flex gap behind and push the label off the edge, so the span
    // has to go rather than shrink.
    const start = divider({ placement: 'start' }, { default: () => 'or' })
    const end = divider({ placement: 'end' }, { default: () => 'or' })
    const left = divider({ placement: 'left' }, { default: () => 'or' })

    expect(start.element.children).toHaveLength(2)
    expect(end.element.children).toHaveLength(2)
    expect(left.element.children).toHaveLength(3)

    // The label leads under `start` and trails under `end`.
    expect(start.element.firstElementChild?.className).toContain(
      'Divider-label'
    )
    expect(end.element.lastElementChild?.className).toContain('Divider-label')
  })

  it('gives the label an unhashed hook to hang styles on', () => {
    // Hashed module names cannot be written in a consumer's stylesheet — the
    // same reason `Sticky` exposes `Sticky-stuck`.
    const wrapper = divider({}, { default: () => 'or' })
    expect(wrapper.find('.Divider-label').text()).toBe('or')
  })
})

describe('spacing', () => {
  it('leaves the default alone when unset', () => {
    expect(classes(divider())).not.toMatch(/spacing/)
  })

  it('maps each step of the scale to a class', () => {
    // The scale is Stack's, so a screen built from both keeps one rhythm.
    for (const [spacing, name] of [
      ['none', 'spacingNone'],
      ['extraTight', 'spacingExtraTight'],
      ['tight', 'spacingTight'],
      ['loose', 'spacingLoose'],
      ['extraLoose', 'spacingExtraLoose']
    ] as const) {
      expect(has(divider({ spacing }), name)).toBe(true)
    }
  })
})

describe('bleed', () => {
  it('stays inside its container by default', () => {
    const wrapper = divider()
    expect(has(wrapper, 'bleed')).toBe(false)
    expect(wrapper.attributes('style')).toBeUndefined()
  })

  it('reaches through the padding CardSection actually uses', () => {
    // `true` leans on the CSS default rather than writing an inline style, so
    // a theme can move it for every divider at once.
    const wrapper = divider({ bleed: true })
    expect(has(wrapper, 'bleed')).toBe(true)
    expect(wrapper.attributes('style')).toBeUndefined()
  })

  it('takes a distance for containers padded differently', () => {
    expect(divider({ bleed: 24 }).attributes('style')).toContain(
      '--Divider-bleed: 24px'
    )
    expect(divider({ bleed: '2rem' }).attributes('style')).toContain(
      '--Divider-bleed: 2rem'
    )
  })
})

describe('line style', () => {
  it('is solid unless dashed', () => {
    expect(has(divider(), 'dashed')).toBe(false)
    expect(has(divider({ dashed: true }), 'dashed')).toBe(true)
  })
})
