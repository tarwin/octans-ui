import { Button } from '@/components/Button'
import { LoadingBar, useProgress } from '@/components/LoadingBar'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta = {
  title: 'Components/Feedback/LoadingBar',
  component: LoadingBar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'The page-load trickle bar, driven by `$ui.progress` (or the',
          '`useProgress()` composable): `start()` when a navigation or long',
          'fetch begins, `done()` when it lands. In between, the bar creeps',
          'toward 99% on its own and only `done()` lets it finish.',
          '',
          'The bar renders at the top of its nearest positioned ancestor —',
          '`GlobalNav` includes one, which is where it usually lives. With no',
          'bar mounted anywhere, `start()` mounts one fixed to the top of the',
          'viewport, so the API works before any layout exists.',
          '',
          'The colour can be set per container with `--ui-loadingBar-color`;',
          "`GlobalNav` uses that to keep the bar visible over the save bar's",
          'primary background.'
        ].join('\n')
      }
    }
  },
  argTypes: {
    fixed: { control: 'boolean' },
    height: { control: 'number' }
  }
} satisfies Meta<typeof LoadingBar>

export default meta
type Story = StoryObj<typeof meta>

/**
The bar lives at the top of whatever positioned element contains it. `start()`
jumps it in, `done()` runs it out.
*/
export const Primary: Story = {
  render: (args) => ({
    components: { LoadingBar, Button },
    setup() {
      const { value, start, done } = useProgress()
      return { args, value, start, done }
    },
    template: `
      <div>
        <div
          style="
            position:relative; height:56px; margin-bottom:16px;
            border:1px solid var(--octans-border);
            border-radius:var(--octans-radius-box); overflow:hidden;
          "
        >
          <LoadingBar v-bind="args" />
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <Button @click="start()">progress.start()</Button>
          <Button @click="done()">progress.done()</Button>
          <span>value: {{ Math.round(value) }}</span>
        </div>
      </div>
    `
  })
}
