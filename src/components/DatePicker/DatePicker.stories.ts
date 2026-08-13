import { FormLayout } from '@/components/FormLayout'
import { dayjs } from '@/utils'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { Dayjs } from 'dayjs'
import { ref } from 'vue'
import DatePicker from './DatePicker.vue'

const meta = {
  title: 'Components/Forms/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

/**
  The `type` prop defaults to "date".
  Clicking the month title allows moving "up" to the next picker level.
 */
export const Default: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const date = ref('2019-09-29 00:00:00')
      return { date }
    },
    template: `
      <div>
        <DatePicker
          label="Start Date"
          placeholder="Choose a date"
          v-model="date"
        />
        <pre>Value: {{date}}</pre>
      </div>
    `
  })
}

/**
  This example shows how the type prop formats the underlying model value.
  Note how each subsequent picker will truncate more of the model value.
 */
export const TypeProp: Story = {
  render: () => ({
    components: { DatePicker, FormLayout },
    setup() {
      const date = ref('2019-09-29 00:00:00')
      return { date }
    },
    template: `
      <div>
        <FormLayout>
          <DatePicker
            v-model="date"
            type="datetime"
            label="datetime"
          />
          <DatePicker
            v-model="date"
            type="date"
            label="date"
          />
          <DatePicker
            v-model="date"
            type="month"
            label="month"
          />
          <DatePicker
            v-model="date"
            type="year"
            label="year"
          />
        </FormLayout>
        <pre>Value: {{date}}</pre>
      </div>
    `
  })
}

/**
  Allows selecting times by using the "datetime" `type`.
  The `disable-date` function is being used to disable dates after today.
  The `min-time` and `max-time` props are limiting times between 09:30am and 10:45am. Times are clamped between these ranges when the date changes.
 */
export const RestrictingDate: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const date = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))
      function disableDate(dayjsDate: Dayjs) {
        return dayjsDate.isAfter()
      }
      return { date, disableDate }
    },
    template: `
      <div>
        <DatePicker
          label="Start Date"
          placeholder="Choose a date"
          type="datetime"
          :disable-date="disableDate"
          min-time="09:30"
          max-time="10:45"
          v-model="date"
        />
        <pre>Value: {{date}}</pre>
      </div>
    `
  })
}

/**
  Allows selecting times by using the "datetime" `type`.
  The `disable-date` function is being used to disable dates after today.
  The `min-time` and `max-time` props are limiting times between 09:30am and 10:45am. Times are clamped between these ranges when the date changes.
 */
export const AutoOpenDisabled: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const date = ref('2019-09-29 00:00:00')
      return { date }
    },
    template: `
      <div>
        <DatePicker
          label="Start Date"
          placeholder="Choose a date"
          v-model="date"
          type="date"
          clearable
          :auto-open="false"
        />
        <pre>Value: {{date}}</pre>
      </div>
    `
  })
}

export const DisabledControl: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const date = ref('2019-09-29 00:00:00')
      return { date }
    },
    template: `
      <div>
        <DatePicker
          label="Start Date"
          placeholder="Choose a date"
          type="date"
          disabled
          v-model="date"
        />
        <pre>Value: {{date}}</pre>
      </div>
    `
  })
}

export const ReadonlyControl: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const date = ref('2019-09-29 00:00:00')
      return { date }
    },
    template: `
      <div>
        <DatePicker
          label="Start Date"
          placeholder="Choose a date"
          readonly
          type="date"
          v-model="date"
        />
        <pre>Value: {{date}}</pre>
      </div>
    `
  })
}
