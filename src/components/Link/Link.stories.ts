import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Link, PageLink } from '.'

const meta = {
  title: 'Components/Navigation/Link',
  component: Link,
  tags: ['autodocs'],
  args: {
    url: ''
  }
} satisfies Meta<typeof Link>

export default meta
type Story = StoryObj<typeof meta>

export const SimpleLink: Story = {
  render: () => ({
    components: { Link },
    template: `
      <Link url="https://example.com">Home</Link>
    `
  })
}

export const ExternalLink: Story = {
  render: () => ({
    components: { Link },
    template: `
      <Link url="https://example.com" external>Home</Link>
    `
  })
}

/**
 * This component is also aliased as `<PageLink>` becuase Vetur complains when using `<Link>`.
 */
export const PageLinkAlias: Story = {
  render: () => ({
    components: { PageLink },
    template: `
      <PageLink url="https://example.com" external>Home</PageLink>
    `
  })
}
