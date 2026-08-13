import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Caption from './Caption.vue'

/**
 * Caption text is smaller than the regular font size.
 */
const meta = {
  title: 'Components/Typography/Caption',
  component: Caption,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof Caption>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => ({
    components: { Caption },
    setup() {
      function onClick(event: MouseEvent) {
        console.log('onclick', event)
      }
      return { onClick }
    },
    template: `
      <div>
        Regular text
        <Caption>Caption text</Caption>
      </div>
      <div>
        Regular text 2
        <Caption class="CaptionClassCustom" @click="onClick">Caption text 2</Caption>
      </div>
    `
  })
}
