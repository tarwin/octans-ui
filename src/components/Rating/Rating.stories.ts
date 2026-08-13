import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Rating from './Rating.vue'

const meta = {
  title: 'Components/Forms/Rating',
  component: Rating,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof Rating>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: () => ({
    components: { Rating },
    setup() {
      const value = ref(3)
      return { value }
    },
    template: `
      <div>
        <Rating label="Rate it" v-model="value" />
        value: {{ value }}
      </div>
    `
  })
}

/**
  Set `allowHalf` to let users pick half values by clicking the left half of an
  icon.
 */
export const HalfStars: Story = {
  render: () => ({
    components: { Rating },
    setup() {
      const value = ref(2.5)
      return { value }
    },
    template: `
      <div>
        <Rating label="Half stars" v-model="value" allow-half />
        value: {{ value }}
      </div>
    `
  })
}

/**
  Fractional values always render, even without `allowHalf` — handy for showing
  a read-only average like 3.7.
 */
export const ReadonlyAverage: Story = {
  render: () => ({
    components: { Rating },
    template: `
      <Rating label="Average score (3.7)" :modelValue="3.7" readonly />
    `
  })
}

/**
  Pass any icon name to `emptyIcon` / `fullIcon`, plus custom colors. An
  outline/filled pair reads best — the empty state needs to look empty.

  Colours can be literals (Hearts) or tokens (Ideas). Prefer tokens: they
  follow the theme, including dark mode. The default star gold is itself a
  token, `--octans-rating`.
 */
export const CustomIconsAndColors: Story = {
  render: () => ({
    components: { Rating },
    setup() {
      const value = ref(3)
      return { value }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px">
        <Rating
          label="Hearts"
          v-model="value"
          empty-icon="mdi:heart-outline"
          full-icon="mdi:heart"
          empty-color="#f3c0c0"
          full-color="#e0245e"
          hover-color="#ff5c8a"
        />
        <Rating
          label="Ideas"
          v-model="value"
          empty-icon="mdi:lightbulb-outline"
          full-icon="mdi:lightbulb"
          full-color="var(--octans-primary)"
          hover-color="var(--octans-primary-400)"
        />
      </div>
    `
  })
}

/**
  `clearable` resets to `0` when you click the icon matching the current value.
 */
export const Clearable: Story = {
  render: () => ({
    components: { Rating },
    setup() {
      const value = ref(4)
      return { value }
    },
    template: `
      <div>
        <Rating label="Click the active star to clear" v-model="value" clearable />
        value: {{ value }}
      </div>
    `
  })
}

export const TenStarsLarge: Story = {
  render: () => ({
    components: { Rating },
    setup() {
      const value = ref(7)
      return { value }
    },
    template: `
      <div>
        <Rating label="Out of ten" v-model="value" :stars="10" :size="28" />
        value: {{ value }}
      </div>
    `
  })
}

export const Disabled: Story = {
  render: () => ({
    components: { Rating },
    template: `
      <Rating label="Disabled" :modelValue="3" disabled />
    `
  })
}

/**
  Set `tooltip` to show the value on hover. Interactive ratings show the value
  under the pointer (what clicking would select); `readonly` / `disabled`
  ratings show the current value.
 */
export const WithTooltip: Story = {
  render: () => ({
    components: { Rating },
    setup() {
      const value = ref(3)
      return { value }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px; padding-top: 24px">
        <Rating label="Interactive (hover a star)" v-model="value" allow-half tooltip />
        <Rating label="Read-only (shows current value)" :modelValue="3.7" readonly tooltip />
      </div>
    `
  })
}
