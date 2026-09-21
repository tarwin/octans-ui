import { Card, CardSection } from '@/components/Card'
import { Icon } from '@/components/Icon'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Tabs from './Tabs.vue'
import { Splitter } from '@/components/Splitter'

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

/**
 * `indicator="bar"` marks the selected tab with a rounded bar sitting on the
 * divider, instead of the default rule under the label. Both draw from
 * `--octans-primary` — this is a shape choice, not a colour one.
 *
 * The prop is a shortcut. The mark is drawn from four tokens, so the app-wide
 * choice belongs in the theme — set them in the Theme Builder, or in your own
 * stylesheet, and every `Tabs` follows without a line of JavaScript:
 *
 * ```css
 * :root {
 *   --octans-tabs-indicator-height: 5px;
 *   --octans-tabs-indicator-radius: var(--octans-radius-field);
 *   --octans-tabs-indicator-offset: -2px;
 *   --octans-tabs-label-gap: 8px;
 * }
 * ```
 *
 * A `Tabs` that sets `indicator` itself still wins, in both directions:
 * `indicator="underline"` opts back out of a themed bar.
 */
export const BarIndicator: Story = {
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
        indicator="bar"
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
          v-model:selected="selected"
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

const MANY_TABS = [
  { value: 'all', label: 'All', icon: 'mdi:inbox', badge: '42' },
  { value: 'draft', label: 'Draft', badge: '3', badgeStatus: 'attention' },
  { value: 'scheduled', label: 'Scheduled', icon: 'mdi:clock-outline' },
  {
    value: 'published',
    label: 'Published',
    icon: 'mdi:send',
    badge: '12',
    badgeStatus: 'success'
  },
  { value: 'archived', label: 'Archived' },
  { value: 'trashed', label: 'Trashed', disabled: true },
  { value: 'flagged', label: 'Flagged', icon: 'mdi:alert-octagon' },
  { value: 'shared', label: 'Shared with me' },
  { value: 'starred', label: 'Starred', icon: 'mdi:star' }
]

/** A tab's `icon` is drawn before its label, in the strip and in the menu. */
export const WithIcons: Story = {
  render: () => ({
    components: { Tabs, Card },
    setup() {
      const selected = ref('all')
      return { selected, tabs: MANY_TABS.slice(0, 4) }
    },
    template: `
      <Card>
        <Tabs :tabs="tabs" v-model:selected="selected" />
      </Card>
    `
  })
}

/**
 * The tabs that do not fit move into a menu at the end of the strip, in
 * order, and nothing is held back for the menu while everything fits. When the
 * selected tab is in the menu the button shows it — icon and badge included —
 * and carries the indicator. Resize the card to see the strip give way one tab
 * at a time; it keeps its height even with every tab in the menu.
 */
export const OverflowMenu: Story = {
  render: () => ({
    components: { Tabs, Card, Splitter },
    setup() {
      const selected = ref('starred')
      const size = ref<number | string>('60%')
      return { selected, size, tabs: MANY_TABS }
    },
    template: `
      <div style="height: 200px; border: 1px solid var(--octans-border); border-radius: var(--octans-radius-box); overflow: hidden">
        <Splitter v-model:size="size" :min="120">
          <template #start>
            <div style="padding: 16px">
              <Card>
                <Tabs :tabs="tabs" v-model:selected="selected" />
                <div style="padding: 16px">Selected: {{ selected }}</div>
              </Card>
            </div>
          </template>
          <template #end>
            <div style="height: 100%; padding: 16px; background: var(--octans-surface-sunken)">Drag the gutter</div>
          </template>
        </Splitter>
      </div>
    `
  })
}

/**
 * `overflow="scroll"` keeps every tab in the strip and scrolls it sideways
 * instead, without a scrollbar; the edge with more tabs behind it fades, and
 * selecting a tab scrolls it into view. `:scroll-indicators="false"` drops
 * the fades, as in the second strip.
 */
export const OverflowScroll: Story = {
  render: () => ({
    components: { Tabs, Card },
    setup() {
      const selected = ref('all')
      return { selected, tabs: MANY_TABS }
    },
    template: `
      <div style="max-width: 480px">
        <Card>
          <Tabs :tabs="tabs" v-model:selected="selected" overflow="scroll" />
          <div style="padding: 16px">Selected: {{ selected }}</div>
        </Card>
        <div style="height: 16px"></div>
        <Card>
          <Tabs :tabs="tabs" v-model:selected="selected" overflow="scroll" :scroll-indicators="false" />
        </Card>
      </div>
    `
  })
}
