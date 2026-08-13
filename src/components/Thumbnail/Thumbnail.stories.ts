import { Button } from '@/components/Button'
import { Card, CardSection } from '@/components/Card'
import { artPlate, artPlates } from '@/styleguide/artPlates'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Thumbnail from './Thumbnail.vue'

const meta = {
  title: 'Components/Data Display/Thumbnail',
  component: Thumbnail,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof Thumbnail>

export default meta
type Story = StoryObj<typeof meta>

// Inline SVG data URIs — see styleguide/artPlates.ts for why these are not
// photographs.
const starryNight = artPlate(0)
const greatWave = artPlate(1)

export const BasicUsage: Story = {
  render: () => ({
    components: { Thumbnail },
    setup: () => ({ work: starryNight }),
    template: `
      <Thumbnail
        :title="work.title"
        :subtitle="work.artist"
        :url="work.url"
      >
        Oil on canvas, {{ work.year }}. Acquired 1941, gallery 4.
      </Thumbnail>
    `
  })
}

export const NoBorders: Story = {
  render: () => ({
    components: { Thumbnail },
    setup: () => ({ work: starryNight }),
    template: `
      <Thumbnail
        noBorder
        :title="work.title"
        :subtitle="work.artist"
        :url="work.url"
      >
        Oil on canvas, {{ work.year }}. Acquired 1941, gallery 4.
      </Thumbnail>
    `
  })
}

export const WithCard: Story = {
  render: () => ({
    components: { Thumbnail, Card, CardSection },
    setup: () => ({ work: greatWave }),
    template: `
      <Card>
        <CardSection>
          <Thumbnail
            noBorder
            :title="work.title"
            :subtitle="work.artist"
            :url="work.url"
          >
            Woodblock print, {{ work.year }}. On loan until March.
          </Thumbnail>
        </CardSection>
      </Card>
    `
  })
}

export const DifferentSizes: Story = {
  render: () => ({
    components: { Thumbnail },
    setup: () => ({
      sizes: [
        ['extraSmall', 'Extra small'],
        ['small', 'Default'],
        ['medium', 'Medium'],
        ['large', 'Large'],
        ['extraLarge', 'Extra large']
      ],
      plates: artPlates
    }),
    template: `
      <div>
        <template v-for="([size, name], i) in sizes" :key="size">
          <Thumbnail
            :size="size"
            :title="name + ' — ' + plates[i].title"
            :subtitle="plates[i].artist"
            :url="plates[i].url"
          >
            The content slot wraps under the title and subtitle, so a longer
            catalogue note keeps the thumbnail's height rather than pushing it
            around. This one runs on a while to show that at the larger sizes.
          </Thumbnail>
          <br />
        </template>
      </div>
    `
  })
}

/**
`url` is optional, and a URL that fails to load falls back to the same
placeholder — the `@error` handler flips to it, so a dead link does not leave a
broken-image icon in the layout.
*/
export const NoOrBrokenLink: Story = {
  render: () => ({
    components: { Thumbnail },
    template: `
      <div>
        <Thumbnail
          title="Untitled"
          subtitle="Artist unknown"
        >
          No image on file.
        </Thumbnail>
        <br>
        <Thumbnail
          title="Untitled"
          subtitle="Artist unknown"
          url="/this-file-does-not-exist.jpg"
        >
          The image reference is recorded but the file is missing.
        </Thumbnail>
      </div>
    `
  })
}

/**
Changing `url` re-tests the image, so a thumbnail that previously fell back to
the placeholder recovers once a working URL arrives.
*/
export const DynamicUrl: Story = {
  render: () => ({
    components: { Thumbnail, Button },
    setup() {
      const index = ref(-1)
      const work = ref(artPlate(0))
      // Starts broken so the recovery path is the thing you actually see.
      const url = ref('/this-file-does-not-exist.jpg')
      function next() {
        index.value += 1
        work.value = artPlate(index.value)
        url.value = work.value.url
      }
      return { url, work, next, started: index }
    },
    template: `
      <div>
        <Thumbnail
          :title="started < 0 ? 'Untitled' : work.title"
          :subtitle="started < 0 ? 'Artist unknown' : work.artist"
          :url="url"
        >
          {{ started < 0 ? 'Image not found.' : 'Oil on canvas, ' + work.year + '.' }}
        </Thumbnail>
        <br>
        <Button @click="next">Show next work</Button>
      </div>
    `
  })
}
