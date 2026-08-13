import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Banner from './Banner.vue'

const meta = {
  title: 'Components/Feedback/Banner',
  component: Banner,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof Banner>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => ({
    components: { Banner },
    template: `
      <Banner title="Default"> How's things with you?</Banner>
      <br />
      <Banner title="Info" status="info">How's things with you?</Banner>
      <br />
      <Banner title="Success" status="success">
        How's things with you?
      </Banner>
      <br />
      <Banner title="Warning" status="warning">
        How's things with you?
      </Banner>
      <br />
      <Banner title="Error" status="error">
        How's things with you?
      </Banner>
      <br />
      <Banner title="New" status="new">
        How's things with you?
      </Banner>
    `
  })
}

export const WithCloseButton: Story = {
  render: () => ({
    components: { Banner },
    setup() {
      const visible = ref(true)
      return { visible }
    },
    template: `
      <Banner
        v-if="visible"
        status="info"
        @close="visible = false"
      >How's things with you?</Banner>
    `
  })
}

export const BasicBanner: Story = {
  render: () => ({
    components: { Banner },
    template: `
      <Banner
        :icon="false"
      >How's things with you?</Banner>
    `
  })
}
