import { ActionList } from '@/components/ActionList'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Caption } from '@/components/Caption'
import { Card, CardSection } from '@/components/Card'
import { Checkbox } from '@/components/Checkbox'
import { DataTable } from '@/components/DataTable'
import { Stack } from '@/components/Stack'
import { Filters } from '@/components/Filters'
import { Icon } from '@/components/Icon'
import { Link } from '@/components/Link'
import { orderBy } from '@/utils'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, h, onBeforeMount, provide, reactive, ref } from 'vue'
import artworksData from '@/styleguide/artworks.json'
import type { InterPropsType } from './types'

// `DataTable` is a generic component (`generic="Row extends ..."`), so its type
// is a generic function, not a plain `Component` — Storybook's
// `Meta['component']` will not accept it, and the resulting inference failure
// makes every story below demand an `args` property.
//
// Drive `Meta` off the prop type instead: that keeps real arg typing, and
// `component` is only cast so Storybook accepts it. Autodocs are unaffected —
// docgen reads the SFC source, not this type.
type DataTableArgs = InterPropsType<Record<string, any>>

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Components/Data Display/DataTable',
  component: DataTable as unknown as Meta<DataTableArgs>['component'],
  tags: ['autodocs'],
  args: {
    columns: [],
    rows: []
  },
  argTypes: {
    // Dynamic slots are rendered via render functions (slots['col:' + key]),
    // so docgen can't auto-detect them. Declare them here so they appear in
    // the "slots" section of the autodocs table.
    'col:[columnKey]': {
      name: 'col:[columnKey]',
      description:
        'Overrides the rendered content of a cell for the column whose `key` ' +
        'matches `[columnKey]` (e.g. `col:catalogNumber`). The key match is ' +
        'case-insensitive.\n\n' +
        'Slot props:\n' +
        '- `row` — the full row data object.\n' +
        '- `value` — the cell value after column formatting is applied.',
      table: {
        category: 'slots',
        type: { summary: '{ row: RowData; value: any }' }
      }
    },
    'head:[columnKey]': {
      name: 'head:[columnKey]',
      description:
        'Overrides the rendered content of a column header for the column ' +
        'whose `key` matches `[columnKey]` (e.g. `head:acquiredDate`). The key ' +
        'match is case-insensitive.\n\n' +
        'Slot props:\n' +
        '- `col` — the column definition, with an added `formatString` property.\n' +
        '- `value` — the header label (same as `col.label`).\n' +
        '- `className` — the class name normally applied to the header `<span>`; ' +
        'spread it onto your element to keep default header styling.',
      table: {
        category: 'slots',
        type: {
          summary: '{ col: Column; value: string; className: string }'
        }
      }
    },
    actions: {
      name: 'actions',
      description:
        'Overrides the content of the row-actions cell (the fixed cell on the ' +
        'right edge), letting you render custom controls — e.g. a few icon ' +
        'buttons alongside a `...` overflow menu.\n\n' +
        'Adding this slot creates the actions column even when `rowActions` is ' +
        'not set, and takes precedence over the default `rowActions` rendering.\n\n' +
        'Slot props:\n' +
        '- `row` — the full row data object.\n' +
        '- `index` — the row index within the current page.\n' +
        '- `actions` — the resolved `rowActions` for this row (the array, or the ' +
        'result of calling the `rowActions` function), or `undefined` if none ' +
        'were provided.\n\n' +
        '**Note:** the slot bypasses `rowActions`, so the automatic ' +
        'disabling of actions during bulk-selection mode does not apply — ' +
        'handle that yourself if needed.',
      table: {
        category: 'slots',
        type: { summary: '{ row: RowData; index: number; actions?: Action[] }' }
      }
    }
  } as Meta<DataTableArgs>['argTypes']
} satisfies Meta<DataTableArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => ({
    components: { DataTable, Card },
    template: `
      <Card>
        <DataTable
          :columns="[
            {key: 'id', label: 'ID'},
            {key: 'artist', label: 'Artist'},
            {key: 'works', label: 'Works', format: 'integer'}
          ]"
          :rows="[]"
        />
      </Card>
    `
  })
}

