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
// Rows drawn above and below the visible window in `virtual` mode, so a quick
// flick does not show empty space before the next render lands.
const VIRTUAL_OVERSCAN = 8
// A first guess at a row's height (16px padding twice, a 16px line, a 1px
// border) — replaced by a measurement as soon as a row has been drawn.
const DEFAULT_ROW_HEIGHT = 49
// How far below the visible area the load-more spinner may be and still count
// as in reach, so the next batch is usually there before anyone sees it.
const LOAD_MORE_MARGIN = 300

const props = withDefaults(defineProps<InterPropsType<Row>>(), {
  totals: false,
  loading: false,
  compact: false,
  actionCollapseThreshold: 900,
  maxPersistActions: MAX_PERSIST_ACTIONS,
  fixedColumnDisableThreshold: 600
})

const emit = defineEmits([
  'click-row',
  'update:sort',
  'update:selectedIds',
  'load-more'
])

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
const sentinelEl = ref<HTMLElement | null>(null)

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

// --- scrolling, virtual rows and load-more ----------------------------------

const hasMaxHeight = computed(
  () =>
    props.maxHeight !== undefined &&
    props.maxHeight !== null &&
    props.maxHeight !== ''
)

const isVirtual = computed(() => !!props.virtual && hasMaxHeight.value)

const scrollTop = ref(0)
const viewportHeight = ref(0)
// The scroll area's inner width — its box less any vertical scrollbar.
const viewportWidth = ref(0)
const headerHeight = ref(0)
const measuredRowHeight = ref<number | null>(null)
// Header cell widths, measured once from a natural layout and then held, so
// the columns do not resize as different rows scroll through.
const frozenWidths = ref<number[] | null>(null)

const rowHeight = computed(
  () => props.rowHeight || measuredRowHeight.value || DEFAULT_ROW_HEIGHT
)

// Two number computeds rather than one `{ start, end }` object: a computed
// only notifies when its value changes, and a fresh object always does — that
// would re-render the table on every pixel of scroll.
const scrolledRows = computed(() =>
  Math.max(0, scrollTop.value - headerHeight.value)
)
const virtualStart = computed(() => {
  const total = filteredRows.value.length
  if (!isVirtual.value) return 0
  const start = Math.floor(scrolledRows.value / rowHeight.value)
  return Math.min(total, Math.max(0, start - VIRTUAL_OVERSCAN))
})
const virtualEnd = computed(() => {
  const total = filteredRows.value.length
  if (!isVirtual.value) return total
  // Before the first measurement there is no viewport height; draw a
  // generous screenful so the table is not empty for that one frame.
  const height = viewportHeight.value || 800
  const end = Math.ceil((scrolledRows.value + height) / rowHeight.value)
  return Math.min(total, Math.max(virtualStart.value, end + VIRTUAL_OVERSCAN))
})

const resetMeasurements = () => {
  measuredRowHeight.value = null
  frozenWidths.value = null
}

const measureLayout = () => {
  const el = scrollEl.value
  if (!el) return
  viewportHeight.value = el.clientHeight
  // A vertical scrollbar appearing or going away changes the inner width
  // without changing the table's own. Anything measured against the old
  // width is stale: let one render land at the new width, then measure.
  if (viewportWidth.value !== el.clientWidth) {
    viewportWidth.value = el.clientWidth
    resetMeasurements()
    nextTick(measureLayout)
    return
  }
  const thead = el.querySelector('thead')
  headerHeight.value = thead ? thead.offsetHeight : 0
  if (!isVirtual.value) return
  const drawn = el.querySelectorAll<HTMLElement>('tbody > tr[data-row-index]')
  if (!drawn.length) return
  if (!props.rowHeight && measuredRowHeight.value === null) {
    let sum = 0
    drawn.forEach((tr) => (sum += tr.getBoundingClientRect().height))
    const average = sum / drawn.length
    if (average > 0) measuredRowHeight.value = average
  }
  if (frozenWidths.value === null) {
    const ths = el.querySelectorAll<HTMLElement>('thead > tr:first-child > th')
    const widths = Array.from(ths, (th) => th.getBoundingClientRect().width)
    if (widths.length && widths.every((w) => w > 0)) {
      frozenWidths.value = widths
    }
  }
}

