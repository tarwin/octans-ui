import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createGradient, isGradient, type Gradient } from '@/utils/gradient'
import ColorSelector from './ColorSelector.vue'

const GRADIENT = createGradient({
  stops: [
    { color: '#ffd400', position: 0 },
    { color: '#0038ff', position: 100 }
  ]
})

const mountSelector = (props: Record<string, unknown> = {}) =>
  mount(ColorSelector, { props: { modelValue: '#5f63e8', ...props } })

type Wrapper = ReturnType<typeof mountSelector>

const trigger = (wrapper: Wrapper) => wrapper.find('button[aria-label]')

const emitted = (wrapper: Wrapper) =>
  (
    wrapper.emitted('update:modelValue') as
      Array<[string | Gradient]> | undefined
  )?.at(-1)?.[0]

const clearButton = (wrapper: Wrapper) =>
  wrapper.find('[aria-label="Clear the value"]')

/**
 * Opens the popover and hands back a way to query its contents.
 *
 * The panel is portalled to `body`, so it lives outside the wrapper's element
 * and has to be found through the document.
 */
async function open(wrapper: Wrapper) {
  await trigger(wrapper).trigger('click')
  await nextTick()
  await nextTick()
  return {
    find: (selector: string) => document.body.querySelector(selector),
    findAll: (selector: string) => [...document.body.querySelectorAll(selector)]
  }
}

const openSelectors: Wrapper[] = []

function mountOpen(props: Record<string, unknown> = {}) {
  const wrapper = mountSelector(props)
  openSelectors.push(wrapper)
  return wrapper
}

