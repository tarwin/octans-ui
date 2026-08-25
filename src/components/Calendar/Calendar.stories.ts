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

/**
  `minDate` and `maxDate` bound the selectable range, inclusive at both ends.

  `disableDate` can express a range too, but writing a predicate for the common
  case is the wrong amount of work — and the two compose, so a range plus "no
  weekends" is both props rather than one cleverer function.

  Out-of-range days are judged at the cell's own granularity, which is why the
  month view still lets you into a month that is only partly reachable.
 */
export const Range: Story = {
  render: () => ({
    components: { Calendar },
    setup() {
      const value = ref()
      const min = '2024-03-10'
      const max = '2024-03-24'
      return { value, min, max }
    },
    template: `
      <div>
        <Calendar
          v-model="value"
          model-format="YYYY-MM-DD"
          model-value="2024-03-15"
          :min-date="min"
          :max-date="max"
        />
        <pre>Selectable: {{min}} — {{max}}</pre>
      </div>
    `
  })
}

/**
  The week starts where the LOCALE says — switch the locale in the toolbar and
  the grid follows, with no prop involved.

  `weekStartsOn` is the per-instance override, for a calendar that has to
  disagree with the viewer: a roster kept in a fixed business week, say. Reach
  for it rarely.
 */
export const WeekStart: Story = {
  render: () => ({
    components: { Calendar },
    template: `
      <div style="display: flex; gap: 24px">
        <div>
          <div style="margin-bottom: 8px">From the locale</div>
          <Calendar model-format="YYYY-MM-DD" model-value="2024-03-15" />
        </div>
        <div>
          <div style="margin-bottom: 8px">weekStartsOn: 1</div>
          <Calendar
            model-format="YYYY-MM-DD"
            model-value="2024-03-15"
            :week-starts-on="1"
          />
        </div>
      </div>
    `
  })
}

/**
  `markers` puts a dot under a day, for saying "something happens here" without
  selecting it — deadlines, bookings, days that have data.

  Each marker takes an optional `color` and `tooltip`. Several on one day draw
  up to three dots and join their tooltips; past three they stop being
  countable and start being a smear.
 */
export const Markers: Story = {
  render: () => ({
    components: { Calendar },
    setup() {
      const markers = [
        { date: '2024-03-05', tooltip: 'Invoice due' },
        {
          date: '2024-03-12',
          color: 'var(--octans-error)',
          tooltip: 'Deadline'
        },
        {
          date: '2024-03-12',
          color: 'var(--octans-warning)',
          tooltip: 'Review'
        },
        {
          date: '2024-03-21',
          color: 'var(--octans-success)',
          tooltip: 'Shipped'
        }
      ]
      return { markers }
    },
    template: `
      <Calendar
        model-format="YYYY-MM-DD"
        model-value="2024-03-15"
        :markers="markers"
      />
    `
  })
}
