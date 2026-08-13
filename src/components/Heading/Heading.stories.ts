import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Heading from './Heading.vue'

const meta = {
  title: 'Components/Typography/Heading',
  component: Heading,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof Heading>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { Heading },
    template: `
      <Heading>Hello World!</Heading>
    `
  })
}
