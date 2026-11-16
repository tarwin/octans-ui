import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { DataTable } from './index'
import BulkActions from './BulkActions.vue'
import { ActionList } from '@/components/ActionList'

const COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' }
]

const ROWS = [
  { id: 1, name: 'Alpha' },
  { id: 2, name: 'Beta' }
]

/**
 * `ActionType.onAction` takes no arguments, but a row action is useless
 * without knowing its row — so row and bulk actions declare their own types
 * (`DataTableRowActionItemType`, `DataTableBulkActionType`) that say what they
 * pass. These pin those two contracts, which are the reason the generic
 * `ActionType` is not simply widened to `...args: any[]`.
 */
describe('DataTable action arguments', () => {
  it('hands a row action its own row', async () => {
    const onAction = vi.fn()
    const wrapper = mount(DataTable, {
      props: {
        columns: COLUMNS,
        rows: ROWS,
        rowActions: [{ label: 'Edit', onAction }]
      }
    })

    const buttons = wrapper.findAll('button').filter((b) => b.text() === 'Edit')
    expect(buttons.length).toBe(ROWS.length)

    await buttons[1].trigger('click')
    expect(onAction).toHaveBeenCalledTimes(1)
    expect(onAction.mock.calls[0]).toEqual([ROWS[1]])
  })

  // Past `maxPersistActions` the row actions collapse into an ActionList,
  // which reads `label` — the items used to also carry a `content` key that
  // nothing consumed.
  it('keeps row action labels when they collapse into a menu', () => {
    const onAction = vi.fn()
    const wrapper = mount(DataTable, {
      props: {
        columns: COLUMNS,
        rows: [ROWS[0]],
        maxPersistActions: 1,
        rowActions: [{ label: 'Edit', onAction }, { label: 'Archive' }]
      }
    })

    const list = wrapper.findComponent(ActionList)
    const items = list.props('items') as {
      label: string
      onAction(): void
    }[]
    expect(items.map((i) => i.label)).toEqual(['Edit', 'Archive'])

    // Still bound to its row once collapsed.
    items[0].onAction()
    expect(onAction.mock.calls[0]).toEqual([ROWS[0]])
  })

  // Bulk actions live behind a dropdown, so this goes at the wrapped action
  // the table hands to `BulkActions` rather than fighting a portalled menu in
  // jsdom. That wrapper is the thing under test: it is what turns the
  // selection into the argument.
  it('hands a bulk action every selected row, as an array', () => {
    const onAction = vi.fn()
    const wrapper = mount(DataTable, {
      props: {
        columns: COLUMNS,
        rows: ROWS,
        selectedIds: [2],
        bulkActions: [{ label: 'Archive', onAction }]
      }
    })

    const bulk = wrapper.findComponent(BulkActions)
    const wrapped = bulk.props('actions') as { onAction(): void }[]
    expect(wrapped).toHaveLength(1)

    wrapped[0].onAction()
    expect(onAction.mock.calls[0]).toEqual([[ROWS[1]]])
  })
})

const manyRows = (count: number) =>
  Array.from({ length: count }, (_, i) => ({ id: i + 1, name: 'Row ' + i }))

describe('DataTable virtual rows', () => {
  it('draws only a window of rows, with spacers standing in for the rest', async () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: COLUMNS,
        rows: manyRows(5000),
        virtual: true,
        maxHeight: 400
      }
    })
    await wrapper.vm.$nextTick()
    const drawn = wrapper.findAll('tbody > tr[data-row-index]')
    expect(drawn.length).toBeGreaterThan(0)
    expect(drawn.length).toBeLessThan(100)
    expect(wrapper.find('table').attributes('aria-rowcount')).toBe('5001')
    expect(drawn[0].attributes('aria-rowindex')).toBe('2')
  })

  it('draws every row without maxHeight', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mount(DataTable, {
      props: { columns: COLUMNS, rows: manyRows(300), virtual: true }
    })
    expect(wrapper.findAll('tbody > tr[data-row-index]')).toHaveLength(300)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})

