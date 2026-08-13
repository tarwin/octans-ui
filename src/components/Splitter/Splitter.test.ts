import { beforeEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import Splitter from './Splitter.vue'
import type { SplitterResizeType, SplitterSizeType } from './types'

/**
 * jsdom lays nothing out, so every rect is zero and the drag maths would have
 * nothing to work from. These stubs give the three elements that matter a size:
 * the container a fixed one, the gutter a fixed one, and the START PANE one
 * derived from the inline size the component itself just wrote. That last part
 * is what makes the fake worth having — the pane reports back what the
 * component asked for, so a drag reads its own previous position exactly as it
 * would in a browser.
 */
const CONTAINER = 400
const GUTTER = 8

function stubRect(el: HTMLElement, size: () => number) {
  Object.defineProperty(el, 'getBoundingClientRect', {
    configurable: true,
    value: () => {
      const n = size()
      return { width: n, height: n, top: 0, left: 0, right: n, bottom: n }
    }
  })
}

async function laidOut(props: Record<string, unknown> = {}, options = {}) {
  const wrapper = mount(Splitter, { props, ...options })
  const container = wrapper.element as HTMLElement
  const gutter = wrapper.get('[role="separator"]').element as HTMLElement
  const pane = wrapper.get('[role="separator"]').element
    .previousElementSibling as HTMLElement

  for (const box of ['clientWidth', 'clientHeight'] as const) {
    Object.defineProperty(container, box, {
      configurable: true,
      value: CONTAINER
    })
  }
  stubRect(container, () => CONTAINER)
  stubRect(gutter, () => GUTTER)
  stubRect(pane, () => {
    const declared = pane.style.width || pane.style.height
    if (declared.endsWith('%')) {
      return (parseFloat(declared) / 100) * CONTAINER
    }
    return parseFloat(declared) || 0
  })

  measure(wrapper)
  // Mounting measures, and restores from storage, before the first render —
  // so the ARIA values and any restored size are one tick behind the DOM.
  await nextTick()
  return { wrapper, container, gutter, pane }
}

const measure = (wrapper: VueWrapper) =>
  (wrapper.vm as unknown as { measure(): void }).measure()

const pointer = (type: string, at: number) =>
  Object.assign(new Event(type, { cancelable: true, bubbles: true }), {
    clientX: at,
    clientY: at,
    pointerId: 1
  })

/** A whole press-move-release, in the coordinates the container is stubbed in. */
async function drag(gutter: HTMLElement, from: number, to: number) {
  gutter.dispatchEvent(pointer('pointerdown', from))
  gutter.dispatchEvent(pointer('pointermove', to))
  gutter.dispatchEvent(pointer('pointerup', to))
  await nextTick()
}

const sizes = (wrapper: VueWrapper) =>
  (wrapper.emitted('update:size') ?? []) as Array<[SplitterSizeType]>

const lastSize = (wrapper: VueWrapper) => sizes(wrapper).at(-1)?.[0]

const lastResize = (wrapper: VueWrapper) =>
  ((wrapper.emitted('resize') ?? []) as Array<[SplitterResizeType]>).at(-1)?.[0]

const key = (wrapper: VueWrapper, key: string, modifiers = {}) =>
  wrapper.get('[role="separator"]').trigger('keydown', { key, ...modifiers })

describe('layout', () => {
  it('splits down the middle by default', async () => {
    const { pane } = await laidOut()
    expect(pane.style.width).toBe('50%')
  })

  it('sizes only the start pane, and lets the end pane take the rest', async () => {
    // One size for two panes is what keeps them adding up at any container
    // width — an end pane with its own size would fight the container.
    const { wrapper, pane } = await laidOut({ size: 120 })
    const end = wrapper.get('[role="separator"]').element
      .nextElementSibling as HTMLElement
    expect(pane.style.width).toBe('120px')
    expect(end.style.width).toBe('')
  })

  it('sizes along the other axis when vertical', async () => {
    const { pane } = await laidOut({ direction: 'vertical', size: 80 })
    expect(pane.style.height).toBe('80px')
    expect(pane.style.width).toBe('')
  })

  it('floors the pane at zero so its content cannot widen it', async () => {
    // `min-width: auto` is the flex default, under which a wide table in the
    // pane wins the argument with the gutter and the split stops moving.
    const { pane } = await laidOut()
    expect(pane.style.minWidth).toBe('0px')
  })

  it('applies min and max as real CSS', async () => {
    // So the browser resolves the unit, and so the pane cannot render outside
    // its bounds even when the container is the thing that changed.
    const { pane } = await laidOut({ min: 100, max: '60%' })
    expect(pane.style.minWidth).toBe('100px')
    expect(pane.style.maxWidth).toBe('60%')
  })

  it('renders both panes and the gutter as one root', async () => {
    const wrapper = mount(Splitter, {
      slots: { start: '<p>one</p>', end: '<p>two</p>' },
      attrs: { class: 'mine' }
    })
    expect(wrapper.text()).toContain('one')
    expect(wrapper.text()).toContain('two')
    expect(wrapper.classes()).toContain('mine')
  })
})

describe('dragging', () => {
  it('moves the split by the distance travelled', async () => {
    const { wrapper, gutter } = await laidOut({ size: 200 })
    await drag(gutter, 200, 260)
    expect(lastSize(wrapper)).toBe(260)
  })

  it('clamps to min and max', async () => {
    const { wrapper, gutter } = await laidOut({ size: 200, min: 150, max: 300 })
    await drag(gutter, 200, 10)
    expect(lastSize(wrapper)).toBe(150)
    await drag(gutter, 200, 900)
    expect(lastSize(wrapper)).toBe(300)
  })

  it('never lets the start pane push the gutter off the end', async () => {
    // The ceiling is the container less the gutter, not the container: a pane
    // sized to the whole container would leave nothing to grab.
    const { wrapper, gutter } = await laidOut({ size: 200 })
    await drag(gutter, 200, 5000)
    expect(lastSize(wrapper)).toBe(CONTAINER - GUTTER)
  })

  it('does nothing at all when disabled', async () => {
    const { wrapper, gutter } = await laidOut({ size: 200, disabled: true })
    await drag(gutter, 200, 300)
    expect(wrapper.emitted('update:size')).toBeUndefined()
  })
})

describe('snapping to increments', () => {
  it('rounds a drag to the nearest step', async () => {
    const { wrapper, gutter } = await laidOut({ size: 200, snapTo: 50 })
    await drag(gutter, 200, 268)
    expect(lastSize(wrapper)).toBe(250)
    await drag(gutter, 250, 279)
    expect(lastSize(wrapper)).toBe(300)
  })

  it('takes a percentage of the container', async () => {
    // 10% of 400 is 40, so 215 belongs to the 200 stop.
    const { wrapper, gutter } = await laidOut({ size: 200, snapTo: '10%' })
    await drag(gutter, 200, 215)
    expect(lastResize(wrapper)?.px).toBe(200)
    await drag(gutter, 200, 230)
    expect(lastResize(wrapper)?.px).toBe(240)
  })

  it('leaves the keyboard alone', async () => {
    // `step` is the precise instrument. A coarse drag grid should not drag the
    // arrow keys down with it, which is the whole reason these are two props.
    const { wrapper } = await laidOut({ size: 200, snapTo: 50, step: 5 })
    await key(wrapper, 'ArrowRight')
    expect(lastSize(wrapper)).toBe(205)
  })

  it('leaves Home, End and the reset exact', async () => {
    const { wrapper } = await laidOut({
      size: 200,
      snapTo: 50,
      min: 120,
      max: 310
    })
    await key(wrapper, 'Home')
    expect(lastSize(wrapper)).toBe(120)
    await key(wrapper, 'End')
    expect(lastSize(wrapper)).toBe(310)
    await wrapper.get('[role="separator"]').trigger('dblclick')
    expect(lastSize(wrapper)).toBe(200)
  })

  it('drags continuously when unset', async () => {
    const { wrapper, gutter } = await laidOut({ size: 200 })
    await drag(gutter, 200, 237)
    expect(lastSize(wrapper)).toBe(237)
  })
})

describe('the handle', () => {
  const gripCount = (wrapper: VueWrapper) =>
    wrapper.get('[role="separator"]').findAll('span').length

  it('draws a hairline by default', async () => {
    expect(gripCount((await laidOut()).wrapper)).toBe(1)
  })

  it('adds a grab bar on request', async () => {
    // The bar sits ON the hairline rather than replacing it, so the division
    // still reads as one continuous line.
    expect(gripCount((await laidOut({ handle: 'grip' })).wrapper)).toBe(2)
  })

  it('draws nothing at all when asked, and stays draggable', async () => {
    const { wrapper, gutter } = await laidOut({ size: 200, handle: 'none' })
    expect(gripCount(wrapper)).toBe(0)
    await drag(gutter, 200, 260)
    expect(lastSize(wrapper)).toBe(260)
  })

  it('is replaced entirely by the slot', async () => {
    const { wrapper } = await laidOut(
      { handle: 'grip' },
      { slots: { handle: '<b>mine</b>' } }
    )
    expect(wrapper.get('[role="separator"]').html()).toContain('mine')
    expect(gripCount(wrapper)).toBe(0)
  })

  it('widens its hit area without taking any room', async () => {
    // The overhang is a pseudo-element, so it reaches over the panes while the
    // gutter keeps its own width in the layout.
    const { wrapper } = await laidOut({ hitArea: 32 })
    expect(wrapper.get('[role="separator"]').attributes('style')).toContain(
      '--hit-area: 32px'
    )
  })

  it('carries plain state classes a stylesheet can name', async () => {
    // Hashed CSS-module names cannot be written in a consumer's stylesheet,
    // which is the whole point of these two.
    const { wrapper } = await laidOut({ size: 200, collapsible: true })
    expect(wrapper.classes()).not.toContain('Splitter-collapsed')
    await key(wrapper, 'Enter')
    expect(wrapper.classes()).toContain('Splitter-collapsed')
  })
})

describe('units', () => {
  it('keeps a percentage a percentage', async () => {
    // Otherwise a responsive layout silently converts to fixed pixels the first
    // time anyone touches the gutter, and stops responding to the container.
    const { wrapper, gutter } = await laidOut({ size: '50%' })
    await drag(gutter, 200, 300)
    expect(lastSize(wrapper)).toBe('75%')
  })

  it('keeps a pixel string a pixel string', async () => {
    const { wrapper, gutter } = await laidOut({ size: '200px' })
    await drag(gutter, 200, 260)
    expect(lastSize(wrapper)).toBe('260px')
  })

  it('emits a bare number for a bare number', async () => {
    const { wrapper, gutter } = await laidOut({ size: 200 })
    await drag(gutter, 200, 260)
    expect(lastSize(wrapper)).toBeTypeOf('number')
  })

  it('reports both units on every move, whatever `size` is in', async () => {
    const { wrapper, gutter } = await laidOut({ size: '50%' })
    await drag(gutter, 200, 300)
    expect(lastResize(wrapper)).toEqual({
      px: 300,
      percent: 75,
      collapsed: false
    })
  })
})

describe('the keyboard', () => {
  it('is reachable, and says what it controls', async () => {
    const { wrapper, pane } = await laidOut({ size: 200 })
    const gutter = wrapper.get('[role="separator"]')
    expect(gutter.attributes('tabindex')).toBe('0')
    expect(gutter.attributes('aria-controls')).toBe(pane.id)
    expect(gutter.attributes('aria-valuenow')).toBe('200')
  })

  it('orients the separator across the split, not along it', async () => {
    // The gutter between two side-by-side panes is a vertical line, and
    // `aria-orientation` describes the separator rather than the layout.
    const orientation = async (direction: string) =>
      (await laidOut({ direction })).wrapper
        .get('[role="separator"]')
        .attributes('aria-orientation')

    expect(await orientation('horizontal')).toBe('vertical')
    expect(await orientation('vertical')).toBe('horizontal')
  })

  it('nudges by `step`, and five times that with Shift', async () => {
    const { wrapper } = await laidOut({ size: 200, step: 10 })
    await key(wrapper, 'ArrowRight')
    expect(lastSize(wrapper)).toBe(210)
    await key(wrapper, 'ArrowLeft', { shiftKey: true })
    expect(lastSize(wrapper)).toBe(160)
  })

  it('reports the size it just moved to, not the one before', async () => {
    // Regression: this used to re-measure the DOM immediately after committing,
    // which reads the size Vue has not rendered yet — so `aria-valuenow` sat
    // one press behind and each nudge started from a stale figure. Two presses
    // is the shortest sequence that shows it.
    const { wrapper } = await laidOut({ size: 200, step: 10 })
    const gutter = wrapper.get('[role="separator"]')
    await key(wrapper, 'ArrowRight')
    expect(gutter.attributes('aria-valuenow')).toBe('210')
    await key(wrapper, 'ArrowRight')
    expect(gutter.attributes('aria-valuenow')).toBe('220')
    expect(lastSize(wrapper)).toBe(220)
  })

  it('jumps to the bounds with Home and End', async () => {
    const { wrapper } = await laidOut({ size: 200, min: 50, max: 300 })
    await key(wrapper, 'Home')
    expect(lastSize(wrapper)).toBe(50)
    await key(wrapper, 'End')
    expect(lastSize(wrapper)).toBe(300)
  })

  it('leaves the other axis to the page', async () => {
    // A vertical splitter that swallowed Left and Right would take them from
    // whatever the page wanted to do with them.
    const { wrapper } = await laidOut({ size: 200, direction: 'vertical' })
    await key(wrapper, 'ArrowRight')
    expect(wrapper.emitted('update:size')).toBeUndefined()
  })

  it('is not focusable when disabled', async () => {
    const { wrapper } = await laidOut({ disabled: true })
    const gutter = wrapper.get('[role="separator"]')
    expect(gutter.attributes('tabindex')).toBeUndefined()
    expect(gutter.attributes('aria-disabled')).toBe('true')
  })
})

describe('collapsing', () => {
  it('shuts and reopens with Enter', async () => {
    const { wrapper, pane } = await laidOut({ size: 200, collapsible: true })
    await key(wrapper, 'Enter')
    expect(wrapper.emitted('update:collapsed')?.at(-1)).toEqual([true])
    expect(pane.style.width).toBe('0px')

    await key(wrapper, 'Enter')
    expect(wrapper.emitted('update:collapsed')?.at(-1)).toEqual([false])
    // Back to where it was, not to some default.
    expect(pane.style.width).toBe('200px')
  })

  it('ignores Enter when it cannot collapse', async () => {
    const { wrapper } = await laidOut({ size: 200 })
    await key(wrapper, 'Enter')
    expect(wrapper.emitted('update:collapsed')).toBeUndefined()
  })

  it('drops the minimum while shut', async () => {
    // `min` would otherwise hold the pane open at exactly the width the user
    // just dragged it shut past.
    const { wrapper, pane } = await laidOut({
      size: 200,
      min: 150,
      collapsible: true
    })
    await key(wrapper, 'Enter')
    expect(pane.style.minWidth).toBe('0px')
  })

  it('snaps shut once dragged `snap` past the minimum', async () => {
    const { wrapper } = await laidOut({
      size: 200,
      min: 150,
      snap: 40,
      collapsible: true
    })
    const gutter = wrapper.get('[role="separator"]').element as HTMLElement

    // 149 is under the minimum but not past the threshold — it holds open.
    await drag(gutter, 200, 149)
    expect(lastResize(wrapper)?.collapsed).toBe(false)
    expect(lastSize(wrapper)).toBe(150)

    await drag(gutter, 150, 100)
    expect(lastResize(wrapper)?.collapsed).toBe(true)
  })

  it('holds the pane at its minimum instead when it cannot collapse', async () => {
    const { wrapper, gutter } = await laidOut({ size: 200, min: 150, snap: 40 })
    await drag(gutter, 200, 20)
    expect(lastSize(wrapper)).toBe(150)
    expect(wrapper.emitted('update:collapsed')).toBeUndefined()
  })
})

describe('resetting', () => {
  it('returns to the size it was given on mount', async () => {
    const { wrapper, gutter } = await laidOut({ size: 200 })
    await drag(gutter, 200, 320)
    await wrapper.get('[role="separator"]').trigger('dblclick')
    expect(lastSize(wrapper)).toBe(200)
  })

  it('reopens a shut pane', async () => {
    const { wrapper, pane } = await laidOut({ size: 200, collapsible: true })
    await key(wrapper, 'Enter')
    await wrapper.get('[role="separator"]').trigger('dblclick')
    expect(pane.style.width).toBe('200px')
  })

  it('can be turned off', async () => {
    const { wrapper } = await laidOut({ size: 200, resetOnDoubleClick: false })
    await key(wrapper, 'ArrowRight')
    await wrapper.get('[role="separator"]').trigger('dblclick')
    expect(lastSize(wrapper)).toBe(210)
  })
})

describe('deferred resizing', () => {
  it('holds the panes still until the drag ends', async () => {
    const { wrapper, gutter, pane } = await laidOut({
      size: 200,
      deferred: true
    })
    gutter.dispatchEvent(pointer('pointerdown', 200))
    gutter.dispatchEvent(pointer('pointermove', 300))
    await nextTick()

    expect(wrapper.emitted('update:size')).toBeUndefined()
    expect(pane.style.width).toBe('200px')

    gutter.dispatchEvent(pointer('pointerup', 300))
    await nextTick()
    expect(lastSize(wrapper)).toBe(300)
  })

  it('shows where the split will land', async () => {
    const { wrapper, gutter } = await laidOut({ size: 200, deferred: true })
    expect(wrapper.findAll('[aria-hidden="true"]')).toHaveLength(1) // the grip

    gutter.dispatchEvent(pointer('pointerdown', 200))
    gutter.dispatchEvent(pointer('pointermove', 300))
    await nextTick()
    const preview = wrapper.findAll('[aria-hidden="true"]').at(-1)
    expect(preview?.attributes('style')).toContain('left: 300px')

    gutter.dispatchEvent(pointer('pointerup', 300))
    await nextTick()
    expect(wrapper.findAll('[aria-hidden="true"]')).toHaveLength(1)
  })
})

describe('persistence', () => {
  beforeEach(() => window.localStorage.clear())

  it('remembers the size under its key', async () => {
    const { wrapper } = await laidOut({ size: 200, storageKey: 'sidebar' })
    await key(wrapper, 'ArrowRight')
    expect(window.localStorage.getItem('octans-splitter:sidebar')).toBe(
      JSON.stringify({ size: 210, collapsed: false })
    )
  })

  it('restores it on mount, and tells the parent it did', async () => {
    window.localStorage.setItem(
      'octans-splitter:sidebar',
      JSON.stringify({ size: 260, collapsed: false })
    )
    const { wrapper, pane } = await laidOut({
      size: 200,
      storageKey: 'sidebar'
    })
    expect(pane.style.width).toBe('260px')
    // A restore that stayed quiet would leave a bound `v-model` disagreeing
    // with the pane the user is looking at.
    expect(lastSize(wrapper)).toBe(260)
  })

  it('ignores anything it did not write', async () => {
    window.localStorage.setItem('octans-splitter:sidebar', 'not json')
    const { pane } = await laidOut({ size: 200, storageKey: 'sidebar' })
    expect(pane.style.width).toBe('200px')
  })

  it('stays quiet without a key', async () => {
    const { wrapper } = await laidOut({ size: 200 })
    await key(wrapper, 'ArrowRight')
    expect(window.localStorage.length).toBe(0)
  })
})
