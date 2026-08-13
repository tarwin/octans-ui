import type { Meta, StoryObj } from '@storybook/vue3-vite'
import PreventAutoComplete from './PreventAutoComplete.vue'

/**
This utility component is a workaround to prevent browsers like Google Chrome
from autocompleting inputs even when they specify `autocomplete="off"`.

  - The workaround may need to evolve over time which is why it is build into
    this component.
  - Currently it works by wrapping the default slot in in a `<form>` element
    with `autocomplete="off"` and uses a noop for the `onsubmit` handler.

This component is used internally by the following form components when their
`autocomplete` prop is set to `"off"`:

  - `<TextField>`
 */
const meta = {
  title: 'Components/Utilities/PreventAutoComplete',
  component: PreventAutoComplete,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof PreventAutoComplete>

export default meta
type Story = StoryObj<typeof meta>

export const Enabled: Story = {
  render: () => ({
    components: { PreventAutoComplete },
    template: `
      <PreventAutoComplete enabled>
        <div>Stuff</div>
      </PreventAutoComplete>
    `
  })
}

export const Disabled: Story = {
  render: () => ({
    components: { PreventAutoComplete },
    template: `
      <PreventAutoComplete :enabled="false">
        <div>Stuff</div>
      </PreventAutoComplete>
    `
  })
}
