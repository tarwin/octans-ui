<script
  lang="ts"
  setup
  generic="Row extends Record<string, any> = Record<string, any>"
>
import { ActionList } from '@/components/ActionList'
import { Button } from '@/components/Button'
import { CheckboxControl } from '@/components/Checkbox'
import { Icon } from '@/components/Icon'
import { SkeletonDisplayText } from '@/components/SkeletonDisplayText'
import { Spinner } from '@/components/Spinner'
import type { ActionType } from '../types'
import type { DataTableColumnType, InterPropsType } from './types'
import debounce from '@/utils/debounce'
import { format, isNumericType, isSummableNumericType } from '@/utils/format'
import {
  computed,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  useCssModule,
  useSlots,
  watch
} from 'vue'
import BulkActions from './BulkActions.vue'
import DataTableFooter from './DataTableFooter.vue'
import { $t } from '@/utils/translate'

const MAX_PERSIST_ACTIONS = 3

const props = withDefaults(defineProps<InterPropsType<Row>>(), {
  totals: false,
  loading: false,
  compact: false,
  actionCollapseThreshold: 900,
  maxPersistActions: MAX_PERSIST_ACTIONS,
  fixedColumnDisableThreshold: 600
})

const emit = defineEmits(['click-row', 'update:sort', 'update:selectedIds'])

/**
 * Declares the component's scoped slots for consumers. As well as the static
 * `actions` slot, the table exposes one dynamic slot per column for the cell
 * (`col:<columnKey>`) and the header (`head:<columnKey>`).
 */
defineSlots<
  {
    actions?(props: {
      row: Row
      index: number
      actions: ActionType[] | undefined
    }): any
  } & {
    // Values must include `undefined`: Vue types slots as
    // `Record<string, Slot | undefined>`, so a required index signature here
    // makes the component unassignable to `Component` (e.g. Storybook's
    // `components` record).
    [name: `col:${string}`]:
      ((props: { row: Row; value: any }) => any) | undefined
    [name: `head:${string}`]:
      | ((props: {
          col: DataTableColumnType
          value?: string
          className: string
        }) => any)
      | undefined
  }
>()

const hasScrollWidth = ref(false)
const hasScrollLeft = ref(false)
const hasScrollRight = ref(false)
const width = ref<null | number>(null)

const slots = useSlots()
const attrs = useAttrs()

const $style = useCssModule()

const rootEl = ref<HTMLElement | null>(null)
const scrollEl = ref<HTMLElement | null>(null)

const fixedColumnAllowed = computed(() => {
  return width.value && width.value < props.fixedColumnDisableThreshold
    ? false
    : true
})

const hasSelection = computed(() => {
  return (props.selectedIds || []).length > 0
})

const cols = computed(() => {
  let hasFixedCol = false
  const cols = (props.columns as DataTableColumnType[]).map(
    (col, index: number) => {
      const colFormat = col.format
      const formatString = typeof colFormat === 'string' ? colFormat : ''
      if (formatString) {
        col.formatString = formatString
      }
      col = {
        ...col,
        index,
        classes: [
          $style.Cell,
          isNumericType(formatString) && $style.Cell_numeric,
          (col.wrap && $style.Cell_wrap) || ''
        ]
      }
      if (typeof colFormat === 'function') {
        col.formatFunc = colFormat
      } else {
        // Applied even when the column has no format so that empty values
        // still render the em dash placeholder.
        col.formatFunc = function (value, row, forTotal) {
          const context = col.formatContext
            ? col.formatContext(row, !!forTotal)
            : null
          if (context) {
            return format(value, formatString, context)
          } else {
            return format(value, formatString)
          }
        }
      }
      if (col.fixed && fixedColumnAllowed.value && index === 0) {
        hasFixedCol = true
        if (!col.classes) col.classes = []
        col.classes.push($style.Cell_fixed, $style.Cell_fixedLast)
      }
      return col
    }
  )
  if (props.bulkActions || Array.isArray(props.selectedIds)) {
    const bulkCol: DataTableColumnType = {
      key: '_bulk',
      type: 'bulkActions',
      classes: [$style.Cell, $style.Cell_bulkActions]
    }
    if (!hasFixedCol) {
      if (!bulkCol.classes) bulkCol.classes = []
      bulkCol.classes.push($style.Cell_fixedLast)
    }
    cols.unshift(bulkCol)
  }
  if (props.rowActions || slots.actions) {
    cols.push({
      key: '_actions',
      type: 'actions',
      classes: [$style.Cell, $style.Cell_actions]
    })
  }
  return cols
})