/**
A column can format its own cells with a function instead of one of the built
in format strings. Pass it as either `format` or `formatFunc` — both are called
with `(value, row, forTotal)` and should return the string to render.

Useful when the displayed value depends on the rest of the row, or on something
outside the table entirely (a translation lookup, a label map, etc.).
*/
export const FunctionFormatters: Story = {
  render: () => ({
    components: { DataTable, Card },
    setup() {
      const methodLabels: Record<string, string> = {
        BEQUEST: 'Bequest',
        PURCHASE: 'Purchased',
        LONG_LOAN: 'Long-term loan'
      }
      const columns = [
        { key: 'id', label: 'ID' },
        {
          key: 'method',
          label: 'Acquired by',
          format: (value: string) => methodLabels[value] || value
        },
        {
          key: 'valuation',
          label: 'Valuation',
          formatFunc: (value: number, row: any) =>
            `${row.currency} ${value.toFixed(2)}`
        }
      ]
      const rows = [
        { id: 1, method: 'BEQUEST', valuation: 120.5, currency: 'AUD' },
        { id: 2, method: 'PURCHASE', valuation: 42, currency: 'USD' },
        { id: 3, method: 'LONG_LOAN', valuation: 8.25, currency: 'GBP' }
      ]
      return { columns, rows }
    },
    template: `
      <Card>
        <DataTable :columns="columns" :rows="rows" />
      </Card>
    `
  })
}

export const InsideCardSection: Story = {
  render: () => ({
    components: { DataTable, Card, CardSection },
    template: `
      <Card>
        <CardSection
          title="Card section header"
          :actions="[
            {label: 'Action 1'},
            {label: 'Action 2'}
          ]"
        >
          <DataTable
            :columns="[
              {key: 'id', label: 'ID'},
              {key: 'artist', label: 'Artist', sortable: true},
              {key: 'works', label: 'Works', format: 'integer', sortable: true}
            ]"
            :rows="[
              {id: 1, artist: 'Claude Monet', works: 2500},
              {id: 2, artist: 'Katsushika Hokusai', works: 3000}
            ]"
          />
        </CardSection>
      </Card>
    `
  })
}

export const LoadingStates: Story = {
  render: () => ({
    components: { DataTable, Card, CardSection, Checkbox },
    args: {},
    setup() {
      const state = reactive({
        totals: false,
        rows: false,
        footer: false
      })
      return {
        state
      }
    },
    template: `
      <div>
        <Card>
          <DataTable
            :columns="[
              {key: 'id', label: 'ID'},
              {key: 'artist', label: 'Artist'},
              {key: 'works', label: 'Works', format: 'integer'}
            ]"
            :rows="[
              {id: 1, artist: 'Claude Monet', works: 2500},
              {id: 2, artist: 'Katsushika Hokusai', works: 3000}
            ]"
            :pagination="{
              offset: 0,
              limit: 10,
              total: 100
            }"
            :totals="['', 10, 58]"
            :loading="state"
          />
        </Card>

        <Checkbox label="Show totals loader" v-model="state.totals" />
        <Checkbox label="Show rows loader" v-model="state.rows" />
        <Checkbox label="Show footer loader" v-model="state.footer" />
      </div>
    `
  })
}

/**
Server-side pagination
Server-side pagination requires the following:

1. Fetch only the data needed to render the current page and assign to `rows`.
2. Fetch the total number of rows and assign to `pagination.total`.
3. Assign the number of items per page to `pagination.limit`.
4. Use the `pagination.updateOffset` callback to fetch new data starting from the offset chosen by the user.
5. Toggle the `loading` prop while data loads.
 */
