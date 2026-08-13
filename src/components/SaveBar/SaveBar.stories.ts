import { Button } from '@/components/Button'
import { SaveBar, useSaveBar } from '@/components/SaveBar'
import uiProviderDecorator from '@/styleguide/uiProviderDecorator'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

const meta = {
  title: 'Components/Feedback/SaveBar',
  component: SaveBar,
  tags: ['autodocs'],
  decorators: [uiProviderDecorator],
  parameters: {
    docs: {
      description: {
        component: [
          'The "Unsaved Changes" bar, promoted from a `GlobalNav` internal to',
          'a component you can mount anywhere — over a top bar, over a single',
          'section, wherever the edit surface is. `GlobalNav` still includes',
          'one, so with a `GlobalNav` there is nothing to mount.',
          '',
          'The bar follows the global `$ui.saveBar` state: `setState("changed")`',
          'shows it, `setState("saving")` disables its buttons and spins, and',
          '`setState("unchanged")` hides it. The app owns that state — clicking',
          'Save only *announces* the click (to `useSaveBar`/`onSave`',
          'subscribers); it is the app that says when the save has landed.',
          '',
          'It fills the width of its nearest positioned ancestor. Discard asks',
          'for confirmation before announcing — turn that off with',
          '`confirmDiscard: false` when the edits at stake are trivial',
          '(`saveBarConfirmDiscard` on `GlobalNav`).'
        ].join('\n')
      }
    }
  },
  argTypes: {
    state: {
      control: 'select',
      options: [undefined, 'unchanged', 'changed', 'saving']
    },
    layoutMode: { control: 'select', options: ['default', 'alternate'] },
    confirmDiscard: { control: 'boolean' }
  }
} satisfies Meta<typeof SaveBar>

export default meta
type Story = StoryObj<typeof meta>

/**
The full loop with `useSaveBar()`: edits mark the state `changed`, Save flips
it to `saving` while the (simulated) request runs, then `unchanged` hides the
bar. Discard confirms, then resets.
*/
export const Primary: Story = {
  render: () => ({
    components: { SaveBar, Button },
    setup() {
      const log = ref('—')
      const { setState } = useSaveBar({
        onSave: () => {
          log.value = 'saving…'
          setState('saving')
          setTimeout(() => {
            setState('unchanged')
            log.value = 'saved'
          }, 1200)
        },
        onDiscard: () => {
          setState('unchanged')
          log.value = 'discarded'
        }
      })
      return { setState, log }
    },
    template: `
      <div>
        <div
          style="
            position:relative; height:40px; margin-bottom:16px;
            border-radius:var(--octans-radius-box); overflow:hidden;
            background:var(--octans-surface-sunken);
          "
        >
          <SaveBar />
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <Button @click="setState('changed')">Make a change</Button>
          <span>last action: <strong>{{ log }}</strong></span>
        </div>
      </div>
    `
  })
}

/**
Driven directly by the `state` prop instead of the global state — for a bar
that belongs to one isolated surface.
*/
export const DrivenByProp: Story = {
  args: { state: 'changed' },
  render: (args) => ({
    components: { SaveBar },
    setup: () => ({ args }),
    template: `
      <div
        style="
          position:relative; height:40px;
          border-radius:var(--octans-radius-box); overflow:hidden;
        "
      >
        <SaveBar v-bind="args" />
      </div>
    `
  })
}

/**
Every built-in string is replaceable through `translations`.
*/
export const Translated: Story = {
  args: {
    state: 'changed',
    translations: {
      unsavedChanges: 'Você tem alterações não salvas',
      save: 'Salvar',
      discard: 'Descartar'
    }
  },
  render: (args) => ({
    components: { SaveBar },
    setup: () => ({ args }),
    template: `
      <div
        style="
          position:relative; height:40px;
          border-radius:var(--octans-radius-box); overflow:hidden;
        "
      >
        <SaveBar v-bind="args" />
      </div>
    `
  })
}
