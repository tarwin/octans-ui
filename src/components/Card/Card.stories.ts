import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Stack } from '@/components/Stack'
import { TextStyle } from '@/components/TextStyle'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Card from './Card.vue'
import CardSection from './CardSection.vue'

/**
 * Cards group similar concepts and tasks together to make screens easier for
 * users to scan, read, and get things done.
 *
 * A `Card` is a shell with an optional header (title + actions). Content lives
 * in one or more `CardSection` children, which are separated by a divider and
 * can carry their own title and actions.
 */
const meta = {
  title: 'Components/Layout/Card',
  component: Card,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => ({
    components: { Card, CardSection },
    template: `
      <Card title="The Card">
        <CardSection title="Section">
          Some text
        </CardSection>
      </Card>
    `
  })
}

/**
 * A card doesn't need a title — content can be placed straight into a section.
 */
export const NoTitle: Story = {
  render: () => ({
    components: { Card, CardSection },
    template: `
      <Card>
        <CardSection>
          A card with no header at all. Useful when the surrounding page already
          provides the context.
        </CardSection>
      </Card>
    `
  })
}

/**
 * Content can also be placed directly in the card without a `CardSection`, but
 * then you're responsible for the padding.
 */
export const WithoutSection: Story = {
  render: () => ({
    components: { Card },
    template: `
      <Card title="No sections">
        <div style="padding: 16px">
          Raw content in the default slot. Note the card itself has no padding.
        </div>
      </Card>
    `
  })
}

/**
 * Multiple sections are divided by a border. Sections stack vertically in the
 * order they're declared.
 */
export const MultipleSections: Story = {
  render: () => ({
    components: { Card, CardSection },
    template: `
      <Card title="Accession record">
        <CardSection title="Artist">
          Johannes Vermeer &mdash; 1632&ndash;1675
        </CardSection>
        <CardSection title="Location">
          West Wing, Gallery 4, Melbourne VIC 3000
        </CardSection>
        <CardSection title="Medium">
          Oil on canvas, 45 &times; 39 cm
        </CardSection>
      </Card>
    `
  })
}

/**
 * `subdued` gives the card a subtle grey background. Handy for secondary or
 * inactive content.
 */
export const Subdued: Story = {
  render: () => ({
    components: { Card, CardSection },
    template: `
      <div>
        <Card title="Normal card">
          <CardSection>Default white background.</CardSection>
        </Card>
        <Card subdued title="Subdued card">
          <CardSection>Subtle grey background.</CardSection>
        </Card>
      </div>
    `
  })
}

/**
 * Sections can be subdued individually — useful for footers, totals or
 * supporting information inside an otherwise normal card.
 */
export const SubduedSection: Story = {
  render: () => ({
    components: { Card, CardSection },
    template: `
      <Card title="Invoice">
        <CardSection>
          3 items &mdash; $120.00
        </CardSection>
        <CardSection subdued>
          <strong>Total: $132.00</strong> (incl. GST)
        </CardSection>
      </Card>
    `
  })
}

/**
 * Actions are rendered as plain buttons in the header. Each action is an
 * object:
 *
 * ```ts
 * interface Action {
 *   label: string
 *   icon?: string
 *   disabled?: boolean
 *   tooltip?: string
 *   tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'
 *   url?: string
 *   external?: boolean
 *   visible?: boolean
 *   onAction?(): void
 * }
 * ```
 */
export const WithActions: Story = {
  render: () => ({
    components: { Card, CardSection },
    setup() {
      const log = ref<string[]>([])
      return {
        log,
        actions: [
          {
            label: 'Edit',
            icon: 'mdi:pencil',
            onAction: () => log.value.push('Edit')
          },
          {
            label: 'Delete',
            icon: 'mdi:trash-can-outline',
            onAction: () => log.value.push('Delete')
          }
        ]
      }
    },
    template: `
      <Card title="With actions" :actions="actions">
        <CardSection>
          Clicked: {{ log.join(', ') || 'nothing yet' }}
        </CardSection>
      </Card>
    `
  })
}

/**
 * Actions support `disabled`, `tooltip`, `visible` and link behaviour
 * (`url` / `external`).
 */
export const ActionVariations: Story = {
  render: () => ({
    components: { Card, CardSection },
    setup() {
      return {
        actions: [
          { label: 'Enabled', icon: 'mdi:check', onAction: () => {} },
          { label: 'Disabled', icon: 'mdi:cancel', disabled: true },
          {
            label: 'Tooltip',
            icon: 'mdi:information',
            tooltip: 'Some help text',
            tooltipPosition: 'bottom'
          },
          {
            label: 'External link',
            icon: 'mdi:open-in-new',
            url: 'https://example.com',
            external: true
          },
          { label: 'Hidden', icon: 'mdi:eye-off', visible: false }
        ]
      }
    },
    template: `
      <Card title="Action variations" :actions="actions">
        <CardSection>
          The "Hidden" action has <code>visible: false</code> so it isn't rendered.
        </CardSection>
      </Card>
    `
  })
}

/**
 * `collapseActions` collapses the header actions into a single "..." menu,
 * which keeps busy headers tidy.
 */
export const CollapsedActions: Story = {
  render: () => ({
    components: { Card, CardSection },
    setup() {
      const last = ref('')
      return {
        last,
        actions: [
          {
            label: 'Duplicate',
            icon: 'mdi:content-copy',
            onAction: () => (last.value = 'Duplicate')
          },
          {
            label: 'Archive',
            icon: 'mdi:archive',
            onAction: () => (last.value = 'Archive')
          },
          {
            label: 'Delete',
            icon: 'mdi:trash-can-outline',
            onAction: () => (last.value = 'Delete')
          }
        ]
      }
    },
    template: `
      <Card title="Collapsed actions" :actions="actions" collapseActions>
        <CardSection>
          Last action: {{ last || 'none' }}
        </CardSection>
      </Card>
    `
  })
}