describe('ColorSelector', () => {
  afterEach(() => {
    // Portalled content outlives the test otherwise, and the next document
    // query finds the previous test's panel.
    while (openSelectors.length) openSelectors.pop()!.unmount()
  })

  describe('as a colour field', () => {
    it('shows the value on the trigger', () => {
      const wrapper = mountSelector()
      expect(trigger(wrapper).text()).toContain('#5f63e8')
      expect(trigger(wrapper).attributes('aria-label')).toBe('Colour: #5f63e8')
    })

    it('shows the placeholder when there is no value', () => {
      const wrapper = mountSelector({ modelValue: '' })
      expect(trigger(wrapper).text()).toContain('Choose a colour')
    })

    it('marks a value it cannot paint rather than showing an empty swatch', () => {
      // "Nothing set" and "a colour we cannot draw" must not look identical.
      const paintable = mountSelector()
      const unpaintable = mountSelector({ modelValue: 'var(--octans-primary)' })

      expect(paintable.html()).toContain('background: rgb(95, 99, 232)')
      // The unparseable value is shown as text but never painted — a swatch
      // full of `var(--octans-primary)` would resolve against the EDITOR's theme
      // and show a colour that has nothing to do with the value being edited.
      expect(unpaintable.html()).not.toContain(
        'background: var(--octans-primary)'
      )
      expect(unpaintable.text()).toContain('var(--octans-primary)')
    })

    it('hides the value when showValue is off', () => {
      const wrapper = mountSelector({ showValue: false })
      expect(trigger(wrapper).text()).not.toContain('#5f63e8')
    })
  })

  describe('as a gradient field', () => {
    it('summarises the gradient on the trigger', () => {
      const wrapper = mountSelector({ mode: 'gradient', modelValue: GRADIENT })
      expect(trigger(wrapper).text()).toBe('Linear 90° · 2 stops · OKLCh')
      expect(trigger(wrapper).attributes('aria-label')).toContain('Gradient:')
    })

    it('drops the angle from the summary for a radial gradient', () => {
      // A radial gradient starts from the centre, so an angle would be a lie.
      const wrapper = mountSelector({
        mode: 'gradient',
        modelValue: { ...GRADIENT, type: 'radial' as const }
      })
      expect(trigger(wrapper).text()).toBe('Radial · 2 stops · OKLCh')
    })

    it('drops the shape from the summary when the shape is hidden', () => {
      const wrapper = mountSelector({
        mode: 'gradient',
        modelValue: GRADIENT,
        hideShape: true
      })
      expect(trigger(wrapper).text()).toBe('Linear · 2 stops · OKLCh')
    })

    it('previews the colours left to right whatever the shape', () => {
      // A conic gradient squeezed into a 20px strip is unreadable, and the
      // summary already says what shape it is.
      const wrapper = mountSelector({
        mode: 'gradient',
        modelValue: { ...GRADIENT, type: 'conic' as const, angle: 200 }
      })
      expect(wrapper.html()).toContain('linear-gradient(90deg')
    })
  })

  describe('mode: both', () => {
    it('picks the tab from the type of the value it was given', async () => {
      const asColor = await open(mountOpen({ mode: 'both' }))
      expect(
        asColor.find('[role="tab"][aria-selected="true"]')?.textContent?.trim()
      ).toBe('Solid')

      const asGradient = await open(
        mountOpen({ mode: 'both', modelValue: GRADIENT })
      )
      expect(
        asGradient
          .findAll('[role="tab"][aria-selected="true"]')
          .at(-1)
          ?.textContent?.trim()
      ).toBe('Gradient')
    })

    it('turns a colour into a flat gradient of that same colour', async () => {
      // Switching must not change what you can see. Inventing a second colour
      // would mean undoing it before you could start.
      const wrapper = mountOpen({ mode: 'both' })
      const panel = await open(wrapper)
      ;(panel.findAll('[role="tab"]')[1] as HTMLElement).click()
      await nextTick()

      const value = emitted(wrapper) as Gradient
      expect(isGradient(value)).toBe(true)
      expect(value.stops.map((s) => s.color)).toEqual(['#5f63e8', '#5f63e8'])
      expect(value.stops.map((s) => s.position)).toEqual([0, 100])
    })

    it('collapses a gradient to its first stop', async () => {
      // Sampling the middle would hand back a colour written nowhere in the
      // gradient you were just looking at.
      const wrapper = mountOpen({ mode: 'both', modelValue: GRADIENT })
      const panel = await open(wrapper)
      ;(panel.findAll('[role="tab"]')[0] as HTMLElement).click()
      await nextTick()
      expect(emitted(wrapper)).toBe('#ffd400')
    })

    it('has no switch in the single-purpose modes', async () => {
      expect((await open(mountOpen())).find('[role="tab"]')).toBeNull()
      const gradientOnly = await open(
        mountOpen({ mode: 'gradient', modelValue: GRADIENT })
      )
      expect(gradientOnly.find('[role="tab"]')).toBeNull()
    })
  })

  describe('the surface inside the popover', () => {
    it('shows the colour picker for a colour', async () => {
      const panel = await open(mountOpen())
      expect(panel.find('[aria-label="Hue"]')).not.toBeNull()
      expect(panel.find('[aria-label^="Stop 1"]')).toBeNull()
    })

    it('shows the gradient picker for a gradient', async () => {
      const panel = await open(
        mountOpen({ mode: 'gradient', modelValue: GRADIENT })
      )
      expect(panel.find('[aria-label="Stop 1 position"]')).not.toBeNull()
    })

    it('edits the stop colour in place rather than in a second popover', async () => {
      // The gradient surface gets `inlineColor` here, so editing a stop's
      // colour does not open a third floating layer over this panel.
      const panel = await open(
        mountOpen({ mode: 'gradient', modelValue: GRADIENT })
      )
      // The inline picker's own hue track is present…
      expect(panel.find('[aria-label="Hue"]')).not.toBeNull()
      // …and there is no nested colour trigger to open a second popover from.
      expect(panel.findAll('button[aria-label^="Colour:"]')).toHaveLength(0)
    })
  })

  describe('clearing', () => {
    it('offers a clear button only when there is something to clear', () => {
      expect(
        mountSelector({ clearable: true })
          .find('[aria-label="Clear the value"]')
          .exists()
      ).toBe(true)
      expect(
        clearButton(mountSelector({ clearable: true, modelValue: '' })).exists()
      ).toBe(false)
      expect(clearButton(mountSelector()).exists()).toBe(false)
    })

    it('emits an empty string when cleared', async () => {
      const wrapper = mountSelector({ clearable: true })
      await clearButton(wrapper).trigger('click')
      expect(wrapper.emitted('update:modelValue')).toEqual([['']])
    })

    it('will not clear while read only', async () => {
      const wrapper = mountSelector({ clearable: true, readonly: true })
      await clearButton(wrapper).trigger('click')
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })
  })

  it('locks the trigger for both disabled and readonly', () => {
    // Read-only means "look but do not change", which for a picker with no text
    // entry is the same closed trigger as disabled — but it keeps full contrast.
    expect(
      mountSelector({ disabled: true }).find('button').attributes('disabled')
    ).toBeDefined()
    expect(
      mountSelector({ readonly: true }).find('button').attributes('disabled')
    ).toBeDefined()
  })

  it('renders the label and error through Labelled', () => {
    const wrapper = mountSelector({
      label: 'Accent colour',
      error: 'Fails contrast'
    })
    expect(wrapper.text()).toContain('Accent colour')
    expect(wrapper.text()).toContain('Fails contrast')
  })
})

