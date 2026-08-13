import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Spinner from './Spinner.vue'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Components/Feedback/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => ({
    components: { Spinner },
    template: `
      <Spinner size="small" />
      <Spinner size="large" />
      <Spinner />
    `
  })
}
