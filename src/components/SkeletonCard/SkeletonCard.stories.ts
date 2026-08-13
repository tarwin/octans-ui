import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SkeletonCard from './SkeletonCard.vue'

const meta = {
  title: 'Components/Feedback/SkeletonCard',
  component: SkeletonCard,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof SkeletonCard>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => ({
    components: { SkeletonCard },
    template: `
      <SkeletonCard />
    `
  })
}
