import { Card, CardSection } from '@/components/Card'
import { FormLayout } from '@/components/FormLayout'
import { SegmentedControl } from '@/components/SegmentedControl'
import { Stack } from '@/components/Stack'
import { TextField } from '@/components/TextField'
import { TextStyle } from '@/components/TextStyle'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

const RANGE = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' }
]

const meta = {
  title: 'Components/Forms/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  args: {
    options: RANGE,
    modelValue: 'week'
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['small', 'medium', 'large'] }
  }
} satisfies Meta<typeof SegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A row of segments where exactly one is selected.
 *
 * Underneath it is one `<input type="radio">` per segment, hidden inside its
 * label. That is where the keyboard behaviour comes from and it is worth
 * trying: `Tab` moves onto the control **once**, and the arrow keys move
 * between the segments from there, wrapping at the ends.
 *
 * Because they are real radios, selection follows focus — arrowing across the
 * control changes the value at every stop. That is correct for a radio group,
 * but debounce anything expensive hanging off `@change`.
 */
export const Primary: Story = {
  render: (args) => ({
    components: { SegmentedControl, TextStyle },
    setup() {
      const range = ref('week')
      return { args, range }
    },
    template: `
      <div>
        <SegmentedControl v-bind="args" v-model="range" />
        <p><TextStyle type="subdued">Showing: {{ range }}</TextStyle></p>
      </div>
    `
  })
}

/**
 * `size` is `Button`'s scale, and the numbers are shared deliberately: a
 * segmented control beside a button in a toolbar is the same height as it —
 * 30, 36 and 44px.
 */
export const Sizes: Story = {
  render: () => ({
    components: { SegmentedControl, Stack, TextStyle },
    setup: () => ({
      options: RANGE,
      range: ref('week'),
      sizes: ['small', 'medium', 'large'] as const
    }),
    template: `
      <Stack vertical spacing="tight">
        <div v-for="size in sizes" :key="size">
          <TextStyle type="subdued">{{ size }}</TextStyle>
          <div>
            <SegmentedControl :options="options" :size="size" v-model="range" />
          </div>
        </div>
      </Stack>
    `
  })
}

/**
 * By default each segment is as wide as its own label. `fullWidth` stretches
 * the control to its container and gives every segment an equal share of it,
 * which is what you want above a panel it is switching.
 *
 * Labels that then don't fit are truncated rather than wrapped — a segment is
 * one line high.
 */
export const FullWidth: Story = {
  render: () => ({
    components: { SegmentedControl },
    setup: () => ({
      view: ref('transactions'),
      options: [
        { label: 'Overview', value: 'overview' },
        { label: 'Transactions', value: 'transactions' },
        { label: 'Payouts', value: 'payouts' }
      ]
    }),
    template: `
      <div style="max-width: 420px">
        <SegmentedControl :options="options" v-model="view" full-width />
      </div>
    `
  })
}

/**
 * An `icon` on an option is drawn before its label.
 */
export const WithIcons: Story = {
  render: () => ({
    components: { SegmentedControl },
    setup: () => ({
      view: ref('chart'),
      options: [
        { label: 'Table', value: 'table', icon: 'mdi:format-list-checks' },
        { label: 'Chart', value: 'chart', icon: 'mdi:chart-line' },
        { label: 'Calendar', value: 'calendar', icon: 'mdi:calendar-today' }
      ]
    }),
    template: `<SegmentedControl :options="options" v-model="view" />`
  })
}

/**
 * A segment with an icon and no label needs a `tooltip` — an icon is a picture
 * to a screen reader, and the tooltip is used as the segment's accessible name
 * as well as being shown on hover. Without one the segment has no name at all.
 *
 * The group needs naming too, since there is no visible label to do it:
 * `ariaLabel` is for exactly that.
 */
export const IconOnly: Story = {
  render: () => ({
    components: { SegmentedControl },
    setup: () => ({
      visibility: ref('unlisted'),
      options: [
        { value: 'public', icon: 'mdi:eye', tooltip: 'Public' },
        { value: 'unlisted', icon: 'mdi:eye-off', tooltip: 'Unlisted' },
        { value: 'private', icon: 'mdi:lock', tooltip: 'Private' }
      ]
    }),
    template: `
      <SegmentedControl
        :options="options"
        v-model="visibility"
        aria-label="Visibility"
      />
    `
  })
}

/**
 * `vertical` stacks the segments. Worth it past three or four long labels,
 * where a row would either truncate or run off the side.
 */
export const Vertical: Story = {
  render: () => ({
    components: { SegmentedControl },
    setup: () => ({
      audience: ref('following'),
      options: [
        { label: 'Everyone', value: 'everyone' },
        { label: 'People I follow', value: 'following' },
        { label: 'Only me', value: 'me' }
      ]
    }),
    template: `<SegmentedControl :options="options" v-model="audience" vertical />`
  })
}

/**
 * `disabled` greys the whole control out; a single option can carry its own.
 *
 * `readonly` is the other one: the control keeps its normal colour and stays
 * focusable, so the value can still be read, but it refuses to move. Try
 * arrowing through it — the selection stays where it is.
 */
