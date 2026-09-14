import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone' // dependent on utc plugin
import duration from 'dayjs/plugin/duration'
import calendar from 'dayjs/plugin/calendar'
import relativeTime from 'dayjs/plugin/relativeTime'
import localeData from 'dayjs/plugin/localeData'
import weekday from 'dayjs/plugin/weekday'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import updateLocale from 'dayjs/plugin/updateLocale'
import objectSupport from 'dayjs/plugin/objectSupport'
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(calendar)
dayjs.extend(duration)
dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.extend(LocalizedFormat)
dayjs.extend(customParseFormat)
dayjs.extend(advancedFormat)
dayjs.extend(updateLocale)
dayjs.extend(objectSupport)

/**
 * Required for duration + fromNow + relative time to operate "strictly"
 * https://github.com/iamkun/dayjs/issues/830
 */
dayjs.extend(relativeTime, {
  thresholds: [
    { l: 's', r: 1 },
    { l: 'ss', r: 59, d: 'second' },
    { l: 'm', r: 1 },
    { l: 'mm', r: 59, d: 'minute' },
    { l: 'h', r: 1 },
    { l: 'hh', r: 23, d: 'hour' },
    { l: 'd', r: 1 },
    { l: 'dd', r: 30, d: 'day' },
    { l: 'M', r: 1 },
    { l: 'MM', r: 11, d: 'month' },
    { l: 'y' },
    { l: 'yy', d: 'year' }
  ]
})

import 'dayjs/locale/ja'
import 'dayjs/locale/es'
import 'dayjs/locale/it'
import 'dayjs/locale/fr'
import 'dayjs/locale/pt'
import 'dayjs/locale/de'
import 'dayjs/locale/nl'
const supportedLangs = ['en', 'ja', 'es', 'it', 'fr', 'pt', 'de', 'nl']

/**
 * Tied to the threshold override above.. This overrides the
 * translations of the relative times so that "seconds" are
 * printed correctly. Without this, any duration or fromNow times
 * would say "a few seconds" (which is super dumb)
 */
dayjs.updateLocale('en', {
  relativeTime: {
    ...dayjs.Ls.en.relativeTime,
    s: 'a second',
    ss: '%d seconds'
  }
})
dayjs.updateLocale('ja', {
  relativeTime: {
    ...dayjs.Ls.ja.relativeTime,
    s: '一秒',
    ss: '%d秒'
  }
})
dayjs.updateLocale('it', {
  relativeTime: {
    ...dayjs.Ls.it.relativeTime,
    s: 'un secondo',
    ss: '%d secondi'
  }
})
dayjs.updateLocale('es', {
  relativeTime: {
    ...dayjs.Ls.es.relativeTime,
    s: 'un segundo',
    ss: '%d segundos'
  }
})
dayjs.updateLocale('fr', {
  relativeTime: {
    ...dayjs.Ls.fr.relativeTime,
    s: 'une seconde',
    ss: '%d secondes'
  }
})
dayjs.updateLocale('pt', {
  relativeTime: {
    ...dayjs.Ls.pt.relativeTime,
    s: 'um segundo',
    ss: '%d segundos'
  }
})
dayjs.updateLocale('nl', {
  relativeTime: {
    ...dayjs.Ls.nl.relativeTime,
    s: 'een seconde',
    ss: '%d seconden'
  }
})
dayjs.updateLocale('de', {
  relativeTime: {
    ...dayjs.Ls.de.relativeTime,
    s: 'eine Sekunde',
    ss: '%d Sekunden'
  }
})

function setLocale(locale: string) {
  const [lang] = locale.split('-')
  if (!supportedLangs.includes(lang)) {
    locale = 'en-US'
  }
  dayjs.locale(locale)
}

/**
 * The library-wide DISPLAY time zone: what "now" means, and what zone dates
 * are rendered in. Unset by default, which means the viewer's own clock.
 *
 * This is the companion to `setLocale` and works the same way — one call at
 * app start, and every `Formatter`, `Calendar` and `DatePicker` follows. An
 * app that must show one fixed zone regardless of who is looking (an
 * operations console pinned to head-office time) sets it once here instead of
 * threading a zone through every call site.
 *
 * It affects DISPLAY only. It does not reinterpret a stored value: a wall
 * clock string stays the wall clock it was.
 */
let displayTimezone: string | undefined

