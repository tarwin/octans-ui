import { Button } from '@/components/Button'
import { GlobalNav } from '@/components/GlobalNav'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import SaveBarController from './SaveBarController.vue'

/**
    **Deprecated** — use the `useSaveBar()` composable instead: the same
    events as callbacks, plus direct access to the state, without a component
    in the template. This renderless wrapper remains for compatibility.

    Usage:

      - Use `v-if` to conditionally render the SaveBarController. This will cause the Save Bar to show or hide in any GlobalNav component on the same page.

      - Use the `@save` event to listen for the user's confirmation to save changes.

      - Use the `@discard` event to listen for the user's confirmation to discard changes.

    **Note:** You do not need this component if you are already using the `<Page>` component as it exposes the same functionality through its `changed` prop and its `@save` and `@discard` events.
 */
const meta = {
  title: 'Components/Utilities/SaveBarController',
  component: SaveBarController,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof SaveBarController>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { SaveBarController, Button, GlobalNav },
    setup() {
      return {
        current: ref(false),
        original: ref(false)
      }
    },
    template: `
      <div>
        <GlobalNav/>
        <SaveBarController
          v-if="current !== original"
          @save="original = current"
          @discard="current = original"
        />
        <br>
        <Button
          @click="current = !current"
        >Flip</Button>
        <pre>original: {{original}}</pre>
        <pre>current: {{current}}</pre>
      </div>
    `
  })
}
