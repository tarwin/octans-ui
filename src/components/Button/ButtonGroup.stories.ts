import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Button from './Button.vue'
import ButtonGroup from './ButtonGroup.vue'
import ButtonGroupItem from './ButtonGroupItem.vue'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Components/Actions/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof ButtonGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => ({
    components: { Button, ButtonGroup },
    template: `
      <ButtonGroup>
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
    `
  })
}

export const PrimaryForLoop: Story = {
  render: () => ({
    components: { Button, ButtonGroup },
    template: `
      <ButtonGroup>
        <Button v-for="label in ['One','Two','Three']" :key="label">{{label}}</Button>
      </ButtonGroup>
    `
  })
}

export const Segmented: Story = {
  render: () => ({
    components: { Button, ButtonGroup },
    template: `
      <ButtonGroup segmented>
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
    `
  })
}

export const WrappingItems: Story = {
  render: () => ({
    components: { Button, ButtonGroup, ButtonGroupItem },
    template: `
      <ButtonGroup segmented fill>
        <Button>One</Button>
        <Button>Two</Button>
        <ButtonGroupItem style="margin-left: auto">
          <Button>Three</Button>
        </ButtonGroupItem>
      </ButtonGroup>
    `
  })
}
