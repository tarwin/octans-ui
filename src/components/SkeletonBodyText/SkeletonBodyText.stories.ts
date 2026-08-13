import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SkeletonBodyText from './SkeletonBodyText.vue'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Components/Feedback/SkeletonBodyText',
  component: SkeletonBodyText,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof SkeletonBodyText>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => ({
    components: { SkeletonBodyText },
    template: `
      <SkeletonBodyText />
    `
  })
}