export const ServerSidePagination: Story = {
  render: () => ({
    components: { DataTable, Card, CardSection, Checkbox },
    args: {},
    setup() {
      provide('currency', 'JPY')
      const offset = ref(0)
      const total = ref(artworksData.length)
      const rows = ref<any[]>([])
      const loading = ref(false)
      const maxPerPage = ref(5)

      const fetchData = (_offset: number) => {
        loading.value = true
        offset.value = _offset
        setTimeout(() => {
          rows.value = artworksData.slice(_offset, _offset + maxPerPage.value)
          loading.value = false
        }, 500)
      }

      onBeforeMount(() => {
        fetchData(0)
      })

      return {
        offset,
        total,
        rows,
        loading,
        maxPerPage,
        fetchData
      }
    },
    template: `
      <Card title="Recent acquisitions">
        <DataTable
          :columns="[
            {
              key: 'catalogNumber',
              label: 'Catalogue No.'
            },
            {
              key: 'title',
              label: 'Title'
            },
            {
              key: 'acquiredDate',
              label: 'Acquired',
              format: 'dateTimeShort'
            },
            {
              key: 'valuationLocalCurrency',
              label: 'Valuation',
              format: 'currency'
            },
            {
              key: 'acquisitionMethod',
              label: 'Method'
            }
          ]"
          :rows="rows"
          :pagination="{
            offset: offset,
            limit: maxPerPage,
            total: total,
            pageSizes: false,
            summary: 'Showing {range} of {total}',
            updateOffset: (val) => fetchData(val)
          }"
          :loading="loading"
        />
      </Card>
    `
  })
}

/**
You can configure data tables to allow users to select multiple rows.

- Bind an array to the `selectedIds` prop to maintain a list of row IDs that are
  selected.
- You can use the `sync` event modifier to define a two-way binding like so:
  `:selected-ids.sync="selectedIds"`.
- During selection mode, the user can click any part of a row to toggle it.

**Note:** Users can only select rows that appear on the current page and
  changing pages clears the selection.
*/
export const SelectableRows: Story = {
  render: () => ({
    components: { DataTable, Card, CardSection, Checkbox },
    args: {},
    setup() {
      const selectedIds = ref<any[]>([])

      return {
        selectedIds
      }
    },
    template: `
      <div>
        <Card>
          <DataTable
            :columns="[
              {key: 'id', label: 'ID'},
              {key: 'artist', label: 'Artist'},
              {key: 'works', label: 'Works', format: 'integer'}
            ]"
            :rows="[
              {id: 1, artist: 'Claude Monet', works: 2500},
              {id: 2, artist: 'Katsushika Hokusai', works: 3000}
            ]"
            v-model:selected-ids="selectedIds"
          />
        </Card>
        <br>selectedIds: {{selectedIds}}
      </div>
    `
  })
}

/**
You can define a list of actions that can be applied to multiple rows that
are selected by the user.

- Start by binding an array to `selectedIds` to maintain a list of row IDs that are selected.
- Next, bind `bulkActions` to you array of actions. Actions will be invoked with an array of selected rows.
*/
export const BulkActions: Story = {
  render: () => ({
    components: { DataTable, Card, CardSection, Checkbox },
    args: {},
    setup() {
      const selectedIds = ref<any[]>([])
      const bulkActions = computed(() => {
        return [
          {
            label: 'Edit',
            onAction(rows: any[]) {
              alert(`You edited ${rows.length} rows`)
            }
          },
          {
            label: 'Delete',
            onAction(rows: any[]) {
              alert(`You deleted ${rows.length} rows`)
            }
          }
        ]
      })
      return {
        selectedIds,
        bulkActions
      }
    },
    template: `
      <Card>
        <DataTable
          :columns="[
            {key: 'id', label: 'ID'},
            {key: 'artist', label: 'Artist'},
            {key: 'works', label: 'Works', format: 'integer'}
          ]"
          :rows="[
            {id: 1, artist: 'Claude Monet', works: 2500},
            {id: 2, artist: 'Katsushika Hokusai', works: 3000}
          ]"
          :bulk-actions="bulkActions"
          v-model:selected-ids.sync="selectedIds"
        />
      </Card>
      <br>selectedIds: {{selectedIds}}
    `
  })
}

