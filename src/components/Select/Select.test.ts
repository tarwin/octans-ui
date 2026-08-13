import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Select from './Select.vue'

/**
 * Press-and-drag selection, the way a native `<select>` behaves: the menu opens
 * on press, the highlight follows a held pointer, and releasing over an option
 * chooses it.
 *
 * The rule everything hinges on is that a release which has not travelled from
 * where it started is a CLICK, not a drag. Without it the menu would open under
 * the pointer and the release that opened it would pick whatever appeared
 * there.
 */

const OPTIONS = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry', disabled: true },
  { label: 'Damson', value: 'damson' }
]

// `teleport: false` keeps the dropdown inside the wrapper so it can be queried;
// it changes nothing about the pointer handling under test.
function mountSelect(props: Record<string, unknown> = {}) {
  return mount(Select, {
    attachTo: document.body,
    props: { options: OPTIONS, teleport: false, ...props }
  })
}

type Wrapper = ReturnType<typeof mountSelect>

const control = (wrapper: Wrapper) => wrapper.find('[class*="control"]')
const dropdown = (wrapper: Wrapper) => wrapper.find('[class*="Dropdown"]')
const options = (wrapper: Wrapper) => wrapper.findAll('[data-option-index]')

const selection = (wrapper: Wrapper) =>
  (wrapper.emitted('update:modelValue') as Array<[unknown]> | undefined)?.at(
    -1
  )?.[0]

/** A real mouse event, since `trigger` cannot carry coordinates or buttons. */
function mouse(type: string, x: number, y: number) {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    button: 0
  })
}

const ORIGIN = { x: 100, y: 100 }

/** Presses the control and, once open, points `elementFromPoint` at `target`. */
async function press(wrapper: Wrapper) {
  control(wrapper).element.dispatchEvent(mouse('mousedown', ORIGIN.x, ORIGIN.y))
  await nextTick()
}

async function moveTo(x: number, y: number) {
  document.dispatchEvent(mouse('mousemove', x, y))
  await nextTick()
}

async function release(x: number, y: number, over: Element | null) {
  hitTest = over
  document.dispatchEvent(mouse('mouseup', x, y))
  await nextTick()
  await nextTick()
}

/**
 * What `elementFromPoint` should report. jsdom has no layout engine, so it does
 * not implement hit-testing at all and the component has to be told what is
 * under the pointer.
 */
let hitTest: Element | null = null

