import { Button } from '@/components/Button'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import EventDelegator from './EventDelegator.vue'

/**
  The EventDelegator is a renderless utility component that can be used to easily
  add event listeners to the `window` or `document` with all the same flexibility
  of regular Vue event handlers.

  There is no need to manually call `addEventListener` or `removeEventListener`
  and events are automatically removed when the component is destroyed.

  Use cases:

    - Window resize events
    - Window or document keyboard events
    - Document mouse events
 */
const meta = {
  title: 'Components/Utilities/EventDelegator',
  component: EventDelegator,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof EventDelegator>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The following example demonstrates the most basic usage. By default, the target
 * of the events is the `window` object. Try typing on your keyboard:
 */
export const SimpleKeydownEvents: Story = {
  render: () => ({
    components: { EventDelegator },
    setup() {
      const lastKey = ref<string | null>(null)
      return {
        lastKey
      }
    },
    template: `
      <div>
        <EventDelegator @keydown="lastKey = $event.key" />
        Last key pressed: <b>{{lastKey}}</b>
      </div>
    `
  })
}

/**
 * Just like regular component event handlers, listeners added and removed
 * automatically on creation and destruction of the event delegator. Try typing on
 * your keyboard and toggling the button:
 */
export const KeydownWithToggle: Story = {
  render: () => ({
    components: { EventDelegator, Button },
    setup() {
      const lastKey = ref<string | null>(null)
      const enabled = ref<boolean>(true)
      return {
        lastKey,
        enabled
      }
    },
    template: `
      <div>
        <EventDelegator
          v-if="enabled"
          @keydown="lastKey = $event.key"
        />
        Last key pressed: <b>{{lastKey}}</b>
        <br/>
        <Button
          @click="enabled = !enabled"
        >{{enabled ? 'Disable' : 'Enable'}}</Button>
      </div>
    `
  })
}

/**
 * All the standard Vue event modifiers work. The following example demonstrates
 * usage of the "once", "passive" and key code modifiers.
 */
export const ModifierExample: Story = {
  render: () => ({
    components: { EventDelegator },
    setup() {
      const scrollY = ref<number>(0)
      function onClick() {
        window.alert({
          title: 'Well done!',
          content: 'You double-clicked the document!'
        })
      }
      function onEnter() {
        window.alert({
          title: 'Entered!',
          content: 'You pressed the enter key!'
        })
      }
      function onScroll() {
        scrollY.value = window.scrollY
      }
      return {
        scrollY,
        onClick,
        onEnter,
        onScroll
      }
    },
    template: `
      <div>
        <EventDelegator
          target="document"
          @dblclick.once="onClick"
          @keydown.enter.once="onEnter"
          @scroll.passive="onScroll"
        />
        <ul>
          <li>Try double-clicking anywhere in the style guide! You should only see an alert the first time.</li>
          <li>Try pressing the <code>ENTER</code> key.</li>
          <li>Document scroll position: {{scrollY}}</li>
        </ul>
      </div>
    `
  })
}
