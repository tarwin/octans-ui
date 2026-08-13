import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ThemeBuilder from './ThemeBuilder.vue'
import KitchenSink from './KitchenSink.vue'

const meta = {
  title: 'Documentation/Theme Builder',
  component: ThemeBuilder,
  parameters: {
    surface: 'app',
    layout: 'fullscreen',
    // The builder drives the theme itself; the toolbar toggle would fight it.
    theme: { disable: true },
    // A full-page tool has no args, so the addons panel is dead space.
    options: { showPanel: false },
    docs: {
      description: {
        component: [
          'Build a custom theme on top of light or dark, preview it against a',
          'kitchen sink of components, and save it to this browser.',
          '',
          'Themes are stored as **sparse overrides** — only the tokens you',
          'changed. That keeps them inheriting future changes to the base',
          'theme, which a full snapshot would freeze.'
        ].join('\n')
      }
    }
  }
} satisfies Meta<typeof ThemeBuilder>

export default meta
type Story = StoryObj<typeof meta>

/**
Edit any token and the preview below updates live. Saved themes persist in
`localStorage` under `octans-custom-themes`, so they survive a reload but never
leave the browser.

Use **Copy** to take the JSON elsewhere, or paste a theme in and press
**Apply JSON**. Unknown token names are rejected rather than silently ignored,
so a typo surfaces immediately.
*/
export const Builder: Story = {}

/**
The preview on its own, for checking the built-in light and dark themes with the
toolbar's Theme control.
*/
export const Preview: StoryObj = {
  parameters: { theme: { disable: false } },
  render: () => ({
    components: { KitchenSink },
    template: '<KitchenSink />'
  })
}
