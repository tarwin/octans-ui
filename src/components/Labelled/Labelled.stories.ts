import { Labelled } from '@/components/Labelled'
import { Stack } from '@/components/Stack'
import { TextField } from '@/components/TextField'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta = {
  title: 'Components/Forms/Labelled',
  component: Labelled,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof Labelled>

export default meta
type Story = StoryObj<typeof meta>

/**
`Labelled` wraps arbitrary content with a label, and optionally an error
message and/or help text below it. It's what `TextField`, `Select` and
other form controls use internally, but it's also handy on its own when
you're building a custom form field that isn't one of the standard inputs.
*/
export const Basic: Story = {
  render: () => ({
    components: { Labelled },
    template: `
      <Labelled label="Store name">
        <input type="text" placeholder="Acme Inc." />
      </Labelled>
    `
  })
}

export const WithHelpText: Story = {
  render: () => ({
    components: { Labelled },
    template: `
      <Labelled
        label="Store name"
        help-text="This appears on your invoices and receipts."
      >
        <input type="text" placeholder="Acme Inc." />
      </Labelled>
    `
  })
}

export const WithHelpTextHtml: Story = {
  render: () => ({
    components: { Labelled },
    template: `
      <Labelled
        label="Store name"
        help-text-html="This appears on your invoices, see <a href='#' onclick='return false;'>an example</a>."
      >
        <input type="text" placeholder="Acme Inc." />
      </Labelled>
    `
  })
}

export const WithHelpLink: Story = {
  render: () => ({
    components: { Labelled },
    template: `
      <Labelled
        label="Store name"
        help-link="https://example.com"
      >
        <input type="text" placeholder="Acme Inc." />
      </Labelled>
    `
  })
}

export const WithError: Story = {
  render: () => ({
    components: { Labelled },
    template: `
      <Labelled
        label="Store name"
        error="Store name is required."
      >
        <input type="text" />
      </Labelled>
    `
  })
}

/** @deprecated Renders the label in bold. Prefer marking required fields another way. */
export const Required: Story = {
  render: () => ({
    components: { Labelled },
    template: `
      <Labelled
        label="Store name"
        required
      >
        <input type="text" placeholder="Acme Inc." />
      </Labelled>
    `
  })
}

/**
The `label` scoped slot lets you fully customize the label markup, while
still getting access to the `label` prop, `helpLink` prop and the
`className` needed to keep the default label styling.
*/
export const CustomLabelSlot: Story = {
  render: () => ({
    components: { Labelled },
    template: `
      <Labelled label="Store name" help-link="https://example.com">
        <template #label="{ label, helpLink, className }">
          <div :class="className" style="display: flex; justify-content: space-between;">
            <span>{{ label }}</span>
            <a :href="helpLink" target="_blank">Learn more</a>
          </div>
        </template>
        <input type="text" placeholder="Acme Inc." />
      </Labelled>
    `
  })
}

/**
Multiple form elements can be wrapped by a single `Labelled`, which is
useful for building custom composite fields.
*/
export const WithMultipleChildren: Story = {
  render: () => ({
    components: { Labelled },
    template: `
      <Labelled
        label="Price range"
        help-text="Set the minimum and maximum price customers can enter."
      >
        <div style="display: flex; gap: 8px;">
          <input type="number" placeholder="Min" />
          <input type="number" placeholder="Max" />
        </div>
      </Labelled>
    `
  })
}

/**
Every option combined: a label, a help link, an error, and help text, all
around a couple of standard inputs.
*/
export const Everything: Story = {
  render: () => ({
    components: { Labelled },
    template: `
      <Labelled
        label="Store name"
        help-link="https://example.com"
        error="Store name is required."
        help-text="This appears on your invoices and receipts."
      >
        <input type="text" />
      </Labelled>
    `
  })
}

/**
Because most inputs (`TextField`, `Select`, etc.) already use `Labelled`
internally, you don't normally need to reach for it directly unless
you're wrapping something custom, like a group of related fields.
*/
export const UsageWithExistingInputs: Story = {
  render: () => ({
    components: { Labelled, TextField, Stack },
    template: `
      <Stack vertical>
        <TextField label="Store name" placeholder="Acme Inc." />
        <Labelled
          label="Shipping address"
          help-text="Used to calculate shipping rates."
        >
          <Stack vertical spacing="tight">
            <input type="text" placeholder="Address line 1" />
            <input type="text" placeholder="Address line 2" />
            <div style="display: flex; gap: 8px;">
              <input type="text" placeholder="City" />
              <input type="text" placeholder="Postal code" />
            </div>
          </Stack>
        </Labelled>
      </Stack>
    `
  })
}
