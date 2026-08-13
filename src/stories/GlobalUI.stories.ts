import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { Button } from '@/components/Button'
import { LoaderOverlay, loader } from '@/components/LoaderOverlay'
import { LoadingBar, progress } from '@/components/LoadingBar'
import { SaveBar, useSaveBar } from '@/components/SaveBar'
import { toast } from '@/components/ToastManager'
import {
  alertModal,
  confirmModal,
  promptModal,
  genericModal
} from '@/components/Modal'
import { format } from '@/utils/format'
import uiProviderDecorator from '@/styleguide/uiProviderDecorator'

/**
 * Live, runnable examples for the global `$ui` helpers. The buttons below call
 * the same functions exposed on `$ui` (imported directly here so they work
 * inside Storybook without installing the plugin).
 */
const meta = {
  title: 'Documentation/Global UI ($ui)',
  decorators: [uiProviderDecorator]
} satisfies Meta

export default meta
type Story = StoryObj

export const Toast: Story = {
  render: () => ({
    components: { Button },
    setup() {
      const showBasic = () =>
        toast({
          title: 'Exhibition published',
          content: 'Your changes are now live.',
          icon: 'mdi:check'
        })

      const showActions = () =>
        toast({
          title: 'Work deleted',
          actions: [
            { label: 'Undo', onAction: () => toast({ title: 'Restored' }) }
          ]
        })

      const showProgress = () => {
        const t = toast({ title: 'Uploading…', loading: true, progress: 0 })
        let p = 0
        const id = setInterval(() => {
          p += 20
          t.progress = p
          if (p >= 100) {
            clearInterval(id)
            t.loading = false
            t.title = 'Upload complete'
          }
        }, 400)
      }

      return { showBasic, showActions, showProgress }
    },
    template: `
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <Button @click="showBasic">Basic toast</Button>
        <Button @click="showActions">With action</Button>
        <Button @click="showProgress">Loading + progress</Button>
      </div>
    `
  })
}

export const Alert: Story = {
  render: () => ({
    components: { Button },
    setup() {
      const open = () =>
        alertModal({
          title: 'Heads up',
          content: 'This action cannot be undone.',
          primaryActionLabel: 'Got it'
        })
      return { open }
    },
    template: `<Button @click="open">Show alert</Button>`
  })
}

export const Confirm: Story = {
  render: () => ({
    components: { Button },
    setup() {
      const result = ref('—')
      const open = () =>
        confirmModal({
          title: 'Delete work?',
          content: 'This will permanently remove the catalogue record.',
          primaryActionLabel: 'Delete',
          primaryActionType: 'destructive',
          secondaryActionLabel: 'Cancel',
          onConfirm: () => (result.value = 'confirmed'),
          onCancel: () => (result.value = 'cancelled')
        })
      return { open, result }
    },
    template: `
      <div style="display:flex; gap:12px; align-items:center;">
        <Button @click="open">Show confirm</Button>
        <span>Result: <strong>{{ result }}</strong></span>
      </div>
    `
  })
}

export const Prompt: Story = {
  render: () => ({
    components: { Button },
    setup() {
      const result = ref('—')
      const open = async () => {
        const value = await promptModal({
          title: 'Rename exhibition',
          inputValue: 'Light and Colour',
          inputPlaceholder: 'Exhibition name',
          inputValidator: (v: string) =>
            v.trim().length > 0 || 'Name is required'
        })
        result.value = typeof value === 'string' ? value : 'cancelled'
      }
      return { open, result }
    },
    template: `
      <div style="display:flex; gap:12px; align-items:center;">
        <Button @click="open">Show prompt</Button>
        <span>Value: <strong>{{ result }}</strong></span>
      </div>
    `
  })
}

export const Modal: Story = {
  render: () => ({
    components: { Button },
    setup() {
      const open = () =>
        genericModal({
          title: 'Details',
          content: 'Any string or VNode can go here as the modal body.',
          primaryAction: { label: 'Close' }
        })
      return { open }
    },
    template: `<Button @click="open">Show modal</Button>`
  })
}

/**
`$ui.progress.start()` / `done()` drive the page-load trickle bar. It renders
in any mounted `LoadingBar` — `GlobalNav` has one built in, and with none
mounted at all, a bar fixed to the top of the viewport appears on first use.
This demo mounts one in a box so it stays visible.
*/
export const Progress: Story = {
  render: () => ({
    components: { Button, LoadingBar },
    setup: () => ({ progress }),
    template: `
      <div>
        <div style="
          position:relative; height:56px; margin-bottom:16px;
          border:1px solid var(--octans-border);
          border-radius:var(--octans-radius-box); overflow:hidden;
        ">
          <LoadingBar />
        </div>
        <div style="display:flex; gap:8px;">
          <Button @click="progress.start()">progress.start()</Button>
          <Button @click="progress.done()">progress.done()</Button>
        </div>
      </div>
    `
  })
}

/**
`$ui.loader.show(message?)` / `hide()` drive the blocking overlay. It renders
in any mounted `LoaderOverlay` — `AppFrame` has one over its content area, and
with none mounted at all, a full-viewport overlay appears on first use. The
overlay blocks clicks, so this demo hides itself after two seconds.
*/
export const Loader: Story = {
  render: () => ({
    components: { Button, LoaderOverlay },
    setup() {
      const showTimed = () => {
        loader.show('Two seconds of patience...')
        setTimeout(() => loader.hide(), 2000)
      }
      return { showTimed }
    },
    template: `
      <div style="
        position:relative; height:200px; padding:16px;
        border:1px solid var(--octans-border);
        border-radius:var(--octans-radius-box); overflow:hidden;
      ">
        <Button @click="showTimed">loader.show() for two seconds</Button>
        <LoaderOverlay />
      </div>
    `
  })
}

/**
`$ui.saveBar` — or the `useSaveBar()` composable shown here — drives the
"Unsaved Changes" bar. The app owns the state: `setState('changed')` shows the
bar, and after a save lands, `setState('unchanged')` hides it. `GlobalNav`
renders the bar itself; the standalone `SaveBar` here stands in for it.
*/
export const SaveBarStory: Story = {
  name: 'Save bar',
  render: () => ({
    components: { Button, SaveBar },
    setup() {
      const { setState } = useSaveBar({
        onSave: () => {
          setState('saving')
          setTimeout(() => setState('unchanged'), 1200)
        },
        onDiscard: () => setState('unchanged')
      })
      return { setState }
    },
    template: `
      <div>
        <div style="
          position:relative; height:40px; margin-bottom:16px;
          border-radius:var(--octans-radius-box); overflow:hidden;
          background:var(--octans-surface-sunken);
        ">
          <SaveBar />
        </div>
        <Button @click="setState('changed')">Make a change</Button>
      </div>
    `
  })
}

export const Format: Story = {
  render: () => ({
    setup() {
      const rows = [
        [`format(1234.5, 'currency')`, format(1234.5, 'currency')],
        [`format(0.873, 'percent')`, format(0.873, 'percent')],
        [`format(1500000, 'integer')`, format(1500000, 'integer')],
        [`format(10485760, 'filesize')`, format(10485760, 'filesize')],
        [`format('2026-01-01', 'dateShort')`, format('2026-01-01', 'dateShort')]
      ]
      return { rows }
    },
    template: `
      <table>
        <thead>
          <tr><th style="text-align:left; padding-right:24px;">Call</th><th style="text-align:left;">Output</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row[0]">
            <td style="padding-right:24px;"><code>{{ row[0] }}</code></td>
            <td><strong>{{ row[1] }}</strong></td>
          </tr>
        </tbody>
      </table>
    `
  })
}