/**
- Mark one or more columns as being `sortable`.
- Bind `sort` to an object containing column and direction to sort by.
- Sort data locally or remotely and bind it to `rows`.
*/
export const SortableData: Story = {
  render: () => ({
    components: { DataTable, Card, CardSection, Checkbox },
    args: {},
    setup() {
      const rows = ref([
        { id: 1, artist: 'Claude Monet', works: 2500 },
        { id: 2, artist: 'Katsushika Hokusai', works: 3000 }
      ])

      const sortBy = ref<null | {
        column: string
        direction: boolean | 'asc' | 'desc'
      }>(null)

      const sortedRows = computed(() => {
        if (sortBy.value) {
          return orderBy(
            rows.value,
            [sortBy.value.column],
            [sortBy.value.direction]
          )
        }
        return rows.value
      })

      return {
        sortBy,
        sortedRows
      }
    },
    template: `
      <Card>
        <DataTable
          :columns="[
            {key: 'id', label: 'ID'},
            {key: 'artist', label: 'Artist', sortable: true},
            {key: 'works', label: 'Works', format: 'integer', sortable: true}
          ]"
          :rows="sortedRows"
          v-model:sort="sortBy"
        />
      </Card>
    `
  })
}

/**
- Uses fixed row actions.
- Uses the `actionCollapseThreshold` property to override the width at which the
  row actions collapse.
*/
export const RowActions: Story = {
  render: () => ({
    components: { DataTable, Card, CardSection, Checkbox },
    args: {},
    setup() {
      const onClickRow = (row: any) => {
        console.log('clicked row', row)
      }
      const onAction1 = (row: any) => {
        console.log('action 1', row)
      }
      const onAction2 = (row: any) => {
        console.log('action 2', row)
      }

      return {
        onClickRow,
        onAction1,
        onAction2
      }
    },
    template: `
      <Card>
        <DataTable
          :columns="[
            {key: 'id', label: 'ID'},
            {key: 'artist', label: 'Artist', sortable: true},
            {key: 'works', label: 'Works', format: 'integer', sortable: true}
          ]"
          :actionCollapseThreshold="420"
          :row-actions="[
            {label: 'Action 1', onAction: onAction1},
            {label: 'Go to example.com [link]', url: 'https://example.com'}
          ]"
          :rows="[
            {id: 1, artist: 'Claude Monet', works: 2500},
            {id: 2, artist: 'Katsushika Hokusai', works: 3000}
          ]"
          @click-row="onClickRow"
        />
      </Card>
    `
  })
}

