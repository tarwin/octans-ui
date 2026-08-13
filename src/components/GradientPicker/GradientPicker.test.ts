import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createGradient, type Gradient } from '@/utils/gradient'
import GradientPicker from './GradientPicker.vue'

const base = createGradient({
  space: 'srgb',
  stops: [
    { color: '#000000', position: 0 },
    { color: '#ffffff', position: 100 }
  ]
})

function mountPicker(props: Record<string, unknown> = {}) {
  return mount(GradientPicker, { props: { modelValue: base, ...props } })
}

/** The last gradient the component emitted. */
function emitted(wrapper: ReturnType<typeof mount>): Gradient | undefined {
  const events = wrapper.emitted('update:modelValue') as
    Array<[Gradient]> | undefined
  return events?.[events.length - 1]?.[0]
}

const handles = (wrapper: ReturnType<typeof mount>) =>
  wrapper.findAll('[role="slider"][aria-label^="Stop"]')

const button = (wrapper: ReturnType<typeof mount>, title: string) =>
  wrapper.find(`button[title="${title}"]`)

describe('GradientPicker', () => {
  it('renders a handle per stop', () => {
    expect(handles(mountPicker())).toHaveLength(2)
    const three = mountPicker({
      modelValue: createGradient({
        stops: [
          { color: '#000', position: 0 },
          { color: '#f00', position: 40 },
          { color: '#fff', position: 100 }
        ]
      })
    })
    expect(handles(three)).toHaveLength(3)
  })

  it('never mutates the gradient it was given', async () => {
    const original = structuredClone(base)
    const wrapper = mountPicker()
    await button(wrapper, 'Add a stop halfway along').trigger('click')
    // The prop object must come back out untouched — a parent holding it in
    // reactive state would otherwise see changes it never committed.
    expect(base).toEqual(original)
    expect(emitted(wrapper)).not.toBe(base)
  })

  describe('adding stops', () => {
    it('colours a new stop with what the gradient already shows there', async () => {
      // Adding a handle must not change how the gradient looks — it only gives
      // you something to grab.
      const wrapper = mountPicker()
      await button(wrapper, 'Add a stop halfway along').trigger('click')
      const stops = emitted(wrapper)!.stops
      expect(stops).toHaveLength(3)
      expect(stops[2]).toEqual({ color: '#808080', position: 50 })
    })

    it('stops at maxStops', async () => {
      const wrapper = mountPicker({ maxStops: 2 })
      const add = button(wrapper, 'Add a stop halfway along')
      expect(add.attributes('disabled')).toBeDefined()
      await add.trigger('click')
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })
  })

  describe('removing stops', () => {
    it('will not go below two, whatever minStops says', async () => {
      // One stop is not a gradient, so the floor is 2 regardless.
      const wrapper = mountPicker({ minStops: 1 })
      const remove = button(wrapper, 'Remove the selected stop')
      expect(remove.attributes('disabled')).toBeDefined()
    })

    it('removes the selected stop', async () => {
      const wrapper = mountPicker({
        modelValue: createGradient({
          stops: [
            { color: '#000000', position: 0 },
            { color: '#ff0000', position: 50 },
            { color: '#ffffff', position: 100 }
          ]
        })
      })
      await handles(wrapper)[1].trigger('pointerdown')
      await button(wrapper, 'Remove the selected stop').trigger('click')
      expect(emitted(wrapper)!.stops.map((s) => s.position)).toEqual([0, 100])
    })

    it('removes with Delete from the keyboard', async () => {
      const wrapper = mountPicker({
        modelValue: createGradient({
          stops: [
            { color: '#000000', position: 0 },
            { color: '#ff0000', position: 50 },
            { color: '#ffffff', position: 100 }
          ]
        })
      })
      await handles(wrapper)[1].trigger('keydown', { key: 'Delete' })
      expect(emitted(wrapper)!.stops).toHaveLength(2)
    })
  })

  describe('keyboard', () => {
    it('moves a stop with the arrow keys, with Shift for bigger steps', async () => {
      const wrapper = mountPicker()
      await handles(wrapper)[0].trigger('keydown', { key: 'ArrowRight' })
      expect(emitted(wrapper)!.stops[0].position).toBe(1)

      await handles(wrapper)[0].trigger('keydown', {
        key: 'ArrowRight',
        shiftKey: true
      })
      expect(emitted(wrapper)!.stops[0].position).toBe(10)
    })

    it('clamps at the ends rather than wrapping', async () => {
      const wrapper = mountPicker()
      await handles(wrapper)[0].trigger('keydown', { key: 'ArrowLeft' })
      expect(emitted(wrapper)!.stops[0].position).toBe(0)
    })

    it('jumps to the ends with Home and End', async () => {
      const wrapper = mountPicker()
      await handles(wrapper)[0].trigger('keydown', { key: 'End' })
      expect(emitted(wrapper)!.stops[0].position).toBe(100)
    })

    it('ignores keys it does not handle', async () => {
      const wrapper = mountPicker()
      await handles(wrapper)[0].trigger('keydown', { key: 'a' })
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })
  })

  describe('stop order', () => {
    it('keeps the array in author order as stops move past each other', async () => {
      // Re-sorting on every drag would renumber the stops under the pointer and
      // change which one is selected mid-gesture.
      const wrapper = mountPicker()
      await handles(wrapper)[0].trigger('keydown', { key: 'End' })
      const stops = emitted(wrapper)!.stops
      expect(stops[0].color).toBe('#000000')
      expect(stops[0].position).toBe(100)
    })

    it('does sort when the user explicitly asks for even spacing', async () => {
      const wrapper = mountPicker({
        modelValue: createGradient({
          stops: [
            { color: '#ffffff', position: 90 },
            { color: '#000000', position: 10 },
            { color: '#ff0000', position: 50 }
          ]
        })
      })
      await button(wrapper, 'Space the stops evenly').trigger('click')
      expect(emitted(wrapper)!.stops).toEqual([
        { color: '#000000', position: 0 },
        { color: '#ff0000', position: 50 },
        { color: '#ffffff', position: 100 }
      ])
    })

    it('reverses by flipping positions, keeping the colours put', async () => {
      const wrapper = mountPicker()
      expect(emitted(mountPicker())).toBeUndefined()
      await button(wrapper, 'Flip the gradient end for end').trigger('click')
      expect(emitted(wrapper)!.stops).toEqual([
        { color: '#000000', position: 100 },
        { color: '#ffffff', position: 0 }
      ])
    })
  })

  describe('shape controls', () => {
    it('hides the angle for a radial gradient, which has none', async () => {
      const radial = mountPicker({
        modelValue: { ...base, type: 'radial' as const }
      })
      expect(radial.find('input[type="number"][max="360"]').exists()).toBe(
        false
      )

      const linear = mountPicker()
      expect(linear.find('input[type="number"][max="360"]').exists()).toBe(true)
    })

    it('hides shape and angle entirely with hideShape', () => {
      const wrapper = mountPicker({ hideShape: true })
      expect(wrapper.find('input[type="number"][max="360"]').exists()).toBe(
        false
      )
      expect(
        wrapper.find('select[aria-label="Shape of the gradient"]').exists()
      ).toBe(false)
      // The interpolation space still matters when sampling, so it stays.
      expect(
        wrapper
          .find('select[aria-label="Blend in which colour space"]')
          .exists()
      ).toBe(true)
    })

    it('hides the type control when only one type is offered', () => {
      const wrapper = mountPicker({ types: ['linear'] })
      expect(
        wrapper.find('select[aria-label="Shape of the gradient"]').exists()
      ).toBe(false)
    })

    it('changes the interpolation space', async () => {
      const wrapper = mountPicker({ hideShape: true })
      await wrapper
        .find('select[aria-label="Blend in which colour space"]')
        .setValue('oklab')
      expect(emitted(wrapper)!.space).toBe('oklab')
    })
  })

  describe('pinned ends', () => {
    const inset = createGradient({
      space: 'srgb',
      stops: [
        { color: '#000000', position: 20 },
        { color: '#888888', position: 50 },
        { color: '#ffffff', position: 80 }
      ]
    })

    it('shows the ends on the edges even before anything is edited', () => {
      // Displaying one thing and emitting another on first touch would be
      // worse than moving them straight away.
      const wrapper = mountPicker({
        modelValue: inset,
        pinStart: true,
        pinEnd: true
      })
      expect(
        handles(wrapper).map((h) => h.attributes('aria-valuenow'))
      ).toEqual(['0', '50', '100'])
    })

    it('pins only the end that was asked for', () => {
      const startOnly = mountPicker({ modelValue: inset, pinStart: true })
      expect(
        handles(startOnly).map((h) => h.attributes('aria-valuenow'))
      ).toEqual(['0', '50', '80'])

      const endOnly = mountPicker({ modelValue: inset, pinEnd: true })
      expect(
        handles(endOnly).map((h) => h.attributes('aria-valuenow'))
      ).toEqual(['20', '50', '100'])
    })

    it('refuses to move a pinned stop', async () => {
      const wrapper = mountPicker({
        modelValue: inset,
        pinStart: true,
        pinEnd: true
      })
      await handles(wrapper)[0].trigger('keydown', { key: 'ArrowRight' })
      await handles(wrapper)[2].trigger('keydown', { key: 'ArrowLeft' })
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    it('still moves the stops in between', async () => {
      const wrapper = mountPicker({
        modelValue: inset,
        pinStart: true,
        pinEnd: true
      })
      await handles(wrapper)[1].trigger('keydown', { key: 'ArrowRight' })
      expect(emitted(wrapper)!.stops[1].position).toBe(51)
    })

    it('pulls the next stop out when a pinned one is removed', async () => {
      // The constraint is on the ends, not on a particular stop — so removing
      // the stop at 0% must not leave the gradient starting at 50%.
      const wrapper = mountPicker({
        modelValue: inset,
        pinStart: true,
        pinEnd: true
      })
      await handles(wrapper)[0].trigger('pointerdown')
      await button(wrapper, 'Remove the selected stop').trigger('click')
      expect(emitted(wrapper)!.stops.map((s) => s.position)).toEqual([0, 100])
    })

    it('holds the ends through reverse and even spacing', async () => {
      const wrapper = mountPicker({
        modelValue: inset,
        pinStart: true,
        pinEnd: true
      })
      await button(wrapper, 'Flip the gradient end for end').trigger('click')
      expect(
        emitted(wrapper)!
          .stops.map((s) => s.position)
          .sort((a, b) => a - b)
      ).toEqual([0, 50, 100])

      await button(wrapper, 'Space the stops evenly').trigger('click')
      expect(emitted(wrapper)!.stops.map((s) => s.position)).toEqual([
        0, 50, 100
      ])
    })

    it('keeps an added stop inside the pinned ends', async () => {
      const wrapper = mountPicker({
        modelValue: inset,
        pinStart: true,
        pinEnd: true
      })
      await button(wrapper, 'Add a stop halfway along').trigger('click')
      const positions = emitted(wrapper)!.stops.map((s) => s.position)
      expect(Math.min(...positions)).toBe(0)
      expect(Math.max(...positions)).toBe(100)
    })

    it('leaves everything alone when neither end is pinned', () => {
      const wrapper = mountPicker({ modelValue: inset })
      expect(
        handles(wrapper).map((h) => h.attributes('aria-valuenow'))
      ).toEqual(['20', '50', '80'])
    })
  })

  it('falls back to a usable gradient when given nothing', () => {
    const wrapper = mount(GradientPicker)
    expect(handles(wrapper)).toHaveLength(2)
  })

  it('emits nothing at all while disabled', async () => {
    const wrapper = mountPicker({ disabled: true })
    await handles(wrapper)[0].trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
