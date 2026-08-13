import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import ToggleSwitch from './ToggleSwitch.vue'

const meta = {
  title: 'Components/Forms/ToggleSwitch',
  component: ToggleSwitch,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof ToggleSwitch>

export default meta
type Story = StoryObj<typeof meta>

/**
  A tick / cross shows in the knob by default, so the state reads without
  having to compare against another switch. Turn it off with `:icons="false"`.
 */
export const Default: Story = {
  render: () => ({
    components: { ToggleSwitch },
    setup() {
      const value = ref(false)
      return { value }
    },
    template: `
      <div>
        <ToggleSwitch v-model="value"/>
        <pre>value: {{value}}</pre>
      </div>
    `
  })
}

/**
  Use `size` to render the switch `small`, `medium` (default) or `large`. All
  dimensions scale proportionally.
 */
export const Sizes: Story = {
  render: () => ({
    components: { ToggleSwitch },
    setup() {
      const small = ref(true)
      const medium = ref(true)
      const large = ref(true)
      return { small, medium, large }
    },
    template: `
      <div style="display: flex; align-items: center; gap: 24px">
        <ToggleSwitch v-model="small" size="small" />
        <ToggleSwitch v-model="medium" size="medium" />
        <ToggleSwitch v-model="large" size="large" />
      </div>
    `
  })
}

/**
  `color` sets the track colour when checked — it's shorthand for `color-on`.
  The knob icon follows it, so one prop recolours the whole control.
 */
export const Color: Story = {
  render: () => ({
    components: { ToggleSwitch },
    setup() {
      const green = ref(true)
      const pink = ref(true)
      const dark = ref(true)
      return { green, pink, dark }
    },
    template: `
      <div style="display: flex; align-items: center; gap: 24px">
        <ToggleSwitch v-model="green" color="#22a06b" />
        <ToggleSwitch v-model="pink" color="#e0245e" />
        <ToggleSwitch v-model="dark" color="#212b36" />
      </div>
    `
  })
}

/**
  `color-off` sets the unchecked track. It defaults to a neutral grey, but a
  meaningful off state is sometimes worth showing — a red "disabled" or an
  amber "paused" reads faster than grey.

  Setting it also colours the off icon. The default grey doesn't, because it's
  too pale to read against the white knob.
 */
export const OffColor: Story = {
  render: () => ({
    components: { ToggleSwitch },
    setup() {
      const alerts = ref(false)
      const backup = ref(false)
      const plain = ref(false)
      return { alerts, backup, plain }
    },
    template: `
      <div style="display: flex; align-items: center; gap: 24px">
        <ToggleSwitch v-model="alerts" color-on="#22a06b" color-off="#d72c0d" />
        <ToggleSwitch v-model="backup" color-on="#22a06b" color-off="#b98900" />
        <ToggleSwitch v-model="plain" color-on="#22a06b" />
      </div>
    `
  })
}

/**
  `icon-color` overrides both knob icons; `icon-color-on` / `icon-color-off`
  override one state each. Needed when the icon's inherited colour doesn't have
  enough contrast against the knob, or when you want the icon to stay constant
  while the track changes.
 */
export const IconColor: Story = {
  render: () => ({
    components: { ToggleSwitch },
    setup() {
      const both = ref(true)
      const perState = ref(true)
      const constant = ref(false)
      return { both, perState, constant }
    },
    template: `
      <div style="display: flex; align-items: center; gap: 24px">
        <ToggleSwitch v-model="both" size="large" color="#212b36" icon-color="#212b36" />
        <ToggleSwitch v-model="perState" size="large" color="#22a06b" icon-color-on="#22a06b" icon-color-off="#d72c0d" />
        <ToggleSwitch v-model="constant" size="large" color="#4a3aff" icon-color="#4a3aff" />
      </div>
    `
  })
}

/**
  Icons are on by default. Set `:icons="false"` for a plain knob — reasonable
  when the switch sits directly beside a label that already states what it
  controls, or when you want the quietest possible control.
 */
export const NoIcons: Story = {
  render: () => ({
    components: { ToggleSwitch },
    setup() {
      const on = ref(true)
      const off = ref(false)
      return { on, off }
    },
    template: `
      <div style="display: flex; align-items: center; gap: 24px">
        <ToggleSwitch v-model="on" :icons="false" />
        <ToggleSwitch v-model="off" :icons="false" />
      </div>
    `
  })
}

/**
  Override either default with `icon-on` / `icon-off`.

  Any name the `Icon` component accepts works. Names outside the ones this
  library uses are fetched from the Iconify API on first render.
 */
export const CustomIcons: Story = {
  render: () => ({
    components: { ToggleSwitch },
    setup() {
      const visible = ref(true)
      const starred = ref(true)
      const enabled = ref(false)
      return { visible, starred, enabled }
    },
    template: `
      <div style="display: flex; align-items: center; gap: 24px">
        <ToggleSwitch v-model="visible" size="large" icon-on="mdi:eye" icon-off="mdi:eye-off" />
        <ToggleSwitch v-model="starred" size="large" color="#e0a11b" icon-on="mdi:star" icon-off="mdi:star-outline" />
        <ToggleSwitch v-model="enabled" size="large" color="#22a06b" icon-on="mdi:check-circle" icon-off="mdi:close-circle" />
      </div>
    `
  })
}

/**
  For anything the icon props don't cover, the `handle` slot renders arbitrary
  content inside the knob and receives the current `checked` state. The slot
  takes precedence over `icons`.
 */
export const HandleSlot: Story = {
  render: () => ({
    components: { ToggleSwitch },
    setup() {
      const value = ref(true)
      return { value }
    },
    template: `
      <div style="display: flex; align-items: center; gap: 24px">
        <ToggleSwitch v-model="value" size="large" color="#212b36">
          <template #handle="{ checked }">
            <span style="font-size: 11px; font-weight: 600; color: #212b36">
              {{ checked ? 'ON' : 'OFF' }}
            </span>
          </template>
        </ToggleSwitch>
        <pre>value: {{ value }}</pre>
      </div>
    `
  })
}

/**
  The switch renders as a `<button role="switch">`, so it is in the tab order,
  activates on Space or Enter, and announces its state through `aria-checked`.

  What it can't work out for itself is what it controls. Give it a name — either
  `aria-label`, or `aria-labelledby` pointing at visible text. Attributes land
  on the button, not the wrapper, so screen readers read them; `class` and
  `style` still apply to the outer element.
 */
export const Labelling: Story = {
  render: () => ({
    components: { ToggleSwitch },
    setup() {
      const alerts = ref(true)
      const backups = ref(false)
      return { alerts, backups }
    },
    template: `
      <div style="display: grid; gap: 16px">
        <ToggleSwitch v-model="alerts" aria-label="Email alerts" />

        <label style="display: flex; align-items: center; gap: 12px">
          <span id="backups-label">Nightly backups</span>
          <ToggleSwitch v-model="backups" aria-labelledby="backups-label" />
        </label>
      </div>
    `
  })
}

/**
  Set `disabled` to make the switch non-interactive. Shown in both states.
 */
export const Disabled: Story = {
  render: () => ({
    components: { ToggleSwitch },
    setup() {
      const off = ref(false)
      const on = ref(true)
      return { off, on }
    },
    template: `
      <div style="display: flex; align-items: center; gap: 24px">
        <ToggleSwitch v-model="off" disabled />
        <ToggleSwitch v-model="on" disabled />
      </div>
    `
  })
}
