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
