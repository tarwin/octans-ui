import memoize from 'lodash-es/memoize'
import { dayjs } from '@/utils'
import { isEmptyValue } from './'
import { $t, getTranslationLocale } from './translate'
import type plugin from 'dayjs/plugin/duration'

export interface FormatContextInterface {
  locale?: string
  currency?: string
}

export const emptyValuePlaceholder = '—'

const getIntegerFormatter = memoize(({ locale }) => {
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    maximumFractionDigits: 0
  })
})

const getDecimalFormatter = memoize(({ locale }) => {
  return new Intl.NumberFormat(locale, {
    style: 'decimal'
  })
})

const getCurrencyFormatter = memoize(
  ({ locale, currency }) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'symbol'
    })
  },
  ({ locale, currency }) => {
    return `${locale}-${currency}`
  }
)

const getPercentFormatter = memoize(({ locale }) => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
})

function createDateFormatter(fn: (d: dayjs.Dayjs) => string) {
  return function (value: string) {
    return fn(dayjs(value))
  }
}

/**
 * relative time: https://day.js.org/docs/en/customization/relative-time
 * durations: https://day.js.org/docs/en/durations/durations
 */

function formatDuration(duration: plugin.Duration, short = false) {
  // Read once and never reassigned — they decide which branch runs below and
  // are never printed, since nothing here shows a unit above the day.
  const years = duration.years()
  const months = duration.months()

  let { days, hours, minutes, seconds } = {
    days: duration.days(),
    hours: duration.hours(),
    minutes: duration.minutes(),
    seconds: duration.seconds()
  }
  const parts = []
  if (years > 0 || months > 0) {
    // Past a month dayjs stops apportioning the components reliably, so
    // collapse the whole span into days and show only that.
    //
    // `asDays()` is the TOTAL length in days. This used to divide
    // `milliseconds()` — which is the milliseconds COMPONENT, 0-999, not the
    // total — so `days` came out 0 every time. With every other unit zeroed
    // just below, that left nothing to print: any duration of a month or more
    // rendered as an empty string (or `0s` in short form).
    days = Math.floor(duration.asDays())
    hours = minutes = seconds = 0
  }
  // slight hack to grab the translations for days, hours, minutes, etc. from dayjs
  const localeMap: Partial<{
    future: string
    past: string
    s: string
    ss: string
    m: string
    mm: string
    h: string
    hh: string
    d: string
    dd: string
    M: string
    MM: string
    y: string
    yy: string
  }> = dayjs.Ls[dayjs.locale() || 'en'].relativeTime
  if (days) {
    if (short) {
      parts.push(`${days}d`)
    } else {
      const k = days > 1 ? 'dd' : 'd'
      const v = localeMap[k] || ''
      parts.push(v.replace('%d', days.toString()))
    }
  }
  if (hours) {
    if (short) {
      parts.push(`${hours}h`)
    } else {
      const k = hours > 1 ? 'hh' : 'h'
      const v = localeMap[k] || ''
      parts.push(v.replace('%d', hours.toString()))
    }
  }
  if (minutes) {
    if (short) {
      parts.push(`${minutes}m`)
    } else {
      const k = minutes > 1 ? 'mm' : 'm'
      const v = localeMap[k] || ''
      parts.push(v.replace('%d', minutes.toString()))
    }
  }
  if (seconds) {
    if (short) {
      parts.push(`${seconds}s`)
    } else {
      const k = seconds > 1 ? 'ss' : 's'
      const v = localeMap[k] || ''
      parts.push(v.replace('%d', seconds.toString()))
    }
  }
  return short ? parts.join(' ') || '0s' : parts.join(' ')
}

