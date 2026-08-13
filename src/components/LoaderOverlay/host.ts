import { createAutoHost } from '@/utils/autoHost'
import LoaderOverlay from './LoaderOverlay.vue'
import { loaderHosts } from './store'

/**
 * The overlay `$ui.loader.show()` falls back to when no `<LoaderOverlay>` is
 * mounted anywhere — fixed over the whole viewport. An `AppFrame` (or any
 * consumer-placed overlay) mounting later takes over and this one retires.
 */
export const { ensure: ensureHost, teardown: teardownHost } = createAutoHost(
  loaderHosts,
  'uiLoaderOverlay',
  LoaderOverlay,
  { fullscreen: true }
)
