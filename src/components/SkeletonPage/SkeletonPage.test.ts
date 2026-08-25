import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { SkeletonPage } from './index'

function mountPage(props: Record<string, unknown> = {}) {
  return mount(SkeletonPage, { props })
}

describe('SkeletonPage', () => {
  it('is a real Page, so it stands in the same place', () => {
    // The whole point: the placeholder and the page it replaces have to be the
    // same width, or the content jumps sideways when it swaps in.
    const wrapper = mountPage({ size: 'wide' })
    expect(wrapper.classes().join(' ')).toContain('Page__wide')
  })

  it('announces loading once, and hides the shapes', () => {
    const wrapper = mountPage()
    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.attributes('aria-label')).toBe('Loading')
    // A dozen decorative rectangles is not something to read out.
    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true)
  })

  it('draws a title placeholder by default, and drops it on request', () => {
    expect(mountPage().findAll('[class*="SkeletonDisplayText"]').length).toBe(1)
    expect(
      mountPage({ title: false }).findAll('[class*="SkeletonDisplayText"]')
        .length
    ).toBe(0)
  })

  it('gives the title placeholder a width of its own', () => {
    // `.Page_title` is a flex row: without a basis the placeholder's
    // `max-width` gives it nothing to be, and it collapses to zero.
    const title = mountPage().find('[class*="SkeletonDisplayText"]')
    expect(title.classes().join(' ')).toContain('Title')
  })

  it('draws one card by default and as many as asked for', () => {
    expect(mountPage().findAll('[class*="Card_"]').length).toBe(1)
    expect(mountPage({ cards: 3 }).findAll('[class*="Card_"]').length).toBe(3)
  })

  it('only draws a primary action when there will be one', () => {
    expect(mountPage().findAll('[class*="Action_"]').length).toBe(0)
    expect(
      mountPage({ primaryAction: true }).findAll('[class*="Action_"]').length
    ).toBe(1)
  })

  it('lets the body be replaced wholesale', () => {
    const wrapper = mount(SkeletonPage, {
      props: { cards: 3 },
      slots: { default: '<p>Custom</p>' }
    })
    expect(wrapper.text()).toContain('Custom')
    expect(wrapper.findAll('[class*="Card_"]').length).toBe(0)
  })
})
