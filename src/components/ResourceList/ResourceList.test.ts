import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ResourceList from './ResourceList.vue'
import { emptyValuePlaceholder } from '@/utils/format'

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'price', label: 'Price', format: 'currency' },
  { key: 'sold', label: 'Sold', format: 'integer' }
]

const items = [
  { id: 1, name: 'Day pass', price: 1234.5, sold: 9876 },
  { id: 2, name: 'Season pass', price: 20, sold: 4 }
]

const mountList = (props = {}) =>
  mount(ResourceList, { props: { columns, items, ...props } })

describe('rendering', () => {
  it('draws a header cell per column', () => {
    const text = mountList().text()
    expect(text).toContain('Name')
    expect(text).toContain('Price')
    expect(text).toContain('Sold')
  })

  it('draws a row per item', () => {
    const text = mountList().text()
    expect(text).toContain('Day pass')
    expect(text).toContain('Season pass')
  })

  it('hands rendering to the `item` slot when there is one', () => {
    const wrapper = mount(ResourceList, {
      props: { columns, items },
      slots: { item: '<div>custom</div>' }
    })
    expect(wrapper.text()).toContain('custom')
    // The built-in row markup steps aside entirely.
    expect(wrapper.text()).not.toContain('Day pass')
  })
})

describe('cell formatting', () => {
  it('runs values through the named formatter', () => {
    // Regression: `formatCell` returned `row[col.key]` untouched, so a column
    // declaring `format: 'currency'` was right-aligned and nothing more — the
    // number rendered bare.
    const text = mountList().text()
    expect(text).toContain('1,234.50')
    expect(text).toContain('9,876')
    expect(text).not.toContain('1234.5')
  })

  it('leaves a column with no format alone', () => {
    expect(mountList().text()).toContain('Day pass')
  })

  it('shows the placeholder for a missing value', () => {
    const wrapper = mountList({ items: [{ id: 1, name: 'Day pass' }] })
    expect(wrapper.text()).toContain(emptyValuePlaceholder)
  })
})

describe('alignment', () => {
  it('right-aligns every numeric column, not just currency', () => {
    // The class names are CSS-module hashed, so match on the local part.
    const numeric = mountList()
      .findAll('[class*="ResourceList_cell"]')
      .filter((el) => el.classes().some((c) => c.includes('__numeric')))
    // Two numeric columns, each aligned in both rows and in the header.
    expect(numeric).toHaveLength(6)
  })

  it('leaves non-numeric columns alone', () => {
    const wrapper = mount(ResourceList, {
      props: { columns: [{ key: 'name', label: 'Name' }], items }
    })
    const numeric = wrapper
      .findAll('[class*="ResourceList_cell"]')
      .filter((el) => el.classes().some((c) => c.includes('__numeric')))
    expect(numeric).toHaveLength(0)
  })
})
