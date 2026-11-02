import type { ActionWithSubjectType } from '../types'

interface DataTableFormatContextType {
  currency: string
  locale: string
  timezone: string
}

export type DataTableColumnFormatFuncType = (
  content: any,
  row: any,
  forTotal?: boolean
) => string | null

export interface DataTableColumnType {
  key: string
  type?: string
  label?: string
  format?: string | DataTableColumnFormatFuncType
  formatString?: string
  formatFunc?: DataTableColumnFormatFuncType
  formatContext?: (
    row: object,
    forTotal: boolean
  ) => Partial<DataTableFormatContextType>
  width?: number
  minWidth?: number
  maxWidth?: number
  fixed?: boolean
  sortable?: boolean
  wrap?: boolean

  // internal
  index?: number
  classes?: Array<string | false>
}

/**
 * An action at the end of a single row. Its `onAction` receives that row.
 */
export type DataTableRowActionItemType<R extends Record<string, any>> =
  ActionWithSubjectType<R>

/**
 * An action shown once rows are selected. Its `onAction` receives every
 * selected row, as an array.
 */
export type DataTableBulkActionType<R extends Record<string, any>> =
  ActionWithSubjectType<R[]>

export type DataTableRowActionType<R extends Record<string, any>> =
  | DataTableRowActionItemType<R>[]
  | ((row: R, index: number) => DataTableRowActionItemType<R>[])

export type DataTableLoadingStateType = {
  totals: boolean
  rows: boolean
  footer: boolean
}

export type DataTablePaginationType = {
  offset: number
  updateOffset: (offset: number) => void
  limit: number
  updateLimit: (limit: number) => void
  pageSizes?: number[]
  total?: number
  summary?: string
}

export type DataTableSortType = {
  column: string
  direction: 'asc' | 'desc'
}

export type InterPropsType<
  Row extends Record<string, any> = Record<string, any>
