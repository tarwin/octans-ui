import { Button } from '@/components/Button'
import { FormLayout } from '@/components/FormLayout'
import { Select } from '@/components/Select'
import { Stack } from '@/components/Stack'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { h, ref } from 'vue'
import { toast } from '@/components/ToastManager'
import {
  Modal,
  alertModal,
  confirmModal,
  genericModal,
  promptModal
} from './index'

/**
 * ### Keyboard Shortcuts
 * `ESCAPE`- Key tiggers `@close` event when a modal is open
 */
const meta = {
  title: 'Components/Overlays/Modal',
  component: Modal,
  tags: ['autodocs'],
  args: {
    visible: false
  }
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Shows how to create a modal as a component.
 */
export const ComponentExample: Story = {
  render: () => ({
    components: { Modal, Button, Stack },
    setup() {
      const visible = ref(false)
      const loading = ref(false)
      function doLoad() {
        loading.value = true
        setTimeout(() => (loading.value = false), 2000)
      }
      return {
        visible,
        loading,
        doLoad,
        doToast: () => toast({ title: 'asdf' })
      }
    },
    template: `
      <div>
        <Button @click="visible = true">Show modal</Button>
        <Modal
          title="Unsaved changes"
          :primaryAction="{
            type: 'destructive',
            icon: 'mdi:plus',
            external: true,
            label: 'Discard changes',
            onAction: () => (visible = false)
          }"
          :secondaryActions="[
            {
              label: 'Keep editing',
              onAction: () => (visible = false)
            }
          ]"
          :visible="visible"
          :loading="loading"
          @close="visible = false"
        >
          <p>
            Are you sure you want to leave? There are unsaved changes. If you leave,
            your changes will be lost.
          </p>
          <Stack spacing="tight">
            <Button @click="doLoad">Test loader</Button>
            <Button @click="doToast">Test Toast</Button>
          </Stack>
        </Modal>
      </div>
    `
  })
}

/**
 * Modals without the `@close` listener will not show the "X" button.
 */
export const NoCloseListener: Story = {
  render: () => ({
    components: { Modal, Button },
    setup() {
      const visible = ref(false)
      return {
        visible
      }
    },
    template: `
      <div>
        <Button @click="visible = true">Show modal</Button>
        <Modal
          title="Unsaved changes"
          :primaryAction="{
            type: 'primary',
            label: 'Close',
            onAction: () => (visible = false)
          }"
          :visible="visible"
        >
          <p>
            There is no close X in the modal because the @close listener is not
            defined.
          </p>
        </Modal>
      </div>
    `
  })
}

/**
 * Example of a modal with pre-body content and very long body content.
 * **Note:** The heights the header, preBody and footer slots are only calculated once as the modal beings to show. The max height of the body will not adjust to dynamically changing heights of other slots.
 */
export const WithPreBodySlot: Story = {
  render: () => ({
    components: { Modal, Button },
    setup() {
      const visible = ref(false)
      return {
        visible
      }
    },
    template: `
      <div>
        <Button @click="visible = true">Show really long modal</Button>
        <Modal
          title="Really long content"
          :visible="visible"
          :primaryAction="{
            label: 'Close',
            onAction: () => (visible = false)
          }"
          @close="visible = false"
        >
          <template #preBody>
            <ul>
              <li>This content appears between the header and the body.</li>
              <li>The modal will not exceed the height of the screen.</li>
              <li>
                The body will take up the remaining space in the modal, and scroll
                if necessary.
              </li>
            </ul>
          </template>
          <div
            style="height: 5000px; background: linear-gradient(#ccc, #eee)"
          ></div>
        </Modal>
      </div>
    `
  })
}

export const WithTertiaryActions: Story = {
  render: () => ({
    components: { Modal, Button },
    setup() {
      const visible = ref(false)
      return {
        visible
      }
    },
    template: `
      <div>
        <Button @click="visible = true">Show modal</Button>
        <Modal
          title="With Tertiary Actions"
          :visible="visible"
          :primaryAction="{
            label: 'Primary',
            onAction: () => (visible = false),
            tooltip: 'This is a tooltip',
            tooltipPosition: 'right'
          }"
          :secondaryActions="[{
            label: 'Secondary 1',
            onAction: () => (visible = false),
            tooltip: 'This is a tooltip',
            tooltipPosition: 'left'
          }]"
          :tertiaryActions="[{
            label: 'Tertiary 1',
            onAction: () => (visible = false),
            tooltip: 'This is a tooltip',
            tooltipPosition: 'top'
          }, {
            label: 'Tertiary 2',
            onAction: () => (visible = false),
            tooltip: null,
            tooltipPosition: 'bottom'
          }]"
          @close="visible = false"
        >
          <div>
            <p>
              This is a modal with a primary action and one secondary actions and two tertiary actions.
            </p>
          </div>
        </Modal>
      </div>
    `
  })
}

export const WithFooterSlot: Story = {
  render: () => ({
    components: { Modal, Button, Select, FormLayout },
    setup() {
      const visible = ref(false)
      return {
        visible
      }
    },
    template: `
      <div>
        <Button @click="visible = true">Show modal</Button>
        <Modal
          title="With Foote Slot"
          :visible="visible"
          :primaryAction="{
            label: 'Primary',
            onAction: () => (visible = false)
          }"
          @close="visible = false"
        >
          <template #footer>
            <div style="background: #eee; width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ddd;">
              <FormLayout>
                <div>This is the footer content!</div>
                <Select
                  :options="[
                    { value: 1, label: 'One' },
                    { value: 2, label: 'Two' },
                    { value: 3, label: 'Three' },
                    { value: 4, label: 'Four' },
                    { value: 5, label: 'Five' },
                    { value: 6, label: 'Six' },
                    { value: 7, label: 'Seven' },
                    { value: 8, label: 'Eight' },
                    { value: 9, label: 'Nine' },
                    { value: 10, label: 'Ten' },
                    { value: 11, label: 'Eleven' },
                    { value: 12, label: 'Twelve' },
                    { value: 13, label: 'Thirteen' },
                    { value: 14, label: 'Fourteen' },
                    { value: 15, label: 'Fifteen' },
                    { value: 16, label: 'Sixteen' },
                    { value: 17, label: 'Seventeen' },
                    { value: 18, label: 'Eighteen' },
                    { value: 19, label: 'Nineteen' },
                    { value: 20, label: 'Twenty' },
                  ]"
                />
              </FormLayout>
            </div>
          </template>
          <div>
            <p>
              This is a modal with a footer slot. Note the footer slot overrides any actions.
            </p>
          </div>
        </Modal>
      </div>
    `
  })
}

/**
* ## APIs

* Each method supports callback methods and promises.

* ### modal()

* This is a generic method that the other methods are built upon.

* - Clicking an action results in the `onAction` callback being fired with the
*   action ID passed to it as well as the promise resolving to the same value.
* - If the modal "X" is clicked the actionId will be `undefined`.

* The following example produces the same output as the component example above
* but uses the `modal()` API instead.
*/
export const ModalApi: Story = {
  render: () => ({
    components: { Button },
    setup() {
      function show() {
        // Not using async/await as the styleguide doesn't support it
        genericModal({
          title: 'Unsaved changes',
          content: `Are you sure you want to leave? There are unsaved changes.
          If you leave, your changes will be lost.`,
          primaryAction: {
            id: 'discardId',
            type: 'destructive',
            label: 'Discard changes',
            onAction() {
              console.log('primaryAction.onAction')
            }
          },
          secondaryActions: [
            {
              id: 'retainId',
              label: 'Keep editing',
              onAction() {
                console.log('secondaryAction[0].onAction')
              }
            }
          ],
          onAction(actionId: string) {
            console.log('onAction', actionId)
          }
        }).then((actionId) => {
          console.log('resolved', actionId)
        })
      }
      return {
        show
      }
    },
    template: `
      <Button @click="show">Show modal using api</Button>
    `
  })
}

/**
 * An example using `VNode` content.
 */
export const ModalApiWithVnode: Story = {
  render: () => ({
    components: { Button },
    setup() {
      function show() {
        genericModal({
          title: 'Title',
          content: h('div', [
            'This text is ',
            h('strong', 'bold!'),
            " Isn't that cool?",
            h('br'),
            h('br'),
            h(
              Button,
              {
                onClick: () => {
                  console.log('clicked button')
                }
              },
              () => 'This is a button'
            )
          ]),
          primaryAction: {
            label: 'Close'
          }
        })
      }
      return {
        show
      }
    },
    template: `
      <Button @click="show">Show modal using api and VNode</Button>
    `
  })
}

/**
 * ### alert()

 * Shows a basic modal with a single primary action.
 * Clicking the action (or the "X") results in the `onAction` callback being fired and the promise being resolved.
 */
export const AlertApi: Story = {
  render: () => ({
    components: { Button },
    setup() {
      function show() {
        // Not using async/await as the styleguide doesn't support it
        alertModal({
          title: 'Title',
          content: 'This is the content of the alert',
          primaryActionLabel: 'Okay',
          onAction(action: string) {
            console.log('onAction', action)
          }
        }).then((action) => {
          console.log('resolved', action)
        })
      }
      return {
        show
      }
    },
    template: `
      <Button @click="show">Show alert modal</Button>
    `
  })
}

/** ### confirm()

 * Shows a basic modal with primary and secondary actions.
 * - Clicking the primary action results in the `onConfirm` callback being fired
 *   and the promise to resolve to `true`.
 * - Clicking the secondary action (or the "X") results in the `onCancel` callback
 *   being fired and the promise to resolve to `false`.
 * - Clicking either action results in the `onAction` callback being fired with
 *   the answer.
 */
export const ConfirmApi: Story = {
  render: () => ({
    components: { Button },
    setup() {
      function show() {
        // Not using async/await as the styleguide doesn't support it
        confirmModal({
          title: 'Delete thing',
          content:
            'Are you sure you want to delete the thing? I cannot be undone.',
          primaryActionLabel: 'Delete it!',
          primaryActionType: 'destructive',
          onConfirm() {
            console.log('onConfirm')
          },
          onCancel() {
            console.log('onCancel')
          },
          onAction(didConfirm) {
            console.log('onAction', didConfirm)
          }
        }).then((action) => {
          console.log('resolved', action)
        })
      }
      return {
        show
      }
    },
    template: `
      <Button @click="show">Show confirm modal</Button>
    `
  })
}

/**
 * ### prompt()

 * Shows a modal with a text input field below the content.

 * - Cancelling the prompt results in the `onCancel` callback being fired as well
 *   as the `onAction` callback and promise resolving to `undefined`.
 */
export const PromptApi: Story = {
  render: () => ({
    components: { Button },
    setup() {
      function show() {
        // Not using async/await as the styleguide doesn't support it
        promptModal({
          title: 'Create exhibition',
          content: 'Enter a name for the new exhibition.',
          primaryActionLabel: 'Create',
          inputValue: 'New exhibition 1',
          inputHelpText: 'The name of your new exhibition. Make it special!',
          inputPlaceholder: 'Exhibition name',
          invalidValueText: 'Il valore inserito non è valido.',
          inputValidator(name) {
            if (name.length < 5) {
              return 'Must be at least 5 characters.'
            }
            if (!/\d/.test(name)) {
              return 'Must contain at least one number.'
            }
            if (/-/.test(name)) {
              return false
            }
            return true
          },
          onSubmit(value) {
            console.log('onSubmit', value)
          },
          onCancel() {
            console.log('onCancel')
          },
          onAction(value) {
            console.log('onAction', value)
          }
        }).then((value) => {
          console.log('resolved', value)
        })
      }
      return {
        show
      }
    },
    template: `
      <Button @click="show">Show prompt modal</Button>
    `
  })
}

export const MultilinePromptApi: Story = {
  render: () => ({
    components: { Button },
    setup() {
      function show() {
        // Not using async/await as the styleguide doesn't support it
        promptModal({
          title: 'Create exhibition',
          content: 'Enter a name for the new exhibition.',
          primaryActionLabel: 'Create',
          inputValue: 'New exhibition 1',
          inputHelpText: 'The name of your new exhibition. Make it special!',
          multiline: true,
          inputPlaceholder: 'Exhibition name',
          invalidValueText: 'Il valore inserito non è valido.',
          inputValidator(name) {
            if (name.length < 5) {
              return 'Must be at least 5 characters.'
            }
            if (!/\d/.test(name)) {
              return 'Must contain at least one number.'
            }
            if (/-/.test(name)) {
              return false
            }
            return true
          },
          onSubmit(value) {
            console.log('onSubmit', value)
          },
          onCancel() {
            console.log('onCancel')
          },
          onAction(value) {
            console.log('onAction', value)
          }
        }).then((value) => {
          console.log('resolved', value)
        })
      }
      return {
        show
      }
    },
    template: `
      <Button @click="show">Show multiline prompt modal</Button>
    `
  })
}

/**
 * Does not require `overflowVisible` as Select uses a portal.
 */
export const SelectCanOverFlow: Story = {
  render: () => ({
    components: { Modal, Button, Select },
    setup() {
      const visible = ref(false)
      return {
        visible
      }
    },
    template: `
      <div>
        <Button @click="visible = true">Show modal</Button>
        <Modal
          title="Unsaved changes"
          :primaryAction="{
            type: 'destructive',
            icon: 'mdi:plus',
            external: true,
            label: 'Discard changes',
            onAction: () => (visible = false)
          }"
          :secondaryActions="[
            {
              label: 'Keep editing',
              onAction: () => (visible = false)
            }
          ]"
          :visible="visible"
          :loading="false"
          @close="visible = false"
        >
          <Select
            label="A Select"
            :options="[
              { value: 1, label: 'One' },
              { value: 2, label: 'Two' },
              { value: 3, label: 'Three' },
              { value: 4, label: 'Four' },
              { value: 5, label: 'Five' },
              { value: 6, label: 'Six' },
              { value: 7, label: 'Seven' },
              { value: 8, label: 'Eight' },
              { value: 9, label: 'Nine' },
              { value: 10, label: 'Ten' },
              { value: 11, label: 'Eleven' },
              { value: 12, label: 'Twelve' },
              { value: 13, label: 'Thirteen' },
              { value: 14, label: 'Fourteen' },
              { value: 15, label: 'Fifteen' },
              { value: 16, label: 'Sixteen' },
              { value: 17, label: 'Seventeen' },
              { value: 18, label: 'Eighteen' },
              { value: 19, label: 'Nineteen' },
              { value: 20, label: 'Twenty' },
            ]"
          />
        </Modal>
      </div>
      `
  })
}
/**
 * Does not require `overflowVisible` as Select uses a portal.
 */
export const SelectLongContent: Story = {
  render: () => ({
    components: { Modal, Button, Select },
    setup() {
      const visible = ref(false)
      return {
        visible
      }
    },
    template: `
      <div>
        <Button @click="visible = true">Show modal</Button>
        <Modal
          title="Unsaved changes"
          :primaryAction="{
            type: 'destructive',
            icon: 'mdi:plus',
            external: true,
            label: 'Discard changes',
            onAction: () => (visible = false)
          }"
          :secondaryActions="[
            {
              label: 'Keep editing',
              onAction: () => (visible = false)
            }
          ]"
          :visible="visible"
          @close="visible = false"
        >
          <p v-for="i in new Array(90)">Content</p>
          <Select
            label="A Select"
            :options="[
              { value: 1, label: 'One' },
              { value: 2, label: 'Two' },
              { value: 3, label: 'Three' },
              { value: 4, label: 'Four' },
              { value: 5, label: 'Five' },
              { value: 6, label: 'Six' },
              { value: 7, label: 'Seven' },
              { value: 8, label: 'Eight' },
              { value: 9, label: 'Nine' },
              { value: 10, label: 'Ten' },
              { value: 11, label: 'Eleven' },
              { value: 12, label: 'Twelve' },
              { value: 13, label: 'Thirteen' },
              { value: 14, label: 'Fourteen' },
              { value: 15, label: 'Fifteen' },
              { value: 16, label: 'Sixteen' },
              { value: 17, label: 'Seventeen' },
              { value: 18, label: 'Eighteen' },
              { value: 19, label: 'Nineteen' },
              { value: 20, label: 'Twenty' },
            ]"
          />
        </Modal>
      </div>
      `
  })
}

/**
 * ### Stacked modals
 *
 * Modals opened from the imperative API share a single `<ModalHost>`, so a
 * modal opened over another one stacks rather than replacing it:
 *
 * - one backdrop for the whole stack, however deep it goes — they used to
 *   compound, darkening the page with every modal
 * - each modal sits a little lower and above the one it opened over
 * - `ESCAPE` closes only the modal on top
 * - closing one returns focus to the modal underneath, and closing the last
 *   returns it to whatever had focus before the stack opened
 *
 * Nothing has to be placed in the page for this — a host is mounted on first
 * use. Render a `<ModalHost>` yourself if you want the modals to live inside
 * your own app, with your plugins and `provide()`s; the auto-mounted one then
 * stands down.
 *
 * A `<Modal>` written into a template does not go through the host, and is
 * unaffected by any of this.
 */
export const StackedModals: Story = {
  render: () => ({
    components: { Button, Stack },
    setup() {
      let depth = 0
      function open() {
        depth++
        genericModal({
          title: `Modal ${depth}`,
          content: `Open another one over this, then press ESCAPE — only the
            top one closes.`,
          primaryAction: {
            label: 'Open another',
            onAction: open
          },
          secondaryActions: [{ label: 'Close', id: 'close' }]
        })
      }
      function openThree() {
        for (let i = 0; i < 3; i++) {
          open()
        }
      }
      return { open, openThree }
    },
    template: `
      <Stack spacing="tight">
        <Button @click="open">Open a modal</Button>
        <Button @click="openThree">Open three at once</Button>
      </Stack>
    `
  })
}
