/**
 * Fuzzy (subsequence) matching, used by `Select`'s `fuzzy` prop and exported so
 * applications can use the same behaviour in their own filters.
 *
 * The rule is simply that every character of the query appears in the text, in
 * order, but not necessarily together — so `gwp` finds "Girl **w**ith a
 * **P**earl Earring" and `strnght` finds "The Starry Night".
 *
 * Scoring exists so the good matches float to the top. Without it, fuzzy
 * matching is worse than a plain substring filter: it returns far more rows and
 * puts them in an arbitrary order.
 */

/** Characters that start a new "word" for the purposes of the bonus below. */
const BOUNDARY = /[\s\-_/:.,(]/

const CONSECUTIVE_BONUS = 8
const BOUNDARY_BONUS = 6
const START_BONUS = 10
/** Charged per character skipped, so tighter matches win. */
const GAP_PENALTY = 0.4

/**
 * Scores `query` against `text`. Higher is better; `null` means no match.
 *
 * An empty query matches everything with a score of `0`, which keeps
 * "no filter typed yet" from being a special case at every call site.
 *
 * Greedy left-to-right rather than optimal: finding the genuinely best
 * alignment is quadratic, and for option-list lengths the difference in
 * ordering is not worth the cost.
 */
export function fuzzyScore(query: string, text: string): number | null {
  if (!query) return 0
  if (!text) return null

  const q = query.toLowerCase()
  const t = text.toLowerCase()

  let score = 0
  let cursor = 0
  let previousIndex = -1

  for (const char of q) {
    const index = t.indexOf(char, cursor)
    if (index === -1) return null

    score += 1
    if (index === 0) {
      score += START_BONUS
    } else if (BOUNDARY.test(t[index - 1])) {
      score += BOUNDARY_BONUS
    }
    if (index === previousIndex + 1) {
      score += CONSECUTIVE_BONUS
    } else if (previousIndex !== -1) {
      score -= (index - previousIndex - 1) * GAP_PENALTY
    }

    previousIndex = index
    cursor = index + 1
  }

  // Prefer the shorter of two otherwise equal matches — "Loans" should beat
  // "Loans out, long term" for the query "loans".
  return score - t.length * 0.01
}

/** Whether `query` fuzzy-matches `text` at all, ignoring how well. */
export function fuzzyMatch(query: string, text: string): boolean {
  return fuzzyScore(query, text) !== null
}

/**
 * Filters and re-orders `items` by how well they match `query`.
 *
 * `getText` may return several strings — a label and a description, say — and
 * the item scores as its best one. Ties keep their original order, so a list
 * that was already meaningfully sorted stays that way.
 */
export function fuzzyFilter<T>(
  query: string,
  items: T[],
  getText: (item: T) => string | (string | undefined | null)[]
): T[] {
  if (!query.trim()) return items

  const scored: { item: T; score: number; index: number }[] = []

  items.forEach((item, index) => {
    const texts = getText(item)
    const candidates = Array.isArray(texts) ? texts : [texts]

    let best: number | null = null
    for (const candidate of candidates) {
      if (!candidate) continue
      const score = fuzzyScore(query, candidate)
      if (score !== null && (best === null || score > best)) best = score
    }

    if (best !== null) scored.push({ item, score: best, index })
  })

  scored.sort((a, b) => b.score - a.score || a.index - b.index)
  return scored.map((entry) => entry.item)
}
