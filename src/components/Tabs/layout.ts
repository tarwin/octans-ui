/**
 * Which tabs move into the overflow menu, as a flag per tab in order.
 *
 * Tabs fill the strip from the left; the first one that does not fit and
 * every tab after it go into the menu, so the strip keeps the caller's order.
 * When every tab fits nothing is reserved for the menu, which is not shown —
 * the old rule always kept 150px back and put the last tab away while it
 * still had room.
 *
 * The menu button is wider when it stands in for the selected tab (it shows
 * that tab instead of a dots icon), so if the selected tab ends up in the menu
 * the fit is run again reserving that width. `menuWidth` is asked for each.
 */
export function overflowTabs(
  widths: number[],
  available: number,
  selectedIndex: number,
  menuWidth: (labelled: boolean) => number
): boolean[] {
  const total = widths.reduce((sum, width) => sum + width, 0)
  if (total <= available) return widths.map(() => false)

  const fit = (reserve: number) => {
    let used = reserve
    let overflowed = false
    return widths.map((width) => {
      if (!overflowed && used + width <= available) {
        used += width
        return false
      }
      overflowed = true
      return true
    })
  }

  let hidden = fit(menuWidth(false))
  if (selectedIndex >= 0 && hidden[selectedIndex]) {
    hidden = fit(menuWidth(true))
  }
  return hidden
}
