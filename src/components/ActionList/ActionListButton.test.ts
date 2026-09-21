import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ActionListButton from './ActionListButton.vue'

describe('ActionListButton', () => {
  // Inside a <form> a bare <button> defaults to `submit`; a menu row must
  // never post the form it happens to sit in.
  it('never submits a surrounding form', () => {
    expect(
      mount(ActionListButton, { props: { label: 'Row' } }).attributes('type')
    ).toBe('button')
  })

  it('puts no type on a link', () => {
    expect(
      mount(ActionListButton, {
        props: { label: 'Row', url: 'https://example.com' }
      }).attributes('type')
    ).toBeUndefined()
  })
})
