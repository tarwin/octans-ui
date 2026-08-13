import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Calendar from './Calendar.vue'
import type { Dayjs } from 'dayjs'

const meta = {
  title: 'Components/Forms/Calendar',
  component: Calendar,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

/**
  The `type` prop defaults to "date".
  Clicking the month title allows moving "up" to the next picker level.
 */
export const Default: Story = {
  render: () => ({
    components: { Calendar },
    setup() {
      const value = ref()
      return {
        value
      }
    },
    template: `
      <div>
        <Calendar
          v-model="value"
        />
        <pre>Value: {{value}}</pre>
      </div>
    `
  })
}

/**
  Allows selecting times by using the "datetime" `type`.
  The `disable-date` function is being used to disables weekends.
  The `min-time` and `max-time` props are limiting times between 09:30am and
  10:45am. Times are clamped between these ranges when the date changes.
 */
export const RestrictingDates: Story = {
  render: () => ({
    components: { Calendar },
    setup() {
      const value = ref('2020-10-01 00:00:00')
      function disableDate(dayjsDate: Dayjs) {
        return dayjsDate.day() === 0 || dayjsDate.day() === 6
      }
      return {
        value,
        disableDate
      }
    },
    template: `
      <div>
        <Calendar
          v-model="value"
          type="datetime"
          :disable-date="disableDate"
          min-time="09:30"
          max-time="10:45"
        />
        <pre>Value: {{value}}</pre>
      </div>
    `
  })
}

export const MonthPicker: Story = {
  render: () => ({
    components: { Calendar },
    setup() {
      const value = ref('1987-09-01 00:00:00')
      return {
        value
      }
    },
    template: `
      <div>
        <Calendar
          v-model="value"
          type="month"
        />
        <pre>Value: {{value}}</pre>
      </div>
    `
  })
}

export const YearPicker: Story = {
  render: () => ({
    components: { Calendar },
    setup() {
      const value = ref('2012-01-01 00:00:00')
      return {
        value
      }
    },
    template: `
      <div>
        <Calendar
          v-model="value"
          type="year"
        />
        <pre>Value: {{value}}</pre>
      </div>
    `
  })
}