watch(
  () => [virtualStart.value, virtualEnd.value, filteredRows.value],
  () => nextTick(measureLayout)
)
watch(
  () => props.columns,
  () => {
    resetMeasurements()
    nextTick(measureLayout)
  }
)
watch(
  () => props.rowHeight,
  () => nextTick(measureLayout)
)

const onVerticalScroll = () => {
  const el = scrollEl.value
  if (el) scrollTop.value = el.scrollTop
}

let loadMorePending = false

// Whether the spinner after the last row is within reach of the scroll area —
// or of the window when the table has no `maxHeight`. Checked against the
// live layout rather than the IntersectionObserver's last report, which is
// stale for a moment after new rows push the spinner down.
const sentinelInReach = () => {
  const target = sentinelEl.value
  if (!target) return false
  const rect = target.getBoundingClientRect()
  const root =
    hasMaxHeight.value && scrollEl.value
      ? scrollEl.value.getBoundingClientRect()
      : { top: 0, bottom: window.innerHeight }
  return rect.top <= root.bottom + LOAD_MORE_MARGIN && rect.bottom >= root.top
}

const maybeLoadMore = () => {
  if (!props.hasMore || props.loadingMore || loadMorePending) return
  if (!sentinelInReach()) return
  loadMorePending = true
  /**
   * Emitted when `hasMore` is set and the end of the loaded rows comes into
   * reach. Append the next batch to `rows`, or set `hasMore` to `false`.
   */
  emit('load-more')
}

watch(
  () => filteredRows.value.length,
  () => {
    loadMorePending = false
    nextTick(maybeLoadMore)
  }
)
watch(
  () => props.loadingMore,
  (loadingMore) => {
    if (!loadingMore) {
      loadMorePending = false
      nextTick(maybeLoadMore)
    }
  }
)
watch(
  () => props.hasMore,
  (hasMore) => hasMore && nextTick(maybeLoadMore)
)

let loadMoreObserver: IntersectionObserver | null = null
const connectLoadMoreObserver = () => {
  loadMoreObserver?.disconnect()
  loadMoreObserver = null
  const target = sentinelEl.value
  if (!target || typeof IntersectionObserver === 'undefined') return
  loadMoreObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) maybeLoadMore()
    },
    {
      root: hasMaxHeight.value ? scrollEl.value : null,
      rootMargin: `0px 0px ${LOAD_MORE_MARGIN}px 0px`
    }
  )
  loadMoreObserver.observe(target)
}
watch([sentinelEl, hasMaxHeight], connectLoadMoreObserver, { flush: 'post' })

/**
 * Scrolls the row at `index` (in `rows`) to the top of the scroll area — for
 * example back to 0 after a sort replaces the rows.
 */
const scrollToIndex = (index: number) => {
  const el = scrollEl.value
  if (!el) return
  if (isVirtual.value) {
    el.scrollTop = Math.max(0, index) * rowHeight.value
    return
  }
  const row = el.querySelector<HTMLElement>(
    `tbody > tr[data-row-index="${index}"]`
  )
  if (!row) return
  if (hasMaxHeight.value) {
    el.scrollTop +=
      row.getBoundingClientRect().top -
      el.getBoundingClientRect().top -
      headerHeight.value
  } else {
    row.scrollIntoView({ block: 'start' })
  }
}

defineExpose({ scrollToIndex })

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

