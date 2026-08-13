import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Pagination from './Pagination.vue'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Components/Navigation/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    offset: 0,
    limit: 10,
    total: 250
  },
  render: () => ({
    components: { Pagination },
    setup() {
      return {
        offset: 0,
        limit: 10,
        total: 250
      }
    },
    template: `
      <Pagination
        :offset="offset"
        :limit.sync="limit"
        :total="total"
        :max-pages="5"
        @change="val => offset = val"
      />
      <pre>offset: {{offset}}, limit: {{limit}}, total: {{total}}</pre>
    `
  })
}
