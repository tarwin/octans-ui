import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FooterHelp from './FooterHelp.vue'

const meta = {
  title: 'Components/Layout/FooterHelp',
  component: FooterHelp,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof FooterHelp>

export default meta
type Story = StoryObj<typeof meta>

export const BasicExample: Story = {
  render: () => ({
    components: { FooterHelp },
    template: `
      <FooterHelp>Here is some text that subtly describes something.</FooterHelp>
    `
  })
}

export const WithTitle: Story = {
  render: () => ({
    components: { FooterHelp },
    template: `
      <FooterHelp title="Note">It can also have a title which is prefixed before the content.</FooterHelp>
    `
  })
}
