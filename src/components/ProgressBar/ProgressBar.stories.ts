import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ProgressBar from './ProgressBar.vue'

const meta = {
  title: 'Components/Feedback/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  args: {
    value: 40
  }
} satisfies Meta<typeof ProgressBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => ({
    components: { ProgressBar },
    template: `
      <div style="display: grid; gap: 16px; max-width: 400px;">
        <ProgressBar :value="40" size="small" />
        <ProgressBar :value="40" size="medium" />
        <ProgressBar :value="40" size="large" />
      </div>
    `
  })
}

export const Statuses: Story = {
  render: () => ({
    components: { ProgressBar },
    template: `
      <div style="display: grid; gap: 16px; max-width: 400px;">
        <ProgressBar :value="60" />
        <ProgressBar :value="60" status="info" />
        <ProgressBar :value="60" status="success" />
        <ProgressBar :value="60" status="warning" />
        <ProgressBar :value="60" status="error" />
      </div>
    `
  })
}

export const Animated: Story = {
  render: () => ({
    components: { ProgressBar },
    template: `
      <div style="display: grid; gap: 16px; max-width: 400px;">
        <ProgressBar :value="65" size="large" animated />
        <ProgressBar :value="60" animated />
        <ProgressBar :value="60" status="info" animated />
        <ProgressBar :value="60" status="success" animated />
        <ProgressBar :value="60" status="warning" animated />
        <ProgressBar :value="60" status="error" animated />
      </div>
    `
  })
}

export const Indeterminate: Story = {
  render: () => ({
    components: { ProgressBar },
    template: `
      <div style="max-width: 400px;">
        <ProgressBar indeterminate />
      </div>
    `
  })
}
