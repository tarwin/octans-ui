import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TextContainer from './TextContainer.vue'

const meta = {
  title: 'Components/Typography/TextContainer',
  component: TextContainer,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof TextContainer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { TextContainer },
    template: `
      <TextContainer>
        <div>first</div>
        <div>second</div>
        <div>third</div>
      </TextContainer>
    `
  })
}
