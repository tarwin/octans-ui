import { TimezonePicker } from '@/components/TimezonePicker'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

const meta = {
  title: 'Components/Forms/TimezonePicker',
  component: TimezonePicker,
  tags: ['autodocs'],
  args: {},
  parameters: {
    docs: {
      description: {
        component: [
          'A searchable timezone picker.',
          '',
          'The library ships **no timezone database**. Zone ids come from',
          '`Intl.supportedValuesOf`, display names from `Intl.DateTimeFormat`',
          'and country names from `Intl.DisplayNames` — so names are always',
          "current with the platform's tzdata and localise automatically with",
          'the Language toolbar control above.',
          '',
          'The picker is a two-step **Location → Time Zone** flow by default,',
          "which narrows ~420 zones down to a country's handful. Both fields",
          'are searchable.',
          '',
          'The only bundled data is a ~10 kB zone → country map for that',
          'grouping, dynamically imported so `groupByCountry: false` never',
          'downloads it.',
          '',
          'Set `inline` to drop the summary field and modal and render the',
          'fields directly — see the Inline stories.'
        ].join('\n')
      }
    }
  }
} satisfies Meta<typeof TimezonePicker>

export default meta
type Story = StoryObj<typeof meta>

/**
By default the picker will require the user to choose a timezone. When they
click the picker, a modal will show with a guess of their timezone already
selected.
 */
export const NoValue: Story = {
  render: () => ({
    components: { TimezonePicker },
    setup() {
      const timezone = ref<null | string>(null)
      return { timezone }
    },
    template: `
      <TimezonePicker
        label="Timezone"
        v-model="timezone"
      />
      <pre>timezone: {{timezone}}</pre>
    `
  })
}

/**
Add the `guess` property to make the picker automatically set the model value
to it's guessed timezone when the initial value of the picker is empty.
*/
export const GuessCurrentTimezone: Story = {
  render: () => ({
    components: { TimezonePicker },
    setup() {
      const timezone = ref<null | string>(null)
      return { timezone }
    },
    template: `
      <TimezonePicker
        label="Timezone"
        v-model="timezone"
        guess
      />
      <pre>timezone: {{timezone}}</pre>
    `
  })
}

export const TimezoneSet: Story = {
  render: () => ({
    components: { TimezonePicker },
    setup() {
      const timezone = ref<null | string>('Europe/Amsterdam')
      return { timezone }
    },
    template: `
      <TimezonePicker
        label="Timezone"
        v-model="timezone"
      />
      <pre>timezone: {{timezone}}</pre>
    `
  })
}

export const Disabled: Story = {
  render: () => ({
    components: { TimezonePicker },
    setup() {
      const timezone = ref<null | string>('Europe/Amsterdam')
      return { timezone }
    },
    template: `
      <TimezonePicker
        label="Timezone"
        v-model="timezone"
        disabled
      />
      <pre>timezone: {{timezone}}</pre>
    `
  })
}

export const Readonly: Story = {
  render: () => ({
    components: { TimezonePicker },
    setup() {
      const timezone = ref<null | string>('Europe/Amsterdam')
      return { timezone }
    },
    template: `
      <TimezonePicker
        label="Timezone"
        v-model="timezone"
        readonly
      />
      <pre>timezone: {{timezone}}</pre>
    `
  })
}

/**
Set `groupByCountry` to `false` for a single searchable list of every zone,
without the Location step. This suits users who already know the city they want
— typing "sydney" jumps straight to it.

It also skips loading the zone → country map entirely.
*/
export const SingleList: Story = {
  render: () => ({
    components: { TimezonePicker },
    setup() {
      const timezone = ref<null | string>('Australia/Sydney')
      return { timezone }
    },
    template: `
      <TimezonePicker
        label="Timezone"
        v-model="timezone"
        :groupByCountry="false"
      />
      <pre>timezone: {{timezone}}</pre>
    `
  })
}

/**
`inline` renders the fields directly — no summary field, no modal.

Use it when the picker already sits inside a form with its own save action,
where the modal's Update/Cancel would be a second, redundant commit step.

**Changes emit immediately**, since there is no Update button. Selecting a
country also emits, because it moves the value to that country's first zone.
*/
export const Inline: Story = {
  render: () => ({
    components: { TimezonePicker },
    setup() {
      const timezone = ref<null | string>('Europe/Amsterdam')
      return { timezone }
    },
    template: `
      <TimezonePicker
        v-model="timezone"
        inline
      />
      <pre>timezone: {{timezone}}</pre>
    `
  })
}

/**
Inline fields already sit side by side and wrap when the container is too
narrow. `condensed` lowers the width at which they wrap, so they stay on one
row in tighter spaces.
*/
export const InlineCondensed: Story = {
  render: () => ({
    components: { TimezonePicker },
    setup() {
      const timezone = ref<null | string>('America/New_York')
      return { timezone }
    },
    template: `
      <TimezonePicker
        v-model="timezone"
        inline
        condensed
      />
      <pre>timezone: {{timezone}}</pre>
    `
  })
}

/**
Inline with `groupByCountry: false` collapses to a single searchable field —
about as compact as a timezone picker gets. `label`, `error` and `helpText`
attach to it.
*/
export const InlineSingleField: Story = {
  render: () => ({
    components: { TimezonePicker },
    setup() {
      const timezone = ref<null | string>('Asia/Tokyo')
      return { timezone }
    },
    template: `
      <TimezonePicker
        v-model="timezone"
        label="Reporting timezone"
        help-text="All report dates are shown in this timezone."
        inline
        :groupByCountry="false"
      />
      <pre>timezone: {{timezone}}</pre>
    `
  })
}