const totalValues = computed(() => {
  const columns = props.columns
  const rows = props.rows as Record<string, any>
  if (loadingStates.value.totals) {
    return columns.map(() => 'loading')
  } else if (props.totals === true) {
    const _totals = []
    for (const col of columns) {
      const colFormat = typeof col.format === 'string' ? col.format : ''
      if (isSummableNumericType(colFormat)) {
        let sum = 0
        for (const row of rows as Record<string, any>[]) {
          sum += row[col.key]
        }
        _totals.push(sum)
      } else {
        _totals.push('')
      }
    }
    return _totals
  }
  return props.totals
})

const hasServerPagination = computed(() => {
  return (
    props.pagination &&
    (props.pagination.total || 0) > 0 &&
    props.pagination.total !== props.rows.length
  )
})

const filteredRows = computed(() => {
  if (props.pagination && !hasServerPagination.value) {
    return props.rows.slice(
      props.pagination.offset,
      props.pagination.offset + props.pagination.limit
    )
  }
  return props.rows
})

// TODO: check that we are using this
const wrappedBulkActions = computed(() => {
  if (props.bulkActions) {
    return props.bulkActions.map((action) => {
      return {
        ...action,
        onAction: () => {
          if (action.onAction) {
            const selection = props.selectedIds || []
            const rows = props.rows.filter((d) => selection.includes(d.id))
            action.onAction(rows)
          }
        }
      }
    })
  }
  return null
})

const maxPages = computed(() => {
  if (width.value && width.value < props.actionCollapseThreshold) {
    return 0
  }
  return 5
})

const loadingStates = computed(() => {
  const states = props.loading
  return {
    totals: states && (states as Record<string, any>).totals,
    rows: states === true || (states && states.rows),
    footer: states && (states as Record<string, any>).footer
  }
})

// Recalculate scroll hints whenever rows are rendered.
watch(
  () => filteredRows.value,
  () => {
    nextTick(updateScroll)
  }
)

const updateScrollImmediate = () => {
  const el = scrollEl.value
  if (el) {
    hasScrollWidth.value = el.clientWidth !== el.scrollWidth
    hasScrollLeft.value = el.scrollLeft > 0
    hasScrollRight.value = el.scrollWidth - el.scrollLeft > el.clientWidth
    width.value = rootEl.value?.clientWidth || null
  }
}

const toggleRowSelection = (rowId: number) => {
  const selectedIds = props.selectedIds
  if (selectedIds) {
    const isSelected = selectedIds.includes(rowId)
    const selection = isSelected
      ? selectedIds.filter((id) => id !== rowId)
      : [...selectedIds, rowId]
    updateSelection(selection)
  }
}

const updateSelection = (selection: number[]) => {
  /**
   * Emitted when the user toggles a row for bulk actions.
   * @type {Array<any>}
   */
  emit('update:selectedIds', selection)
}

const updateScroll = debounce(updateScrollImmediate, 100, {
  leading: true,
  trailing: true
})

onMounted(() => {
  window.addEventListener('resize', updateScroll)

  updateScroll()
  scrollEl.value?.addEventListener('scroll', updateScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScroll)
  scrollEl.value?.removeEventListener('scroll', updateScroll)
})

