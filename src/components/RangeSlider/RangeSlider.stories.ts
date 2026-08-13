import { RangeSlider } from '@/components/RangeSlider'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Components/Forms/RangeSlider',
  component: RangeSlider,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof RangeSlider>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: () => ({
    components: { RangeSlider },
    setup() {
      const value = ref(5)
      return { value }
    },
    template: `
      <RangeSlider
        label="Number of products"
        :min="1"
        :max="100"
        help-text="The maximum number of products to be included."
        v-model="value"
      />
      <pre>{{ value }}</pre>
    `
  })
}

export const Disabled: Story = {
  render: () => ({
    components: { RangeSlider },
    setup() {
      const value = ref(5)
      return { value }
    },
    template: `
      <RangeSlider
        label="Number of products"
        :min="1"
        :max="100"
        help-text="The maximum number of products to be included."
        disabled
        v-model="value"
      />
      <pre>{{ value }}</pre>
    `
  })
}

export const Readonly: Story = {
  render: () => ({
    components: { RangeSlider },
    setup() {
      const value = ref(30)
      return { value }
    },
    template: `
      <RangeSlider
        label="Number of products"
        :min="1"
        :max="100"
        help-text="The maximum number of products to be included."
        readonly
        v-model="value"
      />
      <pre>{{ value }}</pre>
    `
  })
}

/**
 * With an attribute of `step` equal to 0.01
 */
export const StepValues: Story = {
  render: () => ({
    components: { RangeSlider },
    setup() {
      const value = ref(5)
      return { value }
    },
    template: `
      <RangeSlider
        label="What is your hunger level?"
        :min="0"
        :step="0.01"
        :max="100"
        help-text="10% meh, 50% could go a nibble, 100% could eat a horse"
        v-model="value"
      />
      <pre>{{ value }}</pre>
    `
  })
}
