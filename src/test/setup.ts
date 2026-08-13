// jsdom does not implement the observer APIs that several components use for
// responsive behaviour. These are inert stubs — enough for a component to mount
// and unmount cleanly. Any test that asserts on resize behaviour should install
// its own richer fake.

class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = NoopObserver as unknown as typeof ResizeObserver
}

if (!('IntersectionObserver' in globalThis)) {
  globalThis.IntersectionObserver =
    NoopObserver as unknown as typeof IntersectionObserver
}

if (!('matchMedia' in globalThis)) {
  globalThis.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false
  })) as unknown as typeof matchMedia
}

// jsdom implements neither of these on Element.
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = function () {}
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function () {}
}
