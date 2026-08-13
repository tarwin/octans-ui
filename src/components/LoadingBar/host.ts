import { createAutoHost } from '@/utils/autoHost'
import LoadingBar from './LoadingBar.vue'
import { loadingBarHosts } from './store'

/**
 * The bar `$ui.progress.start()` falls back to when no `<LoadingBar>` is
 * mounted anywhere — fixed to the top of the viewport. A `GlobalNav` (or any
 * consumer-placed bar) mounting later takes over and this one retires.
 */
export const { ensure: ensureHost, teardown: teardownHost } = createAutoHost(
  loadingBarHosts,
  'uiLoadingBar',
  LoadingBar,
  { fixed: true }
)
