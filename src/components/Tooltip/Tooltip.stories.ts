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
        <Tooltip content="This is the text" placement="right">Hello</Tooltip> this is a thing.
      </div>
    `
  })
}

export const Slot: Story = {
  render: () => ({
    components: { Tooltip },
    template: `
      <Tooltip>
        <span style="text-decoration: underline;">Hover over this</span>
        <template v-slot:content>
          It works with <b>HTML</b> also!
        </template>
      </Tooltip>
    `
  })
}
