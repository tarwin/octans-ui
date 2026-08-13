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