// Seven slots — `1 … 9 10 11 … 20` — beside the summary; under the collapse
// threshold just previous/next, and the compact form on phones.
const pageSlots = computed(() => {
  if (width.value && width.value < props.actionCollapseThreshold) {
    return 0
  }
  return 7
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

let resizeObserver: ResizeObserver | null = null
let observedWidth = 0

onMounted(() => {
  window.addEventListener('resize', updateScroll)

  updateScroll()
  scrollEl.value?.addEventListener('scroll', updateScroll)
  scrollEl.value?.addEventListener('scroll', onVerticalScroll, {
    passive: true
  })

  if (props.virtual && !hasMaxHeight.value) {
    console.warn(
      'DataTable: `virtual` needs `maxHeight` — rendering every row instead.'
    )
  }

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      // A new width means the held column widths and row height may no
      // longer be right: let the table lay out naturally once and measure
      // again. A height change only moves the window.
      const width = rootEl.value?.clientWidth || 0
      if (width !== observedWidth) {
        observedWidth = width
        resetMeasurements()
      }
      nextTick(measureLayout)
    })
    if (rootEl.value) resizeObserver.observe(rootEl.value)
    if (scrollEl.value) resizeObserver.observe(scrollEl.value)
  }

  nextTick(() => {
    measureLayout()
    maybeLoadMore()
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScroll)
  scrollEl.value?.removeEventListener('scroll', updateScroll)
  scrollEl.value?.removeEventListener('scroll', onVerticalScroll)
  resizeObserver?.disconnect()
  loadMoreObserver?.disconnect()
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
      'data-row-index': rowIndex,
      // A virtual table only has some of its rows in the DOM; these tell a
      // screen reader where in the whole set each one sits.
      'aria-rowindex': isVirtual.value
        ? headerRowCount.value + rowIndex + 1
        : undefined,
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

const headerRowCount = computed(() => (totalValues.value ? 2 : 1))

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

  const headerColsMarkup = cols.value.map((col, colIndex) => {
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
        // `menu-down` is a 10×5 triangle in a 24-unit box, so at the header's
        // font size it is a few pixels wide. The same size `Select` gives its
        // caret, so the two read as one glyph.
        size: '20px',
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
    const frozenWidth = isVirtual.value && frozenWidths.value?.[colIndex]
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
          maxWidth: headMaxWidth && headMaxWidth + 'px',
          width: frozenWidth && frozenWidth + 'px'
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
  const virtual = isVirtual.value
  const headerMarkup = h('thead', [
    h('tr', { 'aria-rowindex': virtual ? 1 : undefined }, headerColsMarkup),
    totalsColsMarkup &&
      h('tr', { 'aria-rowindex': virtual ? 2 : undefined }, totalsColsMarkup)
  ])

  const start = virtualStart.value
  const end = virtualEnd.value
  const rowsMarkup = filteredRows.value
    .slice(start, end)
    .map((row, i) => renderRow(row, start + i))

  // Empty rows standing in for the ones not drawn, so the scrollbar is the
  // size of the whole set. The top one is always present (at 0px when
  // scrolled to the top) so the drawn rows keep their positions among the
  // children and Vue patches them in place.
  const spacerRow = (height: number) =>
    h('tr', { class: $style.SpacerRow, 'aria-hidden': 'true' }, [
      h('td', { colspan: cols.value.length, style: { height: height + 'px' } })
    ])
  const below = (filteredRows.value.length - end) * rowHeight.value
  const bodyRows: any[] = virtual
    ? [
        spacerRow(start * rowHeight.value),
        ...rowsMarkup,
        below > 0 && spacerRow(below)
      ]
    : rowsMarkup

  const loadMoreMarkup =
    props.hasMore &&
    h('tr', { class: $style.LoadMoreRow }, [
      h('td', { ref: sentinelEl, colspan: cols.value.length }, [
        // Held to the visible width so the spinner sits in the middle of
        // what can be seen, not of a table scrolled off to the side. The
        // scroll area's INNER width, not the table's outer one: a classic
        // scrollbar makes the outer width 15px too wide, and this row would
        // then push the whole table into a horizontal scroll.
        h(
          'div',
          {
            class: $style.LoadMoreInner,
            style: {
              width: viewportWidth.value
                ? viewportWidth.value + 'px'
                : undefined
            }
          },
          [h(Spinner, { size: 'small' })]
        )
      ])
    ])

  const emptyText =
    props.emptyText !== null
      ? props.emptyText || $t('ui.dataTable.noData')
      : null
  const emptyMarkup =
    !rowsMarkup.length &&
    !props.hasMore &&
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

  const bodyMarkup = h('tbody', [
    ...(rowsMarkup.length ? bodyRows : [emptyMarkup]),
    loadMoreMarkup
  ])

  // Once the widths are held, a set table width is what switches
  // `table-layout: fixed` on — the header row then decides every column and
  // the rows drawn later cannot push them about.
  const frozen = virtual && frozenWidths.value
  const tableMarkup = h(
    'table',
    {
      class: $style.Table,
      style: frozen
        ? { width: frozen.reduce((a, b) => a + b, 0) + 'px' }
        : undefined,
      'aria-rowcount': virtual
        ? filteredRows.value.length + headerRowCount.value
        : undefined
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
      pageSlots: pageSlots.value,
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
      ]
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
        props.compact && $style.isCompact,
        hasMaxHeight.value && $style.hasMaxHeight
      ],
      // On the root rather than the scroll area, so that `'100%'` resolves
      // against the table's own parent and the footer stays inside the cap.
      style: hasMaxHeight.value
        ? {
            maxHeight:
              typeof props.maxHeight === 'number'
                ? props.maxHeight + 'px'
                : props.maxHeight
          }
        : undefined
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

.DataTable {
  position: relative;
  max-width: 100vw;
  --lh: 14px * 1.4;
  color: var(--octans-text);

  th {
    font-weight: 500;
    border-bottom: 1px solid var(--octans-table-header-border);
  }

  tbody tr:not(:last-child) td {
    border-bottom: 1px solid var(--octans-border);
  }

  tbody tr:hover td {
    background: $rowHoverColor;
  }
}

.hasClickableRows tbody tr:hover {
  cursor: pointer;
}

.isCompact {
  .RowCell {
    padding: var(--octans-datatable-compact-cell-padding-y)
      var(--octans-datatable-cell-padding-x);
  }
}

.Table {
  // width: 100%;
  min-width: 100%;
  border-spacing: 0px;
  table-layout: fixed;
  background: var(--octans-surface);
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

.Cell {
  padding: var(--octans-datatable-cell-padding-y)
    var(--octans-datatable-cell-padding-x);
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
  // The caret is a 20px box beside 14px text, and the glyph sits in the
  // box's upper half. On the baseline that puts it above the label; centre
  // the box on the text's middle instead.
  vertical-align: middle;
  // Sits the caret on the label's x-height rather than dead centre — a
  // filled triangle reads lower than it is drawn.
  margin-top: -2px;

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

// --- max height, virtual rows, load-more ------------------------------------

.hasMaxHeight {
  // A column that hands whatever height it is given to the scroll area: the
  // cap above, or — with `min-height: 0` letting it shrink — whatever a flex
  // column parent has left for it, such as a card body under its title.
  display: flex;
  flex-direction: column;
  min-height: 0;

  .ScrollContainerOuter {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
  }

  .ScrollContainerInner {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    // Scroll anchoring "corrects" scrollTop whenever the top spacer resizes,
    // which for a virtual table means every render — and the corrections
    // compound until the table races to the bottom.
    overflow-anchor: none;
  }

  // The whole head sticks, so a totals row comes along with the labels. It
  // needs its own surface or the rows show through as they pass under it.
  thead {
    position: sticky;
    top: 0;
    z-index: 2;
  }
  th {
    background: var(--octans-surface);
  }
}

// Written in full so it outranks the row hover and divider rules above.
.DataTable tbody tr.SpacerRow td {
  padding: 0;
  border: 0;
  background: transparent;
}

.DataTable tbody tr.LoadMoreRow td {
  padding: 0;
  border: 0;
  background: transparent;
}
.LoadMoreInner {
  position: sticky;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  padding: var(--octans-datatable-cell-padding-y) 0;
  box-sizing: border-box;
}

.EmptyText {
  padding: var(--octans-datatable-cell-padding-y)
    var(--octans-datatable-cell-padding-x);
  border-radius: 0 0 var(--octans-radius-box) var(--octans-radius-box);
  color: var(--octans-text-subdued);
  font-style: italic;
}
</style>
@/styleguide/lang
