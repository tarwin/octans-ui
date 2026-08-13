import type { Dayjs } from 'dayjs'

export interface DatePickerProps {
  label?: string | false
  error?: string | false | null
  /**
   * Help text to show below the control.
   */
  helpText?: string | false
  /**
   * Renders help text as raw HTML. Use with caution.
   */
  helpTextHtml?: string | false
  /**
   * Renders a help icon next to the label which links to an external page.
   */
  helpLink?: string | false
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  /**
   * The type of picker
   */
  type?: 'datetime' | 'date' | 'month' | 'year'
  /**
   * The model date value formatted according to `modelFormat`. Parts of the
   * date may be truncated depending on the `type` being used.
   */
  modelValue?: string
  /**
   * Format of the underling value.
   *
   * @see https://day.js.org/docs/en/display/format
   */
  modelFormat?: string
  /**
   * Provide a filter function to disable specific dates. The function is
   * passed a Dayjs instance.
   */
  disableDate?: (d: Dayjs) => boolean
  /**
   * Restricts the minimum time that can be selected.
   */
  minTime?: string
  /**
   * Restricts the maximum time that can be selected.
   */
  maxTime?: string
  /**
   * Shows a button at the end of the date input which allows the value to be
   * cleared.
   */
  clearable?: boolean
  /**
   * If set to `false` will not automatically display the picker.
   */
  autoOpen?: boolean
}
