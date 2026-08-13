import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ActionList from './ActionList.vue'
import { Button, ButtonGroup } from '../Button'

const meta = {
  title: 'Components/Actions/ActionList',
  component: ActionList,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof ActionList>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => ({
    components: { ActionList, Button },
    template: `
      <ActionList
        :items="[
          { label: 'Action1', onAction: click, tooltip: 'I am a tooltip!' },
          { label: 'Action2', onAction: click }
        ]"
      >
        <Button dropdown>Acquired Date</Button>
      </ActionList>
    `,
    setup() {
      return {
        click() {
          console.log('clicked action')
        }
      }
    }
  })
}

export const WithIcons: Story = {
  render: () => ({
    components: { ActionList, Button },
    template: `
      <ActionList
        :items="[
          {
            label: 'Action1',
            disabled: true,
            url: 'https://www.google.com/',
            external: false,
            type: 'primary',
            icon: 'mdi:plus',
            onAction: click
          },
          {
            label: 'Action2',
            icon: 'mdi:arrow-right',
            onAction: click
          }
        ]"
      >
        <Button dropdown>Acquired Date</Button>
      </ActionList>
    `,
    setup() {
      return {
        click() {
          console.log('clicked action')
        }
      }
    }
  })
}

export const WithUrls: Story = {
  render: () => ({
    components: { ActionList, Button },
    template: `
      <ActionList
        :items="[
          {
            label: 'Example',
            url: 'https://example.com',
            onAction: click
          },
          {
            label: 'Example [external]',
            url: 'https://example.com',
            external: true,
            onAction: click
          },
          {
            label: 'Example [disabled]',
            url: 'https://example.com',
            disabled: true,
            onAction: click
          }
        ]"
      >
        <Button dropdown>Links</Button>
      </ActionList>
    `,
    setup() {
      return {
        click() {
          console.log('clicked action')
        }
      }
    }
  })
}

export const WithHelpText: Story = {
  render: () => ({
    components: { ActionList, Button },
    template: `
      <ActionList
        :items="[
          {
            label: 'Duplicate',
            helpText: 'Duplicates the exhibition including all works and wall labels.'
          },
          {
            label: 'Close exhibition',
            helpText: 'Removes the exhibition from the public schedule.'
          },
          {
            label: 'Close exhibition [link]',
            helpText: 'Removes the exhibition from the public schedule.',
            url: 'https://example.com'
          }
        ]"
      >
        <Button dropdown>Options</Button>
      </ActionList>
    `
  })
}

export const WithSections: Story = {
  render: () => ({
    components: { ActionList, Button },
    template: `
      <ActionList
        :sections="[
          {
            title: 'Section 1',
            items: [{ label: 'Action1' }, { label: 'Action2' }]
          },
          {
            title: 'Section 2',
            items: [{ label: 'Action1' }, { label: 'Action2' }]
          }
        ]"
      >
        <Button dropdown>Acquired Date</Button>
      </ActionList>
    `
  })
}

export const WithSubitems: Story = {
  render: () => ({
    components: { ActionList, Button },
    template: `
      <ActionList
        :items="[
          {
            label: 'Action1'
          },
          {
            label: 'Action2',
            items: [
              { label: 'SubAction1' },
              {
                label: 'SubAction2',
                items: [
                  { label: 'DeepAction1' },
                  {
                    label: 'DeepAction2',
                    items: [
                      { label: 'DeeperAction1' },
                      { label: 'DeeperAction2' }
                    ]
                  },
                  { label: 'DeepAction3' }
                ]
              },
              { label: 'SubAction3' }
            ]
          },
          {
            label: 'Action3',
            items: [
              { label: 'SubAction1' },
              { label: 'SubAction2' },
              { label: 'SubAction3' }
            ]
          },
          {
            label: 'Action4'
          }
        ]"
      >
        <Button dropdown>Acquired Date</Button>
      </ActionList>
    `
  })
}

export const WithSectionsAndSubitems: Story = {
  render: () => ({
    components: { ActionList, Button },
    template: `
      <ActionList
        :sections="[
          {
            title: 'Section 1',
            items: [
              { label: 'Action1' },
              {
                label: 'Action2',
                items: [
                  { label: 'SubAction1' },
                  {
                    label: 'SubAction2',
                    items: [
                      { label: 'DeepAction1' },
                      { label: 'DeepAction2' }
                    ]
                  }
                ]
              }
            ]
          },
          {
            title: 'Section 2',
            items: [
              {
                label: 'Action1',
                sections: [
                  {
                    title: 'Sub Section 1',
                    items: [{ label: 'SubAction1' }, { label: 'SubAction2' }]
                  },
                  {
                    title: 'Sub Section 2',
                    items: [{ label: 'SubAction3' }, { label: 'SubAction4' }]
                  }
                ]
              },
              { label: 'Action2' }
            ]
          }
        ]"
      >
        <Button dropdown>Acquired Date</Button>
      </ActionList>
    `
  })
}

export const WithSectionsAndSubitemsAuto: Story = {
  render: () => ({
    components: { ActionList, Button },
    template: `
      <ActionList
        auto-open
        :sections="[
          {
            title: 'Section 1',
            items: [
              { label: 'Action1' },
              {
                label: 'Action2',
                items: [
                  { label: 'SubAction1' },
                  {
                    label: 'SubAction2',
                    items: [
                      { label: 'DeepAction1' },
                      { label: 'DeepAction2' }
                    ]
                  }
                ]
              }
            ]
          },
          {
            title: 'Section 2',
            items: [
              {
                label: 'Action1',
                sections: [
                  {
                    title: 'Sub Section 1',
                    items: [{ label: 'SubAction1' }, { label: 'SubAction2' }]
                  },
                  {
                    title: 'Sub Section 2',
                    items: [{ label: 'SubAction3' }, { label: 'SubAction4' }]
                  }
                ]
              },
              { label: 'Action2' }
            ]
          }
        ]"
      >
        <Button dropdown>Acquired Date (hover sub-menus)</Button>
      </ActionList>
    `
  })
}

export const InButtonGroup: Story = {
  render: () => ({
    components: { ActionList, Button, ButtonGroup },
    template: `
      <ButtonGroup segmented>
        <ActionList
          :items="[
            {label: 'Action1'},
            {label: 'Action2'}
          ]"
        >
          <Button dropdown>Acquired Date</Button>
        </ActionList>
        <ActionList
          :items="[
            {label: 'Action1'},
            {label: 'Action2'}
          ]"
        >
          <Button dropdown>Acquired Date</Button>
        </ActionList>
      </ButtonGroup>
    `
  })
}

export const InlineWithoutTrigger: Story = {
  render: () => ({
    components: { ActionList },
    template: `
      <ActionList
        :items="[
          {label: 'Action1'},
          {label: 'Action2', disabled: true}
        ]"
      />
      <ActionList
        :sections="[
          {
            title: 'Section 1',
            items: [
              {label: 'Action1'},
              {label: 'Action2'}
            ]
          },
          {
            title: 'Section 2',
            items: [
              {label: 'Action1'},
              {label: 'Action2'}
            ]
          }
        ]"
      />
      <ActionList
        :items="[
          {
            label: 'Action1'
          },
          {
            label: 'Action2',
            items: [
              {label: 'SubAction1'},
              {label: 'SubAction2'}
            ]
          },
          {
            label: 'Action2',
            sections: [
              {
                title: 'Sub Section',
                items: [
                  {label: 'SubAction1'},
                  {label: 'SubAction2'}
                ]
              }
            ]
          }
        ]"
      />
    `
  })
}
