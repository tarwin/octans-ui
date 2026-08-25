import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from './Button.vue'

/**
 * The class names are CSS-module hashed, so assertions match on the LOCAL
 * part (`typePrimary`, `color-error`), which the hash embeds.
 */
const classesOf = (props: Record<string, unknown>) =>
  mount(Button, { props }).classes().join(' ')

describe('Button type × color axes', () => {
  it('renders the structure class for its type', () => {
    expect(classesOf({ type: 'primary' })).toContain('typePrimary')
    expect(classesOf({ type: 'secondary' })).toContain('typeSecondary')
    expect(classesOf({ type: 'link' })).toContain('typeLink')
  })

  it('adds no colour classes without a colour', () => {
    const classes = classesOf({ type: 'outline' })
    expect(classes).not.toContain('hasColor')
    expect(classes).not.toContain('color-')
  })

  it('applies a colour class alongside the structure', () => {
    const classes = classesOf({ type: 'outline', color: 'tertiary' })
    expect(classes).toContain('typeOutline')
    expect(classes).toContain('color-tertiary')
    expect(classes).toContain('hasColor')
  })

  it('normalises `destructive` to the error colour', () => {
    const classes = classesOf({ type: 'plain', destructive: true })
    expect(classes).toContain('typePlain')
    expect(classes).toContain('color-error')
  })

  it('normalises type="destructive" to the error-coloured primary', () => {
    const classes = classesOf({ type: 'destructive' })
    expect(classes).toContain('typePrimary')
    expect(classes).toContain('color-error')
    expect(classes).not.toContain('typeDestructive')
  })

  it('keeps type="destructive" invert on the inverted primary structure', () => {
    const classes = classesOf({ type: 'destructive', invert: true })
    expect(classes).toContain('typePrimary_invert')
    expect(classes).toContain('color-error')
  })

  it('lets `destructive` win over an explicit colour', () => {
    // A destructive action must never quietly render in a calmer colour.
    const classes = classesOf({ color: 'success', destructive: true })
    expect(classes).toContain('color-error')
    expect(classes).not.toContain('color-success')
  })
})

describe('Button loading', () => {
  it('hides the label without removing it, so the width holds', () => {
    const wrapper = mount(Button, {
      props: { loading: true },
      slots: { default: 'Save' }
    })
    // The label is still in the DOM — a spinner that REPLACES it would let a
    // toolbar resize the instant something is clicked.
    expect(wrapper.text()).toContain('Save')
    expect(wrapper.find('div').classes().join(' ')).toContain(
      'content__loading'
    )
    expect(wrapper.find('span').classes().join(' ')).toContain('spinner')
  })

  it('announces busy without dropping focus', () => {
    const wrapper = mount(Button, { props: { loading: true } })
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    // The real attribute would blur a focused button mid-action.
    expect(wrapper.attributes('disabled')).toBeUndefined()
  })

  it('swallows the click while loading', async () => {
    const calls: number[] = []
    const wrapper = mount(Button, {
      props: { loading: true },
      attrs: { onClick: () => calls.push(1) }
    })
    await wrapper.trigger('click')
    expect(calls).toEqual([])
  })

  it('still clicks when not loading', async () => {
    const calls: number[] = []
    const wrapper = mount(Button, { attrs: { onClick: () => calls.push(1) } })
    await wrapper.trigger('click')
    expect(calls).toEqual([1])
  })
})

describe('Button pressed', () => {
  it('announces nothing when it is not a toggle', () => {
    expect(mount(Button).attributes('aria-pressed')).toBeUndefined()
  })

  it('distinguishes a toggle that is off from a button that is not one', () => {
    expect(
      mount(Button, { props: { pressed: false } }).attributes('aria-pressed')
    ).toBe('false')
    expect(
      mount(Button, { props: { pressed: true } }).attributes('aria-pressed')
    ).toBe('true')
  })

  it('takes the pressed treatment for its own type', () => {
    expect(classesOf({ type: 'outline', pressed: true })).toContain('pressed')
  })
})