export const formatters: Record<string, any> = {
  dateAgo: createDateFormatter((m) => m.fromNow()),
  dateCalendar: createDateFormatter((m) => m.calendar()),
  dateIso: createDateFormatter((m) => m.toISOString()),
  dateNumeral: createDateFormatter((m) => m.format('L')),
  dateShort: createDateFormatter((m) => m.format('ll')),
  dateTimeShort: createDateFormatter((m) => m.format('lll')),
  dateLong: createDateFormatter((m) => m.format('LL')),
  dateTimeLong: createDateFormatter((m) => m.format('LLL')),
  dateMonthShort: createDateFormatter((m) => m.format('MMM')),
  dateMonthLong: createDateFormatter((m) => m.format('MMMM')),
  dateMonthYearShort: createDateFormatter((m) => m.format('MMM, YYYY')),
  dateMonthYearLong: createDateFormatter((m) => m.format('MMMM, YYYY')),
  duration(value: any) {
    if (!Array.isArray(value) && value.length !== 2) {
      throw new Error('Duration formatter value must be an array of two dates')
    }
    let start = value[0]
    let end = value[1]
    if (start > end) {
      start = value[1]
      end = value[0]
    }
    return formatDuration(dayjs.duration(dayjs(end).diff(start)))
  },
  durationShort(value: any) {
    if (!Array.isArray(value) && value.length !== 2) {
      throw new Error('Duration formatter value must be an array of two dates')
    }
    let start = value[0]
    let end = value[1]
    if (start > end) {
      start = value[1]
      end = value[0]
    }
    return formatDuration(dayjs.duration(dayjs(end).diff(start)), true)
  },
  durationMs(value: any) {
    // return moment.duration(value).humanize()
    return formatDuration(dayjs.duration(value))
  },
  durationShortMs(value: any) {
    return formatDuration(dayjs.duration(value), true)
  },
  integer(value: number, context: FormatContextInterface) {
    return getIntegerFormatter(context).format(value)
  },
  decimal(value: number, context: FormatContextInterface) {
    return getDecimalFormatter(context).format(value)
  },
  currency(value: number, context: FormatContextInterface) {
    return getCurrencyFormatter(context).format(value)
  },
  percent(value: number, context: FormatContextInterface) {
    return getPercentFormatter(context).format(value)
  },
  boolean(value: boolean) {
    if (value === true) {
      return $t('ui.lang.true')
    }
    if (value === false) {
      return $t('ui.lang.false')
    }
    return emptyValuePlaceholder
  },
  filesize(value: number, context: FormatContextInterface) {
    const info = parseAsBytes(value)
    return formatters.decimal(info.value, context) + ' ' + info.unit
  }
}

export function format(
  value: string | number,
  format: string,
  context?: FormatContextInterface
) {
  if (isEmptyValue(value)) {
    return emptyValuePlaceholder
  }
  if (!format) {
    return value
  }
  if (!context) {
    context = {}
  }
  if (!context.locale) {
    context.locale = getCurrentLocale()
  }
  if (!context.currency) {
    context.currency = 'USD'
  }
  const formatFn = formatters[format]
  if (!formatFn) {
    throw new Error(`Invalid formatter "${format}"`)
  }
  return formatFn(value, context)
}

function getCurrentLocale() {
  // `Intl` wants a BCP 47 tag, but the translation locale may be a bare
  // language ('en', 'fr'), which is still valid — so pass it straight through
  // and only fall back when nothing is set.
  return getTranslationLocale() || 'en-US'
}

export function isNumericType(type: string): boolean {
  return (
    type === 'integer' ||
    type === 'decimal' ||
    type === 'currency' ||
    type === 'percent'
  )
}

export function isSummableNumericType(type: string) {
  return type === 'integer' || type === 'decimal' || type === 'currency'
}

// https://github.com/sindresorhus/pretty-bytes/blob/master/index.js
const BYTE_UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
function parseAsBytes(value: number) {
  let exponent = Math.min(
    Math.floor(Math.log10(value) / 3),
    BYTE_UNITS.length - 1
  )
  if (exponent < 0) {
    exponent = 0
  }
  value = Number((value / Math.pow(1000, exponent)).toFixed(2))
  const unit = BYTE_UNITS[exponent]
  return {
    value,
    unit
  }
}