> = {
  /**
   * An array of Columns.
   *
   * ```ts
   * interface Column {
   *   key: string
   *   label: string
   *   // @See Formatter
   *   // A function can be provided to format the cell value directly, it is
   *   // called with (value, row, forTotal) and should return a string.
   *   format?: FormatType | FormatFunc
   *   // As above, an alternative to passing a function as `format`.
   *   // type FormatFunc =
   *   //   (value: any, row: object, forTotal?: boolean) => string | null
   *   formatFunc?: FormatFunc
   *   // Allows overriding the format context for the current cell.
   *   // @See Formatter
   *   formatContext?: (row: object, forTotal: boolean) => Partial&lt;FormatContext&gt;
   *   // Shortcut for setting minWidth and maxWidth to same value.
   *   width?: number
   *   // Minimum column width in pixels.
   *   minWidth?: number
   *   // Maximum column width in pixels.
   *   maxWidth?: number
   *   // Fixes the column in place, only applies to first column.
   *   fixed?: boolean
   *   sortable?: boolean
   *   // Wraps any overflowing content in the column instead of truncating it.
   *   // Combine with `minWidth` option to prevent column from being made
   *   // infinitely narrow.
   *   wrap?: boolean
   * }
   * ```
   */
  columns: DataTableColumnType[]
  /**
   * An array of row data objects to display.
   *
   *   - Each row should have a unique `id` property.
   *   - Data will be displayed in the order provided.
   *   - If client-side pagination is used, the data table will truncate rows as neccessary.
   *   - If server-side pagination is used, you are responsible for pagination.
   */
  rows: Row[]
  /**
   * An array of actions to display at the end of each row.
   *
   * A function can be provided that will be called once for each row to
   * customize the action on a per-row basis.
   *
   * When necessary the action colum will collapse into an action list
   * and stay fixed to the right edge to improve accessibility.
   *
   * **`onAction` receives the row it belongs to.**
   *
   * ```ts
   * interface DataTableRowActionItemType<Row> {
   *   label: string
   *   // See &lt;Icon&gt; component.
   *   icon?: string
   *   disabled?: boolean
   *   url?: string
   *   external?: boolean
   *   onAction?(row: Row): void
   * }
   * ```
   */
  rowActions?: DataTableRowActionType<Row>
  /**
   * An array of actions to display when the user selects one or more rows.
   *
   * **`onAction` receives an array of the selected row data objects.**
   *
   * ```ts
   * interface DataTableBulkActionType<Row> {
   *   label: string
   *   // See &lt;Icon&gt; component.
   *   icon?: string
   *   disabled?: boolean
   *   url?: string
   *   external?: boolean
   *   onAction?(rows: Row[]): void
   * }
   * ```
   */
  bulkActions?: DataTableBulkActionType<Row>[]
  /**
   * An array containing all the row IDs that are selected.
   * The `update:selectedIds` event is emitted whenever the user changes the
   * selection.
   */
  selectedIds?: number[]
  /**
   * Splits the data in the table into multiple pages if the number of rows
   * exceeds the page limit.
   *
   * ```ts
   * interface PaginationType {
   *   offset: number
   *   // Callback method to invoke with the new offset value when the user
   *   // changes a page.
   *   updateOffset(number): void
   *   // The number of rows to show per page.
   *   limit: number
   *   // Callback method to invoke with the new limit value when the user
   *   // changes the page size.
   *   updateLimit(number): void
   *   // An array of page sizes (limits) the user can choose from.
   *   // See `Pagination` component for defaults and options.
   *   pageSizes: number[]
   *   // Defaults to rows.total.
   *   // If the total provided is greater than the current number of rows
   *   // then the table will render in "server-side" mode where it shows all
   *   // rows and leaves handing of the pagination up to you.
   *   total?: number
   *   // Localized footer summary, defaults to "Showing {range} of {total}"
   *   summary?: string
   * }
   * ```
   */
  pagination?: DataTablePaginationType
  /**
   * If `true` then all numeric columns will be automatically summed.
   *
   * If an array is provided then it will use these numbers for the totals.
   * Use empty strings as placeholders for columns with no total.
   *
   * For example the follow array would manually show totals of 50 and 100 for
   * the second and forth columns and format them based on the column format.
   *
   * ```js
   * ['', 50, '', 100]
   * ```
   *
   * **Note:** The first column can never have a total.
   */
  totals?: boolean | number[] | string[]
  /**
   * Controls loading states for parts of the table. Accepts an object or boolean.
   * Passing `true` is the same as using `{rows: true}`.
   *
   * ```ts
   * interface LoadingStates {
   *   // Shows skeleton text where headers totals should be.
   *   totals: boolean
   *   // Shows a spinner centered on the table and dims all content.
   *   rows: boolean
   *   // Shows skeleton text in the footer.
   *   footer: boolean
   * }
   * ```
   */
  loading?: boolean | DataTableLoadingStateType
  /**
   * Text to show when there are no rows to display.
   */
  emptyText?: string
  /**
   * The current column to sort by and its direction.
   *
   * ```ts
   * interface SortType {
   *   column: string
   *   direction: string // asc | desc
   * }
   * ```
   */
  sort?: DataTableSortType
  /**
   * Renders rows in compact form.
   */
  compact?: boolean
  /**
   * The minimum width in pixels which the DataTable must be for row actions
   * to be displayed inline. When the DataTable is smaller than this width the
   * actions are collapsed into a dropdown menu.
   */
  actionCollapseThreshold?: number
  /**
   * The maximum number of actions to display inline before collapsing into a
   * dropdown menu.
   * @default 3
   */
  maxPersistActions?: number
  /**
   * The maximum width in pixels which the DataTable must be for row actions
   * to be displayed inline. When the DataTable is smaller than this width the
   * actions are collapsed into a dropdown menu.
   */
  fixedColumnDisableThreshold?: number
  /**
   * Disables the scroll bounce effect.
   */
  disableScrollBounce?: boolean
  /**
   * Caps the table's height. The rows scroll inside it and the header (and
   * totals row) stays pinned to the top. A number is pixels; a string is any
   * CSS length — `'60vh'`, or `'100%'` to fill a parent with a set height.
   * Inside a flex column (a card with a title above the table, say) the
   * table also shrinks to the space left, so `'100%'` fills the rest of it.
   * Pagination, if any, stays inside the cap.
   *
   * `virtual` needs it, because a virtual table has to know how tall its
   * window is.
   */
  maxHeight?: number | string
  /**
   * Only renders the rows that are in view (plus a few either side), so a
   * table can hold tens of thousands of rows and still scroll smoothly.
   * Needs `maxHeight`.
   *
   * Rows are assumed to all be one height, which is true unless a column
   * uses `wrap`. Column widths are measured from the first rows drawn and
   * then held, so they do not jump as you scroll; they are measured again
   * when the table is resized or `columns` changes.
   */
  virtual?: boolean
  /**
   * The height of one row in pixels, for `virtual`. Measured from the first
   * rows drawn when not given — set it only if that measurement is wrong.
   */
  rowHeight?: number
  /**
   * There are more rows to fetch. The table shows a spinner after the last
   * row and emits `load-more` as it comes into reach, either inside the
   * `maxHeight` scroll area or, without one, in the page.
   *
   * It asks once, then waits for `rows` to grow or for `loadingMore` to go
   * back to `false` before it asks again. Set it to `false` when the data
   * runs out.
   */
  hasMore?: boolean
  /**
   * A `load-more` fetch is in flight. While it is `true` the table will not
   * ask again. If the fetch fails, setting it back to `false` lets the table
   * ask again once the spinner is still in reach.
   */
  loadingMore?: boolean
}
