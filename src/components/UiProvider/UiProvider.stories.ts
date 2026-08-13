import type { Meta, StoryObj } from '@storybook/vue3-vite'
import UiProvider from './UiProvider.vue'
import { Tooltip } from '../Tooltip'

const meta = {
  title: 'Components/Utilities/UiProvider',
  component: UiProvider,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof UiProvider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { Tooltip, UiProvider },
    template: `
      <UiProvider>
        <Tooltip content="abc">hello</Tooltip>
      </UiProvider>
    `
  })
}
