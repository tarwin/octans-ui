import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Card, CardSection } from '@/components/Card'
import { Divider } from '@/components/Divider'
import { FormLayout } from '@/components/FormLayout'
import { Icon } from '@/components/Icon'
import { Link } from '@/components/Link'
import { Stack } from '@/components/Stack'
import { TextField } from '@/components/TextField'
import { TextStyle } from '@/components/TextStyle'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

const meta = {
  title: 'Components/Layout/Divider',
  component: Divider,
  tags: ['autodocs'],
  args: {},
  argTypes: {
    placement: {
      control: 'inline-radio',
      options: ['start', 'left', 'center', 'right', 'end']
    },
    spacing: {
      control: 'inline-radio',
      options: ['none', 'extraTight', 'tight', 'loose', 'extraLoose']
    }
  }
} satisfies Meta<typeof Divider>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A rule between two groups of content.
 */
export const Primary: Story = {
  render: () => ({
    components: { Divider },
    template: `
      <div>
        <p>Everything above belongs together.</p>
        <Divider />
        <p>And everything below is something else.</p>
      </div>
    `
  })
}

/**
 * Slot content becomes a label sitting in the rule.
 *
 * A labelled divider is deliberately NOT a `separator` to assistive
 * technology: that role makes its children presentational, so the label would
 * be announced by nobody. The visible text is doing the separating instead.
 */
export const WithLabel: Story = {
  render: () => ({
    components: { Divider },
    template: `
      <div>
        <p>Sign in with your email.</p>
        <Divider>or</Divider>
        <p>Continue with a provider.</p>
      </div>
    `
  })
}

/**
 * `placement` moves the label along the line. `left` and `right` keep a short
 * run of line on the near side; `start` and `end` drop it altogether, so the
 * label begins or ends the divider.
 *
 * The row follows the writing direction, so all five mirror under `dir="rtl"`
 * — `left` and `start` sit where reading begins, on the right.
 */
export const Placement: Story = {
  render: () => ({
    components: { Divider },
    setup: () => ({
      placements: ['start', 'left', 'center', 'right', 'end'] as const
    }),
    template: `
      <div>
        <Divider
          v-for="placement in placements"
          :key="placement"
          :placement="placement"
          spacing="loose"
        >{{ placement }}</Divider>
      </div>
    `
  })
}

/**
 * The label is a slot, so it takes anything — an icon, a badge, a whole button.
 * It lays its contents out as a centred row, which is what keeps an icon on
 * the text's centre line rather than its baseline.
 *
 * An icon on its own says nothing to a screen reader. Where the divider is
 * only decoration that is the point; where the icon carries meaning, put the
 * word next to it as the last two examples do.
 */
export const WithIcons: Story = {
  render: () => ({
    components: { Badge, Button, Divider, Icon },
    template: `
      <div>
        <p>An icon alone, as a flourish between sections.</p>
        <Divider><Icon icon="mdi:star" /></Divider>

        <p>An icon and its label, which is what most section headings want.</p>
        <Divider placement="start">
          <Icon icon="mdi:credit-card-outline" /> Payment
        </Divider>

        <p>Anything else the slot is handed — a badge, or a button.</p>
        <Divider placement="end"><Badge>3 archived</Badge></Divider>
        <Divider>
          <Button type="plain" icon="mdi:plus">Add a step</Button>
        </Divider>
        <p>The button is a real control; the divider around it is not.</p>
      </div>
    `
  })
}

/**
 * `spacing` is the room left on both sides, on the same scale `Stack` uses.
 *
 * It is applied as a margin rather than padding, which is what lets a divider
 * drop into a container that already spaces its children and share the gap
 * that is already there instead of adding a second one.
 */
export const Spacing: Story = {
  render: () => ({
    components: { Divider, TextStyle },
    setup: () => ({
      steps: ['none', 'extraTight', 'tight', undefined, 'loose', 'extraLoose']
    }),
    template: `
      <div>
        <template v-for="step in steps" :key="String(step)">
          <TextStyle type="subdued">{{ step ?? 'default (16px)' }}</TextStyle>
          <Divider :spacing="step" />
        </template>
      </div>
    `
  })
}