const renderRow = (row: any, rowIndex: number) => {
  const isSelected = props.selectedIds
    ? props.selectedIds.includes(row.id)
    : false
  const cells = cols.value.map((col) => {
    let content: any = col.key && row[col.key]
    if (col.formatFunc) {
      content = col.formatFunc(content, row)
    }
    const scopedSlot =
      col.key &&
      (slots['col:' + col.key] || slots['col:' + col.key.toLowerCase()])

    if (scopedSlot) {
      content = scopedSlot({
        row,
        value: content
      })
    }
    if (col.type === 'bulkActions') {
      content = h(CheckboxControl, {
        class: $style.RowCheckbox,
        checked: isSelected,
        // Prevent the click on the checkbox from toggling it a second
        // time as it will occur after the change event.
        onClick: (event: MouseEvent) => event.stopPropagation(),
        // Toggle the row selection on change (could be from a click or
        // using the keyboard).
        onChange: () => toggleRowSelection(row.id)
      })
    } else if (col.type === 'actions') {
      const actions =
        typeof props.rowActions === 'function'
          ? props.rowActions(row, rowIndex)
          : props.rowActions
      if (slots.actions) {
        content = slots.actions({ row, index: rowIndex, actions })
      } else if (actions) {
        if (
          actions.length > props.maxPersistActions ||
          (width.value && width.value < props.actionCollapseThreshold)
        ) {
          content = h(
            ActionList,
            {
              items: actions.map((action: any) => {
                return {
                  ...action,
                  onAction() {
                    if (action.onAction) {
                      action.onAction(row)
                    }
                  }
                }
              }),
              placement: 'bottom-end'
            },
            () =>
              h(Button, {
                class: $style.ActionButton,
                size: 'small',
                type: 'link',
                icon: 'mdi:dots-horizontal',
                disabled: hasSelection.value
              })
          )
        } else {
          content = actions.map((action: any) =>
            h(
              Button,
              {
                class: $style.ActionButton,
                type: 'link',
                disabled: hasSelection.value ? true : action.disabled,
                url: action.url,
                external: action.external,
                tooltip: action.tooltip,
                tooltipPosition: action.tooltipPosition || 'left',
                onClick() {
                  if (action.onAction) {
                    action.onAction(row)
                  }
                }
              },
              () => {
                return `${action.label}`
              }
            )
          )
        }
      }
    }
    const minWidth = col.minWidth || col.width
    const maxWidth = col.maxWidth || col.width
    return h(
      'td',
      {
        class: [$style.RowCell, ...(col.classes || [])],
        style: {
          minWidth: minWidth && minWidth + 'px',
          maxWidth: maxWidth && maxWidth + 'px'
        },
        title: maxWidth && typeof content === 'string' ? content : null,
        onClick(event: MouseEvent) {
          if (col.type === 'actions') {
            event.stopPropagation()
          }
        }
      },
      [content]
    )
  })

  return h(
    'tr',
    {
      class: [$style.Row, isSelected && $style.Row_isSelected],
      onClick: () => {
        if (hasSelection.value) {
          toggleRowSelection(row.id)
        } else {
          /**
           * Emitted when a row is clicked. When you define a listener for this
           * event, rows will be styled to show the pointer cursor on hover.
           *
           * @event click-row
           * @type {RowData}
           */
          emit('click-row', row)
        }
      }
    },
    cells
  )
}

const updateOffset = (offset: number) => {
  if (!props.pagination) return
  if (props.pagination.updateOffset) {
    props.pagination.updateOffset(offset)
  }
}

const updateLimit = (limit: number) => {
  if (!props.pagination) return
  if (props.pagination.updateLimit) {
    props.pagination.updateLimit(limit)
  }
}

