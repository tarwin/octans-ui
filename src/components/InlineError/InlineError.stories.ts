import type { Meta, StoryObj } from '@storybook/vue3-vite'
import InlineError from './InlineError.vue'

const meta = {
  title: 'Components/Forms/InlineError',
  component: InlineError,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof InlineError>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => ({
    components: { InlineError },
    template: `
      <InlineError message="This is an error." />
    `
  })
}

export const NoError: Story = {
  render: () => ({
    components: { InlineError },
    template: `
      <InlineError />
    `
  })
}
