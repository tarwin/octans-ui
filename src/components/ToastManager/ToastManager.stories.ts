import { Button } from '@/components/Button'
import { Stack } from '@/components/Stack'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ToastManager from './ToastManager.vue'
import { genericModal } from '@/components/Modal'
import { type ToastManagerItemType } from './types'
import { toast } from '@/components/ToastManager'

const meta = {
  title: 'Components/Feedback/ToastManager',
  component: ToastManager,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof ToastManager>

export default meta
type Story = StoryObj<typeof meta>

/**
  ## API

  ### toast()

  Displays a toast on the page.

  ### Basic example

  - The `title` prop displays the primary text. This is the only required prop.
  - The `content` prop displays additional secondary text.
  - The `duration` prop controls how long the toast is shown for in milliseconds. This defaults to `4500`.
  - The `toast.clearAll()` method removes all visible toasts.

  ### Where toasts render

  Nothing needs to be placed in your page — `toast()` mounts a host the first
  time it is called. Render a `<ToastManager>` somewhere yourself if you want to
  set `position`, `offset` or `contrasting` with props; `toast()` will draw into
  it and stand its own host down, so toasts are never rendered twice.
  `toast.configure()` sets the same three as defaults and wins over the props,
  which is what makes it the way to configure the auto-mounted host.
 */
export const BasicExample: Story = {
  render: () => ({
    components: { Button, Stack },
    setup() {
      function show1() {
        toast({
          title: 'Simple toast'
        })
      }
      function show2() {
        toast({
          title: 'Toast with content',
          content: 'Here is some nice content for you to read'
        })
      }
      function show3() {
        toast({
          title: 'Long-lived toast',
          content: 'This toast is going to stick around for 10 seconds!',
          duration: 10000
        })
      }
      function showModal() {
        genericModal({
          title: 'modal'
        })
      }
      return { show1, show2, show3, clearAll: toast.clearAll, showModal }
    },
    template: `
      <Stack spacing="tight">
        <Button @click="show1">Show toast</Button>
        <Button @click="show2">Show toast with content</Button>
        <Button @click="show3">Show long-lived toast</Button>
        <Button @click="showModal">modal</Button>
        <Button @click="clearAll">Clear all</Button>
      </Stack>
    `
  })
}

/**
 * The `toast()` method returns a reactive instance of the toast which allows you
 * to make updates to the toast after it is created.
 * The `loading` prop replaces the close button with a spinner and removes the
 * default duration.
 * The `progress` prop displays a progress bar.
 * The `remove()` method on the toast can be used to programmatically hide it.
 */
export const LoadingAndProgressExample: Story = {
  render: () => ({
    components: { Button, Stack },
    setup() {
      function show1() {
        toast({
          title: 'Please wait forever',
          content:
            "The user will never be able to close this so maybe it's not a great idea..",
          loading: true
        })
      }
      function show2() {
        const toastInst = toast({
          title: 'Please wait 3 seconds',
          loading: true
        })
        setTimeout(() => {
          toastInst.loading = false
          toastInst.content =
            'I will automatically hide in another 3 seconds if you wait a bit..'
        }, 3000)
        setTimeout(() => {
          toastInst.remove()
        }, 6000)
      }
      function show3() {
        const toastInst = toast({
          title: 'Task',
          content: 'Preparing task..',
          loading: true
        })
        setTimeout(() => {
          toastInst.content = 'Doing the important thingy..'
          toastInst.progress = 0
          const id = setInterval(() => {
            if (toastInst.progress && toastInst.progress > 100) {
              toastInst.progress = undefined
              toastInst.content = 'Finished doing the thing!'
              toastInst.loading = false
              clearInterval(id)
            } else {
              toastInst.progress! += Math.random() * 25
            }
          }, 500)
        }, 2000)
      }
      return { show1, show2, show3, clearAll: toast.clearAll }
    },
    template: `
      <Stack spacing="tight">
        <Button @click="show1">Show forever loading toast</Button>
        <Button @click="show2">Show toast that loads for 3 seconds</Button>
        <Button @click="show3">Show loading and progress toast</Button>
        <Button @click="clearAll">Clear all</Button>
      </Stack>
    `
  })
}

/**
 * Regression check that the instance returned by `toast()` is reactive:
 * every prop mutated on it after creation — `title`, `icon`, `content` and
 * `progress` — must be reflected in the visible toast. The button shows a
 * toast that walks through three fake upload stages, updating all of those
 * props from the outside, and removes itself when done.
 */
export const PostCreationUpdates: Story = {
  render: () => ({
    components: { Button, Stack },
    setup() {
      function show1() {
        const stages = [
          {
            title: 'Preparing',
            icon: 'mdi:file-outline',
            content: 'Reading file..'
          },
          { title: 'Uploading', icon: 'mdi:upload', content: 'Sending data..' },
          { title: 'Done', icon: 'mdi:check', content: 'File uploaded!' }
        ]
        const toastInst = toast({ ...stages[0], progress: 0 })
        let stage = 0
        const id = setInterval(() => {
          toastInst.progress = (toastInst.progress || 0) + 20
          const nextStage = Math.min(
            Math.floor(toastInst.progress / 40),
            stages.length - 1
          )
          if (nextStage !== stage) {
            stage = nextStage
            Object.assign(toastInst, stages[stage])
          }
          if (toastInst.progress >= 100) {
            clearInterval(id)
            setTimeout(() => toastInst.remove(), 1500)
          }
        }, 600)
      }
      return { show1, clearAll: toast.clearAll }
    },
    template: `
      <Stack spacing="tight">
        <Button @click="show1">Show self-updating toast</Button>
        <Button @click="clearAll">Clear all</Button>
      </Stack>
    `
  })
}

/**
 * When actions are used, the default `duration` is not applied.
 */
export const ActionsExample: Story = {
  render: () => ({
    components: { Button, Stack },
    setup() {
      function show1() {
        const toastInst: ToastManagerItemType = toast({
          title: 'Simple toast',
          content: `I'm not sure why you'd want to give users choices in a toast but it is possible..`,
          actions: [
            {
              label: 'Close me',
              onAction: () => toastInst.remove()
            },
            {
              label: 'Alert',
              onAction: () => alert('You clicked the alert')
            }
          ]
        })
      }
      return { show1, clearAll: toast.clearAll }
    },
    template: `
      <Stack spacing="tight">
        <Button @click="show1">Show actions toast</Button>
        <Button @click="clearAll">Clear all</Button>
      </Stack>
    `
  })
}

/**
 * The `position` prop places a toast at any edge or corner of the viewport
 * using compass points: `n`, `ne`, `e`, `se` (the default), `s`, `sw`, `w`
 * and `nw`. Each position keeps its own stack, and toasts animate in from
 * the edge their stack anchors to.
 *
 * `toast.configure()` sets manager-wide defaults: the default `position`,
 * the default `contrasting` theme, and `offset` — extra distance in pixels
 * between the stacks and the viewport edges (a number for both axes, or
 * `{ x, y }`).
 */
export const PositionsAndOffsets: Story = {
  render: () => ({
    components: { Button, Stack },
    setup() {
      const positions = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'] as const
      function show(position: (typeof positions)[number]) {
        toast({
          title: `Toast at ${position}`,
          position
        })
      }
      function offset() {
        toast.configure({ offset: { x: 40, y: 80 } })
        toast({ title: 'Stacks are now offset by 40x80' })
      }
      function resetOffset() {
        toast.configure({ offset: 0 })
        toast({ title: 'Offsets are back to 0' })
      }
      return { positions, show, offset, resetOffset, clearAll: toast.clearAll }
    },
    template: `
      <Stack
        vertical
        spacing="loose"
      >
        <Stack spacing="tight">
          <Button v-for="p in positions" :key="p" @click="show(p)">{{ p }}</Button>
        </Stack>
        <Stack spacing="tight">
          <Button @click="offset">Offset stacks by 40x80</Button>
          <Button @click="resetOffset">Reset offset</Button>
          <Button @click="clearAll">Clear all</Button>
        </Stack>
      </Stack>
    `
  })
}

/**
 * Toasts are dark by default so they stand out on the mostly white interface.
 * Pass `contrasting: false` for a white toast — per toast, or as the manager
 * default via `toast.configure({ contrasting: false })`.
 */
export const Contrasting: Story = {
  render: () => ({
    components: { Button, Stack },
    setup() {
      function show1() {
        toast({
          title: 'Contrasting toast',
          content: 'The default dark look'
        })
      }
      function show2() {
        toast({
          title: 'Quiet toast',
          content: 'A white toast that blends into a light interface',
          contrasting: false
        })
      }
      return { show1, show2, clearAll: toast.clearAll }
    },
    template: `
      <Stack spacing="tight">
        <Button @click="show1">Contrasting (default)</Button>
        <Button @click="show2">Not contrasting</Button>
        <Button @click="clearAll">Clear all</Button>
      </Stack>
    `
  })
}

/**
 * The `tone` prop applies a default icon and accent color for common toast
 * flavors: `success`, `warning`, `error` and `info`. An explicit `icon`
 * still wins over the tone's default.
 */
export const Tones: Story = {
  render: () => ({
    components: { Button, Stack },
    setup() {
      const tones = ['success', 'warning', 'error', 'info'] as const
      function show(tone: (typeof tones)[number], contrasting: boolean) {
        toast({
          title: tone[0].toUpperCase() + tone.slice(1),
          content: `A ${tone} toast`,
          tone,
          contrasting
        })
      }
      return { tones, show, clearAll: toast.clearAll }
    },
    template: `
      <Stack
        vertical
        spacing="loose"
      >
        <Stack spacing="tight">
          <Button v-for="t in tones" :key="t" @click="show(t, true)">{{ t }}</Button>
        </Stack>
        <Stack spacing="tight">
          <Button v-for="t in tones" :key="t + '2'" @click="show(t, false)">{{ t }} (light)</Button>
        </Stack>
        <Stack spacing="tight">
          <Button @click="clearAll">Clear all</Button>
        </Stack>
      </Stack>
    `
  })
}

/**
 * `toast.promise()` shows a loading toast that follows a promise: it morphs
 * into a `success` tone toast when the promise resolves or a `error` one
 * when it rejects, then auto-hides. Each state accepts a title string, toast
 * props, or a function of the resolved value / rejection reason.
 *
 * Hovering any toast pauses its auto-hide timer until the mouse leaves.
 */
export const PromiseExample: Story = {
  render: () => ({
    components: { Button, Stack },
    setup() {
      function delay(ms: number, fail = false) {
        return new Promise<string>((resolve, reject) =>
          setTimeout(
            () =>
              fail ? reject(new Error('Server said no')) : resolve('42 rows'),
            ms
          )
        )
      }
      function show1() {
        toast.promise(delay(3000), {
          loading: 'Saving exhibition..',
          success: (value) => `Saved! The server returned ${value}`,
          error: (error) => ({
            title: 'Could not save',
            content: error.message
          })
        })
      }
      function show2() {
        toast.promise(delay(3000, true), {
          loading: 'Saving exhibition..',
          success: 'Saved!',
          error: (error) => ({
            title: 'Could not save',
            content: error.message
          })
        })
      }
      return { show1, show2, clearAll: toast.clearAll }
    },
    template: `
      <Stack spacing="tight">
        <Button @click="show1">Promise that resolves</Button>
        <Button @click="show2">Promise that rejects</Button>
        <Button @click="clearAll">Clear all</Button>
      </Stack>
    `
  })
}

/**
 * The toast API is also reachable through the `$ui` global installed by the
 * library's plugin (`app.use(UI)`), so templates can call it without imports.
 */
export const Template$Ui: Story = {
  render: () => ({
    components: { Button, Stack },
    template: `
      <Stack spacing="tight">
        <Button @click="() => $ui.toast({content: 'asdf'})">Show actions toast</Button>
        <Button @click="$ui.toast.clearAll">Clear all</Button>
      </Stack>
    `
  })
}