/**
 * `vertical` turns the rule on its side, for things sitting next to each other.
 *
 * It takes the height of whatever it is stacked against — inside a `Stack`
 * that is the tallest item — and falls back to one line of text where there is
 * nothing to stretch to.
 */
export const Vertical: Story = {
  render: () => ({
    components: { Divider, Link, Stack, TextStyle },
    template: `
      <div>
        <Stack spacing="tight" alignment="center">
          <Link url="#">Profile</Link>
          <Divider vertical spacing="extraTight" />
          <Link url="#">Billing</Link>
          <Divider vertical spacing="extraTight" />
          <Link url="#">Sign out</Link>
        </Stack>

        <br />

        <Stack spacing="none" alignment="fill">
          <div style="padding: 16px">
            <TextStyle type="strong">Left</TextStyle>
            <p>Two lines here,<br />so this column is taller.</p>
          </div>
          <Divider vertical spacing="none" />
          <div style="padding: 16px">
            <TextStyle type="strong">Right</TextStyle>
            <p>One line.</p>
          </div>
        </Stack>
      </div>
    `
  })
}

/**
 * Inside a `Card`, two `CardSection`s already draw a rule between them — reach
 * for a `Divider` when the split is smaller than a section.
 *
 * A section pads its content by 16px, so a plain divider stops short of the
 * card's edges and does not line up with the section rules above it. `bleed`
 * pulls it back out through that padding. It takes a distance too, for
 * containers padded differently.
 */
export const InACard: Story = {
  render: () => ({
    components: { Card, CardSection, Divider, TextStyle },
    template: `
      <Card title="Order">
        <CardSection>
          <p>The section above is separated by CardSection's own rule.</p>
          <Divider />
          <p>Inset — it stops at the section's padding.</p>
          <Divider bleed />
          <p>Bled — it meets the card's edges, like the section rules do.</p>
        </CardSection>
        <CardSection subdued>
          <TextStyle type="subdued">Another section.</TextStyle>
        </CardSection>
      </Card>
    `
  })
}

/**
 * `FormLayout` puts 16px between its children, and a divider's spacing is a
 * margin, so the two collapse into one 16px gap rather than stacking up to 32.
 * Nothing needs configuring for a divider to sit in a form's rhythm.
 *
 * Labelled dividers are what this is usually for — grouping fields without
 * splitting the form into separate cards.
 */
export const InAFormLayout: Story = {
  render: () => ({
    components: { Button, Card, CardSection, Divider, FormLayout, TextField },
    setup() {
      const name = ref('Ada Lovelace')
      const email = ref('ada@example.com')
      const card = ref('')
      return { name, email, card }
    },
    template: `
      <Card>
        <CardSection>
          <FormLayout>
            <TextField v-model="name" label="Name" />
            <TextField v-model="email" label="Email" type="email" />
            <Divider placement="left">Payment</Divider>
            <TextField v-model="card" label="Card number" />
            <Divider bleed />
            <Button type="primary">Save</Button>
          </FormLayout>
        </CardSection>
      </Card>
    `
  })
}

/**
 * `dashed` is a shortcut for `--Divider-style`, which takes anything
 * `border-style` accepts. Colour and thickness are custom properties too, so a
 * divider — or every divider under a container — can be restyled without
 * reaching for a hashed class name.
 */
export const Styling: Story = {
  render: () => ({
    components: { Divider },
    template: `
      <div>
        <p>Dashed.</p>
        <Divider dashed />
        <p>Dotted, through the custom property.</p>
        <Divider style="--Divider-style: dotted" />
        <p>Thicker, and in the primary colour.</p>
        <Divider style="--Divider-thickness: 3px; --Divider-color: var(--octans-primary)" />
        <p>Every divider in this box at once.</p>
        <div style="--Divider-color: var(--octans-border-strong); --Divider-style: dashed">
          <Divider />
          <Divider>and a label</Divider>
        </div>
      </div>
    `
  })
}
