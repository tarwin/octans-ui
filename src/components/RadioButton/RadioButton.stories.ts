import { RadioButton, RadioButtonControl } from '@/components/RadioButton'
import { Stack } from '@/components/Stack'
import { TextField } from '@/components/TextField'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Components/Forms/RadioButton',
  component: RadioButton,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof RadioButton>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => ({
    components: { RadioButton, Stack },
    setup() {
      const value = ref(null)
      return { value }
    },
    template: `
      <Stack vertical>
        <RadioButton
          label="No minimum"
          true-value="noMinimum"
          help-text="Do not require a timed ticket for this exhibition."
          v-model="value"
        />
        <RadioButton
          label="Require minimum purchase"
          true-value="minimum"
          v-model="value"
        />
        <pre>value: {{value}}</pre>
      </Stack>
    `
  })
}

export const Disabled: Story = {
  render: () => ({
    components: { RadioButton, Stack },
    template: `
      <Stack vertical>
        <RadioButton
          label="No minimum"
          disabled
          help-text="Do not require a timed ticket for this exhibition."
        />
        <RadioButton
          label="Require minimum purchase"
          checked
          disabled
          help-text="Checked with no v-model, using the 'checked' prop."
        />
      </Stack>
    `
  })
}

export const Readonly: Story = {
  render: () => ({
    components: { RadioButton, Stack },
    template: `
      <Stack vertical>
        <RadioButton
          label="No minimum"
          readonly
          help-text="Clicking this does nothing."
        />
        <RadioButton
          label="Require minimum purchase"
          checked
          readonly
          help-text="Neither does clicking this."
        />
      </Stack>
    `
  })
}

export const WithError: Story = {
  render: () => ({
    components: { RadioButton },
    template: `
      <RadioButton
        label="No minimum"
        error="Choose one of the options above."
        help-text="Do not require a timed ticket for this exhibition."
      />
    `
  })
}

export const WithChildContent: Story = {
  render: () => ({
    components: { RadioButton, Stack, TextField },
    setup() {
      const type = ref(null)
      const value = ref(null)
      return { type, value }
    },
    template: `
      <Stack vertical>
        <RadioButton
          label="No minimum"
          true-value="noMinimum"
          v-model="type"
        />
        <RadioButton
          label="Require minimum purchase"
          true-value="minimum"
          v-model="type"
        >
          <TextField
            type="number"
            v-model="value"
          />
        </RadioButton>
        <pre>type: {{type}}, value: {{value}}</pre>
      </Stack>
    `
  })
}

export const RadioButtonControlText: Story = {
  render: () => ({
    components: { RadioButton, Stack, RadioButtonControl },
    setup() {
      const value = ref('one')
      return { value }
    },
    template: `
      <Stack vertical spacing="none">
        <RadioButtonControl
          value="one"
          :checked="value === 'one'"
          @change="() => value = 'one'"
        />
        <RadioButtonControl
          value="two"
          :checked="value === 'two'"
          @change="() => value = 'two'"
        />
        <pre>value: {{value}}</pre>
      </Stack>
    `
  })
}
