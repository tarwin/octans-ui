import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import ColorPicker from './ColorPicker.vue'

const meta = {
  title: 'Components/Forms/ColorPicker',
  component: ColorPicker,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof ColorPicker>

export default meta
type Story = StoryObj<typeof meta>

/**
  The bare surface. It emits in whatever format the value arrived in, so a
  theme written in `oklch()` does not quietly become hex.
 */
export const Basic: Story = {
  render: () => ({
    components: { ColorPicker },
    setup() {
      const value = ref('#5f63e8')
      return { value }
    },
    template: `
      <div style="max-width: 260px">
        <ColorPicker v-model="value" />
        <p style="font-family: monospace; font-size: 12px">{{ value }}</p>
      </div>
    `
  })
}

/**
  `alpha` adds an opacity track and lets transparent colours be emitted. Without
  it the picker can never hand you a value with alpha, which is usually what you
  want for design tokens.
 */
export const WithAlpha: Story = {
  render: () => ({
    components: { ColorPicker },
    setup() {
      const value = ref('rgb(95 99 232 / 0.65)')
      return { value }
    },
    template: `
      <div style="max-width: 260px">
        <ColorPicker v-model="value" alpha />
        <p style="font-family: monospace; font-size: 12px">{{ value }}</p>
      </div>
    `
  })
}

/**
  `format` pins the output and hides the switcher. `formats` narrows which the
  switcher offers without pinning it.
 */
export const PinnedFormat: Story = {
  render: () => ({
    components: { ColorPicker },
    setup() {
      const pinned = ref('#0b7a4b')
      const narrowed = ref('#0b7a4b')
      return { pinned, narrowed }
    },
    template: `
      <div style="display: flex; gap: 24px; flex-wrap: wrap">
        <div style="max-width: 240px">
          <strong style="font-size: 12px">format="oklch"</strong>
          <ColorPicker v-model="pinned" format="oklch" />
          <p style="font-family: monospace; font-size: 12px">{{ pinned }}</p>
        </div>
        <div style="max-width: 240px">
          <strong style="font-size: 12px">:formats="['hex', 'rgb']"</strong>
          <ColorPicker v-model="narrowed" :formats="['hex', 'rgb']" />
          <p style="font-family: monospace; font-size: 12px">{{ narrowed }}</p>
        </div>
      </div>
    `
  })
}

/**
  `swatches` puts a row of presets under the controls — a palette, a set of
  brand colours, or the tokens already in use.
 */
export const Swatches: Story = {
  render: () => ({
    components: { ColorPicker },
    setup() {
      const value = ref('#5f63e8')
      const swatches = [
        '#5f63e8',
        '#0b7a4b',
        '#b45309',
        '#be123c',
        '#0e7490',
        '#111827',
        '#ffffff',
        'rgb(95 99 232 / 0.4)'
      ]
      return { value, swatches }
    },
    template: `
      <div style="max-width: 260px">
        <ColorPicker v-model="value" alpha :swatches="swatches" />
        <p style="font-family: monospace; font-size: 12px">{{ value }}</p>
      </div>
    `
  })
}

/**
  The eyedropper reads any pixel on screen. It only appears where the browser
  supports the `EyeDropper` API — Chrome and Edge at the time of writing — so
  there is no dead button elsewhere. The palette button opens the operating
  system's own dialog, which is where a user's recent colours live.

  Turn either off if the surrounding UI provides its own.
 */
export const PickingTools: Story = {
  render: () => ({
    components: { ColorPicker },
    setup() {
      const value = ref('#b45309')
      return { value }
    },
    template: `
      <div style="max-width: 260px">
        <ColorPicker v-model="value" :eyedropper="true" :system-picker="true" />
        <p style="font-family: monospace; font-size: 12px">{{ value }}</p>
      </div>
    `
  })
}

/**
  `hideInput` drops the text field and format switcher, for when the value is
  shown elsewhere.
 */
export const VisualOnly: Story = {
  render: () => ({
    components: { ColorPicker },
    setup() {
      const value = ref('#0e7490')
      return { value }
    },
    template: `
      <div style="max-width: 260px">
        <ColorPicker v-model="value" hide-input />
        <p style="font-family: monospace; font-size: 12px">{{ value }}</p>
      </div>
    `
  })
}

export const Disabled: Story = {
  render: () => ({
    components: { ColorPicker },
    template: `
      <div style="max-width: 260px">
        <ColorPicker model-value="#be123c" disabled />
      </div>
    `
  })
}
