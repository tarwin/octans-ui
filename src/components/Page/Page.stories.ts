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

/**
  Every part of the header is a slot with the built-in markup as its fallback,
  so you can replace one piece without rebuilding the rest — or replace the
  whole header with `#header` when the page is nothing like this one.

  `#title` and `#subtitle` are scoped, so a slot that only wants to *decorate*
  the prop can still read it. Note that `#breadcrumbs` and `#subtitle` render
  even with no matching prop, and `#loader` only renders while `loading`.

  One to remember: `#secondaryActions` and `#collapsedActions` are separate.
  The collapsed one is hidden until the page is under 960px wide, so it is easy
  to override the visible actions and leave the narrow layout still drawing the
  props.
 */
export const Slots: Story = {
  render: () => ({
    components: { Badge, Button, Card, CardSection, Page, TextContainer },
    template: `
      <Page
        title="Invoice 1042"
        subtitle="Due 14 March"
        :breadcrumbs="[{ label: 'Invoices', url: '#' }]"
        :secondary-actions="[{ label: 'Duplicate' }, { label: 'Archive' }]"
      >
        <template #title="{ title }">
          <span style="font-family: var(--octans-font-mono)">{{ title }}</span>
        </template>

        <template #subtitle="{ subtitle }">
          <span style="color: var(--octans-text-warning)">{{ subtitle }}</span>
        </template>

        <template #badge>
          <Badge status="warning">Overdue</Badge>
        </template>

        <template #primaryAction>
          <Button type="primary" icon="mdi:content-save">Record payment</Button>
        </template>

        <Card>
          <CardSection>
            <TextContainer>
              The title, subtitle, badge and primary action above are all slot
              content. The breadcrumb row and the secondary actions are the
              built-in fallbacks, from the props.
            </TextContainer>
          </CardSection>
        </Card>
      </Page>
    `
  })
}

/**
  The page's measurements are tokens, so an application can retune every page
  at once instead of reaching in with `:deep()`:

  | Token | Default |
  | --- | --- |
  | `--octans-page-margin-top` | `20px` |
  | `--octans-page-breadcrumb-gap` | `0px` |
  | `--octans-page-title-gap` | `8px` |
  | `--octans-page-content-gap` | `20px` |
  | `--octans-page-title-size` | `30px` |
  | `--octans-page-title-weight` | `normal` |
  | `--octans-page-subtitle-size` | `14px` |
  | `--octans-page-badge-gap` | `16px` |
  | `--octans-page-action-gap` | `4px` |
  | `--octans-page-loader-offset` | `100px` |

  The widths are tokens too — `--octans-page-width`, `-narrow` and `-wide`,
  picked with the `size` prop.

  **Not** a token: the width at which the header collapses its actions into a
  menu. That is a `@container` query, and a container query condition cannot
  read a custom property — the browser resolves the condition before custom
  properties exist, so it would compile fine and silently never match.

  Set them on `:root` for the whole app, or on one page as below.
 */
export const Theming: Story = {
  render: () => ({
    components: { Card, CardSection, Page, TextContainer },
    setup() {
      const compact = {
        '--octans-page-margin-top': '8px',
        '--octans-page-title-size': '20px',
        '--octans-page-title-weight': '600',
        '--octans-page-title-gap': '2px',
        '--octans-page-content-gap': '12px'
      }
      return { compact }
    },
    template: `
      <div>
        <Page title="Default" subtitle="Every measurement at its default.">
          <Card><CardSection>
            <TextContainer>30px title, normal weight, 20px above the content.</TextContainer>
          </CardSection></Card>
        </Page>
        <Page
          title="Retuned"
          subtitle="The same page, five tokens later."
          :style="compact"
        >
          <Card><CardSection>
            <TextContainer>A denser header, set entirely from custom properties.</TextContainer>
          </CardSection></Card>
        </Page>
      </div>
    `
  })
}
