import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Formatter from './Formatter.vue'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Components/Data Display/Formatter',
  component: Formatter,
  tags: ['autodocs'],
  args: {
    type: '',
    value: ''
  }
} satisfies Meta<typeof Formatter>

export default meta
type Story = StoryObj<typeof meta>

export const DateAgo: Story = {
  render: () => ({
    setup() {
      return {
        value: '2024-12-30 10:00:00'
      }
    },
    components: { Formatter },
    template: `
      <Formatter type="dateAgo" :value="value"/>
    `
  })
}

export const DateTimeLong: Story = {
  render: () => ({
    setup() {
      return {
        value: '2024-12-21 14:30:00'
      }
    },
    components: { Formatter },
    template: `
      <Formatter type="dateTimeLong" :value="value"/>
    `
  })
}

export const DateIso: Story = {
  render: () => ({
    setup() {
      return {
        value: '2019-10-21 14:30:00'
      }
    },
    components: { Formatter },
    template: `
      <Formatter type="dateIso" :value="value"/>
    `
  })
}

export const Duration: Story = {
  render: () => ({
    setup() {
      return {
        value: ['2019-10-21 14:30:00', '2019-10-21 07:27:00']
      }
    },
    components: { Formatter },
    template: `
      <Formatter type="duration" :value="value"/>
    `
  })
}

/**
  There are two zones in play, and they answer different questions.
  `timezone` is the clock a date is SHOWN on; `inputTimezone` is the clock it
  was WRITTEN on.

  The fixture below is the shape every MySQL `DATETIME` comes back as —
  `2024-03-15 02:00:00`, a wall clock with no zone attached. Read without an
  input zone it means whatever the reader's own clock says, so the same stored
  row is a different moment for every reader, and setting a display zone does
  not help: it converts an instant that was already wrong.

  Set `setInputTimezone('UTC')` once at start-up when values are stored in UTC.
  Strings that already name an instant — anything ending in `Z` or an offset —
  are never touched.
 */
export const InputTimezone: Story = {
  render: () => ({
    setup() {
      return { value: '2024-03-15 02:00:00' }
    },
    components: { Formatter },
    template: `
      <table style="border-spacing: 16px 4px">
        <tr>
          <td>Read as the viewer's clock, shown in UTC</td>
          <td><Formatter type="dateTimeShort" :value="value" timezone="UTC"/></td>
        </tr>
        <tr>
          <td>Read as UTC, shown in UTC</td>
          <td><Formatter type="dateTimeShort" :value="value" input-timezone="UTC" timezone="UTC"/></td>
        </tr>
        <tr>
          <td>Read as UTC, shown in Sydney</td>
          <td><Formatter type="dateTimeShort" :value="value" input-timezone="UTC" timezone="Australia/Sydney"/></td>
        </tr>
        <tr>
          <td>Read as Sydney, shown in UTC</td>
          <td><Formatter type="dateTimeShort" :value="value" input-timezone="Australia/Sydney" timezone="UTC"/></td>
        </tr>
      </table>
    `
  })
}

/**
  A value with no time is a DAY, not a moment — a `DATE` column, a birthday, a
  deadline — so neither zone is applied to it. Every row below prints the 15th.

  Without that rule, `2024-03-15` read as UTC and shown in Los Angeles renders
  as the 14th, which is how a date of birth ends up off by one.
 */
export const DateWithoutATime: Story = {
  render: () => ({
    setup() {
      return { value: '2024-03-15' }
    },
    components: { Formatter },
    template: `
      <table style="border-spacing: 16px 4px">
        <tr>
          <td>No zones set</td>
          <td><Formatter type="dateNumeral" :value="value"/></td>
        </tr>
        <tr>
          <td>Read as UTC, shown in Los Angeles</td>
          <td><Formatter type="dateNumeral" :value="value" input-timezone="UTC" timezone="America/Los_Angeles"/></td>
        </tr>
        <tr>
          <td>Read as Sydney, shown in Los Angeles</td>
          <td><Formatter type="dateNumeral" :value="value" input-timezone="Australia/Sydney" timezone="America/Los_Angeles"/></td>
        </tr>
      </table>
    `
  })
}

/**
  Dates render in the viewer's own clock by default. An app that has to show
  ONE zone to everybody — an operations console pinned to head-office time —
  calls `setTimezone('America/Los_Angeles')` once at start-up, and every
  `Formatter`, `Calendar` and `DatePicker` follows. It is the companion to
  `setLocale` and works the same way.

  The `timezone` prop is the per-instance override, shown below. Note the
  fixture is late in a UTC day, so the zones disagree about the DATE, not just
  the time.
 */
export const Timezone: Story = {
  render: () => ({
    setup() {
      return { value: '2024-03-15T02:00:00Z' }
    },
    components: { Formatter },
    template: `
      <table style="border-spacing: 16px 4px">
        <tr>
          <td>Viewer's clock</td>
          <td><Formatter type="dateTimeShort" :value="value"/></td>
        </tr>
        <tr>
          <td>UTC</td>
          <td><Formatter type="dateTimeShort" :value="value" timezone="UTC"/></td>
        </tr>
        <tr>
          <td>America/Los_Angeles</td>
          <td><Formatter type="dateTimeShort" :value="value" timezone="America/Los_Angeles"/></td>
        </tr>
        <tr>
          <td>Australia/Sydney</td>
          <td><Formatter type="dateTimeShort" :value="value" timezone="Australia/Sydney"/></td>
        </tr>
      </table>
    `
  })
}
