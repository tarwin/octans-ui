import type { Meta, StoryObj } from '@storybook/vue3-vite'
import PageActions from './PageActions.vue'

const meta = {
  title: 'Components/Layout/PageActions',
  component: PageActions,
  tags: ['autodocs'],
  args: {
    primaryAction: {
      label: 'asdf'
    }
  }
} satisfies Meta<typeof PageActions>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { PageActions },
    setup() {
      return {
        actionLog: (action: string) => {
          console.log('action log:', action)
        }
      }
    },
    template: `
      <PageActions
        :primaryAction="{
          label: 'Save',
          onAction: () => actionLog('Save')
        }"
        :secondaryActions="[
          {
            label: 'Delete work',
            onAction: () => actionLog('Delete'),
            type: 'destructive'
          },
          {
            label: 'Withdraw from display',
            disabled: true,
            icon: 'mdi:elephant'
          }
        ]"
      />
    `
  })
}
