import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Pagination from './Pagination.vue'

// 250 rows, 25 a page, on page 3 (offset 50).
const PROPS = { offset: 50, limit: 25, total: 250 }

const compactStrip = (wrapper: ReturnType<typeof mount>) =>
  wrapper.find('[data-compact]')
const fullStrip = (wrapper: ReturnType<typeof mount>) =>
  wrapper
    .findAll('[class*="Pages"]')
    .find((el) => !el.element.hasAttribute('data-compact'))

/** Labels of the compact strip's buttons, in order. */
const compactButtons = (wrapper: ReturnType<typeof mount>) =>
  compactStrip(wrapper)
    .findAll('button')
    .map((b) => b.attributes('aria-label'))

describe('Pagination compact form', () => {
  it('renders the full strip until it has measured its container', () => {
    // jsdom has no ResizeObserver, so nothing is ever measured here.
    const wrapper = mount(Pagination, { props: PROPS })
    expect(compactStrip(wrapper).exists()).toBe(false)
    expect(fullStrip(wrapper)).toBeDefined()
    expect(fullStrip(wrapper)!.classes().join(' ')).not.toContain('hidden')
  })

  it('renders only the compact strip when forced', () => {
    const wrapper = mount(Pagination, { props: { ...PROPS, compact: true } })
    expect(compactStrip(wrapper).exists()).toBe(true)
    expect(fullStrip(wrapper)).toBeUndefined()
  })

  it('renders only the full strip when turned off', () => {
    const wrapper = mount(Pagination, { props: { ...PROPS, compact: false } })
    expect(compactStrip(wrapper).exists()).toBe(false)
    expect(fullStrip(wrapper)).toBeDefined()
  })

  it('shows the current page of the total', () => {
    const wrapper = mount(Pagination, { props: { ...PROPS, compact: true } })
    expect(compactStrip(wrapper).text().replace(/\s+/g, ' ')).toContain(
      '3 / 10'
    )
  })

  it('reads 1 / 1 with nothing to page through', () => {
    const wrapper = mount(Pagination, {
      props: { offset: 0, limit: 25, total: 0, compact: true }
    })
    expect(compactStrip(wrapper).text().replace(/\s+/g, ' ')).toContain('1 / 1')
  })

  it('has first, previous, next and last buttons', () => {
    const wrapper = mount(Pagination, { props: { ...PROPS, compact: true } })
    expect(compactButtons(wrapper)).toEqual([
      'First page',
      'Previous page',
      'Next page',
      'Last page'
    ])
  })

  it('drops first and last on request', () => {
    const wrapper = mount(Pagination, {
      props: { ...PROPS, compact: true, hideFirstLast: true }
    })
    expect(compactButtons(wrapper)).toEqual(['Previous page', 'Next page'])
  })

  it('emits the offset of the first and last pages', async () => {
    const wrapper = mount(Pagination, { props: { ...PROPS, compact: true } })
    const [first, , , last] = compactStrip(wrapper).findAll('button')
    await first.trigger('click')
    await last.trigger('click')
    expect(wrapper.emitted('change')).toEqual([[0], [225]])
  })

  it('disables the backward buttons on the first page and forward on the last', () => {
    const onFirst = mount(Pagination, {
      props: { ...PROPS, offset: 0, compact: true }
    })
    const onLast = mount(Pagination, {
      props: { ...PROPS, offset: 225, compact: true }
    })
    const disabled = (w: ReturnType<typeof mount>) =>
      compactStrip(w)
        .findAll('button')
        .map((b) => b.attributes('disabled') !== undefined)
    expect(disabled(onFirst)).toEqual([true, true, false, false])
    expect(disabled(onLast)).toEqual([false, false, true, true])
  })
})

