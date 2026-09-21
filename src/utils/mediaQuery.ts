import { getCurrentScope, onScopeDispose, ref, type Ref } from 'vue'

/**
 * Whether a media query matches, kept current as the viewport changes.
 *
 * False where there is no window (SSR) or no `matchMedia` (jsdom), so a
 * component reading it renders its desktop form there.
 */
export function useMediaQuery(query: string): Ref<boolean> {
  const matches = ref(false)
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return matches
  }
  const media = window.matchMedia(query)
  matches.value = media.matches
  const update = (event: MediaQueryListEvent) => {
    matches.value = event.matches
  }
  media.addEventListener('change', update)
  if (getCurrentScope()) {
    onScopeDispose(() => media.removeEventListener('change', update))
  }
  return matches
}

/**
 * The viewport a phone has, in portrait: below `$breakpointSm`. Overlays that
 * take a different form on a phone all switch at this one width.
 */
export const PHONE_QUERY = '(max-width: 567px)'
