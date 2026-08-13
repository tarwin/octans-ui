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

const mysqlFormat = 'YYYY-MM-DD HH:mm:ss'

export { dayjs, setLocale, mysqlFormat }
