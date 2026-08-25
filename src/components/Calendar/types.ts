import type { Dayjs } from 'dayjs'

export interface CalendarCellType {
  value: string
  label?: string
  isSelected?: boolean
  isCurrent?: boolean
  isOtherPeriod?: boolean
  isDisabled?: boolean
  /** Markers falling on this cell, in the order they were given. */
  markers?: CalendarMarkerType[]
}

/**
 * A dot drawn under a day, for saying "something happens here" without
 * selecting it — deadlines, bookings, days with data.
 */
export interface CalendarMarkerType {
  /**
   * The day to mark. Anything DayJS can parse, including a `Date` or another
   * `Dayjs`; only the day part is used.
   */
  date: string | number | Date | Dayjs
  /** Any CSS colour. Defaults to the theme's primary. */
  color?: string
  /** Native tooltip on the day. Several markers on a day join with a comma. */
  tooltip?: string
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
  /**
   * The earliest selectable date, inclusive. Anything DayJS can parse.
   *
   * `disableDate` can express this too, but a range is the common case and
   * writing a predicate for it every time is the wrong amount of work. Both
   * apply when both are given.
   */
  minDate?: string | number | Date | Dayjs
  /**
   * The latest selectable date, inclusive.
   */
  maxDate?: string | number | Date | Dayjs
  /**
   * The day the week starts on, `0` Sunday through `6` Saturday.
   *
   * Normally you should NOT set this: the week start comes from the active
   * locale, so `setLocale('fr')` already moves it to Monday. This is the
   * per-instance override for a calendar that has to disagree with the
   * viewer's locale — a roster in a fixed business week, say.
   */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /**
   * Days to mark with a dot.
   */
  markers?: CalendarMarkerType[]
  /**
   * The time zone that decides what "today" is, as an IANA name
   * (`'America/Los_Angeles'`). Defaults to the library-wide display time zone
   * — see `setTimezone` — and, failing that, the viewer's own clock.
   *
   * This moves the highlighted day and the day an empty picker opens on. It
   * does NOT convert `modelValue`: the model is a wall clock in
   * `modelFormat`, parsed and formatted without a zone, and it stays that way.
   */
  timezone?: string
}
