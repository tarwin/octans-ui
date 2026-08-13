/**
 * A DOM event handler as it arrives from `$attrs`.
 *
 * The delegator only ever invokes these with the event itself, so this is the
 * whole contract — it is deliberately narrower than the handler a caller may
 * have written.
 */
export type EventHandler = (event: Event) => void

export interface Listener {
  name: string // The event name
  handler: EventHandler // The event handler
  options: ListenerOptions // The options used to add the event listener
  remove?: () => void // A function to remove the event listener
}

export interface ListenerOptions {
  capture: boolean
  passive: boolean
}

/** Suffixes that are modifiers rather than part of the event name. */
const MODIFIERS = ['passive', 'once', 'capture'] as const

export function normalizeEvent(name: string) {
  name = name.replace(/^on/, '').toLowerCase()
  const found = { once: false, capture: false, passive: false }

  // The suffixes arrive in whichever order the modifiers were written —
  // `@click.once.capture` and `@click.capture.once` are both legal — so keep
  // stripping until none match. Testing each suffix once, in a fixed order,
  // used to leave `onClickOnceCapture` listening for an event called
  // `clickonce`, which never fires.
  //
  // Known limit: an event whose real name ends in one of these words, such as
  // `gotpointercapture`, is misread. Those are element-level events and this
  // only ever binds to `window` or `document`, so it has not come up.
  for (let matched = true; matched;) {
    matched = false
    for (const modifier of MODIFIERS) {
      if (!name.endsWith(modifier)) continue
      const rest = name.slice(0, -modifier.length)
      // A name that is nothing but a modifier is an event called `once`, not a
      // modifier with no event.
      if (!rest) continue
      name = rest
      found[modifier] = true
      matched = true
    }
  }

  return { name, ...found }
}

export function createEventListener(
  name: string,
  target: EventTarget,
  handler: EventHandler
) {
  const opts = normalizeEvent(name)
  const listener: Listener = {
    name: opts.name,
    handler: handler,
    options: {
      capture: opts.capture,
      passive: opts.passive
    }
  }
  if (opts.once) {
    listener.handler = function (event: Event) {
      handler(event)
      listener.remove?.()
    }
  }

  // Bound through a stable wrapper rather than passing `listener.handler`
  // directly, so `add` and `remove` are given the same reference while the
  // wrapper still reads `listener.handler` at dispatch time — reassigning it
  // on the returned listener takes effect.
  const _handler = (event: Event) => listener.handler(event)
  listener.remove = function () {
    target.removeEventListener(listener.name, _handler, listener.options)
  }
  target.addEventListener(listener.name, _handler, listener.options)
  return listener
}
