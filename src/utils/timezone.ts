/**
 * Timezone helpers built on the platform's `Intl` APIs.
 *
 * The library ships no timezone database. Zone ids, display names and country
 * names all come from `Intl`, which means they are always current with the
 * host's tzdata and localised for free.
 *
 * The one thing `Intl` has no API for is mapping a zone to a country, so that
 * map is generated into `TimezonePicker/zoneCountries.ts` (~10 kB) and imported
 * *dynamically* — apps that don't group by country never download it.
 */

export interface TimezoneOptionType {
  /** IANA id, e.g. `Australia/Sydney`. */
  value: string
  /** e.g. `Sydney, Australia`. */
  label: string
  /** e.g. `Australian Eastern Time (GMT+10)`. */
  description: string
  /** Region prefix of the id, e.g. `Australia`. Used for grouping. */
  region: string
}

/**
 * Every zone the runtime knows about.
 *
 * `Intl.supportedValuesOf` is ES2022. Older engines get a small fallback list
 * rather than an empty picker — enough to be usable, and `guessTimezone()`
 * still resolves the user's actual zone either way.
 */
export function listTimezones(): string[] {
  const intl = Intl as typeof Intl & {
    supportedValuesOf?: (key: string) => string[]
  }
  if (typeof intl.supportedValuesOf === 'function') {
    try {
      return intl.supportedValuesOf('timeZone')
    } catch {
      // Fall through to the static list below.
    }
  }
  return FALLBACK_ZONES
}

/** The user's current zone, or `UTC` if it can't be determined. */
export function guessTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

export function isValidTimezone(zone: string): boolean {
  if (!zone) return false
  try {
    new Intl.DateTimeFormat('en', { timeZone: zone })
    return true
  } catch {
    return false
  }
}

function timeZoneNamePart(
  zone: string,
  style: 'longGeneric' | 'shortOffset' | 'long',
  locale?: string
): string {
  try {
    return (
      new Intl.DateTimeFormat(locale, { timeZone: zone, timeZoneName: style })
        .formatToParts(new Date())
        .find((part) => part.type === 'timeZoneName')?.value ?? ''
    )
  } catch {
    return ''
  }
}

/**
 * A human name for the zone, localised — `Australian Eastern Time`,
 * `India Standard Time`.
 */
export function getTimezoneName(zone: string, locale?: string): string {
  return (
    timeZoneNamePart(zone, 'longGeneric', locale) ||
    timeZoneNamePart(zone, 'long', locale)
  )
}

/** Current UTC offset as a short label — `GMT+10`, `GMT-4`, `GMT+5:30`. */
export function getTimezoneOffset(zone: string, locale?: string): string {
  return timeZoneNamePart(zone, 'shortOffset', locale)
}

/**
 * Turns an IANA id into something readable: `Australia/Sydney` →
 * `Sydney, Australia`. Underscores become spaces and the path is reversed, so
 * the city — the part people search for — leads.
 */
export function formatTimezoneId(zone: string): string {
  return zone.replace(/_/g, ' ').split('/').reverse().join(', ')
}

/** The leading region of an id: `Australia/Sydney` → `Australia`. */
export function getTimezoneRegion(zone: string): string {
  const [region] = zone.split('/')
  return region.replace(/_/g, ' ')
}

/** Builds the option list the picker renders. */
export function getTimezoneOptions(locale?: string): TimezoneOptionType[] {
  return listTimezones().map((zone) => {
    const name = getTimezoneName(zone, locale)
    const offset = getTimezoneOffset(zone, locale)
    return {
      value: zone,
      label: formatTimezoneId(zone),
      description: name ? `${name} (${offset})` : offset,
      region: getTimezoneRegion(zone)
    }
  })
}

export interface TimezoneCountryType {
  /** ISO 3166-1 alpha-2 code. */
  value: string
  /** Localised country name. */
  label: string
  /** Zones belonging to this country, sorted by label. */
  zones: string[]
}

/**
 * Loads the zone → country map and inverts it into a country list.
 *
 * Dynamically imported on purpose: it is the only bundled timezone data, and
 * only country grouping needs it.
 */
export async function loadTimezoneCountries(
  locale?: string
): Promise<TimezoneCountryType[]> {
  const { ZONE_COUNTRIES } =
    await import('@/components/TimezonePicker/zoneCountries')

  const known = new Set(listTimezones())
  const byCountry = new Map<string, string[]>()
  for (const [zone, code] of Object.entries(ZONE_COUNTRIES)) {
    // Skip zones this runtime doesn't recognise — the map is generated from a
    // tzdb snapshot and can name zones an older engine has never heard of.
    if (!known.has(zone)) continue
    const list = byCountry.get(code)
    if (list) list.push(zone)
    else byCountry.set(code, [zone])
  }

  let displayNames: Intl.DisplayNames | undefined
  try {
    displayNames = new Intl.DisplayNames(locale ? [locale] : undefined, {
      type: 'region'
    })
  } catch {
    // Older engine — fall back to the raw country code as the label.
  }

  return [...byCountry.entries()]
    .map(([code, zones]) => ({
      value: code,
      label: displayNames?.of(code) ?? code,
      zones: zones.sort((a, b) =>
        formatTimezoneId(a).localeCompare(formatTimezoneId(b))
      )
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/** Looks up the country code for a zone, without loading the whole list. */
export async function getTimezoneCountry(
  zone: string
): Promise<string | undefined> {
  const { ZONE_COUNTRIES } =
    await import('@/components/TimezonePicker/zoneCountries')
  return ZONE_COUNTRIES[zone]
}

/**
 * Used only when `Intl.supportedValuesOf` is unavailable. Deliberately short —
 * one zone per major offset, enough to keep the picker usable rather than to
 * be complete.
 */
const FALLBACK_ZONES = [
  'Pacific/Midway',
  'Pacific/Honolulu',
  'America/Anchorage',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Halifax',
  'America/Sao_Paulo',
  'Atlantic/Azores',
  'UTC',
  'Europe/London',
  'Europe/Paris',
  'Europe/Athens',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Australia/Brisbane',
  'Australia/Sydney',
  'Pacific/Auckland'
]
