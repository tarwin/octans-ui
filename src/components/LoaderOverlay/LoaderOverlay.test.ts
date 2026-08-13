import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { loader } from './index'
import { teardownHost } from './host'
import LoaderOverlay from './LoaderOverlay.vue'

const autoHost = () => document.getElementById('uiLoaderOverlay')
const overlays = () => document.querySelectorAll('[aria-busy="true"]').length

const flush = async () => {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

afterEach(() => {
  loader.hide()
  teardownHost()
  document.body.replaceChildren()
})

describe('LoaderOverlay', () => {
  it('shows via the visible prop, with the default message', async () => {
    const wrapper = mount(LoaderOverlay, { props: { visible: true } })
    expect(wrapper.text()).toContain('Loading...')

    await wrapper.setProps({ visible: false })
    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('shows via $ui.loader, preferring its message over the prop', async () => {
    const wrapper = mount(LoaderOverlay, {
      props: { message: 'From the prop' },
      attachTo: document.body
    })
    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(false)

    loader.show('Crunching numbers...')
    await nextTick()
    expect(wrapper.text()).toContain('Crunching numbers...')
    expect(loader.visible).toBe(true)

    loader.hide()
    await nextTick()
    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('falls back to the prop message when shown without one', async () => {
    const wrapper = mount(LoaderOverlay, {
      props: { message: 'From the prop' },
      attachTo: document.body
    })

    loader.show()
    await nextTick()
    expect(wrapper.text()).toContain('From the prop')

    wrapper.unmount()
  })

  it('replaces the spinner and message through the default slot', async () => {
    const wrapper = mount(LoaderOverlay, {
      props: { visible: true },
      slots: { default: '<em>Custom content</em>' }
    })
    expect(wrapper.find('em').text()).toBe('Custom content')
    expect(wrapper.text()).not.toContain('Loading...')

    wrapper.unmount()
  })

  it('mounts a fullscreen host on first use, and retires it for a consumer overlay', async () => {
    expect(autoHost()).toBeNull()

    loader.show()
    await flush()
    expect(autoHost()).not.toBeNull()
    expect(overlays()).toBe(1)

    const wrapper = mount(LoaderOverlay, { attachTo: document.body })
    await flush()

    expect(autoHost()).toBeNull()
    expect(overlays()).toBe(1)

    wrapper.unmount()
  })
})
