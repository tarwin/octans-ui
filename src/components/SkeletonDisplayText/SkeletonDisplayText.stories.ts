import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SkeletonDisplayText from './SkeletonDisplayText.vue'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Components/Feedback/SkeletonDisplayText',
  component: SkeletonDisplayText,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof SkeletonDisplayText>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => ({
    components: { SkeletonDisplayText },
    template: `
      <SkeletonDisplayText />
    `
  })
}
