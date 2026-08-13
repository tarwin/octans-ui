<script lang="ts" setup>
import { FormLayout, FormLayoutGroup } from '@/components/FormLayout'
import { Modal } from '@/components/Modal'
import { NavField } from '@/components/NavField'
import { Select } from '@/components/Select'
import { dayjs } from '@/utils'
import { $t } from '@/utils/translate'
import {
  formatTimezoneId,
  getTimezoneCountry,
  getTimezoneName,
  getTimezoneOffset,
  guessTimezone,
  isValidTimezone,
  listTimezones,
  loadTimezoneCountries,
  type TimezoneCountryType
} from '@/utils/timezone'
import { computed, onMounted, ref, watch } from 'vue'
import type { TimezonePickerProps } from './types'

const props = withDefaults(defineProps<TimezonePickerProps>(), {
  disabled: false,
  readonly: false,
  guess: false,
  inline: false,
  condensed: false,
  // On by default: narrowing ~420 zones down to a country's handful is what
  // makes this picker feel manageable. `false` gives one searchable list.
  groupByCountry: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | undefined): void
}>()

const visible = ref(false)
/**
 * The working value.
 *
 * In modal mode this is a draft that only reaches the model on Update. Inline
 * there is no commit step, so it tracks `modelValue` and every change is
 * emitted straight away.
 */
const timezone = ref<string | null>(props.modelValue ?? null)
const countryCode = ref<string | null>(null)
const countries = ref<TimezoneCountryType[] | null>(null)
const loadingCountries = ref(false)

// Built from Intl, so this is synchronous — there is no data file to fetch and
// therefore no loading state on the field itself.
const allZones = computed(() => listTimezones())

const countryOptions = computed(() =>
  (countries.value ?? []).map((c) => ({ label: c.label, value: c.value }))
)

/**
 * When grouping by country, narrow to that country's zones. Otherwise fall back
 * to the full list, for users who would rather search for a city directly.
 */
const timezoneOptions = computed(() => {
  if (props.groupByCountry) {
    if (!countryCode.value || !countries.value) return []
    const country = countries.value.find((c) => c.value === countryCode.value)
    if (!country) return []
    return country.zones.map(toOption)
  }
  return allZones.value.map(toOption)
})

/**
 * The offset goes in the LABEL, not just the description, so it stays visible
 * once the select is closed — the description only shows in the open list.
 */
function toOption(zone: string) {
  return {
    label: `${formatTimezoneId(zone)} (${getTimezoneOffset(zone)})`,
    value: zone,
    description: `${getTimezoneName(zone)} · ${dayjs().tz(zone).format('lll')}`
  }
}

/** What the collapsed summary field shows. Modal mode only. */
const selected = computed(() => {
  const value = props.modelValue
  if (!value || !isValidTimezone(value)) return null
  const name = getTimezoneName(value)
  const offset = getTimezoneOffset(value)
  return {
    title: formatTimezoneId(value),
    description: name ? `${name} (${offset})` : offset
  }
})

async function ensureCountries() {
  if (!props.groupByCountry || countries.value || loadingCountries.value) return
  loadingCountries.value = true
  try {
    countries.value = await loadTimezoneCountries()
  } finally {
    loadingCountries.value = false
  }
}

async function syncCountryFor(zone: string) {
  if (!props.groupByCountry) return
  await ensureCountries()
  countryCode.value = (await getTimezoneCountry(zone)) ?? null
}

function open() {
  if (props.disabled || props.readonly) return
  timezone.value = props.modelValue ?? guessTimezone()
  void syncCountryFor(timezone.value)
  visible.value = true
}

function commit() {
  emit('update:modelValue', timezone.value ?? undefined)
  visible.value = false
}

function onSelectTimezone(zone: string) {
  timezone.value = zone
  // Inline has no Update button, so the selection is the commit.
  if (props.inline) emit('update:modelValue', zone)
}

function onSelectCountry(code: string) {
  countryCode.value = code
  const country = countries.value?.find((c) => c.value === code)
  // Preselect the country's first zone so the second field is never empty.
  const next = country?.zones[0] ?? null
  timezone.value = next
  if (props.inline && next) emit('update:modelValue', next)
}

watch(
  () => props.modelValue,
  (value) => {
    if (props.inline) timezone.value = value ?? null
    if (value) void syncCountryFor(value)
  }
)

onMounted(() => {
  if (!props.modelValue && props.guess) {
    // Only emit when explicitly asked to — silently changing a bound value on
    // mount would surprise a form that hasn't been touched.
    const guessed = guessTimezone()
    emit('update:modelValue', guessed)
    timezone.value = guessed
    void syncCountryFor(guessed)
  } else if (props.modelValue) {
    void syncCountryFor(props.modelValue)
  } else if (props.groupByCountry) {
    void ensureCountries()
  }
})
</script>

<template>
  <!--
    Inline: the fields are the control. No summary field, no modal, and no
    Update button — see `onSelectTimezone`.
  -->
  <FormLayout v-if="inline">
    <component
      :is="groupByCountry ? FormLayoutGroup : 'div'"
      :condensed="groupByCountry && condensed ? true : undefined"
    >
      <Select
        v-if="groupByCountry"
        :label="$t('ui.timezonePicker.location')"
        :placeholder="$t('ui.timezonePicker.locationPlaceholder')"
        :options="countryOptions"
        :disabled="disabled || loadingCountries"
        :readonly="readonly"
        :modelValue="countryCode"
        searchable
        @update:modelValue="onSelectCountry"
      />
      <Select
        :label="label ?? $t('ui.timezonePicker.timezone')"
        :placeholder="$t('ui.timezonePicker.timezonePlaceholder')"
        :options="timezoneOptions"
        :modelValue="timezone"
        :disabled="disabled"
        :readonly="readonly"
        :error="error"
        :help-text="helpText"
        :help-text-html="helpTextHtml"
        :help-link="helpLink"
        searchable
        @update:modelValue="onSelectTimezone"
      />
    </component>
  </FormLayout>

  <div v-else>
    <Modal
      :title="$t('ui.timezonePicker.title')"
      :visible="visible"
      :primaryAction="{
        label: $t('ui.timezonePicker.update'),
        disabled: !timezone,
        onAction: commit
      }"
      :secondaryActions="[
        {
          label: $t('ui.timezonePicker.cancel'),
          onAction: () => (visible = false)
        }
      ]"
      overflow-visible
      @close="visible = false"
    >
      <FormLayout>
        <Select
          v-if="groupByCountry"
          :label="$t('ui.timezonePicker.location')"
          :placeholder="$t('ui.timezonePicker.locationPlaceholder')"
          :options="countryOptions"
          :disabled="loadingCountries"
          :modelValue="countryCode"
          searchable
          @update:modelValue="onSelectCountry"
        />
        <Select
          :label="$t('ui.timezonePicker.timezone')"
          :placeholder="$t('ui.timezonePicker.timezonePlaceholder')"
          :options="timezoneOptions"
          :modelValue="timezone"
          searchable
          @update:modelValue="onSelectTimezone"
        />
      </FormLayout>
    </Modal>
    <NavField
      :error="error"
      :help-text="helpText"
      :help-text-html="helpTextHtml"
      :help-link="helpLink"
      :label="label"
      :title="selected && selected.title"
      :description="selected && selected.description"
      :placeholder="$t('ui.timezonePicker.title')"
      :disabled="disabled"
      :readonly="readonly"
      @click="open"
    />
  </div>
</template>