/**
 * Sections have their own `actions` / `collapseActions` props, so each section
 * can carry its own controls.
 */
export const SectionActions: Story = {
  render: () => ({
    components: { Card, CardSection },
    setup() {
      return {
        cardActions: [
          { label: 'Settings', icon: 'mdi:cog', onAction: () => {} }
        ],
        sectionActions: [
          { label: 'Add', icon: 'mdi:plus', onAction: () => {} }
        ],
        moreActions: [
          { label: 'Import', icon: 'mdi:upload', onAction: () => {} },
          { label: 'Export', icon: 'mdi:download', onAction: () => {} }
        ]
      }
    },
    template: `
      <Card title="Card and section actions" :actions="cardActions">
        <CardSection title="Team members" :actions="sectionActions">
          Jane, John, Jo
        </CardSection>
        <CardSection title="Data" :actions="moreActions" collapseActions>
          Import or export from the section menu.
        </CardSection>
      </Card>
    `
  })
}

/**
 * Use the `title` slot when you need more than plain text in the heading — for
 * example a badge or an icon alongside the title.
 */
export const CustomTitle: Story = {
  render: () => ({
    components: { Card, CardSection, Badge, Stack },
    template: `
      <Card>
        <template #title>
          <Stack alignment="center" spacing="tight">
            <strong>Exhibition</strong>
            <Badge status="success">Live</Badge>
          </Stack>
        </template>
        <CardSection>
          <template #title>
            <Stack alignment="center" spacing="tight">
              <span>Performance</span>
              <Badge status="info">Beta</Badge>
            </Stack>
          </template>
          The <code>title</code> slot overrides the <code>title</code> prop on both
          Card and CardSection.
        </CardSection>
      </Card>
    `
  })
}

/**
 * Sections are padded by default. Set `:padded="false"` for full-bleed content
 * such as tables or lists that manage their own spacing.
 */
export const NotPadded: Story = {
  render: () => ({
    components: { Card, CardSection },
    template: `
      <Card title="Full bleed content">
        <CardSection title="Rows" :padded="false">
          <div
            v-for="row in ['One', 'Two', 'Three']"
            :key="row"
            style="padding: 8px 16px; border-top: 1px solid #e7e9ec"
          >
            {{ row }}
          </div>
        </CardSection>
      </Card>
    `
  })
}

/**
 * Sections can be rendered conditionally — dividers still work correctly since
 * they're based on adjacent siblings.
 */
export const ConditionalSections: Story = {
  render: () => ({
    components: { Card, CardSection, Button },
    setup() {
      const showExtra = ref(false)
      return { showExtra }
    },
    template: `
      <Card title="Conditional sections">
        <CardSection>
          <Button @click="showExtra = !showExtra">
            {{ showExtra ? 'Hide' : 'Show' }} extra section
          </Button>
        </CardSection>
        <CardSection v-if="showExtra" subdued title="Extra">
          This section only exists when toggled on.
        </CardSection>
      </Card>
    `
  })
}

/**
 * Cards stacked next to each other automatically get spacing between them.
 */
export const StackedCards: Story = {
  render: () => ({
    components: { Card, CardSection },
    template: `
      <div>
        <Card title="First card">
          <CardSection>Content</CardSection>
        </Card>
        <Card title="Second card">
          <CardSection>Content</CardSection>
        </Card>
        <Card title="Third card" subdued>
          <CardSection>Content</CardSection>
        </Card>
      </div>
    `
  })
}

/**
 * A realistic combination: header actions, several sections, a subdued footer
 * section and some formatted content.
 */
export const KitchenSink: Story = {
  render: () => ({
    components: { Card, CardSection, Badge, Button, Stack, TextStyle },
    setup() {
      const status = ref('Draft')
      return {
        status,
        actions: [
          { label: 'Preview', icon: 'mdi:eye', tooltip: 'Preview exhibition' },
          { label: 'Edit', icon: 'mdi:pencil' },
          {
            label: 'Delete',
            icon: 'mdi:trash-can-outline',
            onAction: () => (status.value = 'Deleted')
          }
        ]
      }
    },
    template: `
      <Card :actions="actions" collapseActions>
        <template #title>
          <Stack alignment="center" spacing="tight">
            <strong>Light and Colour</strong>
            <Badge status="warning">{{ status }}</Badge>
          </Stack>
        </template>

        <CardSection title="Overview">
          <TextStyle type="subdued">
            Running from 1 Dec to 31 Dec across all four galleries.
          </TextStyle>
        </CardSection>

        <CardSection title="Metrics" :padded="false">
          <div
            v-for="metric in [
              { label: 'Works on show', value: '128' },
              { label: 'Visitors', value: '128,402' },
              { label: 'Audio guide plays', value: '3,204' }
            ]"
            :key="metric.label"
            style="display: flex; justify-content: space-between; padding: 8px 16px; border-top: 1px solid #e7e9ec"
          >
            <span>{{ metric.label }}</span>
            <TextStyle type="strong">{{ metric.value }}</TextStyle>
          </div>
        </CardSection>

        <CardSection subdued>
          <Stack alignment="center">
            <Button type="primary" @click="status = 'Live'">Publish</Button>
            <Button @click="status = 'Draft'">Reset</Button>
          </Stack>
        </CardSection>
      </Card>
    `
  })
}
