import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { progress } from './index'
import { teardownHost } from './host'
import LoadingBar from './LoadingBar.vue'
import { doneProgress, loadingBarState, startProgress } from './store'

const autoHost = () => document.getElementById('uiLoadingBar')

const flush = async () => {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

beforeEach(() => {
  vi.useFakeTimers()
  // Pins the trickle's random delay to 450ms so the timeline is exact.
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
})

afterEach(() => {
  doneProgress()
  vi.runAllTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
  teardownHost()
  document.body.replaceChildren()
})

describe('progress store', () => {
  it('jumps on start and trickles toward 99, never reaching it alone', () => {
    startProgress()
    // 1, then the first nudge fires synchronously: +10.
    expect(loadingBarState.value).toBe(11)

    vi.advanceTimersByTime(450)
    expect(loadingBarState.value).toBe(21)

    // However long the work takes, the bar refuses to claim it finished.
    vi.advanceTimersByTime(450 * 200)
    expect(loadingBarState.value).toBe(99)
  })

  it('fills to 100 on done, then clears after a second', () => {
    startProgress()
    doneProgress()
    expect(loadingBarState.value).toBe(100)

    vi.advanceTimersByTime(999)
    expect(loadingBarState.value).toBe(100)
    vi.advanceTimersByTime(1)
    expect(loadingBarState.value).toBe(0)
  })

  it('ignores done() when never started', () => {
    doneProgress()
    expect(loadingBarState.value).toBe(0)
  })

  it('restarts cleanly mid-trickle', () => {
    startProgress()
    vi.advanceTimersByTime(450 * 5)
    const before = loadingBarState.value
    expect(before).toBeGreaterThan(11)

    startProgress()
    expect(loadingBarState.value).toBe(11)
  })
})

describe('LoadingBar', () => {
  it('renders nothing while idle, and the store value as a width', async () => {
    const wrapper = mount(LoadingBar)
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(false)

    startProgress()
    await nextTick()

    const bar = wrapper.find('[role="progressbar"]')
    expect(bar.exists()).toBe(true)
    expect(bar.attributes('style')).toContain('width: 11%')

    wrapper.unmount()
  })

  it('mounts a fixed host on first use, and retires it for a consumer bar', async () => {
    expect(autoHost()).toBeNull()

    progress.start()
    await flush()
    expect(autoHost()).not.toBeNull()

    const wrapper = mount(LoadingBar, { attachTo: document.body })
    await flush()

    expect(autoHost()).toBeNull()
    expect(document.querySelectorAll('[role="progressbar"]')).toHaveLength(1)

    wrapper.unmount()
  })
})
