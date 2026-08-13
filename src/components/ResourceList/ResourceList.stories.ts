import { Badge } from '@/components/Badge'
import { Card } from '@/components/Card'
import { ResourceItem, ResourceList } from '@/components/ResourceList'
import { Stack } from '@/components/Stack'
import { TextStyle } from '@/components/TextStyle'
import artworksData from '@/styleguide/artworks.json'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

const artworks = artworksData.slice(0, 6)

const meta = {
  title: 'Components/Data Display/ResourceList',
  component: ResourceList,
  tags: ['autodocs'],
  args: {
    columns: [],
    items: []
  }
} satisfies Meta<typeof ResourceList>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A column's `format` names a formatter from `format()`, and the value is run
 * through it — the same set `DataTable` uses.
 */
export const Primary: Story = {
  render: () => ({
    components: { ResourceList, Card },
    setup() {
      return {
        artworks,
        columns: [
          { key: 'title', label: 'Title' },
          { key: 'artist', label: 'Artist' },
          { key: 'medium', label: 'Medium' },
          { key: 'valuation', label: 'Valuation', format: 'currency' },
          { key: 'acquiredDate', label: 'Acquired', format: 'dateShort' }
        ]
      }
    },
    template: `
      <Card>
        <ResourceList
          :columns="columns"
          :items="artworks"
        />
      </Card>
    `
  })
}

/**
 * Every numeric format (`currency`, `integer`, `decimal`, `percent`) also
 * right-aligns its column. A value that is missing or empty renders as an em
 * dash rather than a blank cell.
 */
export const Formats: Story = {
  render: () => ({
    components: { ResourceList, Card },
    setup() {
      return {
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'price', label: 'Price', format: 'currency' },
          { key: 'sold', label: 'Sold', format: 'integer' },
          { key: 'rate', label: 'Conversion', format: 'percent' },
          { key: 'catalogue', label: 'Catalogue', format: 'filesize' },
          { key: 'opensAt', label: 'Opens', format: 'dateShort' }
        ],
        items: [
          {
            id: 1,
            name: 'Day pass',
            price: 1234.5,
            sold: 9876,
            rate: 0.184,
            catalogue: 2400000,
            opensAt: '2026-03-14'
          },
          {
            id: 2,
            name: 'Season pass',
            price: 20,
            sold: 4,
            rate: 0.02,
            catalogue: 512,
            opensAt: '2026-04-02'
          },
          {
            // Nothing but a name — every other cell falls back to the
            // placeholder.
            id: 3,
            name: 'Members preview'
          }
        ]
      }
    },
    template: `
      <Card>
        <ResourceList
          :columns="columns"
          :items="items"
        />
      </Card>
    `
  })
}

/**
 * With no `items` the header still renders, so the shape of the list is
 * visible while it loads or filters down to nothing.
 */
export const Empty: Story = {
  render: () => ({
    components: { ResourceList, Card },
    setup() {
      return {
        columns: [
          { key: 'title', label: 'Title' },
          { key: 'artist', label: 'Artist' },
          { key: 'valuation', label: 'Valuation', format: 'currency' }
        ]
      }
    },
    template: `
      <Card>
        <ResourceList
          :columns="columns"
          :items="[]"
        />
      </Card>
    `
  })
}

/**
 * The `item` slot replaces the built-in row entirely — the columns then only
 * draw the header, and the row is yours to lay out. Use `<ResourceItem>` to
 * keep the row padding, borders and hover state.
 */
export const CustomItems: Story = {
  render: () => ({
    components: { ResourceList, ResourceItem, Card, Stack, TextStyle, Badge },
    setup() {
      return { artworks }
    },
    template: `
      <Card>
        <ResourceList
          :columns="[{ key: 'title', label: 'Collection' }]"
          :items="artworks"
        >
          <template #item="{ item }">
            <ResourceItem>
              <Stack
                vertical
                spacing="extraTight"
              >
                <Stack
                  spacing="tight"
                  alignment="center"
                >
                  <TextStyle type="strong">{{ item.title }}</TextStyle>
                  <Badge :status="item.conservationCost ? 'warning' : 'success'">
                    {{ item.conservationCost ? 'In conservation' : 'On display' }}
                  </Badge>
                </Stack>
                <TextStyle type="subdued">
                  {{ item.artist }} · {{ item.medium }}
                </TextStyle>
              </Stack>
            </ResourceItem>
          </template>
        </ResourceList>
      </Card>
    `
  })
}

/**
 * `<ResourceItem>` emits `click`, so rows built through the `item` slot can be
 * selectable. The built-in rows are not clickable — they render the same
 * component but nothing is listening.
 */
export const Clickable: Story = {
  render: () => ({
    components: { ResourceList, ResourceItem, Card, Stack, TextStyle },
    setup() {
      const selected = ref<string | null>(null)
      return { artworks, selected }
    },
    template: `
      <Stack vertical>
        <Card>
          <ResourceList
            :columns="[{ key: 'title', label: 'Collection' }]"
            :items="artworks"
          >
            <template #item="{ item }">
              <ResourceItem @click="selected = item.title">
                <TextStyle :type="selected === item.title ? 'strong' : undefined">
                  {{ item.title }}
                </TextStyle>
              </ResourceItem>
            </template>
          </ResourceList>
        </Card>
        <pre>selected: {{ selected }}</pre>
      </Stack>
    `
  })
}