describe('Select — press and drag', () => {
  beforeEach(() => {
    hitTest = null
    ;(document as Document & { elementFromPoint: unknown }).elementFromPoint =
      () => hitTest
  })

  afterEach(() => {
    vi.restoreAllMocks()
    const doc = document as unknown as Record<string, unknown>
    delete doc.elementFromPoint
  })

  it('opens the menu on press, before the button is released', async () => {
    const wrapper = mountSelect()
    expect(dropdown(wrapper).exists()).toBe(false)
    await press(wrapper)
    expect(dropdown(wrapper).exists()).toBe(true)
    wrapper.unmount()
  })

  it('chooses the option the pointer is released over', async () => {
    const wrapper = mountSelect()
    await press(wrapper)
    const banana = options(wrapper)[1].element
    await moveTo(ORIGIN.x, ORIGIN.y + 40)
    await release(ORIGIN.x, ORIGIN.y + 40, banana)

    expect(selection(wrapper)).toBe('banana')
    // A single-value select closes once it has its answer.
    expect(dropdown(wrapper).exists()).toBe(false)
    wrapper.unmount()
  })

  describe('a click is not a drag', () => {
    it('leaves the menu open when the pointer has not moved', async () => {
      const wrapper = mountSelect()
      await press(wrapper)
      // Released without moving, but over an option — which is exactly what
      // happens when the menu opens upward under the pointer.
      await release(ORIGIN.x, ORIGIN.y, options(wrapper)[1].element)

      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      expect(dropdown(wrapper).exists()).toBe(true)
      wrapper.unmount()
    })

    it('tolerates the wobble in an ordinary click', async () => {
      const wrapper = mountSelect()
      await press(wrapper)
      await moveTo(ORIGIN.x + 2, ORIGIN.y + 2)
      await release(ORIGIN.x + 2, ORIGIN.y + 2, options(wrapper)[1].element)

      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      expect(dropdown(wrapper).exists()).toBe(true)
      wrapper.unmount()
    })

    it('commits once the pointer has clearly travelled', async () => {
      const wrapper = mountSelect()
      await press(wrapper)
      await moveTo(ORIGIN.x, ORIGIN.y + 8)
      await release(ORIGIN.x, ORIGIN.y + 8, options(wrapper)[1].element)

      expect(selection(wrapper)).toBe('banana')
      wrapper.unmount()
    })
  })

  it('does nothing when released away from the list', async () => {
    const wrapper = mountSelect()
    await press(wrapper)
    await moveTo(ORIGIN.x + 300, ORIGIN.y + 300)
    await release(ORIGIN.x + 300, ORIGIN.y + 300, document.body)

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('ignores a disabled option', async () => {
    const wrapper = mountSelect()
    await press(wrapper)
    const cherry = options(wrapper)[2].element
    await moveTo(ORIGIN.x, ORIGIN.y + 60)
    await release(ORIGIN.x, ORIGIN.y + 60, cherry)

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(dropdown(wrapper).exists()).toBe(true)
    wrapper.unmount()
  })

  it('finds the option from a child of it, not just the row itself', async () => {
    // The pointer is almost always over a label or a checkbox, never the row.
    const wrapper = mountSelect()
    await press(wrapper)
    const label = options(wrapper)[3].find('[class*="Option_label"]').element
    await moveTo(ORIGIN.x, ORIGIN.y + 80)
    await release(ORIGIN.x, ORIGIN.y + 80, label)

    expect(selection(wrapper)).toBe('damson')
    wrapper.unmount()
  })

  describe('multiple mode', () => {
    it('toggles on release and stays open for the next one', async () => {
      const wrapper = mountSelect({ multiple: true, modelValue: [] })
      await press(wrapper)
      await moveTo(ORIGIN.x, ORIGIN.y + 40)
      await release(ORIGIN.x, ORIGIN.y + 40, options(wrapper)[1].element)

      expect(selection(wrapper)).toEqual(['banana'])
      // Closing here would fight the whole point of a multi-select.
      expect(dropdown(wrapper).exists()).toBe(true)
      wrapper.unmount()
    })
  })

  describe('dragSelect: false', () => {
    it('does not open on press', async () => {
      const wrapper = mountSelect({ dragSelect: false })
      await press(wrapper)
      expect(dropdown(wrapper).exists()).toBe(false)
      wrapper.unmount()
    })

    it('still opens on click', async () => {
      const wrapper = mountSelect({ dragSelect: false })
      await control(wrapper).trigger('click')
      expect(dropdown(wrapper).exists()).toBe(true)
      wrapper.unmount()
    })

    it('never commits on release', async () => {
      const wrapper = mountSelect({ dragSelect: false })
      await control(wrapper).trigger('click')
      await moveTo(ORIGIN.x, ORIGIN.y + 40)
      await release(ORIGIN.x, ORIGIN.y + 40, options(wrapper)[1].element)

      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      wrapper.unmount()
    })
  })

  it('opens on click for callers that never send a mousedown', async () => {
    // Keeps the component working under test harnesses and synthetic clicks,
    // which is how every existing story and test drives it.
    const wrapper = mountSelect()
    await control(wrapper).trigger('click')
    expect(dropdown(wrapper).exists()).toBe(true)
    wrapper.unmount()
  })

  it('does not open when disabled or readonly', async () => {
    for (const props of [{ disabled: true }, { readonly: true }]) {
      const wrapper = mountSelect(props)
      await press(wrapper)
      expect(dropdown(wrapper).exists()).toBe(false)
      wrapper.unmount()
    }
  })

  it('ignores a non-primary button', async () => {
    const wrapper = mountSelect()
    control(wrapper).element.dispatchEvent(
      new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        button: 2
      })
    )
    await nextTick()
    expect(dropdown(wrapper).exists()).toBe(false)
    wrapper.unmount()
  })

  it('stops tracking the pointer once the component is gone', async () => {
    // A live mousemove listener on `document` outlasting the component is a
    // leak that only shows up as an error much later.
    const remove = vi.spyOn(document, 'removeEventListener')
    const wrapper = mountSelect()
    await press(wrapper)
    wrapper.unmount()

    const removed = remove.mock.calls.map((call) => call[0])
    expect(removed).toContain('mousemove')
    expect(removed).toContain('mouseup')
  })
})