describe('trigger appearance', () => {
  const swatch = (wrapper: Wrapper) => wrapper.find('[aria-hidden="true"]')

  it('shows the value beside the swatch by default', () => {
    expect(mountSelector().text()).toContain('#5f63e8')
  })

  it('strips the control back to the colour alone', () => {
    // `showValue` is not just ignored — a bare trigger has no room for it, so
    // the text goes whether or not it was asked for.
    const wrapper = mountSelector({ trigger: 'swatch', showValue: true })
    expect(wrapper.text()).not.toContain('#5f63e8')
    expect(
      trigger(wrapper)
        .classes()
        .some((c) => c.includes('trigger__bare'))
    ).toBe(true)
  })

  it('draws the swatch as a circle when asked', () => {
    expect(
      swatch(mountSelector({ swatchShape: 'circle' }))
        .classes()
        .some((c) => c.includes('swatch__circle'))
    ).toBe(true)
    expect(
      swatch(mountSelector())
        .classes()
        .some((c) => c.includes('swatch__circle'))
    ).toBe(false)
  })

  // A gradient swatch is widened so more than two stops read; widening a circle
  // would draw an ellipse, so the shape wins.
  it('keeps a circle round even for a gradient', () => {
    const asSquare = swatch(mountSelector({ modelValue: GRADIENT }))
    const asCircle = swatch(
      mountSelector({ modelValue: GRADIENT, swatchShape: 'circle' })
    )
    expect(asSquare.classes().some((c) => c.includes('swatch__wide'))).toBe(
      true
    )
    expect(asCircle.classes().some((c) => c.includes('swatch__wide'))).toBe(
      false
    )
  })

  it('takes a swatch size as pixels or a CSS length', () => {
    // The property goes on the field's own div, inside the `Labelled` wrapper
    // that is the component's root.
    const style = (wrapper: Wrapper) =>
      wrapper.element.firstElementChild?.getAttribute('style')
    expect(style(mountSelector({ swatchSize: 32 }))).toContain(
      '--ColorSelector-swatchSize: 32px'
    )
    expect(style(mountSelector({ swatchSize: '2rem' }))).toContain(
      '--ColorSelector-swatchSize: 2rem'
    )
  })
})

describe('remembering picked colours', () => {
  /** Opens the popover, changes the value as the picker would, then closes. */
  async function pick(wrapper: Wrapper, value: string | Gradient) {
    await trigger(wrapper).trigger('click')
    await nextTick()
    await wrapper.setProps({ modelValue: value })
    await trigger(wrapper).trigger('click')
    await nextTick()
  }

  const remembered = (wrapper: Wrapper) =>
    (wrapper.emitted('update:swatches') as Array<[string[]]> | undefined)?.at(
      -1
    )?.[0]

  it('says nothing unless asked to remember', async () => {
    const wrapper = mountSelector({ swatches: ['#000000'] })
    await pick(wrapper, '#ff0000')
    expect(wrapper.emitted('update:swatches')).toBeUndefined()
  })

  it('puts the colour at the front of the palette', async () => {
    const wrapper = mountSelector({
      rememberSwatches: true,
      swatches: ['#000000', '#ffffff']
    })
    await pick(wrapper, '#ff0000')
    expect(remembered(wrapper)).toEqual(['#ff0000', '#000000', '#ffffff'])
  })

  it('starts a palette from nothing', async () => {
    const wrapper = mountSelector({ rememberSwatches: true })
    await pick(wrapper, '#ff0000')
    expect(remembered(wrapper)).toEqual(['#ff0000'])
  })

  // Opening a picker and closing it again is not choosing anything.
  it('remembers nothing when the value did not move', async () => {
    const wrapper = mountSelector({ rememberSwatches: true })
    await trigger(wrapper).trigger('click')
    await nextTick()
    await trigger(wrapper).trigger('click')
    await nextTick()
    expect(wrapper.emitted('update:swatches')).toBeUndefined()
  })

  // `#f00` and `#ff0000` are one colour, and a palette holding both looks
  // broken. The spelling that was picked is the one kept.
  it('does not list the same colour twice under two spellings', async () => {
    const wrapper = mountSelector({
      rememberSwatches: true,
      swatches: ['#ff0000', '#000000']
    })
    await pick(wrapper, '#f00')
    expect(remembered(wrapper)).toEqual(['#f00', '#000000'])
  })

  it('drops the oldest once a cap is set', async () => {
    const wrapper = mountSelector({
      rememberSwatches: true,
      maxSwatches: 2,
      swatches: ['#000000', '#ffffff']
    })
    await pick(wrapper, '#ff0000')
    expect(remembered(wrapper)).toEqual(['#ff0000', '#000000'])
  })

  it('keeps every swatch when there is no cap', async () => {
    const wrapper = mountSelector({
      rememberSwatches: true,
      swatches: ['#000000', '#ffffff', '#123456']
    })
    await pick(wrapper, '#ff0000')
    expect(remembered(wrapper)).toHaveLength(4)
  })

  // The palette is a list of colour strings; a gradient has no place in it.
  it('never remembers a gradient', async () => {
    const wrapper = mountSelector({ rememberSwatches: true, mode: 'both' })
    await pick(wrapper, GRADIENT)
    expect(wrapper.emitted('update:swatches')).toBeUndefined()
  })

  // A token is a legitimate value and not a colour we can paint or normalise.
  it('never remembers something it cannot parse', async () => {
    const wrapper = mountSelector({ rememberSwatches: true })
    await pick(wrapper, 'var(--brand)')
    expect(wrapper.emitted('update:swatches')).toBeUndefined()
  })
})

