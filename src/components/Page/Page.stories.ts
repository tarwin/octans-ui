import { Button } from '@/components/Button'
import { Card, CardSection } from '@/components/Card'
import { Layout, LayoutSection } from '@/components/Layout'
import { SkeletonBodyText } from '@/components/SkeletonBodyText'
import { SkeletonDisplayText } from '@/components/SkeletonDisplayText'
import { TextContainer } from '@/components/TextContainer'
import { Badge } from '@/components/Badge'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Page from './Page.vue'

const meta = {
  title: 'Components/Layout/Page',
  component: Page,
  tags: ['autodocs'],
  parameters: { surface: 'app' },
  args: {}
} satisfies Meta<typeof Page>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: {
      Page,
      Button,
      Card,
      CardSection,
      Layout,
      LayoutSection,
      TextContainer,
      SkeletonBodyText,
      SkeletonDisplayText,
      Badge
    },
    setup() {
      return {
        logAction: (action: string) => console.log('log action', action),
        clickHelp: () => console.log('click help')
      }
    },
    template: `
      <Page
        title="The Starry Night"
        subtitle="Some subtitle for this page..."
        :badge="{
          label: 'Draft'
        }"
        include-help
        :breadcrumbs="[
          {label: 'Collection', url: '/'},
          {label: 'Post-Impressionism', url: '/'}
        ]"
        :primaryAction="{
          label: 'Save',
          icon: 'mdi:plus',
          onAction: () => logAction('Save')
        }"
        :secondaryActions="[
          {
            label: 'Empty',
            icon: 'mdi:plus',
            url: 'https://www.google.com/',
            external: true,
            onAction: () => logAction('Link clicked')
          },
          {
            label: 'Action',
            onAction: () => logAction('Action')
          },
          {
            label: 'Link',
            url: 'https://example.com'
          },
          {
            label: 'External link',
            url: 'https://example.com',
            external: true
          },
          {
            label: 'External link with action',
            url: 'https://example.com',
            external: true,
            onAction: () => logAction('Clicked external link with action')
          },
          {
            label: 'All opts but disabled',
            disabled: true,
            url: 'https://example.com',
            external: true,
            onAction: () => logAction('Should not fire')
          }
        ]"
        :actionGroups="[
          {
            title: 'Promote',
            actions: [
              {label: 'Share on Facebook'},
              {label: 'Share via Email'}
            ]
          }
        ]"
        @clickHelp="clickHelp"
      >
        <template #primaryAction>
          <div style="display:flex;gap:10px;">
            <Button>Hello</Button>
            <Button>Hello2</Button>
          </div>
        </template>
        <template #badge>
          <Badge status="error">Error</Badge>
          <Badge status="info">Info</Badge>
          <Badge status="success">Success</Badge>
        </template>
        <Layout>
          <LayoutSection>
            <Card title="Options">
              <CardSection>
                <TextContainer>
                  <SkeletonDisplayText />
                  <SkeletonBodyText :lines="5" />
                </TextContainer>
              </CardSection>
            </Card>
            <Card title="Options">
              <CardSection>
                <TextContainer>
                  <SkeletonDisplayText />
                  <SkeletonBodyText :lines="5" />
                </TextContainer>
              </CardSection>
            </Card>
          </LayoutSection>
          <LayoutSection secondary>
            <Card title="Side content" subdued>
              <CardSection>
                <TextContainer>
                  <SkeletonDisplayText />
                  <SkeletonBodyText :lines="15" />
                </TextContainer>
              </CardSection>
            </Card>
          </LayoutSection>
        </Layout>
      </Page>
    `
  })
}

export const PageWithLoader: Story = {
  render: () => ({
    components: {
      Page,
      Card,
      CardSection,
      Layout,
      LayoutSection,
      TextContainer,
      SkeletonBodyText,
      SkeletonDisplayText,
      Badge
    },
    template: `
      <Page
        title="The Starry Night"
        subtitle="Some subtitle for this page..."
        :breadcrumbs="[{label: 'Home', url: '/'}]"
        :primaryAction="{
          label: 'Save'
        }"
        :secondaryActions="[
          {label: 'Duplicate'},
          {label: 'Disable'}
        ]"
        :actionGroups="[
          {
            title: 'Promote',
            actions: [
              {label: 'Share on Facebook'},
              {label: 'Share via Email'}
            ]
          }
        ]"
        loading
      >
        <Layout>
          <LayoutSection>
            <Card title="Options">
              <CardSection>
                <TextContainer>
                  <SkeletonDisplayText />
                  <SkeletonBodyText :lines="5" />
                </TextContainer>
              </CardSection>
            </Card>
            <Card title="Options">
              <CardSection>
                <TextContainer>
                  <SkeletonDisplayText />
                  <SkeletonBodyText :lines="5" />
                </TextContainer>
              </CardSection>
            </Card>
          </LayoutSection>
          <LayoutSection secondary>
            <Card title="Side content" subdued>
              <CardSection>
                <TextContainer>
                  <SkeletonDisplayText />
                  <SkeletonBodyText :lines="15" />
                </TextContainer>
              </CardSection>
            </Card>
          </LayoutSection>
        </Layout>
      </Page>
    `
  })
}
