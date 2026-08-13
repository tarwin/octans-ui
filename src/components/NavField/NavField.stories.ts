import { NavField } from '@/components/NavField'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Components/Forms/NavField',
  component: NavField,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof NavField>

export default meta
type Story = StoryObj<typeof meta>

export const PlaceholderText: Story = {
  render: () => ({
    components: { NavField },
    template: `
      <NavField
        placeholder="Choose a thing"
      />
    `
  })
}

export const TruncateLongContent: Story = {
  render: () => ({
    components: { NavField },
    template: `
      <NavField
        title="Seconds Until First Cart Change"
        description="The number of seconds elapsed from the start of the session to the first time the cart had a non-zero value."
        style="max-width: 400px"
      />
    `
  })
}

export const Disabled: Story = {
  render: () => ({
    components: { NavField },
    template: `
      <NavField
        title="Seconds Until First Cart Change"
        description="The number of seconds elapsed from the start of the session to the first time the cart had a non-zero value."
        disabled
      />
    `
  })
}

export const Readonly: Story = {
  render: () => ({
    components: { NavField },
    template: `
      <NavField
        title="Seconds Until First Cart Change"
        description="The number of seconds elapsed from the start of the session to the first time the cart had a non-zero value."
        readonly
      />
    `
  })
}

export const Loading: Story = {
  render: () => ({
    components: { NavField },
    template: `
      <NavField
        title="Seconds Until First Cart Change"
        description="The number of seconds elapsed from the start of the session to the first time the cart had a non-zero value."
        loading
      />
    `
  })
}
