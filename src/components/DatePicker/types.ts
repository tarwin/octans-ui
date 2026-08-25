import type { Dayjs } from 'dayjs'
import type { CalendarMarkerType } from '@/components/Calendar'

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
  /**
   * The earliest selectable date, inclusive. Anything DayJS can parse.
   */
  minDate?: string | number | Date | Dayjs
  /**
   * The latest selectable date, inclusive.
   */
  maxDate?: string | number | Date | Dayjs
  /**
   * The day the week starts on, `0` Sunday through `6` Saturday. Comes from
   * the active locale unless set — see `Calendar`.
   */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /**
   * Days to mark with a dot in the calendar.
   */
  markers?: CalendarMarkerType[]
  /**
   * IANA time zone deciding what "today" is. Defaults to the library-wide
   * display zone — see `setTimezone`. It does not convert `modelValue`.
   */
  timezone?: string
  /**
   * Marks the field as required: an asterisk after the label, and
   * `aria-required` on the control.
   *
   * Announced, not enforced — it deliberately does NOT set the native
   * `required` attribute, so the browser's own validation bubble stays out of
   * the way of whatever the app does about errors. Use `error` to show a
   * failure.
   */
  required?: boolean
}
