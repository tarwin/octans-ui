import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import { createGradient, gradientCss, isGradient } from '@/utils/gradient'
import ColorSelector from './ColorSelector.vue'

const meta = {
  title: 'Components/Forms/ColorSelector',
  component: ColorSelector,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof ColorSelector>

export default meta
type Story = StoryObj<typeof meta>

/**
  The colour field — a swatch you click to open a picker. `ColorPicker` and
  `GradientPicker` are the bare surfaces it wraps; reach for those directly when
  you want one always on show.
 */
export const Basic: Story = {
  render: () => ({
    components: { ColorSelector },
    setup() {
      const value = ref('#5f63e8')
      return { value }
    },
    template: `
      <div style="max-width: 320px">
        <ColorSelector
          v-model="value"
          label="Accent colour"
          help-text="Used for primary buttons and links."
        />
      </div>
    `
  })
}

/**
  `mode` decides what the field holds. In `both` the value's TYPE says which it
  currently is — a string is a colour, an object is a `Gradient` — so there is no
  second prop to keep in sync and the value cannot disagree with itself.

  Switching to a gradient makes both stops the colour you already had, so nothing
  you can see changes. Switching back takes the first stop, which is the one
  answer that is actually written in the gradient you were looking at.
 */
export const Modes: Story = {
  render: () => ({
    components: { ColorSelector },
    setup() {
      const color = ref<any>('#0b7a4b')
      const gradient = ref<any>(
        createGradient({
          stops: [
            { color: '#ffd400', position: 0 },
            { color: '#0038ff', position: 100 }
          ]
        })
      )
      const either = ref<any>('#b45309')
      const eitherCss = computed(() =>
        isGradient(either.value) ? gradientCss(either.value) : either.value
      )
      return { color, gradient, either, eitherCss }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 420px">
        <ColorSelector v-model="color" mode="color" label="Colour only (the default)" />
        <ColorSelector v-model="gradient" mode="gradient" label="Gradient only" />
        <ColorSelector v-model="either" mode="both" label="Either" />
        <div :style="{ height: '80px', borderRadius: '6px', background: eitherCss }" />
        <code style="font-size: 11px; word-break: break-all">
          {{ typeof either === 'string' ? either : JSON.stringify(either) }}
        </code>
      </div>
    `
  })
}

export const WithAlpha: Story = {
  render: () => ({
    components: { ColorSelector },
    setup() {
      const value = ref('rgb(11 122 75 / 0.5)')
      return { value }
    },
    template: `
      <div style="max-width: 320px">
        <ColorSelector v-model="value" label="Overlay" alpha />
      </div>
    `
  })
}

/**
  A value the swatch cannot paint — `var()`, `color-mix()` — gets a question mark
  rather than an empty box, so "nothing set" and "something we cannot draw" do
  not look the same.
 */
export const UnpaintableValue: Story = {
  render: () => ({
    components: { ColorSelector },
    setup() {
      const value = ref('var(--octans-primary)')
      const empty = ref('')
      return { value, empty }
    },
    template: `
      <div style="display: flex; gap: 24px; flex-wrap: wrap">
        <ColorSelector v-model="value" label="Not a flat colour" />
        <ColorSelector v-model="empty" label="Nothing set" clearable />
      </div>
    `
  })
}

export const States: Story = {
  render: () => ({
    components: { ColorSelector },
    setup() {
      const value = ref('#be123c')
      return { value }
    },
    template: `
      <div style="display: flex; gap: 24px; flex-wrap: wrap">
        <ColorSelector v-model="value" label="With an error" error="Fails contrast against the surface" />
        <ColorSelector :model-value="value" label="Read only" readonly />
        <ColorSelector :model-value="value" label="Disabled" disabled />
        <ColorSelector v-model="value" label="Clearable" clearable />
        <ColorSelector v-model="value" label="Swatch only" :show-value="false" />
      </div>
    `
  })
}

/**
  `trigger="swatch"` takes the control back to the colour and nothing else — no
  border, no padding, no value text. For a toolbar, a table cell, a legend, or
  anywhere a form field would be more furniture than the one colour deserves.

  `swatchShape="circle"` makes it a dot, which reads unmistakably as *a colour*
  rather than as a small button. The shape carries through to the preset
  swatches inside the picker, so the two do not disagree.

  Raise `swatchSize` when the swatch is the whole control: the default 20px is
  right beside a value inside a bordered trigger and small as a thing to hit.
 */
export const BareTrigger: Story = {
  render: () => ({
    components: { ColorSelector },
    setup() {
      const brand = ref('#5f63e8')
      const accent = ref('#0d9488')
      const warn = ref('#f59e0b')
      const swatches = [
        '#5f63e8',
        '#0d9488',
        '#f59e0b',
        '#be123c',
        '#111827',
        '#ffffff'
      ]
      return { brand, accent, warn, swatches }
    },
    template: `
      <div style="display: grid; gap: 24px">
        <div style="display: flex; gap: 12px; align-items: center">
          <ColorSelector v-model="brand" trigger="swatch" :swatches="swatches" />
          <ColorSelector v-model="accent" trigger="swatch" :swatches="swatches" />
          <ColorSelector v-model="warn" trigger="swatch" :swatches="swatches" />
          <span style="color: var(--octans-text-subdued)">Squares, 20px — the default size</span>
        </div>

        <div style="display: flex; gap: 12px; align-items: center">
          <ColorSelector v-model="brand" trigger="swatch" swatch-shape="circle" :swatch-size="28" :swatches="swatches" />
          <ColorSelector v-model="accent" trigger="swatch" swatch-shape="circle" :swatch-size="28" :swatches="swatches" />
          <ColorSelector v-model="warn" trigger="swatch" swatch-shape="circle" :swatch-size="28" :swatches="swatches" />
          <span style="color: var(--octans-text-subdued)">Circles at 28px</span>
        </div>

        <div style="display: flex; gap: 12px; align-items: center">
          <ColorSelector v-model="brand" swatch-shape="circle" label="" />
          <span style="color: var(--octans-text-subdued)">A circle inside the ordinary trigger</span>
        </div>
      </div>
    `
  })
}

/**
  The palette is `swatches`, and it is yours: define it wherever you like and
  bind it with `v-model:swatches`. With `rememberSwatches`, every colour you
  pick goes to the front of it — so a list held outside the field can be shared
  between several of them, or persisted, and fills itself in as you work.

  A colour is remembered when the popover CLOSES. Every position on the
  saturation square emits as you cross it, and remembering those would fill the
  palette with colours nobody chose.

  `maxSwatches` caps the list. Set it when the palette is a recently-used list,
  and leave it off when it is one you curated — the cap drops entries off the
  end, which is where a curated palette keeps what it was given.
 */
export const RememberedSwatches: Story = {
  render: () => ({
    components: { ColorSelector },
    setup() {
      // Held out here, so both fields draw on the same list and both add to it.
      const recent = ref<string[]>(['#5f63e8', '#0d9488'])
      const background = ref('#ffffff')
      const text = ref('#111827')
      return { recent, background, text }
    },
    template: `
      <div style="display: grid; gap: 16px; max-width: 420px">
        <div style="display: flex; gap: 24px">
          <ColorSelector
            v-model="background"
            v-model:swatches="recent"
            remember-swatches
            :max-swatches="8"
            label="Background"
          />
          <ColorSelector
            v-model="text"
            v-model:swatches="recent"
            remember-swatches
            :max-swatches="8"
            label="Text"
          />
        </div>

        <div>
          <div style="color: var(--octans-text-subdued); margin-bottom: 6px">
            The shared palette, most recent first — pick a colour in either field
            and watch it arrive:
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap">
            <span
              v-for="swatch in recent"
              :key="swatch"
              :title="swatch"
              :style="{
                width: '24px',
                height: '24px',
                borderRadius: 'var(--octans-radius-full)',
                background: swatch,
                border: '1px solid var(--octans-border-strong)'
              }"
            />
          </div>
          <pre style="margin-top: 8px">{{ recent }}</pre>
        </div>
      </div>
    `
  })
}

/**
  `trigger="input"` puts the value in a text field you can type into, with the
  swatch beside it still opening the picker. For the case where the colour is
  usually pasted or typed and the picker is the fallback rather than the point.

  The field commits on Enter or on leaving it, never while you type: `#ff` on
  the way to `#ff0000` is a half-written colour, and pushing each keystroke
  through the model would paint the swatch with two colours nobody chose. A
  value it cannot paint is still accepted — `var(--brand)` is a legitimate thing
  to want here, and the swatch says it cannot draw it rather than refusing it.

  `fullWidth` stretches the control to its container, so it lines up with the
  `TextField`s around it in a form.
 */
export const Editable: Story = {
  render: () => ({
    components: { ColorSelector },
    setup() {
      const brand = ref('#5f63e8')
      const token = ref('var(--brand-500)')
      const surface = ref('#f8f9fb')
      return { brand, token, surface }
    },
    template: `
      <div style="display: grid; gap: 16px; max-width: 320px">
        <ColorSelector v-model="brand" trigger="input" label="Brand" full-width />
        <ColorSelector
          v-model="token"
          trigger="input"
          label="From a token"
          help-text="Accepted, and marked as something the swatch cannot draw."
          full-width
        />
        <ColorSelector
          v-model="surface"
          trigger="input"
          label="Surface"
          full-width
          clearable
        />
        <ColorSelector
          v-model="brand"
          trigger="input"
          label="Not stretched"
        />
        <pre>{{ { brand, token, surface } }}</pre>
      </div>
    `
  })
}
