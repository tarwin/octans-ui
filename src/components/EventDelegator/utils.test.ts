import { afterEach, describe, expect, it, vi } from 'vitest'
import { createEventListener, normalizeEvent, type Listener } from './utils'

const open: Listener[] = []

function listen(name: string, target: EventTarget = window) {
  const handler = vi.fn()
  const listener = createEventListener(name, target, handler)
  open.push(listener)
  return { handler, listener }
}

const click = () => window.dispatchEvent(new Event('click'))

afterEach(() => {
  while (open.length) open.pop()!.remove?.()
})

describe('normalizeEvent', () => {
  it('lowercases the name and drops the `on`', () => {
    expect(normalizeEvent('onPointerDown')).toEqual({
      name: 'pointerdown',
      once: false,
      capture: false,
      passive: false
    })
  })

  it('reads the modifiers in whichever order they were written', () => {
    // `@click.once.capture` and `@click.capture.once` are both legal, and Vue
    // spells the attribute in the order the modifiers appear. Stripping each
    // suffix once, in a fixed order, left `onClickOnceCapture` listening for
    // an event named `clickonce` — which nothing ever dispatches.
    for (const name of ['onClickOnceCapture', 'onClickCaptureOnce']) {
      expect(normalizeEvent(name)).toEqual({
        name: 'click',
        once: true,
        capture: true,
        passive: false
      })
    }
  })

  it('reads all three modifiers at once', () => {
    expect(normalizeEvent('onClickPassiveOnceCapture')).toEqual({
      name: 'click',
      once: true,
      capture: true,
      passive: true
    })
  })

  it('treats a bare modifier as the event name', () => {
    // An event genuinely called `once` is a name, not a modifier with nothing
    // left in front of it.
    expect(normalizeEvent('onOnce').name).toBe('once')
  })
})

describe('createEventListener', () => {
  it('forwards the event and nothing else', () => {
    const { handler } = listen('onClick')
    const event = new Event('click')
    window.dispatchEvent(event)
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler.mock.calls[0]).toEqual([event])
  })

  it('stops firing once removed', () => {
    const { handler, listener } = listen('onClick')
    click()
    listener.remove?.()
    click()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('removes a capturing listener too', () => {
    // `removeEventListener` matches on `capture`, so add and remove have to
    // agree about it as well as about the reference.
    const { handler, listener } = listen('onClickCapture')
    click()
    listener.remove?.()
    click()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('fires a `once` listener exactly once', () => {
    const { handler } = listen('onClickOnce')
    click()
    click()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('fires a `once` listener whatever order its modifiers came in', () => {
    const { handler } = listen('onClickPassiveOnce')
    click()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('honours a handler swapped onto the returned listener', () => {
    const { listener } = listen('onClick')
    const replacement = vi.fn()
    listener.handler = replacement
    click()
    expect(replacement).toHaveBeenCalledTimes(1)
  })
})
