import type { Meta, StoryObj } from '@storybook/vue3-vite'
import KeyboardKey from './KeyboardKey.vue'

const meta = {
  title: 'Components/Typography/KeyboardKey',
  component: KeyboardKey,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof KeyboardKey>

export default meta
type Story = StoryObj<typeof meta>

/**
  A single key, for documenting a shortcut in running text.

  It renders a real `<kbd>`, which is what says "keyboard input" to anything
  reading the page rather than looking at it — the styling is the smaller half
  of the job. Keys in a sequence space themselves, so you can set them straight
  next to each other.
 */
export const Default: Story = {
  render: () => ({
    components: { KeyboardKey },
    template: `
      <div style="line-height: 2">
        Press <KeyboardKey>⌘</KeyboardKey><KeyboardKey>K</KeyboardKey>
        to search, or <KeyboardKey>Esc</KeyboardKey> to close.
      </div>
    `
  })
}

/**
  `size="small"` for a shortcut sitting inside a menu row or a table cell,
  where a full-size key would set the row height.
 */
export const Small: Story = {
  render: () => ({
    components: { KeyboardKey },
    template: `
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 220px;
          padding: 6px 10px;
          border: 1px solid var(--octans-border);
          border-radius: var(--octans-radius-box);
        "
      >
        <span>Save</span>
        <span>
          <KeyboardKey size="small">⌘</KeyboardKey>
          <KeyboardKey size="small">S</KeyboardKey>
        </span>
      </div>
    `
  })
}

/**
  The `label` prop is the same thing as the default slot, for when the key
  comes from data rather than from the template.
 */
export const FromData: Story = {
  render: () => ({
    components: { KeyboardKey },
    setup() {
      return { keys: ['Ctrl', 'Shift', 'P'] }
    },
    template: `
      <span>
        <KeyboardKey v-for="key in keys" :key="key" :label="key" />
      </span>
    `
  })
}
