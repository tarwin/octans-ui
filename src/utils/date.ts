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
 * Reads a value in the display time zone, or the viewer's clock when there
 * isn't one. `timezone` overrides the global for this one call.
 *
 * A zone the runtime rejects falls back rather than throwing: a date that
 * renders in the wrong zone is a bug, and a component that throws while
 * rendering is an outage.
 */
function inTimezone(value?: dayjs.ConfigType, timezone?: string) {
  const zone = timezone ?? displayTimezone
  const date = value === undefined ? dayjs() : dayjs(value)
  if (!zone) return date
  try {
    return date.tz(zone)
  } catch {
    return date
  }
}

const mysqlFormat = 'YYYY-MM-DD HH:mm:ss'

export { dayjs, setLocale, setTimezone, getTimezone, inTimezone, mysqlFormat }
