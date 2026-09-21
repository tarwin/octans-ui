export type PageItem =
  | { type: 'page'; page: number }
  /**
   * An ellipsis standing in for the pages between its neighbours. `to` is the
   * nearest hidden page, which is where clicking it goes.
   */
  | { type: 'gap'; to: number }

const page = (n: number): PageItem => ({ type: 'page', page: n })

/**
 * The run of page numbers to show, always filling exactly `slots` positions
 * (or every page, when there are fewer than that). The first and last page
 * are always present, and an ellipsis takes a slot a number would otherwise
 * have, so the strip is the same width whichever page is current — the old
 * window-plus-ellipses approach grew by two slots in the middle of a long
 * list and shrank again at either end.
 *
 * An odd `slots` keeps the current page centred in the middle run. Anything
 * under 5 cannot fit both ellipses and is treated as 5; `0` means no page
 * numbers at all.
 *
 * Ported from Naive UI's `createPageItemsInfo`.
 */
export function pageItems(
  current: number,
  count: number,
  slots: number
): PageItem[] {
  if (count <= 0 || slots <= 0) return []
  slots = Math.max(slots, 5)
  if (count <= slots) {
    return Array.from({ length: count }, (_, i) => page(i + 1))
  }

  const first = 1
  const last = count
  // The middle run is everything but first, last and the two ellipsis slots.
  const delta = (slots - 5) / 2
  const end = Math.min(
    Math.max(current + Math.ceil(delta), first + slots - 3),
    last - 2
  )
  const start = Math.max(
    Math.min(current - Math.floor(delta), last - slots + 3),
    first + 2
  )

  const items: PageItem[] = [page(first)]
  if (start > first + 2) {
    items.push({ type: 'gap', to: start - 1 })
  } else {
    items.push(page(first + 1))
  }
  for (let i = start; i <= end; i++) {
    items.push(page(i))
  }
  if (end < last - 2) {
    items.push({ type: 'gap', to: end + 1 })
  } else {
    items.push(page(last - 1))
  }
  items.push(page(last))
  return items
}
