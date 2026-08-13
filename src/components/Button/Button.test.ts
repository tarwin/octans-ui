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