describe('DataTable load-more', () => {
  it('asks once, and again only after rows grow', async () => {
    const wrapper = mount(DataTable, {
      props: { columns: COLUMNS, rows: ROWS, hasMore: true }
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('load-more')).toHaveLength(1)

    // Nothing has changed, so it must not ask again.
    await wrapper.setProps({ compact: true })
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('load-more')).toHaveLength(1)

    await wrapper.setProps({ rows: [...ROWS, { id: 3, name: 'Gamma' }] })
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('load-more')).toHaveLength(2)
  })

  it('waits while loadingMore, and stops when hasMore is false', async () => {
    const wrapper = mount(DataTable, {
      props: { columns: COLUMNS, rows: ROWS, hasMore: true, loadingMore: true }
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('load-more')).toBeUndefined()

    await wrapper.setProps({ hasMore: false, loadingMore: false })
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('load-more')).toBeUndefined()
  })

  it('shows the spinner instead of the empty text while more may come', () => {
    const wrapper = mount(DataTable, {
      props: { columns: COLUMNS, rows: [], hasMore: true, loadingMore: true }
    })
    expect(wrapper.find('tbody img').exists()).toBe(true)
    expect(wrapper.find('tbody td[colspan]').exists()).toBe(true)
  })
})

describe('DataTable row events', () => {
  const rowAt = (wrapper: ReturnType<typeof mount>, index: number) =>
    wrapper.find(`tbody tr[data-row-index="${index}"]`)

  it('emits dblclick-row with the row that was double-clicked', async () => {
    const wrapper = mount(DataTable, {
      props: { columns: COLUMNS, rows: ROWS }
    })
    await rowAt(wrapper, 1).trigger('dblclick')
    expect(wrapper.emitted('dblclick-row')).toEqual([[ROWS[1]]])
  })

  it('does not emit dblclick-row from the row actions cell', async () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: COLUMNS,
        rows: ROWS,
        rowActions: [{ label: 'Edit', onAction: () => {} }]
      }
    })
    const edit = wrapper.findAll('button').find((b) => b.text() === 'Edit')!
    await edit.trigger('dblclick')
    expect(wrapper.emitted('dblclick-row')).toBeUndefined()
  })

  it('does not emit dblclick-row while rows are being selected', async () => {
    const wrapper = mount(DataTable, {
      props: { columns: COLUMNS, rows: ROWS, selectedIds: [1] }
    })
    await rowAt(wrapper, 1).trigger('dblclick')
    expect(wrapper.emitted('dblclick-row')).toBeUndefined()
  })

  // Declared events never reach `useAttrs()`, which is where the pointer
  // cursor used to look for them — so it never showed.
  const pointerFor = (props: Record<string, unknown>) =>
    mount(DataTable, {
      props: { columns: COLUMNS, rows: ROWS, ...props } as any
    })
      .find('.UIElement')
      .classes()
      .join(' ')
      .includes('hasClickableRows')

  it('shows the pointer for click-row, not for dblclick-row alone', () => {
    expect(pointerFor({ onClickRow: () => {} })).toBe(true)
    expect(pointerFor({ onDblclickRow: () => {} })).toBe(false)
    expect(pointerFor({})).toBe(false)
  })

  it('lets rowCursor override the pointer either way', () => {
    expect(pointerFor({ onDblclickRow: () => {}, rowCursor: 'pointer' })).toBe(
      true
    )
    expect(pointerFor({ onClickRow: () => {}, rowCursor: 'default' })).toBe(
      false
    )
  })
})

describe('DataTable double-click text selection', () => {
  const press = (wrapper: ReturnType<typeof mount>, detail: number) => {
    const event = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      detail
    })
    wrapper.find('tbody tr td').element.dispatchEvent(event)
    return event
  }

  it('cancels the second press so the word is not selected', () => {
    const wrapper = mount(DataTable, {
      props: { columns: COLUMNS, rows: ROWS, onDblclickRow: () => {} } as any
    })
    expect(press(wrapper, 1).defaultPrevented).toBe(false)
    expect(press(wrapper, 2).defaultPrevented).toBe(true)
  })

  it('leaves selection alone without a dblclick-row listener', () => {
    const wrapper = mount(DataTable, {
      props: { columns: COLUMNS, rows: ROWS, onClickRow: () => {} } as any
    })
    expect(press(wrapper, 2).defaultPrevented).toBe(false)
  })
})