describe('Pagination full strip', () => {
  const pageLabels = (wrapper: ReturnType<typeof mount>) =>
    fullStrip(wrapper)!
      .findAll('button')
      .map((b) => b.attributes('aria-label') || b.text())

  it('renders the fixed-slot run of pages', () => {
    const wrapper = mount(Pagination, {
      props: { offset: 90, limit: 10, total: 250, pageSlots: 7, compact: false }
    })
    expect(pageLabels(wrapper)).toEqual([
      'Previous page',
      '1',
      'Page 8',
      '9',
      '10',
      '11',
      'Page 12',
      '25',
      'Next page'
    ])
  })

  it('goes to the nearest hidden page when an ellipsis is clicked', async () => {
    const wrapper = mount(Pagination, {
      props: { offset: 90, limit: 10, total: 250, pageSlots: 7, compact: false }
    })
    await wrapper.find('[aria-label="Page 12"]').trigger('click')
    expect(wrapper.emitted('change')).toEqual([[110]])
  })

  it('marks the current page', () => {
    const wrapper = mount(Pagination, {
      props: { offset: 90, limit: 10, total: 250, pageSlots: 7, compact: false }
    })
    expect(wrapper.find('[aria-current="page"]').text()).toBe('10')
  })

  it('treats the deprecated maxPages as one more slot', () => {
    const wrapper = mount(Pagination, {
      props: { offset: 0, limit: 10, total: 250, maxPages: 5, compact: false }
    })
    expect(pageLabels(wrapper)).toEqual([
      'Previous page',
      '1',
      '2',
      '3',
      '4',
      'Page 5',
      '25',
      'Next page'
    ])
  })

  it('sizes every page slot to the longest page number', () => {
    const wrapper = mount(Pagination, {
      props: { offset: 0, limit: 10, total: 2500, compact: false }
    })
    expect(wrapper.attributes('style')).toContain('--pagination-digits: 3')
  })

  it('leaves the page numbers out with zero slots', () => {
    const wrapper = mount(Pagination, {
      props: { ...PROPS, pageSlots: 0, compact: false }
    })
    expect(pageLabels(wrapper)).toEqual(['Previous page', 'Next page'])
  })
})

describe('Pagination options', () => {
  const pageSize = (wrapper: ReturnType<typeof mount>) => wrapper.find('select')

  it('shows the page-size select with the full strip only by default', () => {
    expect(pageSize(mount(Pagination, { props: PROPS })).exists()).toBe(true)
    expect(
      pageSize(
        mount(Pagination, { props: { ...PROPS, compact: true } })
      ).exists()
    ).toBe(false)
  })

  it('keeps the page-size select in the compact form on request', () => {
    const wrapper = mount(Pagination, {
      props: { ...PROPS, compact: true, showPageSize: 'always' }
    })
    expect(pageSize(wrapper).exists()).toBe(true)
  })

  it('drops the page-size select on request', () => {
    const wrapper = mount(Pagination, {
      props: { ...PROPS, showPageSize: false }
    })
    expect(pageSize(wrapper).exists()).toBe(false)
  })

  it('aligns its controls', () => {
    const right = mount(Pagination, { props: { ...PROPS, align: 'right' } })
    const left = mount(Pagination, { props: PROPS })
    expect(right.classes().join(' ')).toContain('Pagination__right')
    expect(left.classes().join(' ')).not.toMatch(/__right|__center/)
  })

  it('jumps to a typed page, clamped to the list', async () => {
    const wrapper = mount(Pagination, {
      props: { ...PROPS, jumpTo: true, compact: false }
    })
    const input = wrapper.find('input[type="number"]')
    await input.setValue('7')
    await input.trigger('keydown.enter')
    await input.setValue('99')
    await input.trigger('keydown.enter')
    expect(wrapper.emitted('change')).toEqual([[150], [225]])
    expect((input.element as HTMLInputElement).value).toBe('')
  })

  it('makes the compact readout a button when jumping is on', () => {
    const wrapper = mount(Pagination, {
      props: { ...PROPS, jumpTo: true, compact: true }
    })
    expect(compactButtons(wrapper)).toEqual([
      'First page',
      'Previous page',
      'Go to page',
      'Next page',
      'Last page'
    ])
  })
})
