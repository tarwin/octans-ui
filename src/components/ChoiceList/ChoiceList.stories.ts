import { ChoiceList } from '@/components/ChoiceList'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, h, ref } from 'vue'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Components/Forms/ChoiceList',
  component: ChoiceList,
  tags: ['autodocs'],
  args: {
    options: []
  }
} satisfies Meta<typeof ChoiceList>

export default meta
type Story = StoryObj<typeof meta>

export const SingleChoice: Story = {
  render: () => ({
    components: { ChoiceList },
    setup() {
      const value = ref(false)
      return {
        value
      }
    },
    template: `
    <div>
      <ChoiceList
        label="Minimum purchase"
        :options="[
          {
            label: 'Enabled',
            value: 'enabled'
          },
          {
            label: 'Disabled',
            value: 'disabled'
          },
          {
            label: 'Unsure',
            value: 'unsure'
          }
        ]"
        v-model="value"
      />
      <pre>value: {{value}}</pre>
    </div>
    `
  })
}

export const MultipleChoiceList: Story = {
  render: () => ({
    components: { ChoiceList },
    setup() {
      const methods = ref<any[]>([])
      const error = computed(() => {
        if (!/email|mobile/.test(methods.value.join(''))) {
          return 'You must select at least one method that is not "none".'
        }
        return ''
      })
      return {
        methods,
        error,
        h
      }
    },
    template: `
      <div>
        <ChoiceList
          label="Required two-factor authentication methods"
          :options="[
            {
              label: 'Email',
              value: 'email',
              helpText: 'A verification code will be sent via email.'
            },
            {
              label: 'Mobile',
              value: 'mobile',
              helpText: 'A verification code will be sent via SMS.',
              disabled: true
            },
            {
              label: 'None',
              value: 'none',
              helpText: 'Allow users to disable two-factor authentication.'
            }
          ]"
          :error="error"
          multiple
          v-model="methods"
        />
        <pre>methods: {{methods}}</pre>
      </div>
    `
  })
}

/**
  `revealedContent` is the follow-up a choice opens up — shown only while that
  choice is selected, and hidden again when it isn't. Use it for the "Other:
  ___" field, or the settings a mode brings with it.

  It is not a description: text that should always be visible is `helpText`.

  A string is enough for prose; pass a VNode (via `h`) for anything richer.
 */
export const RevealedContent: Story = {
  render: () => ({
    components: { ChoiceList },
    setup() {
      const method = ref('standard')
      const other = ref('')
      return { method, other, h }
    },
    template: `
      <div>
        <ChoiceList
          label="Shipping method"
          :options="[
            {
              label: 'Standard',
              value: 'standard',
              helpText: 'Arrives in 5–7 working days.'
            },
            {
              label: 'Express',
              value: 'express',
              helpText: 'Arrives next working day.',
              revealedContent: 'Orders placed after 3pm ship the following day.'
            },
            {
              label: 'Other',
              value: 'other',
              revealedContent: h('input', {
                placeholder: 'Describe your preferred method',
                style: 'width: 260px; padding: 4px 8px'
              })
            }
          ]"
          v-model="method"
        />
        <pre>method: {{ method }}</pre>
      </div>
    `
  })
}

/**
 * `appearance="segmented"` draws the same choices as a joined row of segments
 * instead of a column of radios. It is the same radio group underneath — the
 * model, the events and the keyboard behaviour are unchanged — so this is a
 * one-prop switch for a form rendered from config.
 *
 * Reach for it when there are two to five short labels and showing all of them
 * at once is worth the width. A choice needing a description, a `helpLink`, or
 * more than about five options wants the list.
 *
 * What changes in a segment, which is one line high: per-choice `helpText`
 * becomes a tooltip, `helpLink` and per-choice `readonly` are dropped, and
 * `revealedContent` appears under the whole row rather than under one choice.
 * `multiple` has no segmented form at all — a segmented control is a radio
 * group — so it falls back to the checkbox list and says so in the console.
 *
 * For icons in the segments, reach for `SegmentedControl` directly.
 */
export const Segmented: Story = {
  render: () => ({
    components: { ChoiceList },
    setup() {
      const method = ref('standard')
      return { method }
    },
    template: `
      <div>
        <ChoiceList
          label="Shipping method"
          appearance="segmented"
          helpText="Delivery estimates are working days."
          :options="[
            {
              label: 'Standard',
              value: 'standard',
              helpText: 'Arrives in 5–7 days.'
            },
            {
              label: 'Express',
              value: 'express',
              helpText: 'Arrives tomorrow.',
              revealedContent: 'Orders placed after 3pm ship the following day.'
            },
            {
              label: 'Pickup',
              value: 'pickup'
            }
          ]"
          v-model="method"
        />
        <pre>method: {{ method }}</pre>
      </div>
    `
  })
}

export const Disabled: Story = {
  render: () => ({
    components: { ChoiceList },
    template: `
      <div>
        <ChoiceList
          label="Required two-factor authentication methods"
          :options="[
            {
              label: 'Email',
              value: 'email',
              helpText: 'A verification code will be sent via email.'
            },
            {
              label: 'Mobile',
              value: 'mobile',
              helpText: 'A verification code will be sent via SMS.',
              disabled: true
            },
            {
              label: 'None',
              value: 'none',
              helpText: 'Allow users to disable two-factor authentication.'
            }
          ]"
          multiple
          disabled
        />
      </div>
    `
  })
}

export const ReadOnly: Story = {
  render: () => ({
    components: { ChoiceList },
    template: `
      <div>
        <ChoiceList
          label="Required two-factor authentication methods"
          :options="[
            {
              label: 'Email',
              value: 'email',
              helpText: 'A verification code will be sent via email.'
            },
            {
              label: 'Mobile',
              value: 'mobile',
              helpText: 'A verification code will be sent via SMS.'
            },
            {
              label: 'None',
              value: 'none',
              helpText: 'Allow users to disable two-factor authentication.'
            }
          ]"
          :value="['email', 'mobile']"
          multiple
          readonly
        />
      </div>
    `
  })
}