/**
Instead of the prop-driven `rowActions`, you can take full control of the
row-actions cell with the `actions` scoped slot. This lets you mix custom
controls — for example a couple of always-visible icon buttons next to the
standard `...` overflow menu (rendered with `ActionList`).

- The slot receives `{ row, index, actions }`.
- `actions` is the resolved `rowActions` for the row (handy if you want to keep
  passing them as a prop and just tweak the presentation), or `undefined`.
- This example also shows a "button action to the left" — a `View` button
  rendered into the first column via the `col:[key]` slot. `@click.stop` keeps
  it from also triggering the row's `click-row` handler.

**Note:** because the slot bypasses `rowActions`, the automatic disabling of
actions during bulk-selection mode does not apply.
*/
export const CustomActions: Story = {
  render: () => ({
    components: { DataTable, Card, Button, ActionList, Stack },
    setup() {
      const rows = ref([
        {
          id: 1,
          name: 'Mira Hollis',
          email: 'mira.hollis@example.org',
          department: 'Paintings',
          works: 128
        },
        {
          id: 2,
          name: 'Tao Ekhart',
          email: 'tao.ekhart@example.org',
          department: 'Prints',
          works: 412
        },
        {
          id: 3,
          name: 'Sana Moreau',
          email: 'sana.moreau@example.org',
          department: 'Photography',
          works: 76
        },
        {
          id: 4,
          name: 'Nils Vance',
          email: 'nils.vance@example.org',
          department: 'Sculpture',
          works: 39
        }
      ])

      const onClickRow = (row: any) => console.log('clicked row', row)
      const onView = (row: any) => console.log('view', row)
      const onEdit = (row: any) => console.log('edit', row)
      const onCopy = (row: any) => console.log('copy', row)
      const onArchive = (row: any) => console.log('archive', row)
      const onDelete = (row: any) => console.log('delete', row)

      return { rows, onClickRow, onView, onEdit, onCopy, onArchive, onDelete }
    },
    template: `
      <Card>
        <DataTable
          :columns="[
            {key: 'name', label: 'Name', fixed: true},
            {key: 'name', label: 'Name'},
            {key: 'email', label: 'Email'},
            {key: 'email', label: 'Email'},
            {key: 'email', label: 'Email'},
            {key: 'department', label: 'Department'},
            {key: 'department', label: 'Department'},
            {key: 'department', label: 'Department'},
            {key: 'works', label: 'Works', format: 'integer'}
          ]"
          :rows="rows"
          @click-row="onClickRow"
          :disableScrollBounce="true"
        >
          <template #col:name="{ row }">
            <Button
              type="outline"
              size="small"
              icon="mdi:eye"
              @click.stop="onView(row)"
            >{{ row.name }}</Button>
          </template>

          <template #actions="{ row }">
            <Stack :wrap="false">
              <Button
                type="plain"
                size="small"
                icon="mdi:pencil"
                tooltip="Edit"
                @click="onEdit(row)"
              />
              <Button
                type="plain"
                size="small"
                icon="mdi:content-copy"
                tooltip="Duplicate"
                @click="onCopy(row)"
              />
              <ActionList
                placement="bottom-end"
                :items="[
                  {label: 'Archive', icon: 'mdi:archive-arrow-down', onAction: () => onArchive(row)},
                  {label: 'Delete', icon: 'mdi:delete', onAction: () => onDelete(row)}
                ]"
              >
                <Button type="plain" size="small" icon="mdi:dots-horizontal" />
              </ActionList>
            </Stack>
          </template>
        </DataTable>
      </Card>
    `
  })
}

