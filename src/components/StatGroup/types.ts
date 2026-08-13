export interface StatProps {
  /**
   * The text to display in the label.
   */
  label?: string
  /**
   * Value format.
   * > see `Formatter` type
   */
  type?: string
  /**
   * The value to pass to formatter as a property. Alternatively the value can
   * be passed as the default slot content.
   * > see `Formatter` value
   */
  value?: any
  /**
   * Formatter locale (e.g. to be used with Intl.NumberFormat)
   * > see `Formatter`locale
   */
  locale?: string
  /**
   * Formatter currency (e.g. to be used with Intl.NumberFormat)
   * > see `Formatter` currency
   */
  currency?: string
  /**
   * By default the value is rendered on a single line and truncated if too
   * long. Enabling this property allows the value to span multiple lines.
   */
  multiline?: boolean
}

export interface StatGroupProps {
  /**
   * The minimum width of columns in the group. (default 200px)
   */
  minWidth?: string
  /**
   * The maximum width of columns in the group. (default 1fr)
   */
  maxWidth?: string
}
