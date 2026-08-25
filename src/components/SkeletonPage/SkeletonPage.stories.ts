import { Card, CardSection } from '@/components/Card'
import { SkeletonBodyText } from '@/components/SkeletonBodyText'
import { SkeletonDisplayText } from '@/components/SkeletonDisplayText'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SkeletonPage from './SkeletonPage.vue'

const meta = {
  title: 'Components/Feedback/SkeletonPage',
  component: SkeletonPage,
  tags: ['autodocs'],
  parameters: { surface: 'app' },
  args: {}
} satisfies Meta<typeof SkeletonPage>

export default meta
type Story = StoryObj<typeof meta>

/**
  A page-shaped placeholder for the moment before a page's data arrives.

  It renders a real `Page`, which is the point — pass the same `size` the real
  page uses and the content does not jump sideways when it swaps in:

  ```vue
  <SkeletonPage v-if="loading" size="wide" />
  <Page v-else size="wide" title="Orders">…</Page>
  ```

  `<Page loading>` is the other option and they are for different moments:
  that one dims a page whose content you already have while something
  refreshes, this one stands in for content you do not have yet.
 */
export const Default: Story = {
  render: () => ({
    components: { SkeletonPage },
    template: `<SkeletonPage />`
  })
}

/**
  `cards` stacks more of them, and `primaryAction` draws a button-shaped block
  in the header so the header does not change height when the real action
  arrives.
 */
export const FullPage: Story = {
  render: () => ({
    components: { SkeletonPage },
    template: `<SkeletonPage primary-action :cards="3" />`
  })
}

/**
  `:title="false"` for a page whose title you already know — there is no reason
  to draw a placeholder for something you can render for real.
 */
export const KnownTitle: Story = {
  render: () => ({
    components: { SkeletonPage },
    template: `<SkeletonPage :title="false" :cards="2" />`
  })
}

/**
  The default slot replaces the body, for a page whose shape is nothing like a
  stack of cards. The header placeholder and the accessibility treatment stay.
 */
export const CustomBody: Story = {
  render: () => ({
    components: {
      Card,
      CardSection,
      SkeletonBodyText,
      SkeletonDisplayText,
      SkeletonPage
    },
    template: `
      <SkeletonPage>
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px">
          <Card>
            <CardSection>
              <SkeletonBodyText :lines="8" />
            </CardSection>
          </Card>
          <Card subdued>
            <CardSection>
              <SkeletonDisplayText size="small" />
              <div style="height: 16px"></div>
              <SkeletonBodyText :lines="4" />
            </CardSection>
          </Card>
        </div>
      </SkeletonPage>
    `
  })
}
