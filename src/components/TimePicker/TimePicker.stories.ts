import { FormLayout, FormLayoutGroup } from '@/components/FormLayout'
import { TimePicker } from '@/components/TimePicker'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

const meta = {
  title: 'Components/Forms/TimePicker',
  component: TimePicker,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof TimePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Example: Story = {
  render: () => ({
    components: { TimePicker },
    setup() {
      const time = ref('09:30:00')
      return { time }
    },
    template: `
      <TimePicker
        label="Start Time"
        v-model="time"
      />
      <pre>Value: {{time}}</pre>
    `
  })
}

/**
By default the input fills the width of its container, like other form fields.
*/
export const FullWidth: Story = {
  render: () => ({
    components: { TimePicker },
    setup() {
      const time = ref('09:30:00')
      return { time }
    },
    template: `
      <div style="width: 300px; border: 1px dashed #ccc; padding: 8px;">
        <TimePicker
          label="Full width (default)"
          clearable
          v-model="time"
        />
      </div>
      <pre>Value: {{time}}</pre>
    `
  })
}

/**
Set `width="auto"` to size the input to its content instead of stretching.
*/
export const AutoWidth: Story = {
  render: () => ({
    components: { TimePicker },
    setup() {
      const time = ref('09:30:00')
      return { time }
    },
    template: `
      <div style="width: 300px; border: 1px dashed #ccc; padding: 8px;">
        <TimePicker
          label="Auto width"
          width="auto"
          clearable
          v-model="time"
        />
      </div>
      <pre>Value: {{time}}</pre>
    `
  })
}

/**
Use `is-24-hour` to hide the AM/PM toggle and edit the time in 24 hour format.
*/
export const TwentyFourHour: Story = {
  render: () => ({
    components: { TimePicker },
    setup() {
      const time = ref('17:45:00')
      return { time }
    },
    template: `
      <TimePicker
        label="Start Time"
        is-24-hour
        v-model="time"
      />
      <pre>Value: {{time}}</pre>
    `
  })
}

/**
`minute-step` controls how much the minute value changes when stepping with the
up/down arrow keys (hold <kbd>shift</kbd> to step by a single minute).
*/
export const MinuteStep: Story = {
  render: () => ({
    components: { TimePicker },
    setup() {
      const time = ref('12:00:00')
      return { time }
    },
    template: `
      <TimePicker
        label="Step by 5"
        :minute-step="5"
        v-model="time"
      />
      <pre>Value: {{time}}</pre>
    `
  })
}

/**
With `minute-step-strict`, the minute snaps to the nearest `minute-step`
multiple when the field loses focus. Type an off-step minute (e.g. `12:07`) and
tab away to see it snap to `12:00`.
*/
export const MinuteStepStrict: Story = {
  render: () => ({
    components: { TimePicker },
    setup() {
      const time = ref('12:00:00')
      return { time }
    },
    template: `
      <TimePicker
        label="Strict 15 min steps"
        :minute-step="15"
        minute-step-strict
        v-model="time"
      />
      <pre>Value: {{time}}</pre>
    `
  })
}

/**
Set `clearable` to show a button that clears the value (emits \`null\`).
*/
export const Clearable: Story = {
  render: () => ({
    components: { TimePicker },
    setup() {
      const time = ref<string | null>('08:15:00')
      return { time }
    },
    template: `
      <TimePicker
        label="Clearable"
        clearable
        v-model="time"
      />
      <pre>Value: {{time}}</pre>
    `
  })
}

export const DisabledAndReadonly: Story = {
  render: () => ({
    components: { TimePicker, FormLayout, FormLayoutGroup },
    setup() {
      const time = ref('10:00:00')
      return { time }
    },
    template: `
      <FormLayout>
        <FormLayoutGroup>
          <TimePicker label="Disabled" disabled v-model="time" />
          <TimePicker label="Readonly" readonly v-model="time" />
        </FormLayoutGroup>
      </FormLayout>
    `
  })
}

/**
This example shows two time pickers representing start and end times with their
`min-time` and `max-time` props linked to each other. An error is shown when the
selected time falls outside the allowed range.
*/
export const TimesWithValidation: Story = {
  render: () => ({
    components: { TimePicker, FormLayout, FormLayoutGroup },
    setup() {
      const startTime = ref('09:00:00')
      const endTime = ref('17:00:00')
      return { startTime, endTime }
    },
    template: `
      <FormLayout>
        <FormLayoutGroup>
          <TimePicker
            label="Start Time"
            :max-time="endTime"
            v-model="startTime"
          />
          <TimePicker
            label="End Time"
            :min-time="startTime"
            v-model="endTime"
          />
        </FormLayoutGroup>
      </FormLayout>
      <pre>startTime: {{startTime}}, endTime: {{endTime}}</pre>
    `
  })
}
