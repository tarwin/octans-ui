import { Button, ButtonGroup } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { Select } from '@/components/Select'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import TextField from './TextField.vue'

const meta = {
  title: 'Components/Forms/TextField',
  component: TextField,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof TextField>

export default meta
type Story = StoryObj<typeof meta>

export const BasicTextField: Story = {
  render: () => ({
    components: { TextField },
    template: `
      <TextField label="Basic field" />
    `
  })
}

export const DisabledTextField: Story = {
  render: () => ({
    components: { TextField },
    template: `
      <TextField label="Label" modelValue="You can't edit me" disabled />
    `
  })
}

export const Readonly: Story = {
  render: () => ({
    components: { TextField },
    template: `
      <TextField label="Label" modelValue="You can't edit me" readonly />
    `
  })
}

export const Email: Story = {
  render: () => ({
    components: { TextField },
    setup() {
      const value = ref('test@example.com')
      return { value }
    },
    template: `
      <div>
        <TextField label="Email" type="email" v-model="value" />
        value: {{value}}
      </div>
    `
  })
}

/**
  Treats the model value as a number as well as setting `type="number"` on the
  underlining `<input>` element.

  The value entered by the user will be parsed as a float and returned as a number
  if not `NaN`, otherwise it will be returned as the string value in the browser.
 */
export const Number: Story = {
  render: () => ({
    components: { TextField },
    setup() {
      const value = ref(0)
      return { value }
    },
    template: `
      <div>
        <TextField
          label="Number"
          type="number"
          :min="0"
          :max="10"
          :step="2"
          v-model="value"
        />
        value: {{value}}<br />
        typeof value: {{typeof value}}
      </div>
    `
  })
}

export const Password: Story = {
  render: () => ({
    components: { TextField },
    setup() {
      const value = ref('super secret password')
      return { value }
    },
    template: `
      <div>
        <TextField label="Password" type="password" v-model="value" />
        value: {{value}}
      </div>
    `
  })
}

export const PrefixSuffix: Story = {
  render: () => ({
    components: { TextField },
    template: `
      <TextField label="Cool label" prefix="$" suffix="%" />
    `
  })
}

export const RightAligned: Story = {
  render: () => ({
    components: { TextField },
    template: `
      <TextField label="Am I right?" align="right" value="yes" />
    `
  })
}

/**
  Multiline fields are rendered as a textarea element and are split by newline
  characters (`\n`). The field will grow vertically to match the input and scroll
  after 200px.
 */
export const MultilineTextarea: Story = {
  render: () => ({
    components: { TextField, Button },
    setup() {
      const comments = ref('This is a long thing\nsomething')
      function update() {
        const quotes = [
          'Operator! Give me the number for 911!',
          "Marge, you know it's rude to talk when my mouth is full.",
          'Stupidity got us into this mess, and stupidity will get us out.',
          'Trying is the first step towards failure.',
          'Oh yeah, what are you gonna do? Release the dogs? Or the bees? Or the ' +
            'dogs with bees in their mouths and when they bark, they shoot bees at you?'
        ]
        const author = '\n  - Homer Simpson'
        comments.value = quotes.join(author + '\n\n') + author
      }
      return { comments, update }
    },
    template: `
      <div>
        <TextField label="Comments" v-model="comments" multiline />
        <br />
        <Button @click="update">Set really long input</Button>
      </div>
    `
  })
}

/**
  When the `multiline` property is set to a number it indicates how many rows to
  show. The example below demonstates this. When the property is set to `true` (or
  a value is omitted) it will default to showing 2 rows of text.
 */
export const NumberedMultilineTextarea: Story = {
  render: () => ({
    components: { TextField },
    setup() {
      const description = ref('Will render 5 lines with multiline set to 5')
      return { description }
    },
    template: `
      <div>
        <TextField label="Description" v-model="description" multiline="5" />
        <br />
      </div>
    `
  })
}

/**
 * Don't do complicated stuff like this all at once.
 */
export const LotsOfOptions: Story = {
  render: () => ({
    components: { TextField, Icon, ButtonGroup, Select, Button },
    template: `
      <TextField
        label="Field with lots of options"
        prefix="$"
        suffix="%"
        error="There is an error..."
        help-text="Here is some helpful text"
      >
        <template #prefix>
          <Icon icon="mdi:magnify" />
        </template>
        <template #left>
          <ButtonGroup segmented>
            <Button>Left button</Button>
            <Button>Click Me</Button>
          </ButtonGroup>
        </template>
        <template #right>
          <Select
            :options="[
              {label: 'kg', value: 'kg'},
              {label: 'lb', value: 'lb'}
            ]"
            modelValue="kg"
          />
        </template>
      </TextField>
    `
  })
}

/**
  Pass a `mask` to constrain and format single-line input. Masks use
  [maska](https://beholdr.github.io/maska/) tokens: `#` for a digit, `@` for a
  letter and `*` for alphanumeric. Masking is ignored on `multiline` fields.

  By default `v-model` receives the masked value. Set `unmask` to receive the
  raw value instead — the input stays masked either way.
 */
export const Mask: Story = {
  render: () => ({
    components: { TextField },
    setup() {
      const phone = ref('')
      const date = ref('')
      const plate = ref('')
      const card = ref('')
      return { phone, date, plate, card }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px">
        <div>
          <TextField label="Phone" mask="(###) ###-####" v-model="phone" placeholder="(___) ___-____" />
          value: {{ phone || '—' }}
        </div>
        <div>
          <TextField label="Date" mask="##/##/####" v-model="date" placeholder="dd/mm/yyyy" />
          value: {{ date || '—' }}
        </div>
        <div>
          <TextField label="License plate" mask="@@@-####" v-model="plate" placeholder="ABC-1234" />
          value: {{ plate || '—' }}
        </div>
        <div>
          <TextField label="Card (unmasked model)" mask="#### #### #### ####" unmask v-model="card" />
          raw value: {{ card || '—' }}
        </div>
      </div>
    `
  })
}

/**
  View the developer console to see events emitted while typing, clicking and
  changing focus.
 */
export const Events: Story = {
  render: () => ({
    components: { TextField },
    setup() {
      function onClick(event: Event) {
        console.log('onClick', event)
      }
      function onInput(value: any, event: Event) {
        console.log('onInput', value, event)
      }
      function onKeydown(event: Event) {
        console.log('onKeydown', event)
      }
      function onFocus(event: Event) {
        console.log('onFocus', event)
      }
      function onBlur(event: Event) {
        console.log('onBlur', event)
      }
      return {
        onClick,
        onInput,
        onKeydown,
        onFocus,
        onBlur
      }
    },
    template: `
      <TextField
        label="Label"
        @click="onClick"
        @update:modelValue="onInput"
        @keydown="onKeydown"
        @focus="onFocus"
        @blur="onBlur"
      />
    `
  })
}

/**
  Focuses the text field one second after the button is clicked.
 */
export const ProgrammableFocus: Story = {
  render: () => ({
    components: { TextField, Button },
    setup() {
      const text = ref<InstanceType<typeof TextField>>()
      function focus() {
        setTimeout(() => text.value?.focus(), 1000)
      }
      return {
        text,
        focus
      }
    },
    template: `
      <div>
        <TextField label="Label" ref="text" />
        <br />
        <Button @click="focus">Focus after 1 second</Button>
      </div>
    `
  })
}