/**
This example demonstrates most of the features available for the Data Table:

- Fixed first column table is too wide.
- Dynamic row actions that collapes to a dropdown on small screens.
- Bulk row actions.
- Customized cell content using `col:[COLUMN_KEY]` slot templates.
  - Slot gets an object with `{ row, value }`.
  - `row` is the row object for the specific row.
  - `value` is the value of the cell, after formatting.
- Customized column header content using `head:[COLUMN_KEY]` slot templates.
  - Slot gets an object with `{ col, value, className }`.
  - `col` is the column object for the specific column, with added `formatString` property.
  - `value` is the label for the header which can also be access `col.value`.
  - `className` is the class name that would have been added to the header `<span>`.
- Dynamic column formatters.
- Sortable columns with an initial sort direction.
- Pagination.
*/
export const Complex: Story = {
  render: () => ({
    components: {
      DataTable,
      Card,
      CardSection,
      Badge,
      Caption,
      Icon,
      Link,
      Filters
    },
    args: {},
    setup() {
      const rows = ref<any[]>([])
      const offset = ref(0)
      const limit = ref(10)
      const selectedIds = ref([])
      const query = ref(null)
      const sortBy = ref({
        column: 'acquiredDate',
        direction: 'asc' as any
      })
      const loading = ref(true)

      onBeforeMount(() => {
        setTimeout(() => {
          rows.value = artworksData
          loading.value = false
        }, 1000)
      })

      const onClickRow = (row: any) => {
        console.log('clicked row', row)
      }

      const columns = computed(() => {
        return [
          {
            key: 'catalogNumber',
            label: 'Catalogue No.',
            fixed: true
          },
          {
            key: 'title',
            label: 'Title',
            sortable: true
          },
          {
            key: 'artist',
            label: 'Artist',
            sortable: true
          },
          {
            key: 'acquiredDate',
            label: 'Acquired',
            format: 'dateTimeShort',
            sortable: true
          },
          {
            key: 'valuation',
            label: 'Valuation',
            format: 'currency',
            formatContext(row: any, forTotal: boolean) {
              return {
                currency: forTotal ? 'AUD' : row.currency
              }
            },
            sortable: true
          },
          {
            key: 'curatorEmail',
            label: 'Curator'
          },
          {
            key: 'insurancePremium',
            label: 'Premium',
            format: 'currency',
            formatContext: (row: any) => ({ currency: row.currency }),
            sortable: true
          },
          {
            key: 'acquisitionMethod',
            label: 'Method',
            render: (value: any) => h('div', [h('div', value), h('b', 'hello')])
          },
          {
            key: 'accessionKey',
            label: 'Accession Key',
            maxWidth: '50px'
          },
          {
            key: 'notes',
            label: 'Notes',
            maxWidth: 200
          }
        ]
      })

      const rowActions = computed(() => {
        return (row: any) => {
          return [
            {
              label: 'Edit',
              disabled: row.valuation > 500000,
              onAction(row: any) {
                console.log('Edit row', row)
              }
            },
            {
              label: 'Copy',
              url: `#copy:${row.catalogNumber}`
            },
            { label: 'Disable' }
          ]
        }
      })

      const bulkActions = computed(() => {
        return [
          {
            label: 'Enable',
            onAction(rows: any) {
              console.log('enbale all', rows)
            }
          },
          { label: 'Disable' }
        ]
      })

      const filteredRows = computed(() => {
        const queryStr = (query.value || '').toLowerCase()
        let _rows = rows.value
        if (queryStr) {
          _rows = _rows.filter(
            (row) => JSON.stringify(row).toLowerCase().indexOf(queryStr) >= 0
          )
        }
        if (sortBy.value) {
          _rows = orderBy(
            _rows,
            [sortBy.value.column],
            [sortBy.value.direction]
          )
        }
        return _rows
      })

      return {
        rows,
        offset,
        limit,
        selectedIds,
        query,
        sortBy,
        loading,

        onClickRow,

        columns,
        rowActions,
        bulkActions,
        filteredRows
      }
    },
    template: `
      <Card title="Collection">
        <Filters v-model:query="query" />
        <DataTable
          :columns="columns"
          :rows="filteredRows"
          :row-actions="rowActions"
          :bulk-actions="bulkActions"
          v-model:selected-ids="selectedIds"
          :pagination="{
            offset: offset,
            limit: limit,
            total: filteredRows && filteredRows.length,
            updateOffset: (val) => (offset = val),
            updateLimit: (val) => {
              limit = val
              offset = 0
            }
          }"
          totals
          v-model:sort="sortBy"
          @click-row="onClickRow"
          compact
          :loading="loading"
        >
          <template v-slot:head:acquiredDate="{col, value, className}">
            <span :class="className">{{value}} ({{col.formatString}}) <Icon icon="mdi:clock-outline" /></span>
          </template>
          <template v-slot:col:catalogNumber="{row}">
            <Link url="#">{{row.catalogNumber}}</Link>
            <Caption>#{{row.id}}</Caption>
          </template>
          <template v-slot:col:curatorEmail="{value}">
            <Badge
              :status="value.length >= 24 ? 'success' : 'default'"
            >{{value}}</Badge>
          </template>
        </DataTable>
      </Card>
    `
  })
}

