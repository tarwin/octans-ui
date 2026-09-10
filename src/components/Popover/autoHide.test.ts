import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { Popover } from './index'

/**
 * `autoHide` closes the content on an outside click — and a click on the
 * TRIGGER is not one, even though reka reports it as one. Its
 * `usePointerDownOutside` excludes the content layer and nothing else, so
 * without a trigger check here the trigger would close the content and reopen
 * it on the same click.
 *
 * The check used to find the trigger by walking to the wrapper and taking
 * `children[0]`, which is only the trigger when the trigger happens to be a
 * single element — hence the two-root case below.
 */
async function open(triggerSlot: string) {
  const wrapper = mount(Popover, {
    props: { visible: true, autoHide: true },
    slots: { trigger: triggerSlot, default: '<div id="body">Body</div>' },
    attachTo: document.body
  })
  await nextTick()
  const content = wrapper.findComponent({ name: 'PopoverContent' })
  // Straight at our own handler: reka's own outside detection is reka's to
  // test, and the event it hands over carries the clicked element as `target`
  // (it dispatches on `detail.originalEvent.target`).
  const interactOutside = (target: Node) =>
    content.vm.$emit('interactOutside', { target } as unknown as Event)
  const closed = () =>
    (wrapper.emitted('update:visible') ?? []).some(([v]) => v === false)
  return { wrapper, interactOutside, closed }
}

describe('Popover autoHide', () => {
  it('closes on a click outside', async () => {
    const outside = document.createElement('div')
    document.body.appendChild(outside)
    const { interactOutside, closed } = await open(
      '<button id="a">Open</button>'
    )
    interactOutside(outside)
    expect(closed()).toBe(true)
    outside.remove()
  })

  it('does not close on a click on the trigger', async () => {
    const { wrapper, interactOutside, closed } = await open(
      '<button id="a">Open</button>'
    )
    interactOutside(wrapper.find('#a').element)
    expect(closed()).toBe(false)
  })

  it('does not close on a click INSIDE the trigger', async () => {
    const { wrapper, interactOutside, closed } = await open(
      '<button id="a"><span id="inner">Open</span></button>'
    )
    interactOutside(wrapper.find('#inner').element)
    expect(closed()).toBe(false)
  })

  it('does not close on the second root of a multi-root trigger', async () => {
    // The case the old `children[0]` lookup got wrong: half the trigger
    // counted as the trigger and the other half counted as the page.
    const { wrapper, interactOutside, closed } = await open(
      '<span id="a">Open</span><span id="b">More</span>'
    )
    interactOutside(wrapper.find('#b').element)
    expect(closed()).toBe(false)
  })

  it('stays open on an outside click when autoHide is off', async () => {
    const outside = document.createElement('div')
    document.body.appendChild(outside)
    const wrapper = mount(Popover, {
      props: { visible: true },
      slots: { trigger: '<button>Open</button>', default: '<div>Body</div>' },
      attachTo: document.body
    })
    await nextTick()
    wrapper
      .findComponent({ name: 'PopoverContent' })
      .vm.$emit('interactOutside', { target: outside } as unknown as Event)
    expect(
      (wrapper.emitted('update:visible') ?? []).some(([v]) => v === false)
    ).toBe(false)
    outside.remove()
  })

  it('closes on Escape, which carries no target at all', async () => {
    const { wrapper, closed } = await open('<button id="a">Open</button>')
    wrapper.findComponent({ name: 'PopoverContent' }).vm.$emit('escapeKeyDown')
    expect(closed()).toBe(true)
  })
})
