import { reactive, readonly } from 'vue'
import { createHostRegistry } from '@/utils/autoHost'

/**
 * The single store every `$ui.progress` call writes to, and every mounted
 * `<LoadingBar>` reads from. State lives here rather than inside a component
 * so the trickle is one sequence of numbers no matter how many bars render it
 * — it used to live in `GlobalNav`, which meant no `GlobalNav`, no bar.
 */
const state = reactive({
  /** 0 when idle, 1–99 while trickling, 100 for the moment before it clears. */
  value: 0
})

export const loadingBarState = readonly(state)

export const loadingBarHosts = createHostRegistry()

let timer: ReturnType<typeof setTimeout> | null = null

function clearTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

// Big strides early, a crawl near the end, and never past 99 on its own —
// only `done()` gets to say the work finished.
function nudgeAmount(value: number) {
  if (value < 20) return 10
  if (value < 50) return 4
  if (value < 80) return 2
  if (value < 99) return 0.5
  return 0
}

function nudge() {
  if (state.value <= 0) return
  state.value = Math.min(state.value + nudgeAmount(state.value), 99)
  timer = setTimeout(nudge, Math.random() * 500 + 200)
}

export function startProgress() {
  clearTimer()
  state.value = 1
  nudge()
}

export function doneProgress() {
  clearTimer()
  if (state.value <= 0) return
  state.value = 100
  timer = setTimeout(() => {
    state.value = 0
  }, 1000)
}
