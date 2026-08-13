import { FormLayout, FormLayoutGroup } from '@/components/FormLayout'
import { TextField } from '@/components/TextField'
import { Select } from '@/components/Select'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta = {
  title: 'Components/Layout/FormLayout',
  component: FormLayout,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof FormLayout>

export default meta
type Story = StoryObj<typeof meta>

/**
The `FormLayout` component wraps all elements (non-text nodes) in an internal
`FormLayoutItem` which adds spacing between form elements.
*/
export const Basic: Story = {
  render: () => ({
    components: { FormLayout, TextField, FormLayoutGroup, Select },
    template: `
      <FormLayout>
        <FormLayoutGroup>
          <Select
            label="Pricing Type"
          />
        </FormLayoutGroup>
        <FormLayoutGroup>
          <Select
            label="Charge Type"
          />
          <TextField
            label="Charge Rate"
          />
        </FormLayoutGroup>
        <FormLayoutGroup>
          <Select
            label="Extra Charge Type"
          />
          <TextField
            label="Extra Charge Rate"
          />
        </FormLayoutGroup>
      </FormLayout>
    `
  })
}
