import { afterEach, describe, expect, it, vi } from 'vitest'
import { positionPanel } from './positionPanel'

// jsdom has no layout — every rect is zeroes — so the placement never flips and
// the coordinates are always 0. What is worth pinning here is the wiring around
// `computePosition`, not the geometry: the styles land, the attribute the
// stylesheets key off is written, and a destroyed panel stays destroyed.

const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

const build = () => {
  const reference = document.createElement('div')
  const panel = document.createElement('div')
  document.body.append(reference, panel)
  return { reference, panel }
}

afterEach(() => {
  document.body.replaceChildren()
})

describe('positionPanel()', () => {
  it('positions the panel and reports the placement it used', async () => {
    const { reference, panel } = build()
    const onPlacement = vi.fn()

    const position = positionPanel(reference, panel, {
      placement: 'bottom-start',
      onPlacement
    })
    await settle()

    expect(panel.style.position).toBe('absolute')
    expect(panel.style.left).toBe('0px')
    expect(panel.style.top).toBe('0px')
    expect(panel.getAttribute('data-placement')).toBe('bottom-start')
    expect(onPlacement).toHaveBeenCalledWith('bottom-start')

    position.destroy()
  })

  it('calls onFirstUpdate once, however many times it repositions', async () => {
    const { reference, panel } = build()
    const onFirstUpdate = vi.fn()

    const position = positionPanel(reference, panel, { onFirstUpdate })
    await settle()
    position.update()
    position.update()
    await settle()

    expect(onFirstUpdate).toHaveBeenCalledTimes(1)

    position.destroy()
  })

  it('does not touch the panel after destroy', async () => {
    const { reference, panel } = build()

    // `computePosition` is async, so this update is still in flight when the
    // panel is destroyed — it must not write coordinates onto an element that
    // is on its way out of the document.
    const position = positionPanel(reference, panel)
    position.destroy()
    await settle()

    expect(panel.style.position).toBe('')
    expect(panel.getAttribute('data-placement')).toBeNull()
  })
})