const render = () => {
  const selectedIds = props.selectedIds || []
  // The bulk-actions column draws a control rather than a heading; every other
  // column is a caller's `head:` slot if there is one, and its label if not.
  const headerContent = (col: DataTableColumnType) => {
    if (col.type === 'bulkActions') {
      return h(BulkActions, {
        actions: wrappedBulkActions.value || [],
        totalItems: filteredRows.value.length,
        selectedItems: selectedIds.length,
        onChange(selectAll) {
          const selection = selectAll
            ? filteredRows.value.map((d: any) => d.id)
            : []
          updateSelection(selection)
        }
      })
    }
    const scopedSlot =
      col.key &&
      (slots['head:' + col.key] || slots['head:' + col.key.toLowerCase()])
    if (scopedSlot) {
      return scopedSlot({
        col,
        value: col.label,
        className: $style.HeaderContent
      })
    }
    return h('span', { class: $style.HeaderContent }, col.label)
  }

  const headerColsMarkup = cols.value.map((col) => {
    const content = headerContent(col)

    const isSorted = props.sort && props.sort.column === col.key

    const sortMarkup =
      col.sortable &&
      h(Icon, {
        // Written as two whole names rather than built by concatenation: the
        // icon bundler scans for complete names so it can pre-register them
        // for offline use.
        icon:
          props.sort && props.sort.direction === 'asc'
            ? 'mdi:menu-up'
            : 'mdi:menu-down',
        class: $style.SortIcon
      })

    // The table is `table-layout: fixed`, so column widths come from the first
    // row — which is this header row. Applying the same min/max the body cells
    // get is what makes `minWidth` actually hold a column open: without it a
    // `wrap` column collapses (its `word-break: break-all` puts min-content at
    // roughly one character), and when there are no rows there are no body
    // cells to carry the width at all.
    const headMinWidth = col.minWidth || col.width
    const headMaxWidth = col.maxWidth || col.width
    return h(
      'th',
      {
        class: [
          ...(col.classes || []),
          $style.HeaderCell,
          col.sortable && $style.Cell_sortable,
          isSorted && $style.Cell_isSorted
        ],
        style: {
          minWidth: headMinWidth && headMinWidth + 'px',
          maxWidth: headMaxWidth && headMaxWidth + 'px'
        },
        onClick() {
          if (!hasSelection.value && col.sortable) {
            const newSort = {
              column: col.key,
              direction: props.sort ? props.sort.direction : 'desc'
            }
            if (props.sort && props.sort.column === col.key) {
              newSort.direction =
                props.sort.direction === 'desc' ? 'asc' : 'desc'
            }
            emit('update:sort', newSort)
          }
        }
      },
      [sortMarkup, content]
    )
  })
  const totalsColsMarkup =
    totalValues.value &&
    cols.value.map((col, index) => {
      let content: any = (totalValues.value as number[])[col.index || 0]
      if (index === 0) {
        content = 'Totals'
      } else if (content === 'loading') {
        content = h(SkeletonDisplayText, {
          props: {
            size: 'tiny'
          },
          style: {
            display: 'inline-block',
            minWidth: '100px'
          }
        })
      } else if (content && col.formatFunc) {
        content = col.formatFunc(content, filteredRows.value[0], true)
      }
      return h(
        'th',
        {
          class: [...(col.classes || []), $style.Cell_total]
        },
        [content]
      )
    })
  const headerMarkup = h('thead', [
    h('tr', headerColsMarkup),
    totalsColsMarkup && h('tr', totalsColsMarkup)
  ])

  const rowsMarkup = filteredRows.value.map((row, rowIndex) => {
    return renderRow(row, rowIndex)
  })
  const emptyText =
    props.emptyText !== null
      ? props.emptyText || $t('ui.dataTable.noData')
      : null
  const emptyMarkup =
    !rowsMarkup.length &&
    emptyText &&
    h('tr', [
      h(
        'td',
        {
          class: [$style.EmptyText],
          colspan: cols.value.length
        },
        emptyText
      )
    ])

  // const bodyMarkup = h('tbody', [rowsMarkup || emptyMarkup])
  const bodyMarkup = h('tbody', rowsMarkup.length ? rowsMarkup : [emptyMarkup])

  const tableMarkup = h(
    'table',
    {
      class: $style.Table
    },
    [headerMarkup, bodyMarkup]
  )

  const footerMarkup =
    props.pagination &&
    h(DataTableFooter, {
      offset: props.pagination.offset,
      limit: props.pagination.limit,
      total: props.pagination.total || props.rows.length,
      summary: props.pagination.summary,
      maxPages: maxPages.value,
      pageSizes: props.pagination.pageSizes,
      loading: loadingStates.value.footer,
      onUpdateOffset: (val: number) => updateOffset(val),
      onUpdateLimit: (val: number) => updateLimit(val)
    })

  const scrollContainerInnerMarkup = h(
    'div',
    {
      ref: scrollEl,
      class: [
        $style.ScrollContainerInner,
        props.disableScrollBounce && $style.sDisableBounce
      ],
      on: {
        scroll: updateScroll
      }
    },
    [tableMarkup]
  )

  const hasLeftFixed =
    props.bulkActions ||
    Array.isArray(selectedIds) ||
    cols.value.some((c) => c.fixed)

  const hasRightFixed = !!props.rowActions || !!slots.actions
  const scrollContainerOuterMarkup = h(
    'div',
    {
      class: [
        $style.ScrollContainerOuter,
        !hasLeftFixed && $style.NoFixedLeft,
        !hasRightFixed && $style.NoFixedRight
      ]
    },
    [scrollContainerInnerMarkup]
  )

  const loaderMarkup =
    loadingStates.value.rows &&
    h(
      'div',
      {
        class: $style.Loader
      },
      [h(Spinner)]
    )

  return h(
    'div',
    {
      ref: rootEl,
      class: [
        'UIElement',
        $style.DataTable,
        hasScrollWidth.value && $style.hasScrollWidth,
        hasScrollLeft.value && $style.hasScrollLeft,
        hasScrollRight.value && $style.hasScrollRight,
        props.bulkActions && $style.hasBulkActions,
        props.selectedIds && props.selectedIds.length && $style.hasSelection,
        attrs['click-row'] && $style.hasClickableRows,
        props.compact && $style.isCompact
      ]
    },
    [loaderMarkup, scrollContainerOuterMarkup, footerMarkup]
  )
}
</script>