/**
Repro for header sizing when the table has no rows.

Plain columns don't wrap: `.Cell` is `white-space: nowrap`, and the table sits
in an `overflow-x: auto` scroller, so long labels just widen the table and you
get a horizontal scrollbar. Two things override that nowrap, and both leave the
header with nothing holding it open:

- **`fixed: true`** on the first column — `.Cell_fixed` sets
  `white-space: unset`, which inherits down to `normal`. Its `width: 145px` is
  commented out, so there's no floor.
- **`wrap: true`** on any column — `.Cell_wrap` sets `white-space: normal` plus
  `word-break: break-all`. The `min-width: 150px` meant to back this up lives on
  `.CellWrapContent`, which is defined in the stylesheet but never applied to
  anything, so it has no effect.

The sort icon compounds both. When a column is `sortable` the header renders as
`[sortMarkup, content]` (`DataTable.vue:507`) — an inline `<Icon>` plus a 5px
margin sitting in front of the label, inside the same cell. That's horizontal
space the label no longer has, so a column already wrapping from one of the
rules above wraps sooner and harder. Toggle it on and off against a fixed or
wrapped column to see how much it accounts for.

The empty state is what exposes it. With rows, the body cells hold the column
open; with none, the wrapping header is the only thing left and it collapses.
Toggle "Add rows" against either wrap trigger to see the difference.

`minWidth` isn't a way out either — the header `<th>` (`DataTable.vue:484`) only
gets `class` and `onClick`, while the body `<td>` (`DataTable.vue:380`) is the
one that receives `minWidth` / `maxWidth`. With no rows there's no `<td>` to
carry it.
*/
export const NoDataManyColumns: Story = {
  render: () => ({
    components: { DataTable, Card, Checkbox, Stack },
    setup() {
      const labels = [
        'Catalogue Number',
        'Curator Email Address',
        'Country Of Origin',
        'Insured Valuation Including Frame',
        'Acquisition Method Recorded At Accession',
        'Conservation Status',
        'Provenance Reference',
        'First Exhibited Date And Time',
        'Attributed Exhibition Name',
        'Lifetime Loan Count'
      ]
      const fixedFirst = ref(true)
      const wrapAll = ref(false)
      const sortable = ref(true)
      const applyMinWidth = ref(false)
      const withRows = ref(false)

      const columns = computed(() =>
        labels.map((label, index) => ({
          key: 'col' + index,
          label,
          ...(fixedFirst.value && index === 0 ? { fixed: true } : {}),
          ...(wrapAll.value ? { wrap: true } : {}),
          ...(sortable.value ? { sortable: true } : {}),
          ...(applyMinWidth.value ? { minWidth: 180 } : {})
        }))
      )
      const rows = computed(() =>
        withRows.value
          ? [
              Object.fromEntries(
                labels.map((_, i) => ['col' + i, 'Value ' + i])
              ),
              Object.fromEntries(
                labels.map((_, i) => ['col' + i, 'Value ' + i])
              )
            ]
          : []
      )
      return {
        columns,
        rows,
        fixedFirst,
        wrapAll,
        sortable,
        applyMinWidth,
        withRows
      }
    },
    template: `
      <div>
        <Stack vertical spacing="extraTight">
          <Checkbox v-model="fixedFirst" label="fixed: true on the first column" />
          <Checkbox v-model="wrapAll" label="wrap: true on every column" />
          <Checkbox v-model="sortable" label="sortable: true on every column (adds the sort icon)" />
          <Checkbox v-model="applyMinWidth" label="minWidth: 180 on every column" />
          <Checkbox v-model="withRows" label="Add rows" />
        </Stack>
        <br />
        <Card>
          <DataTable :columns="columns" :rows="rows" />
        </Card>
      </div>
    `
  })
}
