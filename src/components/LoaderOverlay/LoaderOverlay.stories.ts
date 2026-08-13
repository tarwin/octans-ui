import { Button } from '@/components/Button'
import { LoaderOverlay, useLoader } from '@/components/LoaderOverlay'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta = {
  title: 'Components/Feedback/LoaderOverlay',
  component: LoaderOverlay,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'The blocking "please wait" overlay, driven by `$ui.loader` (or the',
          '`useLoader()` composable): `show()` dims everything under it until',
          '`hide()`.',
          '',
          'The overlay covers its nearest positioned ancestor — `AppFrame`',
          'includes one over its content area, leaving the nav usable. With no',
          'overlay mounted anywhere, `show()` mounts one covering the whole',
          'viewport, so the API works before any layout exists.',
          '',
          'It can also be driven directly with the `visible` prop, which is',
          "how `AppFrame`'s `loading` prop works. The default slot replaces",
          'the spinner and message.'
        ].join('\n')
      }
    }
  },
  argTypes: {
    visible: { control: 'boolean' },
    message: { control: 'text' },
    fullscreen: { control: 'boolean' }
  }
} satisfies Meta<typeof LoaderOverlay>

export default meta
type Story = StoryObj<typeof meta>

/**
Driven by the `visible` prop, covering its container. Toggle it in the
controls.
*/
export const Primary: Story = {
  args: { visible: true },
  render: (args) => ({
    components: { LoaderOverlay },
    setup: () => ({ args }),
    template: `
      <div
        style="
          position:relative; height:220px;
          border:1px solid var(--octans-border);
          border-radius:var(--octans-radius-box); overflow:hidden;
          padding:16px;
        "
      >
        <p>Content the overlay sits over.</p>
        <LoaderOverlay v-bind="args" />
      </div>
    `
  })
}

/**
Driven by `$ui.loader`. The overlay blocks clicks — including the button that
showed it — so this demo hides itself after two seconds, which is also the
honest shape of real usage: `show()` before the work, `hide()` in `finally`.
*/
export const DrivenByLoader: Story = {
  render: () => ({
    components: { LoaderOverlay, Button },
    setup() {
      const loader = useLoader()
      const showTimed = () => {
        loader.show('Saving your changes...')
        setTimeout(() => loader.hide(), 2000)
      }
      return { showTimed }
    },
    template: `
      <div
        style="
          position:relative; height:220px;
          border:1px solid var(--octans-border);
          border-radius:var(--octans-radius-box); overflow:hidden;
          padding:16px;
        "
      >
        <Button @click="showTimed">loader.show() for two seconds</Button>
        <LoaderOverlay />
      </div>
    `
  })
}

/**
The default slot replaces the spinner and message entirely.
*/
export const CustomContent: Story = {
  args: { visible: true },
  render: (args) => ({
    components: { LoaderOverlay },
    setup: () => ({ args }),
    template: `
      <div
        style="
          position:relative; height:220px;
          border:1px solid var(--octans-border);
          border-radius:var(--octans-radius-box); overflow:hidden;
        "
      >
        <LoaderOverlay v-bind="args">
          <span style="font-size:28px">🐙</span>
          <span style="margin-left:10px">Wrangling tentacles…</span>
        </LoaderOverlay>
      </div>
    `
  })
}
