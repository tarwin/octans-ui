export interface ResourceListColumnType {
  key: string
  label: string
  /**
   * Name of a formatter from `format()` — `currency`, `integer`, `percent`,
   * `dateShort` and so on. Numeric formats also right-align the column.
   */
  format?: string
}

export interface ResourceListProps {
  /**
   * Column definitions for the list.
   */
  columns?: ResourceListColumnType[]
  /**
   * Array of item objects to display. Each item should have an `id` property.
   */
  items?: Record<string, any>[]
}
