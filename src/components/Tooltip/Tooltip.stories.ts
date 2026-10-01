import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Tooltip from './Tooltip.vue'

// UiProvider comes from the global decorator in .storybook/preview.ts.
const meta = {
  title: 'Components/Overlays/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: () => ({
    components: { Tooltip },
    template: `
      <div>
        <Tooltip content="This is the text" placement="top">
          <span style="text-decoration: underline dotted;">Hover this sentence for basic tooltip.</span>
        </Tooltip>
      </div>
    `
  })
}

export const Slot: Story = {
  render: () => ({
    components: { Tooltip },
    template: `
      <Tooltip placement="top">
        <span style="text-decoration: underline dotted;">Hover this sentence for HTML tooltip.</span>
        <template v-slot:content>
          It works with <b>HTML</b> also!
        </template>
      </Tooltip>
    `
  })
}
