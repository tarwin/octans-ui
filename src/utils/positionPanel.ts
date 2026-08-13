import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  type Placement
} from '@floating-ui/dom'

export type { Placement }

export interface PositionPanelOptions {
  /** Preferred placement. Flips to the opposite side when it does not fit. */
  placement?: Placement
  /** Gap between the reference and the panel, in pixels. */
  offset?: number
  /**
   * Called with the placement actually used, and again whenever it changes —
   * a panel that flips to `top-start` usually needs different styling.
   */
  onPlacement?: (placement: Placement) => void
  /** Called once, after the first position lands. */
  onFirstUpdate?: () => void
}

export interface PanelPosition {
  /** Reposition now. `autoUpdate` covers scroll and resize on its own. */
  update: () => void
  /** Stops tracking and releases the observers. */
  destroy: () => void
}

/**
 * Positions a floating panel against a reference element and keeps it there
 * while the page scrolls or either element resizes.
 *
 * This is the only imperative positioning in the library. `<Popper>` — and so
 * `ActionList`, `DatePicker`, `TimePicker` and `ColorSelector` — goes through
 * reka-ui, which does its own on the same floating-ui underneath. This exists
 * for `Select`, whose dropdown is hand-rolled rather than a `<Popper>`.
 */
export function positionPanel(
  reference: HTMLElement,
  panel: HTMLElement,
  options: PositionPanelOptions = {}
): PanelPosition {
  const { placement = 'bottom-start', onPlacement, onFirstUpdate } = options
  let isFirst = true
  let lastPlacement: Placement | null = null
  let stopped = false

  const update = () => {
    if (stopped) return
    computePosition(reference, panel, {
      placement,
      strategy: 'absolute',
      middleware: [offset(options.offset ?? 0), flip(), shift()]
    }).then(({ x, y, placement: used }) => {
      // `computePosition` is async, so a destroy can land between the call and
      // its resolution — leaving coordinates on a panel that is on its way out.
      if (stopped) return
      Object.assign(panel.style, {
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`
      })
      if (used !== lastPlacement) {
        lastPlacement = used
        // Popper wrote this attribute itself and stylesheets key off it.
        // floating-ui only computes coordinates, so we write it.
        panel.setAttribute('data-placement', used)
        onPlacement?.(used)
      }
      if (isFirst) {
        isFirst = false
        onFirstUpdate?.()
      }
    })
  }

  const stopAutoUpdate = autoUpdate(reference, panel, update)

  return {
    update,
    destroy() {
      stopped = true
      stopAutoUpdate()
    }
  }
}

export default positionPanel
