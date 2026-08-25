import { Button } from '@/components/Button'
import { Checkbox } from '@/components/Checkbox'
import { FormLayout } from '@/components/FormLayout'
import { Select } from '@/components/Select'
import { Stack } from '@/components/Stack'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import Popover from './Popover.vue'

const meta = {
  title: 'Components/Overlays/Popover',
  component: Popover,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

/**
 * By default any click on the trigger will toggle the popover to show or hide.
 */
export const SimplePopover: Story = {
  render: () => ({
    components: { Popover, Button },
    template: `
      <Popover>
        <template #trigger>
          <Button>Toggle</Button>
        </template>
        <div style="background: #fff; border: 1px solid red; padding: 8px">
          This is the content of the popover
        </div>
      </Popover>
    `
  })
}

/**
 * By default, clicking outside the popover or trigger will not cause it to hide.
 * To do this, use the `auto-hide` prop.
 *
 * This trigger drives visibility itself, so it opts out of the automatic
 * toggle with `:auto-trigger-toggle="false"` — otherwise both would fire on
 * the same click and cancel each other out.
 */
export const SimplePopoverWithAutoHide: Story = {
  render: () => ({
    components: { Popover, Button },
    setup() {
      return {
        runToggle: (cb: () => void) => {
          console.log('runtoggle')
          cb()
        }
      }
    },
    template: `
      <Popover auto-hide :auto-trigger-toggle="false">
        <template #trigger="{toggle}">
          <Button @click="runToggle(toggle)">Toggle</Button>
        </template>
        <div style="background: #fff; border: 1px solid red; padding: 8px">
          This is the content of the popover
        </div>
      </Popover>
    `
  })
}

export const JustDiv: Story = {
  render: () => ({
    components: { Popover, Button, Stack },
    setup() {
      return {
        runToggle: (cb: () => void) => {
          console.log('runtoggle')
          cb()
        }
      }
    },
    template: `
      <Popover auto-hide>
        <template #trigger>
          <div style="border:1px solid var(--octans-border); padding: 8px;">
            <Stack
              alignment="center"
              spacing="tight"
            >
              <div>TRIGGER</div>
              <Button>button 1</Button>
              <Button>button 2</Button>
            </Stack>
          </div>
        </template>
        <div style="background: #fff; border: 1px solid red; padding: 8px">
          This is the content of the popover
        </div>
      </Popover>
    `
  })
}

export const Disabled: Story = {
  render: () => ({
    components: { Popover, Button, Checkbox },
    setup() {
      const disabled = ref(false)
      return {
        disabled
      }
    },
    template: `
      <Popover :disabled="disabled">
        <template #trigger>
          <Button>Toggle</Button>
        </template>
        <div style="background: #fff; border: 1px solid red; padding: 8px">
          This is the content of the popover
        </div>
      </Popover>
      <Checkbox
        label="Disabled"
        v-model="disabled"
      />
    `
  })
}

/**
 * A trigger that only ever *shows* must opt out of the automatic toggle,
 * otherwise the same click that runs `show` also toggles the popover back shut.
 */
export const ShowAndHide: Story = {
  render: () => ({
    components: { Popover, Button },
    template: `
      <Popover :auto-trigger-toggle="false">
        <template #trigger="{show}">
          <Button @click="show">Show</Button>
        </template>
        <template #default="{hide}">
          <div style="background: #fff; border: 1px solid red; padding: 8px">
            This is the content of the popover
            <Button @click="hide">Hide</Button>
          </div>
        </template>
      </Popover>
    `
  })
}

/**
 * Hover-driven triggers opt out too — a click would otherwise toggle the
 * popover independently of the pointer.
 */
export const ShowAndHideOnHover: Story = {
  render: () => ({
    components: { Popover, Button },
    template: `
      <Popover :auto-trigger-toggle="false">
        <template #trigger="{show, hide}">
          <Button
            @mouseenter="show"
            @mouseleave="hide"
          >Hover over me!</Button>
        </template>
        <div style="background: #fff; border: 1px solid red; padding: 8px">
          This is the content of the popover
        </div>
      </Popover>
    `
  })
}

export const Playground: Story = {
  render: () => ({
    components: { Popover, Button, Select, Checkbox, FormLayout },
    setup() {
      const autoHide = ref(false)
      const autoTriggerToggle = ref(true)
      const placementPrefix = ref('top')
      const placementSuffix = ref('')
      const visible = ref(false)
      const placement = computed(() => {
        return placementPrefix.value + placementSuffix.value
      })
      return {
        autoHide,
        autoTriggerToggle,
        placementPrefix,
        placementSuffix,
        visible,
        placement
      }
    },
    template: `
      <div>
        <div style="width: 700px; height: 250px; overflow: scroll;">
          <div style="width: 2000px; height: 500px; padding: 100px 0 0 250px;">
            <Popover
              :auto-hide="autoHide"
              :auto-trigger-toggle="autoTriggerToggle"
              :placement="placement"
              v-model:visible="visible"
            >
              <template #trigger>
                <Button>Toggle</Button>
              </template>
              <div style="background: #fff; border: 1px solid red; padding: 8px">
                This is the content of the popover
              </div>
            </Popover>
          </div>
        </div>
        <br>
        <hr>
        <FormLayout>
          <Checkbox
            label="Auto Hide"
            v-model="autoHide"
          />
          <Checkbox
            label="Auto Toggle Trigger"
            v-model="autoTriggerToggle"
          />
          <Select
            label="Placement"
            :options="[
              { value: 'auto', label: 'auto' },
              { value: 'top', label: 'top' },
              { value: 'right', label: 'right' },
              { value: 'bottom', label: 'bottom' },
              { value: 'left', label: 'left' }
            ]"
            v-model="placementPrefix"
          />
          <Select
            label="Placement Variation"
            :options="[
              { value: '', label: 'none' },
              { value: '-start', label: 'start' },
              { value: '-end', label: 'end' }
            ]"
            v-model="placementSuffix"
          />
          <Checkbox
            label="Visible"
            v-model="visible"
          />
        </FormLayout>
      </div>
    `
  })
}
