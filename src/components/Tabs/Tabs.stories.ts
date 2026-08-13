import { Card, CardSection } from '@/components/Card'
import { Icon } from '@/components/Icon'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Tabs from './Tabs.vue'

const meta = {
  title: 'Components/Navigation/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const VModel: Story = {
  render: () => ({
    components: { Tabs, Card, CardSection },
    setup() {
      const selected = ref('all')
      return {
        selected,
        tabs: [
          { value: 'all', label: 'All' },
          { value: 'running', label: 'Active' },
          { value: 'published', label: 'Scheduled' },
          { value: 'draft', label: 'Draft' },
          { value: 'trashed', label: 'Trashed' },
          { value: 'all1', label: 'All1' },
          { value: 'running2', label: 'Active2' },
          { value: 'published3', label: 'Scheduled3' },
          { value: 'draft4', label: 'Draft4' },
          { value: 'trashed5', label: 'Trashed5' }
        ]
      }
    },
    template: `
    <Card>
      <Tabs
        :tabs="tabs"
        v-model:selected="selected"
      />
      <CardSection>Do something with selected tab: {{ selected }}</CardSection>
    </Card>
    `
  })
}

export const Purple: Story = {
  render: () => ({
    components: { Tabs, Card, CardSection },
    setup() {
      const selected = ref('all')
      return {
        selected,
        tabs: [
          { value: 'all', label: 'All' },
          { value: 'running', label: 'Active' },
          { value: 'published', label: 'Scheduled' },
          { value: 'draft', label: 'Draft' },
          { value: 'trashed', label: 'Trashed' },
          { value: 'all1', label: 'All1' },
          { value: 'running2', label: 'Active2' },
          { value: 'published3', label: 'Scheduled3' },
          { value: 'draft4', label: 'Draft4' },
          { value: 'trashed5', label: 'Trashed5' }
        ]
      }
    },
    template: `
    <Card>
      <Tabs
        :tabs="tabs"
        v-model:selected="selected"
        theme="purple"
      />
      <CardSection>Do something with selected tab: {{ selected }}</CardSection>
    </Card>
    `
  })
}

export const NoVModel: Story = {
  render: () => ({
    components: { Tabs, Card, CardSection },
    setup() {
      const currentTab = ref({ value: 'all', label: 'All' })
      return {
        currentTab,
        tabs: [
          { value: 'all', label: 'All' },
          { value: 'running', label: 'Active' },
          { value: 'published', label: 'Scheduled' },
          { value: 'draft', label: 'Draft' },
          { value: 'trashed', label: 'Trashed' }
        ]
      }
    },
    template: `
      <Card>
        <Tabs
          :tabs="tabs"
          :selected="currentTab && currentTab.id"
          @update:selected="(id, tab) => (currentTab = tab)"
        />
        <CardSection>
          {{ currentTab }}
        </CardSection>
      </Card>
    `
  })
}

/**
 * Note: Only _truthy_ badge content will be rendered. This means if you really
 * want to render the number zero (`0`) you should pass it as a string (`"0"`).
 */
export const WithBadges: Story = {
  render: () => ({
    components: { Tabs, Card },
    setup() {
      const selected = ref('all')
      return {
        selected,
        tabs: [
          { value: 'all', label: 'All', badge: '3' },
          {
            value: 'running',
            label: 'Active',
            badge: 'Hello',
            badgeStatus: 'warning',
            badgeProgress: 'partiallyComplete'
          },
          { value: 'published', label: 'Scheduled' },
          { value: 'draft', label: 'Draft' },
          { value: 'trashed', label: 'Trashed' }
        ]
      }
    },
    template: `
      <Card>
        <Tabs
          :tabs="tabs"
          v-model="selected"
        />
      </Card>
    `
  })
}

export const CustomTabContent: Story = {
  render: () => ({
    components: { Tabs, Card, Icon },
    setup() {
      const selected = ref('endpoint')
      return {
        selected,
        tabs: [
          {
            value: 'endpoint',
            label: 'Endpoint',
            icon: 'mdi:check-circle-outline'
          },
          { value: 'proxy', label: 'Proxy Subdomain' },
          { value: 'javascript', label: 'JavaScript Embed Code' }
        ]
      }
    },
    template: `
      <Card>
        <Tabs
          :tabs="tabs"
          v-model:selected="selected"
        >
          <template v-slot:tab="{ tab }">
            {{ tab.label }}
            <Icon
              v-if="tab.icon"
              :icon="tab.icon"
              style="color: green; margin-left: 0.5rem"
            />
          </template>
        </Tabs>
      </Card>
    `
  })
}
