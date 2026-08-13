import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import { createGradient, gradientCss } from '@/utils/gradient'
import GradientPicker from './GradientPicker.vue'

const meta = {
  title: 'Components/Forms/GradientPicker',
  component: GradientPicker,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof GradientPicker>

export default meta
type Story = StoryObj<typeof meta>

/**
  The bare surface. Drag the handles to move stops, click the bar to add one
  where you clicked — the new stop takes the colour already passing through
  there, so adding it never changes how the gradient looks.
 */
export const Basic: Story = {
  render: () => ({
    components: { GradientPicker },
    setup() {
      const value = ref(
        createGradient({
          stops: [
            { color: '#ffd400', position: 0 },
            { color: '#0038ff', position: 100 }
          ]
        })
      )
      const css = computed(() => gradientCss(value.value))
      return { value, css }
    },
    template: `
      <div style="max-width: 320px">
        <GradientPicker v-model="value" />
        <p style="font-family: monospace; font-size: 11px; word-break: break-all">
          {{ value.stops.length }} stops, {{ value.type }} {{ value.angle }}°,
          blended in {{ value.space }}
        </p>
      </div>
    `
  })
}

/**
  The interpolation space is most of what separates a good gradient from a muddy
  one. Yellow to blue is the clearest demonstration: sRGB passes through a dead
  olive, OKLCh keeps its chroma the whole way and travels through teal.
 */
export const InterpolationSpaces: Story = {
  render: () => ({
    setup() {
      const spaces = ['oklch', 'oklab', 'srgb', 'hsl'] as const
      const bars = spaces.map((space) => ({
        space,
        css: gradientCss(
          createGradient({
            space,
            stops: [
              { color: '#ffd400', position: 0 },
              { color: '#0038ff', position: 100 }
            ]
          })
        )
      }))
      return { bars }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px; max-width: 420px">
        <div v-for="bar in bars" :key="bar.space">
          <strong style="font-size: 11px; text-transform: uppercase">{{ bar.space }}</strong>
          <div :style="{ height: '32px', borderRadius: '4px', backgroundImage: bar.css }" />
        </div>
      </div>
    `
  })
}

/**
  `alpha` lets stops carry transparency. Fading out is interpolated
  premultiplied, so a colour keeps its hue as it disappears instead of sliding
  towards the grey that `transparent` literally is.
 */
export const WithAlpha: Story = {
  render: () => ({
    components: { GradientPicker },
    setup() {
      const value = ref(
        createGradient({
          space: 'srgb',
          stops: [
            { color: '#ff0000', position: 0 },
            { color: 'transparent', position: 100 }
          ]
        })
      )
      return { value }
    },
    template: `
      <div style="max-width: 320px">
        <GradientPicker v-model="value" alpha />
      </div>
    `
  })
}

/**
  `hideShape` drops the shape and angle controls — for when only the colours
  along the gradient matter. Generating a colour ramp works this way: it samples
  positions and never draws the gradient at all.

  `pinStart` and `pinEnd` hold the outermost stops on the edges, so the gradient
  always spans its whole range. Without them a stop dragged inward leaves a flat
  run of colour at the edge — which for a ramp means several steps coming out
  identical.

  The constraint is on the ENDS, not on a particular stop: remove a pinned stop
  and the next one is pulled out to the edge.
 */
export const Pinned: Story = {
  render: () => ({
    components: { GradientPicker },
    setup() {
      const pinned = ref(
        createGradient({
          stops: [
            { color: '#f8fafc', position: 0 },
            { color: '#5f63e8', position: 45 },
            { color: '#0f172a', position: 100 }
          ]
        })
      )
      const free = ref(
        createGradient({
          stops: [
            { color: '#f8fafc', position: 0 },
            { color: '#0f172a', position: 100 }
          ]
        })
      )
      return { pinned, free }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px; max-width: 320px">
        <div>
          <strong style="font-size: 12px">Pinned — the ends will not move</strong>
          <GradientPicker v-model="pinned" hide-shape pin-start pin-end />
        </div>
        <div>
          <strong style="font-size: 12px">Free — drag either end inward</strong>
          <GradientPicker v-model="free" hide-shape />
        </div>
      </div>
    `
  })
}

/**
  `minStops` and `maxStops` bound how many stops the user may leave or add. The
  floor is never below 2 whatever you pass — one stop is not a gradient.
 */
export const StopLimits: Story = {
  render: () => ({
    components: { GradientPicker },
    setup() {
      const value = ref(
        createGradient({
          stops: [
            { color: '#ffd400', position: 0 },
            { color: '#0b7a4b', position: 50 },
            { color: '#0038ff', position: 100 }
          ]
        })
      )
      return { value }
    },
    template: `
      <div style="max-width: 320px">
        <GradientPicker v-model="value" hide-shape :min-stops="3" :max-stops="4" />
        <p style="font-size: 11px">
          At least 3, at most 4 — {{ value.stops.length }} now.
        </p>
      </div>
    `
  })
}

/**
  Conic gradients wrap, so the first and last stop meet. Give them the same
  colour or the join shows as a seam.

  The surface draws no preview of the painted shape — it is a control, and where
  the result belongs is the caller's business. `gradientCss()` gives you the CSS.
 */
export const Shapes: Story = {
  render: () => ({
    components: { GradientPicker },
    setup() {
      const value = ref(
        createGradient({
          type: 'conic',
          stops: [
            { color: '#5f63e8', position: 0 },
            { color: '#0b7a4b', position: 50 },
            { color: '#5f63e8', position: 100 }
          ]
        })
      )
      const css = computed(() => gradientCss(value.value))
      return { value, css }
    },
    template: `
      <div style="max-width: 320px">
        <GradientPicker v-model="value" />
        <div :style="{ marginTop: '12px', height: '140px', borderRadius: '6px', backgroundImage: css }" />
      </div>
    `
  })
}

/**
  `inlineColor` swaps the stop's colour swatch for an always-visible picker.
  Worth setting when the gradient surface is itself inside a popover: opening a
  second popover from within the first works, but a third floating layer is a
  small target to reach across. `ColorSelector` sets it for you.
 */
export const InlineColor: Story = {
  render: () => ({
    components: { GradientPicker },
    setup() {
      const value = ref(
        createGradient({
          stops: [
            { color: '#ffd400', position: 0 },
            { color: '#0038ff', position: 100 }
          ]
        })
      )
      return { value }
    },
    template: `
      <div style="max-width: 320px">
        <GradientPicker v-model="value" inline-color />
      </div>
    `
  })
}

export const Disabled: Story = {
  render: () => ({
    components: { GradientPicker },
    setup: () => ({ value: createGradient() }),
    template: `
      <div style="max-width: 320px">
        <GradientPicker :model-value="value" disabled />
      </div>
    `
  })
}
