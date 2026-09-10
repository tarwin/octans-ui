import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { TextField } from './index'

const VAR = '--octans-textfield-max-height'

/**
 * A multiline field has always grown to fit what is typed into it — the hidden
 * ghost measures the value and drives the height. What it could not do was
 * grow past 200px, and that ceiling was unreachable from outside: the rule
 * lives at `.TextField__multiline .TextField_input`, which outranks anything
 * a caller can put on the component.
 *
 * The ceiling is a custom property now, so these tests check it is published
 * where the rule can read it. The rule itself — `max-height: var(...)` — is
 * beyond jsdom, which does not resolve `var()` in computed styles.
 */
function fieldStyle(wrapper: ReturnType<typeof mount>) {
  return (wrapper.find('[class*="TextField"]').element as HTMLElement).style
}

describe('TextField maxHeight', () => {
  it('publishes a CSS length as given', () => {
    const wrapper = mount(TextField, {
      props: { multiline: true, maxHeight: '50vh' }
    })
    expect(fieldStyle(wrapper).getPropertyValue(VAR)).toBe('50vh')
  })

  it('reads a bare number as pixels', () => {
    const wrapper = mount(TextField, {
      props: { multiline: true, maxHeight: 420 }
    })
    expect(fieldStyle(wrapper).getPropertyValue(VAR)).toBe('420px')
  })

  it('takes "none" through unchanged, for a field with no ceiling at all', () => {
    const wrapper = mount(TextField, {
      props: { multiline: true, maxHeight: 'none' }
    })
    expect(fieldStyle(wrapper).getPropertyValue(VAR)).toBe('none')
  })

  it('publishes nothing without the prop, leaving the 200px fallback', () => {
    const wrapper = mount(TextField, { props: { multiline: true } })
    expect(fieldStyle(wrapper).getPropertyValue(VAR)).toBe('')
  })
})
