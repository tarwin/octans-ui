import { Card, CardSection } from '@/components/Card'
import { SkeletonBodyText } from '@/components/SkeletonBodyText'
import { SkeletonCard } from '@/components/SkeletonCard'
import { SkeletonDisplayText } from '@/components/SkeletonDisplayText'
import { TextContainer } from '@/components/TextContainer'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Layout from './Layout.vue'
import LayoutSection from './LayoutSection.vue'
import LayoutSectionAnnotated from './LayoutSectionAnnotated.vue'

const meta = {
  title: 'Components/Layout/Layout',
  component: Layout,
  tags: ['autodocs'],
  parameters: { surface: 'app' },
  args: {}
} satisfies Meta<typeof Layout>

export default meta
type Story = StoryObj<typeof meta>

export const ExampleLayout: Story = {
  render: () => ({
    components: {
      Layout,
      LayoutSection,
      Card,
      CardSection,
      TextContainer,
      SkeletonBodyText,
      SkeletonDisplayText
    },
    template: `
      <Layout>
        <LayoutSection>
          <Card title="Title">
            <CardSection>
              <TextContainer>
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText />
              </TextContainer>
            </CardSection>
            <CardSection>
              <TextContainer>
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText />
              </TextContainer>
            </CardSection>
          </Card>
        </LayoutSection>
        <LayoutSection size="secondary">
          <Card title="Title">
            <CardSection>
              <TextContainer>
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText />
              </TextContainer>
            </CardSection>
          </Card>
        </LayoutSection>
      </Layout>
    `
  })
}

/**
 * ### Default layout
 * By default each layout section will take up an equal amount of space.
 */
export const Default: Story = {
  render: () => ({
    components: { Layout, LayoutSection, SkeletonCard },
    template: `
      <Layout>
        <LayoutSection>
          <SkeletonCard />
        </LayoutSection>
        <LayoutSection>
          <SkeletonCard />
        </LayoutSection>
        <LayoutSection>
          <SkeletonCard />
        </LayoutSection>
      </Layout>
    `
  })
}

/**
 * ### Full-width columns
 * Use to create 100% width layouts.
 */
export const FullWidth: Story = {
  render: () => ({
    components: { Layout, LayoutSection, SkeletonCard },
    template: `
      <Layout>
        <LayoutSection size="full">
          <SkeletonCard title="full" />
        </LayoutSection>
        <LayoutSection size="full">
          <SkeletonCard title="full" />
        </LayoutSection>
      </Layout>
    `
  })
}

/**
 * ### Two columns with equal width
 * Use to create a 50% + 50% layout. Sections are stacked on smaller screens.
 */
export const HalfWidth: Story = {
  render: () => ({
    components: { Layout, LayoutSection, SkeletonCard },
    template: `
      <Layout>
        <LayoutSection size="half">
          <SkeletonCard title="half" />
        </LayoutSection>
        <LayoutSection size="half">
          <SkeletonCard title="half" />
        </LayoutSection>
      </Layout>
    `
  })
}

/**
 * ### Three columns with equal width
 * Use to create a 33% + 33% + 33% layout. Sections are stacked on smaller screens.
 */
export const ThirdWidth: Story = {
  render: () => ({
    components: { Layout, LayoutSection, SkeletonCard },
    template: `
      <Layout>
        <LayoutSection size="third">
          <SkeletonCard title="third" />
        </LayoutSection>
        <LayoutSection size="third">
          <SkeletonCard title="third" />
        </LayoutSection>
        <LayoutSection size="third">
          <SkeletonCard title="third" />
        </LayoutSection>
      </Layout>
    `
  })
}

/**
 * ### Two columns with primary and secondary widths
 * The primary will take a minimum of 680px. The secondary column will take up at
 * most 300px unless it wraps.
 */
export const PrimaryAndSecondary: Story = {
  render: () => ({
    components: { Layout, LayoutSection, SkeletonCard },
    template: `
      <Layout>
        <LayoutSection size="primary">
          <SkeletonCard title="default" />
        </LayoutSection>
        <LayoutSection size="secondary">
          <SkeletonCard title="secondary" subdued />
        </LayoutSection>
      </Layout>
    `
  })
}

/**
 * ### Annotated layout sections
 * Useful to break up pages with many sections.
 */
export const Annotated: Story = {
  render: () => ({
    components: {
      Layout,
      LayoutSectionAnnotated,
      Card,
      CardSection,
      TextContainer,
      SkeletonBodyText,
      SkeletonDisplayText
    },
    template: `
      <Layout>
        <LayoutSectionAnnotated
          title="Contact details"
          description="We will use this information to contact you."
          full-width
        >
          <template #actions>
            Actions
          </template>
          <Card title="Title">
            <CardSection>
              <TextContainer>
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText />
              </TextContainer>
            </CardSection>
          </Card>
        </LayoutSectionAnnotated>
        <LayoutSectionAnnotated
          title="Company details"
          description="We will use this information for billing and reporting."
        >
          <Card title="Title">
            <CardSection>
              <TextContainer>
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText />
              </TextContainer>
            </CardSection>
            <CardSection>
              <TextContainer>
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText />
              </TextContainer>
            </CardSection>
          </Card>
        </LayoutSectionAnnotated>
      </Layout>
    `
  })
}