function setTimezone(timezone?: string | null) {
  if (!timezone) {
    displayTimezone = undefined
    return
  }
  // A bad IANA name makes `.tz()` THROW, from inside a formatter, long after
  // the mistake — so it is caught here, where the name is.
  try {
    dayjs().tz(timezone)
    displayTimezone = timezone
  } catch {
    console.warn(
      `[octans] setTimezone: "${timezone}" is not a time zone this runtime ` +
        "knows. Falling back to the viewer's own clock."
    )
    displayTimezone = undefined
  }
}

function getTimezone(): string | undefined {
  return displayTimezone
}

/**
 * The library-wide INPUT time zone: what a date string that carries no zone of
 * its own is taken to mean. Unset by default, which is the viewer's own clock.
 *
 * This is the other half of the question `setTimezone` answers. That one says
 * which clock a date is RENDERED in; this one says which clock it was WRITTEN
 * in. They are separate unknowns, and an app reading UTC out of a database and
 * showing it in Sydney needs to answer both.
 *
 * It matters because a naive string — `'2024-03-15 02:00:00'`, the shape every
 * MySQL `DATETIME` comes back as — is a wall clock with no instant attached.
 * Read against the viewer's clock, the same stored row becomes a different
 * moment for every reader, and setting a display zone does not fix that: it
 * converts an instant that was already wrong.
 *
 * Set it to `'UTC'` when values are stored in UTC, which is the common case.
 */
let inputTimezone: string | undefined

function setInputTimezone(timezone?: string | null) {
  if (!timezone) {
    inputTimezone = undefined
    return
  }
  // Validated here, where the name is, for the same reason `setTimezone`
  // validates: otherwise the throw surfaces from inside a formatter.
  try {
    dayjs().tz(timezone)
    inputTimezone = timezone
  } catch {
    console.warn(
      `[octans] setInputTimezone: "${timezone}" is not a time zone this ` +
        "runtime knows. Falling back to the viewer's own clock."
    )
    inputTimezone = undefined
  }
}

function getInputTimezone(): string | undefined {
  return inputTimezone
}

/** A bare calendar date: `2024-03-15`, and nothing else. */
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

/** Ends in `Z` or a UTC offset, so the string already says which instant. */
const HAS_OFFSET = /(?:Z|[+-]\d{2}:?\d{2})$/i

/**
 * True for a value that names a DAY rather than a moment.
 *
 * These are deliberately left floating: no input zone applied, no display zone
 * applied. A birthday or a MySQL `DATE` column has no time and no zone, so
 * pinning it to one and rendering it in another moves it — `'2024-03-15'` read
 * as UTC and shown in Los Angeles is the 14th, which is how a date of birth
 * ends up off by a day.
 */
function isFloatingDate(value?: dayjs.ConfigType): boolean {
  return typeof value === 'string' && DATE_ONLY.test(value.trim())
}

/**
 * Turns a value into an instant, using `zone` for strings that do not say.
 *
 * Anything that is already an instant is left alone: a `Date`, an epoch
 * number, another dayjs object, or a string ending in `Z` or an offset. Only
 * the naive strings are ambiguous, and only they are pinned.
 */
function parseInTimezone(value?: dayjs.ConfigType, zone?: string) {
  if (value === undefined) return dayjs()
  if (!zone || typeof value !== 'string') return dayjs(value)
  if (HAS_OFFSET.test(value.trim())) return dayjs(value)
  try {
    return dayjs.tz(value, zone)
  } catch {
    return dayjs(value)
  }
}

/**
 * Reads a value in the display time zone, or the viewer's clock when there
 * isn't one. `timezone` overrides the global for this one call, as does
 * `inputTimezone` for the zone a naive string is read in.
 *
 * A zone the runtime rejects falls back rather than throwing: a date that
 * renders in the wrong zone is a bug, and a component that throws while
 * rendering is an outage.
 */
function inTimezone(
  value?: dayjs.ConfigType,
  timezone?: string,
  input?: string
) {
  if (isFloatingDate(value)) return dayjs(value)
  const date = parseInTimezone(value, input ?? inputTimezone)
  const zone = timezone ?? displayTimezone
  if (!zone) return date
  try {
    return date.tz(zone)
  } catch {
    return date
  }
}

const mysqlFormat = 'YYYY-MM-DD HH:mm:ss'

export {
  dayjs,
  setLocale,
  setTimezone,
  getTimezone,
  setInputTimezone,
  getInputTimezone,
  isFloatingDate,
  parseInTimezone,
  inTimezone,
  mysqlFormat
}