<template>
  <!-- called inline so this renders in DataTable's own effect - see List.vue -->
  <component :is="render()" />
</template>

<style lang="scss" module>
// vars
$focusColor: var(--octans-focus-ring);

@mixin compatMode {
  :global(.ui-compat) {
    @content;
  }
}

$rowHoverColor: var(--octans-surface-hover);
$bulkActionWidth: 45px;
$padding: 16px;

.DataTable {
  position: relative;
  max-width: 100vw;
  --lh: 14px * 1.4;
  color: var(--octans-text);

  th {
    font-weight: 500;
    border-bottom: 1px solid var(--octans-border-strong);
  }

  tbody tr:not(:last-child) td {
    border-bottom: 1px solid var(--octans-border);
  }

  tbody tr:hover td {
    background: $rowHoverColor;
  }

  [data-card-section] > & {
    margin: -16px;
  }
  [data-card-section] > [data-card-header] + & {
    margin-top: 0;
  }
}

.hasClickableRows tbody tr:hover {
  cursor: pointer;
}

.isCompact {
  .RowCell {
    padding: 8px 16px;
  }
}

.Table {
  // width: 100%;
  min-width: 100%;
  border-spacing: 0px;
  table-layout: fixed;
  background: var(--octans-surface);
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
  border-collapse: separate;
}

@include compatMode {
  .Table {
    th,
    td {
      line-height: normal;
    }
  }
}

.Row:last-child td {
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
}

.Cell {
  padding: $padding;
  text-align: left;
  vertical-align: middle;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  .Row_isSelected & {
    background: color-mix(in srgb, var(--octans-primary) 10%, transparent);
  }
  .Row_isSelected:hover & {
    background: color-mix(in srgb, var(--octans-primary) 14%, transparent);
  }
}

.Cell_sortable {
  cursor: pointer;

  &:hover {
    color: $focusColor;
  }
}
.SortIcon {
  opacity: 0.3;
  margin-right: 5px;

  .Cell_isSorted &,
  .Cell_sortable:hover & {
    opacity: 1;
  }
}

