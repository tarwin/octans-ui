import { Badge } from '@/components/Badge'
import { Stack, StackItem } from '@/components/Stack'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Components/Layout/Stack',
  component: Stack,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof Stack>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => ({
    components: { Stack, Badge },
    setup() {
      const value = ref(false)
      return {
        value
      }
    },
    template: `
      <Stack>
        <Badge>One</Badge>
        <Badge>Two</Badge>
        <Badge>Three</Badge>
        <Badge>Four</Badge>
      </Stack>
    `
  })
}

export const NonWrapping: Story = {
  render: () => ({
    components: { Stack, Badge },
    setup() {
      const value = ref(false)
      return {
        value
      }
    },
    template: `
      <Stack :wrap="false">
        <Badge>One</Badge>
        <Badge>Two</Badge>
        <Badge>Three</Badge>
        <Badge>Four</Badge>
      </Stack>
    `
  })
}

export const Alignment: Story = {
  render: () => ({
    components: { Stack, Badge },
    setup() {
      const value = ref(false)
      return {
        value
      }
    },
    template: `
      <div>
        Aligns items along the stack's cross axis. By default the stack items are laid
        out in a horizontal row and this will affect how they are aligned vertically.
      </div>
      <div>
        <h1>default</h1>
        <Stack>
          <div>One<br>one<br>one</div>
          <div>Two</div>
        </Stack>
        <br>
        <h1>leading</h1>
        <Stack alignment="leading">
          <div>One<br>one<br>one</div>
          <div>Two</div>
        </Stack>
        <br>
        <h1>trailing</h1>
        <Stack alignment="trailing">
          <div>One<br>one<br>one</div>
          <div>Two</div>
        </Stack>
        <br>
        <h1>center</h1>
        <Stack alignment="center">
          <div>One<br>one<br>one</div>
          <div>Two</div>
        </Stack>
        <br>
        <h1>fill</h1>
        <Stack alignment="fill">
          <div>One<br>one<br>one</div>
          <div>Two</div>
        </Stack>
        <br>
        <h1>baseline</h1>
        <Stack alignment="baseline">
          <div>One<br>one<br>one</div>
          <div>Two</div>
        </Stack>
      </div>
    `
  })
}

export const Distribution: Story = {
  render: () => ({
    components: { Stack, Badge },
    setup() {
      const value = ref(false)
      return {
        value
      }
    },
    template: `
      <div>
      Defines how stack items are aligned along the main axis.
      </div>
      <div>
        <h1>default</h1>
        <Stack>
          <Badge>One</Badge>
          <Badge>Two</Badge>
          <Badge>Three</Badge>
        </Stack>
        <br>
        <h1>equalSpacing</h1>
        <Stack distribution="equalSpacing">
          <Badge>One</Badge>
          <Badge>Two</Badge>
          <Badge>Three</Badge>
        </Stack>
        <br>
        <h1>leading</h1>
        <Stack distribution="leading">
          <Badge>One</Badge>
          <Badge>Two</Badge>
          <Badge>Three</Badge>
        </Stack>
        <br>
        <h1>trailing</h1>
        <Stack distribution="trailing">
          <Badge>One</Badge>
          <Badge>Two</Badge>
          <Badge>Three</Badge>
        </Stack>
        <br>
        <h1>center</h1>
        <Stack distribution="center">
          <Badge>One</Badge>
          <Badge>Two</Badge>
          <Badge>Three</Badge>
        </Stack>
        <br>
        <h1>fill</h1>
        <Stack distribution="fill">
          <Badge>One</Badge>
          <Badge>Two</Badge>
          <Badge>Three</Badge>
        </Stack>
        <br>
        <h1>fillEvenly</h1>
        <Stack distribution="fillEvenly">
          <Badge>One</Badge>
          <Badge>Two</Badge>
          <Badge>Three</Badge>
        </Stack>
      </div>
    `
  })
}

export const Spacing: Story = {
  render: () => ({
    components: { Stack, Badge },
    setup() {
      const value = ref(false)
      return {
        value
      }
    },
    template: `
      <div>
        <h1>default</h1>
        <Stack>
          <Badge>One</Badge>
          <Badge>Two</Badge>
          <Badge>Three</Badge>
        </Stack>
        <br>
        <h1>extraTight</h1>
        <Stack spacing="extraTight">
          <Badge>One</Badge>
          <Badge>Two</Badge>
          <Badge>Three</Badge>
        </Stack>
        <br>
        <h1>tight</h1>
        <Stack spacing="tight">
          <Badge>One</Badge>
          <Badge>Two</Badge>
          <Badge>Three</Badge>
        </Stack>
        <br>
        <h1>loose</h1>
        <Stack spacing="loose">
          <Badge>One</Badge>
          <Badge>Two</Badge>
          <Badge>Three</Badge>
        </Stack>
        <br>
        <h1>extraLoose</h1>
        <Stack spacing="extraLoose">
          <Badge>One</Badge>
          <Badge>Two</Badge>
          <Badge>Three</Badge>
        </Stack>
        <br>
        <h1>none</h1>
        <Stack spacing="none">
          <Badge>One</Badge>
          <Badge>Two</Badge>
          <Badge>Three</Badge>
        </Stack>
      </div>
    `
  })
}

/**
 * By default the main axis of the stack is horizontal (items are in a row). This
 * property flips that so the main axis is vertical.
 */
export const Vertical: Story = {
  render: () => ({
    components: { Stack, Badge },
    setup() {
      const value = ref(false)
      return {
        value
      }
    },
    template: `
      <Stack vertical>
        <Badge>One</Badge>
        <Badge>Two</Badge>
        <Badge>Three</Badge>
      </Stack>
    `
  })
}

// By default all items are automatically wrapped in a 'StackItem'. You can
// wrap one item manually in order to pass it the 'fill' prop.
export const StackWhereSingleItemFillsRemainingSpace: Story = {
  render: () => ({
    components: { Stack, StackItem, Badge },
    setup() {
      const value = ref(false)
      return {
        value
      }
    },
    template: `
      <Stack>
        <StackItem fill>
          <Badge>One</Badge>
        </StackItem>
        <Badge>Two</Badge>
        <Badge>Three</Badge>
      </Stack>
    `
  })
}
