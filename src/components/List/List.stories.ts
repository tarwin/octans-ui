import { Button } from '@/components/Button'
import { Card, CardSection } from '@/components/Card'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import List from './List.vue'
import ListItem from './ListItem.vue'
import type { ListItemType } from './types'

const meta = {
  title: 'Components/Typography/List',
  component: List,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof List>

export default meta
type Story = StoryObj<typeof meta>

export const Truncated: Story = {
  render: () => ({
    components: { List, ListItem },
    template: `
      <List type="number" :max-items="3">
        <ListItem>uno</ListItem>
        <ListItem>due</ListItem>
        <ListItem>tre</ListItem>
        <ListItem>quattro</ListItem>
        <ListItem>cinque</ListItem>
      </List>
    `
  })
}

export const ForLoopListItemMax: Story = {
  render: () => ({
    components: { List, ListItem },
    template: `
      <List type="number" :max-items="2">
        <ListItem v-for="i in [1,2,3,4,5]" :key="i">item: {{i}}</ListItem>
      </List>
    `
  })
}

export const ReactiveAddItem: Story = {
  render: () => ({
    components: { List, ListItem, Button },
    setup() {
      const items = ref(['1', '2', '3'])
      function addItem() {
        items.value.push(new Date().toISOString())
      }
      return { addItem, items }
    },
    template: `
      <List type="number">
        <ListItem v-for="i in items" :key="i">item: {{i}}</ListItem>
      </List>
      <Button @click="addItem">Add Item</Button>
    `
  })
}

export const EmptyList: Story = {
  render: () => ({
    components: { List },
    template: `
      <List></List>
    `
  })
}

export const BoundToData: Story = {
  render: () => ({
    components: { List },
    template: `
      <List
        :items="[
          {content: 'First item'},
          {content: 'Second item'}
        ]"
      />
    `
  })
}

/**
 * Only `label`, `content` and `idLabel` are rendered, and each is optional —
 * an item without an `idLabel` should not leave an empty ID row behind it.
 * Any other keys on an item are ignored by the list and handed straight back
 * to `select-item`
 */
export const PartialItems: Story = {
  render: () => ({
    components: { List, Card },
    setup() {
      const lastSelected = ref<ListItemType | null>(null)
      function onSelectItem(item: ListItemType) {
        lastSelected.value = item
      }
      return { lastSelected, onSelectItem }
    },
    template: `
      <Card title="Partial items">
        <List
          in-card
          selectable
          :items="[
            {label: 'Everything', content: 'Has all three fields', idLabel: 'ID: 1'},
            {label: 'No ID label', content: 'Should not render an empty ID row'},
            {content: 'Content only'},
            {label: 'Label only'},
            {
              label: 'Carries extra keys',
              content: 'Click me — the whole item comes back',
              idLabel: 'ID: 5',
              rowIndex: 4,
              colKey: 'discountValue'
            }
          ]"
          @select-item="onSelectItem"
        />
      </Card>
      <pre>Last selected: {{lastSelected}}</pre>
    `
  })
}

/**
 * `emptyText` and `moreItemsText` default to translated strings, so they follow
 * the language picked in the toolbar. Passing `''` suppresses the line
 * entirely, which is distinct from not passing the prop at all.
 */
export const BottomTextVariants: Story = {
  render: () => ({
    components: { List, Card, CardSection },
    template: `
      <Card title="Empty lists">
        <CardSection title="Default — translated">
          <List :items="[]" />
        </CardSection>
        <CardSection title="Custom empty-text">
          <List :items="[]" empty-text="Nothing here yet" />
        </CardSection>
        <CardSection title="Suppressed with empty-text=''">
          <List :items="[]" empty-text="" />
        </CardSection>
      </Card>
      <Card title="Truncated lists">
        <CardSection title="Default — translated">
          <List :max-items="2" :items="[
            {content: 'One'}, {content: 'Two'}, {content: 'Three'}, {content: 'Four'}
          ]" />
        </CardSection>
        <CardSection title="Custom more-items-text">
          <List :max-items="2" more-items-text="{count} hidden" :items="[
            {content: 'One'}, {content: 'Two'}, {content: 'Three'}, {content: 'Four'}
          ]" />
        </CardSection>
        <CardSection title="Suppressed with more-items-text=''">
          <List :max-items="2" more-items-text="" :items="[
            {content: 'One'}, {content: 'Two'}, {content: 'Three'}, {content: 'Four'}
          ]" />
        </CardSection>
      </Card>
    `
  })
}

export const ErrorsBoundToData: Story = {
  render: () => ({
    components: { List, Card },
    setup() {
      function onSelectItem(item: ListItemType) {
        console.log('clicked item', item)
      }
      return { onSelectItem }
    },
    template: `
      <Card title="Errors">
        <List
          type="error"
          :items="[
            {
              label: 'First item',
              content: 'This is the long list content',
              idLabel: 'Item1'
            },
            {
              label: 'Second item',
              content: 'This is the long list content',
              idLabel: 'Item2'
            },
            {
              label: 'Third item',
              content: 'This is the long list content',
              idLabel: 'Item3'
            },
            {
              label: 'Forth item',
              content: 'This is the long list content',
              idLabel: 'Item4'
            }
          ]"
          :max-items="3"
          in-card
          selectable
          @select-item="onSelectItem"
        />
      </Card>
    `
  })
}

export const ErrorListInsideCardSection: Story = {
  render: () => ({
    components: { List, Card, CardSection },
    template: `
      <Card title="Errors">
        <CardSection>
          <List
            type="error"
            :items="[
              {
                label: 'First item',
                content: 'This is the long list content',
                idLabel: 'Item1'
              },
              {
                label: 'Second item',
                content: 'This is the long list content',
                idLabel: 'Item2'
              }
            ]"
            in-card-section
          />
        </CardSection>
      </Card>
    `
  })
}

export const TightList: Story = {
  render: () => ({
    components: { List, ListItem },
    template: `
      <List tight>
        <ListItem>uno</ListItem>
        <ListItem>due</ListItem>
        <ListItem>tre</ListItem>
      </List>
    `
  })
}
