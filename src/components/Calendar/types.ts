import type { Dayjs } from 'dayjs'

export interface CalendarCellType {
  value: string
  label?: string
  isSelected?: boolean
  isCurrent?: boolean
  isOtherPeriod?: boolean
  isDisabled?: boolean
}

export interface CalendarProps {
  /**
   * The type of picker:
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
}