export const DisabledAndReadonly: Story = {
  render: () => ({
    components: { SegmentedControl, Stack, TextStyle },
    setup: () => ({
      options: RANGE,
      range: ref('week'),
      partly: [
        { label: 'Day', value: 'day' },
        { label: 'Week', value: 'week' },
        { label: 'Month', value: 'month', disabled: true }
      ]
    }),
    template: `
      <Stack vertical spacing="tight">
        <div>
          <TextStyle type="subdued">One option disabled — the arrow keys skip it</TextStyle>
          <div><SegmentedControl :options="partly" v-model="range" /></div>
        </div>
        <div>
          <TextStyle type="subdued">The whole control disabled</TextStyle>
          <div><SegmentedControl :options="options" v-model="range" disabled /></div>
        </div>
        <div>
          <TextStyle type="subdued">Readonly — focusable, unchangeable</TextStyle>
          <div><SegmentedControl :options="options" v-model="range" readonly /></div>
        </div>
      </Stack>
    `
  })
}

/**
 * Give it a `label` and it becomes a form field: the label, error and help text
 * are the same `Labelled` wrapper every other field in the library uses, so it
 * lines up inside a `FormLayout` without any arrangement.
 *
 * Leave `label` off for a toolbar control and name the group with `ariaLabel`
 * instead — the group still needs a name either way.
 */
export const AsAFormField: Story = {
  render: () => ({
    components: {
      Card,
      CardSection,
      FormLayout,
      SegmentedControl,
      TextField
    },
    setup() {
      const name = ref('Ada Lovelace')
      const billing = ref('monthly')
      const plan = ref('')
      return {
        name,
        billing,
        plan,
        cycles: [
          { label: 'Monthly', value: 'monthly' },
          { label: 'Yearly', value: 'yearly', tooltip: 'Two months free' }
        ],
        plans: [
          { label: 'Starter', value: 'starter' },
          { label: 'Team', value: 'team' },
          { label: 'Enterprise', value: 'enterprise' }
        ]
      }
    },
    template: `
      <Card title="Subscription">
        <CardSection>
          <FormLayout>
            <TextField v-model="name" label="Billed to" />
            <SegmentedControl
              v-model="billing"
              :options="cycles"
              label="Billing cycle"
              help-text="Change it whenever you like — we prorate."
            />
            <SegmentedControl
              v-model="plan"
              :options="plans"
              label="Plan"
              error="Pick a plan to continue"
            />
          </FormLayout>
        </CardSection>
      </Card>
    `
  })
}

/**
 * The switcher it is most often reached for: choosing which view of the same
 * data you are looking at.
 *
 * This is the line between it and `Tabs`. Tabs are page furniture — full
 * width, underlined, usually route-backed — and they own the panels beneath
 * them. A segmented control just produces a value; what you do with it is your
 * business, and it will sit in a card header without taking the whole width.
 */
export const AViewSwitcher: Story = {
  render: () => ({
    components: { Card, CardSection, SegmentedControl, Stack, TextStyle },
    setup() {
      const view = ref('chart')
      return {
        view,
        options: [
          { label: 'Table', value: 'table', icon: 'mdi:format-list-checks' },
          { label: 'Chart', value: 'chart', icon: 'mdi:chart-line' }
        ]
      }
    },
    template: `
      <Card title="Revenue">
        <CardSection>
          <Stack alignment="center" distribution="equalSpacing">
            <TextStyle type="strong">Last 30 days</TextStyle>
            <SegmentedControl
              v-model="view"
              :options="options"
              size="small"
              aria-label="View"
            />
          </Stack>
        </CardSection>
        <CardSection subdued>
          <TextStyle type="subdued">The {{ view }} would go here.</TextStyle>
        </CardSection>
      </Card>
    `
  })
}

/**
 * The track and the selected segment are custom properties, so one control —
 * or every control inside a container — can be restyled without reaching for a
 * hashed class name. `SegmentedControl-segment` and `-selected` are unhashed
 * hooks for anything the properties don't cover.
 */
export const Styling: Story = {
  render: () => ({
    components: { SegmentedControl, Stack, TextStyle },
    setup: () => ({
      options: RANGE,
      plain: ref('week'),
      tinted: ref('week'),
      inverted: ref('week'),
      alsoInverted: ref('day')
    }),
    template: `
      <Stack vertical spacing="tight">
        <div>
          <TextStyle type="subdued">Default</TextStyle>
          <div><SegmentedControl :options="options" v-model="plain" /></div>
        </div>
        <div>
          <TextStyle type="subdued">A tinted track</TextStyle>
          <div>
            <SegmentedControl
              :options="options"
              v-model="tinted"
              style="--SegmentedControl-trackColor: var(--octans-primary-surface)"
            />
          </div>
        </div>
        <div>
          <TextStyle type="subdued">Every control in this box at once</TextStyle>
          <div style="--SegmentedControl-selectedColor: var(--octans-primary); --SegmentedControl-selectedTextColor: var(--octans-text-on-primary); --SegmentedControl-selectedBorderColor: transparent">
            <SegmentedControl :options="options" v-model="inverted" />
            <SegmentedControl :options="options" v-model="alsoInverted" />
          </div>
        </div>
      </Stack>
    `
  })
}
