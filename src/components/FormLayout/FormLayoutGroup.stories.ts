import { FormLayout, FormLayoutGroup } from '@/components/FormLayout'
import { TextField } from '@/components/TextField'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/**
Wrap elements inside a `FormLayout` with a `FormLayoutGroup` to display them in
a horizontal row when there is space available.
*/
const meta = {
  title: 'Components/Layout/FormLayoutGroup',
  component: FormLayoutGroup,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof FormLayoutGroup>

export default meta
type Story = StoryObj<typeof meta>

/**
By default, fields in a the group are giving a minimum width of `220px` and will
wrap when necessary.
*/
export const DefaultSpacing: Story = {
  render: () => ({
    components: { FormLayout, FormLayoutGroup, TextField },
    template: `
      <FormLayout>
        <FormLayoutGroup>
          <TextField
            label="A"
          />
          <TextField
            label="B"
          />
          <TextField
            label="C"
          />
          <TextField
            label="D"
          />
        </FormLayoutGroup>
      </FormLayout>
    `
  })
}

/**
Add the `condensed` property to allow tightly packed fields.
*/
export const CondensedSpacing: Story = {
  render: () => ({
    components: { FormLayout, FormLayoutGroup, TextField },
    template: `
      <FormLayout>
        <FormLayoutGroup condensed>
          <TextField
            label="A"
          />
          <TextField
            label="B"
          />
          <TextField
            label="C"
          />
          <TextField
            label="D"
          />
        </FormLayoutGroup>
      </FormLayout>
    `
  })
}

/**
Use with templates (flattening) and v-if="false" to allow fields to wrap when necessary.
*/
export const UseWithTemplatesSlashIf: Story = {
  render: () => ({
    components: { FormLayout, FormLayoutGroup, TextField },
    template: `
      <FormLayout>
        <FormLayoutGroup>
          <TextField
            v-if="false"
            label="A"
          />
          <template v-if="true">
            <TextField
              label="B"
            />
            <TextField
              label="C"
            />
          </template>
          <template v-if="true">
            <template v-if="true">
              <TextField
                label="D"
              />
            </template>
            <TextField
              label="E"
            />
          </template>
        </FormLayoutGroup>
      </FormLayout>
    `
  })
}
