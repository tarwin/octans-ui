import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ScrollPane } from './index'

/**
 * `scrollIntoView` exists because the DOM's own version does not stop at this
 * pane: it walks every scrollable ancestor, so calling it on an item inside a
 * pane that lives in a dropdown or a sheet is as likely to scroll the page out
 * from under the overlay as it is to move the list.
 *
 * jsdom has no layout, so every box here is stated outright. That is not a
 * weaker test than a rendered one would be — the arithmetic is the thing under
 * test, and stating the rects makes the cases (target above, below, already
 * visible) exact rather than approximate.
 */
function rect(top: number, height: number, left = 0, width = 0): DOMRect {
  return {
    top,
    bottom: top + height,
    height,
    left,
    right: left + width,
    width,
    x: left,
    y: top,
    toJSON: () => ({})
  } as DOMRect
}

const PANE = rect(0, 100, 0, 200)

function setup(direction: 'vertical' | 'horizontal' | 'both' = 'vertical') {
  const wrapper = mount(ScrollPane, {
    props: { direction, containerClass: 'pane' },
    slots: { default: '<div id="target">Target</div>' },
    attachTo: document.body
  })
  const pane = wrapper.find('.pane').element as HTMLElement
  const target = wrapper.find('#target').element as HTMLElement

  pane.getBoundingClientRect = () => PANE
  pane.scrollTo = vi.fn()
  Object.defineProperty(pane, 'scrollTop', { value: 0, writable: true })
  Object.defineProperty(pane, 'scrollLeft', { value: 0, writable: true })

  const api = wrapper.vm as unknown as {
    scrollIntoView: (t: unknown, o?: object) => void
  }
  return { wrapper, pane, target, api }
}

describe('ScrollPane.scrollIntoView', () => {
  let ctx: ReturnType<typeof setup>
  beforeEach(() => {
    ctx = setup()
  })

  it('scrolls down just far enough to reveal a target below the fold', () => {
    // Pane shows 0–100; the target sits at 140–160, so 60px of scroll brings
    // its bottom to the pane's bottom and not one pixel further.
    ctx.target.getBoundingClientRect = () => rect(140, 20)
    ctx.api.scrollIntoView(ctx.target)
    expect(ctx.pane.scrollTo).toHaveBeenCalledWith({
      top: 60,
      left: 0,
      behavior: undefined
    })
  })

  it('scrolls up to reveal a target above the fold', () => {
    Object.defineProperty(ctx.pane, 'scrollTop', { value: 200, writable: true })
    ctx.target.getBoundingClientRect = () => rect(-30, 20)
    ctx.api.scrollIntoView(ctx.target)
    expect(ctx.pane.scrollTo).toHaveBeenCalledWith({
      top: 170,
      left: 0,
      behavior: undefined
    })
  })

  it('stays put when the target is already visible', () => {
    Object.defineProperty(ctx.pane, 'scrollTop', { value: 40, writable: true })
    ctx.target.getBoundingClientRect = () => rect(30, 20)
    ctx.api.scrollIntoView(ctx.target)
    expect(ctx.pane.scrollTo).toHaveBeenCalledWith({
      top: 40,
      left: 0,
      behavior: undefined
    })
  })

  it('leaves room when asked for an offset', () => {
    ctx.target.getBoundingClientRect = () => rect(140, 20)
    ctx.api.scrollIntoView(ctx.target, { offset: 12 })
    expect(ctx.pane.scrollTo).toHaveBeenCalledWith({
      top: 72,
      left: 0,
      behavior: undefined
    })
  })

  it('pulls the target to the top for block: "start"', () => {
    ctx.target.getBoundingClientRect = () => rect(30, 20)
    ctx.api.scrollIntoView(ctx.target, { block: 'start' })
    expect(ctx.pane.scrollTo).toHaveBeenCalledWith({
      top: 30,
      left: 0,
      behavior: undefined
    })
  })

  it('centres the target for block: "center"', () => {
    // Target 140–160 in a 100-tall pane: 40px of slack, half above and half
    // below, so the top lands at 140 - 40 = 100.
    ctx.target.getBoundingClientRect = () => rect(140, 20)
    ctx.api.scrollIntoView(ctx.target, { block: 'center' })
    expect(ctx.pane.scrollTo).toHaveBeenCalledWith({
      top: 100,
      left: 0,
      behavior: undefined
    })
  })

  it('resolves a selector inside the pane', () => {
    ctx.target.getBoundingClientRect = () => rect(140, 20)
    ctx.api.scrollIntoView('#target')
    expect(ctx.pane.scrollTo).toHaveBeenCalledWith({
      top: 60,
      left: 0,
      behavior: undefined
    })
  })

  it('ignores a target that is not in this pane', () => {
    // The alternative is scrolling to an arbitrary position computed from a
    // rect that has nothing to do with this container.
    const stranger = document.createElement('div')
    document.body.appendChild(stranger)
    ctx.api.scrollIntoView(stranger)
    expect(ctx.pane.scrollTo).not.toHaveBeenCalled()
    stranger.remove()
  })

  it('ignores a selector that matches nothing', () => {
    ctx.api.scrollIntoView('#nope')
    expect(ctx.pane.scrollTo).not.toHaveBeenCalled()
  })

  it('does nothing to an axis the pane does not scroll', () => {
    // A horizontal pane must leave `scrollTop` alone even though the target
    // is also below the fold — the vertical axis is `overflow: hidden` there,
    // so moving it would do nothing but confuse the indicators.
    const horizontal = setup('horizontal')
    horizontal.target.getBoundingClientRect = () => rect(140, 20, 300, 50)
    horizontal.api.scrollIntoView(horizontal.target)
    expect(horizontal.pane.scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 150,
      behavior: undefined
    })
  })

  it('passes the scroll behaviour through', () => {
    ctx.target.getBoundingClientRect = () => rect(140, 20)
    ctx.api.scrollIntoView(ctx.target, { behavior: 'smooth' })
    expect(ctx.pane.scrollTo).toHaveBeenCalledWith({
      top: 60,
      left: 0,
      behavior: 'smooth'
    })
  })
})
