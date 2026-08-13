import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Button from './Button.vue'
import Stack from '../Stack/Stack.vue'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Components/Actions/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    icon: 'mdi:star'
  }
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => ({
    components: { Button, Stack },
    template: `
      <Stack vertical>
        <Stack>
          <Button>Default</Button>
          <Button disabled tooltip="I am disabled!">Default</Button>
          <Button icon="mdi:plus">Default</Button>
          <Button icon="mdi:plus">Default</Button>
        </Stack>
        <Stack>
          <Button type="primary">Primary</Button>
          <Button type="primary" disabled>Primary</Button>
          <Button type="primary" invert>Primary</Button>
          <Button type="primary" invert disabled>Primary</Button>
        </Stack>
        <Stack>
          <Button type="secondary">Secondary</Button>
          <Button type="secondary" disabled>Secondary</Button>
          <Button type="secondary" invert>Secondary</Button>
          <Button type="secondary" invert disabled>Secondary</Button>
        </Stack>
        <Stack>
          <Button type="destructive">Destructive</Button>
          <Button type="destructive" invert>Destructive</Button>
          <Button type="destructive" disabled>Destructive</Button>
        </Stack>
        <Stack>
          <Button type="outline">Outline</Button>
          <Button type="outline" disabled>Outline</Button>
          <Button type="outline" destructive>Outline destructive</Button>
        </Stack>
        <Stack alignment="center">
          <Button destructive>Default destructive</Button>
          <Button type="secondary" destructive>Tonal destructive</Button>
          <Button type="plain" destructive>Plain destructive</Button>
          <Button type="link" destructive>Link destructive</Button>
        </Stack>
        <Stack alignment="center">
          <Button type="primary" color="secondary">Solid secondary</Button>
          <Button type="primary" color="tertiary">Solid tertiary</Button>
          <Button type="secondary" color="tertiary">Tonal tertiary</Button>
          <Button type="outline" color="tertiary">Outline tertiary</Button>
          <Button type="primary" color="success">Solid success</Button>
        </Stack>
        <Stack>
          <Button type="plain">Plain</Button>
          <Button type="plain" disabled>Plain</Button>
          <Button type="plain" icon="mdi:pencil">Plain with icon</Button>
        </Stack>
        <Stack alignment="center">
          <Button type="link">Link</Button>
          <Button type="link" disabled>Link</Button>
          <Button type="link" icon="mdi:open-in-new">Link with icon</Button>
          <span>… sits flush with inline text</span>
        </Stack>
        <Stack>
          <Button type="plain" icon="mdi:close-circle"></Button>
          <Button dropdown>Dropdown</Button>
          <Button icon="mdi:close-circle"></Button>
          <Button dropdown icon="mdi:close-circle"></Button>
        </Stack>
      </Stack>
    `
  })
}

export const Sizes: Story = {
  render: () => ({
    components: { Button, Stack },
    template: `
      <Stack
        spacing="tight"
        alignment="center"
      >
        <Button size="small">Small</Button>
        <Button size="medium">Medium</Button>
        <Button size="large">Large</Button>
      </Stack>
    `
  })
}

export const SimpleTooltips: Story = {
  render: () => ({
    components: { Button, Stack },
    template: `
      <Stack
        vertical
        spacing="loose"
      >
        <Stack spacing="tight">
          <Button
            tooltip="I'm on the top!"
            tooltip-position="top"
          >Top</Button>
          <Button
            tooltip="I'm on the right!"
            tooltip-position="right"
          >Right</Button>
          <Button
            tooltip="I'm on the bottom!"
            tooltip-position="bottom"
          >Bottom</Button>
          <Button
            tooltip="I'm on the left!"
            tooltip-position="left"
          >Left</Button>
        </Stack>
        <Button
          tooltip="This is a test to show what really long tooltip text looks like!"
        >Really long tooltip</Button>
      </Stack>
    `
  })
}

export const FullWidth: Story = {
  render: () => ({
    components: { Button },
    template: `
      <Button fullWidth>Hello</Button>
    `
  })
}

export const ButtonAsALink: Story = {
  render: () => ({
    components: { Button, Stack },
    setup() {
      return {
        log(...args: any[]) {
          console.log(...args)
        }
      }
    },
    template: `
      <Stack spacing="tight">
        <Button
          @click="log('click normal')"
        >A normal button</Button>
        <Button
          @click="log('click link')"
          url="https://example.com"
        >A link</Button>
        <Button
          @click="log('click external link')"
          url="https://example.com"
          external
        >An external link</Button>
        <Button
          @click="log('click disabled link')"
          url="https://example.com"
          disabled
        >A disabled link</Button>
        <Button
          @click="log('click disabled')"
          disabled
        >A disabled button</Button>
      </Stack>
    `
  })
}

export const Iconify: Story = {
  render: () => ({
    components: { Button, Stack },
    template: `
      <Stack vertical>
        <Stack>
          <Button icon="mdi:plus">Iconify</Button>
          <Button type="primary" icon="mdi:content-save">Save</Button>
          <Button type="destructive" icon="mdi:trash-can">Delete</Button>
          <Button type="outline" icon="mdi:download">Export</Button>
          <Button type="plain" icon="mdi:pencil">Edit</Button>
        </Stack>
        <Stack>
          <Button icon="mdi:cog" />
          <Button icon="mdi:bell" dropdown />
          <Button icon="not:mdi:bell">Muted</Button>
          <Button size="small" icon="mdi:magnify">Small</Button>
          <Button size="large" icon="mdi:magnify">Large</Button>
        </Stack>
      </Stack>
    `
  })
}

export const Badges: Story = {
  render: () => ({
    components: { Button, Stack },
    template: `
      <Stack vertical>
        <Stack>
          <div style="width: 130px">Status on the icon</div>
          <Button icon="mdi:cloud-sync" badge="info">Info</Button>
          <Button icon="mdi:cloud-sync" badge="success">Success</Button>
          <Button icon="mdi:cloud-sync" badge="warning">Warning</Button>
          <Button icon="mdi:cloud-sync" badge="error">Critical</Button>
          <Button icon="mdi:cloud-sync" badge="warning" />
          <Button badge="error" dropdown>Dropdown</Button>
        </Stack>
        <Stack>
          <div style="width: 130px">Text in a pill</div>
          <Button icon="mdi:bell" badge="3">Alerts</Button>
          <Button icon="mdi:bell" badge="12" badge-status="error">Alerts</Button>
          <Button icon="mdi:inbox" badge="99+" badge-status="info">Inbox</Button>
          <Button badge="New" badge-status="success">No icon</Button>
          <Button type="primary" badge="2" badge-status="warning">Primary</Button>
        </Stack>
        <Stack>
          <div style="width: 130px">Long form</div>
          <Button icon="mdi:server" :badge="{ text: '2', status: 'error' }">Object</Button>
          <Button icon="mdi:server" :badge="{ text: 'beta', color: '#46417d' }">Custom colour</Button>
          <Button icon="mdi:server" :badge="{ icon: 'mdi:lock', color: '#46417d' }">Custom glyph</Button>
          <Button icon="mdi:server" :badge="{ text: '4', icon: 'mdi:alert', status: 'warning' }">Both</Button>
        </Stack>
        <Stack>
          <div style="width: 130px">Sizes</div>
          <Button size="small" icon="mdi:bell" badge="3">Small</Button>
          <Button size="medium" icon="mdi:bell" badge="3">Medium</Button>
          <Button size="large" icon="mdi:bell" badge="3">Large</Button>
        </Stack>
      </Stack>
    `
  })
}
