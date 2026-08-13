import { reactive, readonly } from 'vue'
import { createHostRegistry } from '@/utils/autoHost'

/**
 * The single store every `$ui.loader` call writes to, and every mounted
 * `<LoaderOverlay>` reads from. It used to be a window event that only
 * `AppFrame` listened for — no `AppFrame`, no loader.
 */
const state = reactive({
  visible: false,
  /** Empty means "use the overlay's default text". */
  message: ''
})

export const loaderState = readonly(state)

export const loaderHosts = createHostRegistry()

export function showLoader(message = '') {
  state.visible = true
  state.message = message
}

export function hideLoader() {
  state.visible = false
}
