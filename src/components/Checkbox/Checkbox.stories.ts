import { Checkbox, CheckboxControl } from '@/components/Checkbox'
import { Stack } from '@/components/Stack'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Components/Forms/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => ({
    components: { Checkbox },
    setup() {
      const value = ref(false)
      return {
        value
      }
    },
    template: `
      <div>
        <Checkbox
          label="Basic checkbox"
          help-text="With some helpful text below it.."
          v-model="value"
        />
        <pre>value: {{value}}</pre>
      </div>
    `
  })
}

export const Disabled: Story = {
  render: () => ({
    components: { Checkbox },
    setup() {
      const value = ref(false)
      return {
        value
      }
    },
    template: `
      <div>
        <Checkbox
          label="Basic checkbox"
          help-text="With some helpful text below it.."
          disabled
          v-model="value"
        />
        <pre>value: {{value}}</pre>
      </div>
    `
  })
}

export const ReadOnly: Story = {
  render: () => ({
    components: { Checkbox },
    setup() {
      const value = ref(false)
      return {
        value
      }
    },
    template: `
      <div>
        <Checkbox
          label="Basic checkbox"
          help-text="With some helpful text below it.."
          readonly
          checked
        />
      </div>
    `
  })
}

export const WithError: Story = {
  render: () => ({
    components: { Checkbox },
    setup() {
      const value = ref(false)
      return {
        value
      }
    },
    template: `
      <div>
        <Checkbox
          label="Basic checkbox"
          help-text="With some helpful text below it.."
          error="Somehow you managed to get a boolean wrong?!"
          v-model="value"
        />
        <pre>value: {{value}}</pre>
      </div>
    `
  })
}

export const UsingNonDefaultTrueFalseValues: Story = {
  render: () => ({
    components: { Checkbox },
    setup() {
      const value = ref<boolean | null>(null)
      return {
        value
      }
    },
    template: `
      <div>
        <Checkbox
          label="Basic checkbox"
          help-text="With some helpful text below it.."
          true-value="yep"
          false-value="nope"
          v-model="value"
        />
        <pre>value: {{value}}</pre>
      </div>
    `
  })
}

export const IndeterminiteState: Story = {
  render: () => ({
    components: { Checkbox, Stack },
    setup() {
      const values = ref<boolean[]>([false, true, false])

      const someChecked = computed(() => {
        return values.value.some((v) => v)
      })
      const allChecked = computed(() => {
        return values.value.every((v) => v)
      })

      return {
        values,
        someChecked,
        allChecked
      }
    },
    template: `
      <Stack vertical spacing="none">
        <Checkbox
          label="Use all the options"
          :checked="someChecked"
          :indeterminate="someChecked && !allChecked"
        />
        <Checkbox
          label="Option 1"
          v-model="values[0]"
        />
        <Checkbox
          label="Option 2"
          v-model="values[1]"
        />
        <Checkbox
          label="Option 3"
          v-model="values[2]"
        />
        <pre>values: {{values}}</pre>
      </Stack>
    `
  })
}

export const WithChildContent: Story = {
  render: () => ({
    components: { Checkbox, Stack },
    setup() {
      const type = ref<boolean | null>(null)
      const value = ref<boolean | null>(null)
      return {
        type,
        value
      }
    },
    template: `
      <Stack vertical>
        <Checkbox
          label="Require minimum purchase"
          value="minimum"
          v-model="type"
        >
          <input
            type="number"
            v-model="value"
          />
        </Checkbox>
        <pre>type: {{type}}, value: {{value}}</pre>
      </Stack>
    `
  })
}

export const CheckboxControlTest: Story = {
  render: () => ({
    components: { CheckboxControl, Stack },
    setup() {
      const value = ref(false)
      return {
        value
      }
    },
    template: `
      <Stack vertical spacing="none">
        <CheckboxControl
          :checked="value"
          @change="event => value = event.target.checked"
        />
        <pre>value: {{value}}</pre>
      </Stack>
    `
  })
}