.Cell_wrap {
  overflow: visible;
  white-space: normal;
  word-break: break-all;
}

.CellWrapContent {
  --max-lines: 3;
  position: relative;
  max-height: calc(var(--lh) * var(--max-lines));
  padding-right: 14px;
  // text-overflow: ellipsis;
  overflow: hidden;
  min-width: 150px;
  max-width: unset;

  &::before {
    content: '...';
    position: absolute;
    bottom: 0;
    right: 0;
  }

  &::after {
    content: '';
    position: absolute;
    right: 0; /* note: not using bottom */
    width: 1rem;
    height: 1rem;
    background: white;

    tr:hover & {
      background: $rowHoverColor;
    }
  }
}

.Cell_fixed {
  position: sticky;
  top: auto;
  left: 0;
  z-index: 1;
  // width: 145px;
  white-space: unset;
  background: var(--octans-surface);
  overflow: visible;

  .hasBulkActions & {
    left: $bulkActionWidth;
  }
}

.Cell_bulkActions {
  composes: Cell_fixed;
  left: 0 !important;
  width: $bulkActionWidth;
  min-width: $bulkActionWidth;
  max-width: $bulkActionWidth;
}
th.Cell_bulkActions {
  z-index: 2;
  vertical-align: top;
}

.hasScrollLeft {
  .ScrollContainerOuter {
    .Cell_fixedLast {
      border-right: 2px solid var(--octans-border);
      box-shadow: 2px 0px 0px 0px rgba(0, 0, 0, 0.05);
    }
    &.NoFixedLeft {
      &::before {
        content: ' ';
        display: block;
        width: 5px;
        height: 100%;
        position: absolute;
        box-shadow: inset 2px 0px 2px 1px rgba(0, 0, 0, 0.05);
        top: 0;
        left: 0;
      }
    }
  }
}

.Cell_numeric {
  text-align: right;
}

.Cell_total {
  background: var(--octans-surface-sunken) !important;
}

.Cell_actions {
  position: sticky;
  top: auto;
  right: 0;
  min-width: 40px;
  background: var(--octans-surface);
  // vertical-align: middle;
  overflow: visible;
  text-align: right;
  cursor: default;
  // For tables with few columns, Cell_actions takes up more width than it needs.
  // When combined with the @click-row listener it prevents a usable area of the
  // row from being clicked. This forces Cell_actions to take as little width
  // as possible.
  width: 1%;
}
.hasScrollRight {
  .ScrollContainerOuter {
    .Cell_actions {
      border-left: 2px solid var(--octans-border);
      box-shadow: -2px 0px 0px 0px rgba(0, 0, 0, 0.05);
    }
    &.NoFixedRight {
      &::after {
        content: ' ';
        display: block;
        width: 5px;
        height: 100%;
        position: absolute;
        box-shadow: inset -2px 0px 2px 1px rgba(0, 0, 0, 0.05);
        top: 0;
        right: 0;
      }
    }
  }
}

.ActionButton {
  & + & {
    margin-left: 8px;
  }
}

.ScrollContainerInner {
  overflow-x: auto;
  overscroll-behavior: contain auto;
  &.sDisableBounce {
    overscroll-behavior: none;
  }
}
.ScrollContainerOuter {
  position: relative;
}

.RowCheckbox {
  position: relative;
  top: 2px;
}

.hasSelection {
  .HeaderContent {
    visibility: hidden;
  }
  .SortIcon {
    display: none;
  }
  th.Cell {
    cursor: default;
  }
  td.Cell {
    cursor: pointer;

    // Disable clicking any links or buttons that may be rendered as custom
    // column slots while in bulk selection mode.
    * {
      pointer-events: none;
    }
  }
}

.Loader {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--octans-scrim);
  border-radius: var(--octans-radius-field);
}

.EmptyText {
  padding: $padding;
  border-radius: 0 0 var(--octans-radius-box) var(--octans-radius-box);
  color: var(--octans-text-subdued);
  font-style: italic;
}
</style>
@/styleguide/lang
