import { afterEach, describe, expect, it } from 'vitest'
import { lockScroll, scrollLockCount } from './scrollLock'

const releases: Array<() => void> = []
const lock = () => {
  const release = lockScroll()
  releases.push(release)
  return release
}

afterEach(() => {
  for (const release of releases) release()
  releases.length = 0
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
})

describe('lockScroll', () => {
  it('hides body overflow while held and restores it after', () => {
    document.body.style.overflow = 'auto'
    const release = lock()
    expect(document.body.style.overflow).toBe('hidden')
    release()
    expect(document.body.style.overflow).toBe('auto')
  })

  it('stays locked until the last holder lets go', () => {
    const first = lock()
    const second = lock()
    expect(scrollLockCount()).toBe(2)
    first()
    expect(document.body.style.overflow).toBe('hidden')
    second()
    expect(document.body.style.overflow).toBe('')
    expect(scrollLockCount()).toBe(0)
  })

  it('ignores a second release from the same holder', () => {
    // A modal releases from its leave hook and again on unmount; the second
    // must not release a lock some other overlay still holds.
    const first = lock()
    lock()
    first()
    first()
    expect(scrollLockCount()).toBe(1)
    expect(document.body.style.overflow).toBe('hidden')
  })
})
