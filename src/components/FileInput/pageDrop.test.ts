import { afterEach, describe, expect, it, vi } from 'vitest'
import { claimPageDrop, releasePageDrop } from './pageDrop'

/**
 * The page as a drop target. Everything here is about the events the BROWSER
 * sends, which is the part that cannot be reasoned about from the component:
 * `dragenter` and `dragleave` fire for every element the pointer crosses, so
 * "the drag left the page" is a counting problem, not an event.
 */
function drag(
  type: string,
  types: string[] = ['Files'],
  files: unknown[] = []
) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'dataTransfer', {
    value: { types, files }
  })
  window.dispatchEvent(event)
  return event
}

const token = {}

function makeHandlers() {
  return {
    onDragChange: vi.fn((_dragging: boolean) => {}),
    onDrop: vi.fn((_files: FileList) => {})
  }
}

let handlers: ReturnType<typeof makeHandlers>

function claim() {
  handlers = makeHandlers()
  return claimPageDrop(token, handlers)
}

afterEach(() => releasePageDrop(token))

describe('page drop', () => {
  it('lights up once, however many elements the drag crosses', () => {
    claim()
    drag('dragenter')
    drag('dragenter') // onto a child
    drag('dragenter') // and another
    expect(handlers.onDragChange).toHaveBeenCalledTimes(1)
    expect(handlers.onDragChange).toHaveBeenCalledWith(true)
  })

  it('only goes dark once the drag has left everything', () => {
    claim()
    drag('dragenter')
    drag('dragenter')
    drag('dragleave')
    // Still inside — one enter is unaccounted for. A bare `dragleave` handler
    // would have switched the overlay off here, halfway across the page.
    expect(handlers.onDragChange).toHaveBeenCalledTimes(1)
    drag('dragleave')
    expect(handlers.onDragChange).toHaveBeenLastCalledWith(false)
  })

  it('cancels dragover, or the browser navigates to the file', () => {
    claim()
    const event = drag('dragover')
    expect(event.defaultPrevented).toBe(true)
  })

  it('hands over the dropped files and resets', () => {
    claim()
    drag('dragenter')
    const file = { name: 'a.pdf' }
    drag('drop', ['Files'], [file])
    expect(handlers.onDrop).toHaveBeenCalledOnce()
    expect(handlers.onDrop.mock.calls[0][0][0]).toBe(file)
    expect(handlers.onDragChange).toHaveBeenLastCalledWith(false)

    // The counter is reset, not decremented — a drop can arrive with several
    // enters outstanding, and a stuck counter would leave the overlay up.
    drag('dragenter')
    expect(handlers.onDragChange).toHaveBeenLastCalledWith(true)
  })

  it('ignores a drag that carries no files', () => {
    claim()
    drag('dragenter', ['text/plain'])
    drag('drop', ['text/plain'])
    expect(handlers.onDragChange).not.toHaveBeenCalled()
    expect(handlers.onDrop).not.toHaveBeenCalled()
  })

  it('refuses a second claimant rather than splitting the page', () => {
    claim()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const second = makeHandlers()
    expect(claimPageDrop({}, second)).toBe(false)
    expect(warn).toHaveBeenCalledOnce()

    // The first holder keeps the page.
    drag('dragenter')
    expect(handlers.onDragChange).toHaveBeenCalledWith(true)
    expect(second.onDragChange).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it('stops listening once released', () => {
    claim()
    releasePageDrop(token)
    drag('dragenter')
    expect(handlers.onDragChange).not.toHaveBeenCalled()
  })

  it('ignores a release from something that never held the claim', () => {
    claim()
    releasePageDrop({})
    drag('dragenter')
    expect(handlers.onDragChange).toHaveBeenCalledWith(true)
  })
})
