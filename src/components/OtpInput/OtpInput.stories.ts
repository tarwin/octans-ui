import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import OtpInput from './OtpInput.vue'

const meta = {
  title: 'Components/Forms/OtpInput',
  component: OtpInput,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof OtpInput>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: () => ({
    components: { OtpInput },
    setup() {
      const value = ref('')
      return { value }
    },
    template: `
      <div>
        <OtpInput label="Verification code" v-model="value" />
        value: {{ value || '—' }}
      </div>
    `
  })
}

/**
  Set `length` to control how many cells are rendered.
 */
export const SixDigits: Story = {
  render: () => ({
    components: { OtpInput },
    setup() {
      const value = ref('')
      return { value }
    },
    template: `
      <div>
        <OtpInput label="6-digit code" :length="6" v-model="value" integerOnly />
        value: {{ value || '—' }}
      </div>
    `
  })
}

/**
  `integerOnly` restricts entry to digits `0-9` and shows a numeric keyboard on
  mobile.
 */
export const IntegerOnly: Story = {
  render: () => ({
    components: { OtpInput },
    setup() {
      const value = ref('')
      return { value }
    },
    template: `
      <div>
        <OtpInput label="PIN" v-model="value" integerOnly />
        value: {{ value || '—' }}
      </div>
    `
  })
}

/**
  Pass a string to `allowedChars` to restrict entry to an explicit set of
  characters. Here only uppercase hex digits are accepted.
 */
export const AllowedCharsSet: Story = {
  render: () => ({
    components: { OtpInput },
    setup() {
      const value = ref('')
      return { value }
    },
    template: `
      <div>
        <OtpInput label="Hex code" :length="6" allowedChars="0123456789ABCDEF" casing="upper" v-model="value" />
        value: {{ value || '—' }}
      </div>
    `
  })
}

/**
  Pass a `RegExp` to `allowedChars` for full control — it is tested against each
  typed or pasted character. This example allows case-insensitive letters only.
 */
export const AllowedCharsRegExp: Story = {
  render: () => ({
    components: { OtpInput },
    setup() {
      const value = ref('')
      const pattern = /[a-z]/i
      return { value, pattern }
    },
    template: `
      <div>
        <OtpInput label="Letters only" :length="5" :allowedChars="pattern" v-model="value" />
        value: {{ value || '—' }}
      </div>
    `
  })
}

/**
  Use `groups` to split the cells into visually separated blocks, e.g. a
  product key. The field still behaves as one input — typing, paste, backspace
  and focus flow across the separators, and the value has no separators in it.
  Customise the divider with `separator`.
 */
export const Grouped: Story = {
  render: () => ({
    components: { OtpInput },
    setup() {
      const value = ref('')
      return { value }
    },
    template: `
      <div>
        <OtpInput
          label="Product key"
          :groups="[4, 4, 4]"
          casing="upper"
          allowedChars="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
          v-model="value"
        />
        value: {{ value || '—' }}
      </div>
    `
  })
}

/**
  Set `casing` to `"upper"` or `"lower"` to force the case of entered characters.
  Casing is applied before `allowedChars` validation, so typing `a` here yields
  an uppercase `A`.
 */
export const ForcedCasing: Story = {
  render: () => ({
    components: { OtpInput },
    setup() {
      const value = ref('')
      return { value }
    },
    template: `
      <div>
        <OtpInput label="Uppercase code" :length="5" casing="upper" v-model="value" />
        value: {{ value || '—' }}
      </div>
    `
  })
}

/**
  Set `mask` to hide the entered characters, PIN style.
 */
export const Masked: Story = {
  render: () => ({
    components: { OtpInput },
    setup() {
      const value = ref('')
      return { value }
    },
    template: `
      <div>
        <OtpInput label="Secret PIN" v-model="value" integerOnly mask />
        value: {{ value || '—' }}
      </div>
    `
  })
}

export const WithError: Story = {
  render: () => ({
    components: { OtpInput },
    setup() {
      const value = ref('12')
      return { value }
    },
    template: `
      <OtpInput
        label="Verification code"
        v-model="value"
        integerOnly
        error="That code is incorrect"
        help-text="Check the email we sent you"
      />
    `
  })
}

export const Disabled: Story = {
  render: () => ({
    components: { OtpInput },
    template: `
      <OtpInput label="Disabled" modelValue="1234" disabled />
    `
  })
}

/**
  Set `centered` to center the cells within the available width instead of
  left-aligning them.
 */
export const Centered: Story = {
  render: () => ({
    components: { OtpInput },
    setup() {
      const value = ref('')
      return { value }
    },
    template: `
      <div>
        <OtpInput label="Verification code" v-model="value" centered />
        value: {{ value || '—' }}
      </div>
    `
  })
}

/**
  The `complete` event fires once every cell is filled.
 */
export const CompleteEvent: Story = {
  render: () => ({
    components: { OtpInput },
    setup() {
      const value = ref('')
      const completed = ref('')
      function onComplete(code: string) {
        completed.value = code
      }
      return { value, completed, onComplete }
    },
    template: `
      <div>
        <OtpInput label="Enter code" :length="4" integerOnly v-model="value" @complete="onComplete" />
        last completed value: {{ completed || '—' }}
      </div>
    `
  })
}