describe('the editable trigger', () => {
  const field = (wrapper: Wrapper) => wrapper.find('input[type="text"]')

  it('shows the value in a text field you can type into', () => {
    const wrapper = mountSelector({ trigger: 'input' })
    expect((field(wrapper).element as HTMLInputElement).value).toBe('#5f63e8')
  })

  /**
   * Types without committing. `setValue` fires `change` as well as `input`,
   * which is the very distinction these tests are about.
   */
  async function type(wrapper: Wrapper, value: string) {
    const input = field(wrapper)
    ;(input.element as HTMLInputElement).value = value
    await input.trigger('input')
    return input
  }

  it('says nothing until the change is committed', async () => {
    // Every keystroke through the model would mean `#f`, `#ff`, `#ff0` — three
    // colours nobody asked for on the way to the one they did.
    const wrapper = mountSelector({ trigger: 'input' })
    const input = await type(wrapper, '#ff0000')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await input.trigger('change')
    expect(emitted(wrapper)).toBe('#ff0000')
  })

  // The swatch already has a "cannot draw this" mark for exactly this case, so
  // refusing a typed one would contradict the rest of the component.
  it('accepts a value it cannot paint', async () => {
    const wrapper = mountSelector({ trigger: 'input' })
    const input = await type(wrapper, 'var(--brand)')
    await input.trigger('change')
    expect(emitted(wrapper)).toBe('var(--brand)')
  })

  it('puts back the model when the parent does not take the value', async () => {
    // Nothing is bound here, so the model never moves. The field must not be
    // left showing a value the component does not hold.
    const wrapper = mountSelector({ trigger: 'input' })
    await field(wrapper).trigger('focus')
    const input = await type(wrapper, '#123123')
    await input.trigger('blur')
    expect((field(wrapper).element as HTMLInputElement).value).toBe('#5f63e8')
  })

  it('leaves a half-typed value alone while it is being typed', async () => {
    // `#ff` is on the way to a colour, and resyncing mid-word would fight the
    // person typing it.
    const wrapper = mountSelector({ trigger: 'input' })
    await field(wrapper).trigger('focus')
    await type(wrapper, '#ff')
    await wrapper.setProps({ modelValue: '#5f63e8' })
    expect((field(wrapper).element as HTMLInputElement).value).toBe('#ff')
  })

  it('will not take a typed value while locked', async () => {
    for (const lock of [{ readonly: true }, { disabled: true }]) {
      const wrapper = mountSelector({ trigger: 'input', ...lock })
      await field(wrapper).trigger('change')
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    }
  })

  // A gradient has no text form to type, so the field shows the summary and
  // refuses edits while the swatch still opens the picker.
  it('shows a gradient read only', () => {
    const wrapper = mountSelector({ trigger: 'input', modelValue: GRADIENT })
    const input = field(wrapper).element as HTMLInputElement
    expect(input.readOnly).toBe(true)
    expect(input.value).toContain('stops')
  })

  it('keeps the swatch as its own button, since an input cannot live in one', () => {
    const wrapper = mountSelector({ trigger: 'input' })
    const swatchButton = wrapper.find('button[aria-label]')
    expect(swatchButton.exists()).toBe(true)
    expect(swatchButton.find('input').exists()).toBe(false)
  })
})

describe('fullWidth', () => {
  const root = (wrapper: Wrapper) => wrapper.element.firstElementChild
  const isFull = (wrapper: Wrapper) =>
    [...(root(wrapper)?.classList ?? [])].some((c) => c.includes('__full'))

  it('stretches to its container only when asked', () => {
    expect(isFull(mountSelector())).toBe(false)
    expect(isFull(mountSelector({ fullWidth: true }))).toBe(true)
    expect(isFull(mountSelector({ fullWidth: true, trigger: 'input' }))).toBe(
      true
    )
  })
})
