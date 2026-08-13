import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TextStyle from './TextStyle.vue'

const meta = {
  title: 'Components/Typography/TextStyle',
  component: TextStyle,
  tags: ['autodocs']
} satisfies Meta<typeof TextStyle>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => ({
    components: { TextStyle },
    template: `
      <div>
        <TextStyle type="positive">positive</TextStyle><br>
        <TextStyle type="negative">negative</TextStyle><br>
        <TextStyle type="strong">strong</TextStyle><br>
        <TextStyle type="subdued">subdued</TextStyle><br>
        <TextStyle type="code">code</TextStyle>
        <br>
        <TextStyle type="link">link</TextStyle>
      </div>
    `
  })
}
