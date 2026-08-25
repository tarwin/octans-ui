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
