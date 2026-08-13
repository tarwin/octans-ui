import { Card, CardSection } from '@/components/Card'
import { DataTable } from '@/components/DataTable'
import { Filters } from '@/components/Filters'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import artworksData from '@/styleguide/artworks.json'

const meta = {
  title: 'Components/Forms/Filters',
  component: Filters,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof Filters>

export default meta
type Story = StoryObj<typeof meta>

export const Simple: Story = {
  render: () => ({
    components: { Filters, Card, CardSection },
    setup() {
      const query = ref('')
      return { query }
    },
    template: `
      <Card>
        <Filters
          v-model:query="query"
        />
        <CardSection>
          <pre>query: {{query}}</pre>
        </CardSection>
      </Card>
    `
  })
}

export const Complex: Story = {
  render: () => ({
    components: { Filters, Card, CardSection, DataTable },
    setup() {
      const artworks = ref<any[]>(artworksData)
      artworks.value.forEach((artwork, index) => {
        const collection =
          index % 2 === 0
            ? { label: 'Permanent', value: 1 }
            : { label: 'On loan', value: 2 }
        artwork.collectionKey = collection.value
        artwork.collection = collection.label
      })

      const appliedFilters = ref({
        collections: [1]
      })
      const offset = ref(0)
      const limit = ref(10)
      const query = ref('')

      const filteredArtworks = computed(() => {
        return artworks.value.filter((d) => {
          if (
            appliedFilters.value?.collections?.length &&
            !appliedFilters.value.collections.includes(d.collectionKey)
          ) {
            return false
          }
          if (query.value) {
            if (d.catalogNumber.includes(query.value)) return true
            if (d.title.toLowerCase().includes(query.value.toLowerCase())) {
              return true
            }
            if (d.artist.toLowerCase().includes(query.value.toLowerCase())) {
              return true
            }
            return false
          }
          return true
        })
      })

      const pageOfArtworks = computed(() => {
        const start = offset.value
        const end = start + limit.value
        return filteredArtworks.value.slice(start, end).map((d) => {
          return {
            ...d,
            net: d.valuationLocalCurrency - d.insurancePremiumLocalCurrency
          }
        })
      })

      return {
        pageOfArtworks,
        filteredArtworks,
        appliedFilters,
        offset,
        limit,
        query
      }
    },
    template: `
      <Card title="Collection">
        <Filters
          ref="filters"
          :filters="[
            {
              key: 'startDate',
              label: 'Start Date',
              type: 'date',
            },
            {
              key: 'endDate',
              label: 'End Date',
              type: 'date'
            },
            {
              key: 'catalogNumber',
              label: 'Catalogue No.',
              type: 'text'
            },
            {
              key: 'artist',
              label: 'Artist',
              type: 'text'
            },
            {
              key: 'collections',
              label: 'Collection',
              type: 'select',
              placeholder: 'Choose a collection',
              multiple: true,
              options: [
                { label: 'Permanent', value: 1 },
                { label: 'On loan', value: 2 }
              ]
            },
            {
              key: 'onDisplay',
              label: 'On display',
              placeholder: 'Choose a value',
              type: 'boolean'
            }
          ]"
          :shortcuts="[
            {
              label: 'Collection',
              items: [
                { label: 'All', onAction: () => appliedFilters.collections = [] },
                { label: 'Permanent', onAction: () => appliedFilters.collections = [1] },
                { label: 'On loan', onAction: () => appliedFilters.collections = [2] },
              ]
            }
          ]"
          v-model:appliedFilters="appliedFilters"
          v-model:query="query"
          :mode="'multi'"
          required
        />
        <DataTable
          :columns="[
            {
              key: 'catalogNumber',
              label: 'Catalogue No.'
            },
            {
              key: 'collection',
              label: 'Collection'
            },
            {
              key: 'title',
              label: 'Title'
            },
            {
              key: 'artist',
              label: 'Artist'
            },
            {
              key: 'acquiredDate',
              label: 'Acquired',
              format: 'dateTimeShort'
            },
            {
              key: 'valuationLocalCurrency',
              label: 'Valuation',
              format: 'currency'
            },
            {
              key: 'insurancePremiumLocalCurrency',
              label: 'Premium',
              format: 'currency'
            },
            {
              key: 'net',
              label: 'Net Valuation',
              format: 'currency'
            },
            {
              key: 'conservationCost',
              label: 'Conservation',
              format: 'currency'
            }
          ]"
          :rows="pageOfArtworks"
          :pagination="{
            offset: offset,
            limit: limit,
            total: filteredArtworks.length,
            updateOffset: (val) => (offset = val),
            updateLimit: (val) => {
              limit = val
              offset = 0
            }
          }"
        />
      </Card>
      <pre>query: {{query}}</pre>
      <pre>appliedFilters: {{appliedFilters}}</pre>
      <pre>offset: {{offset}}</pre>
      <pre>limit: {{limit}}</pre>
      <pre>filteredArtworks.length: {{filteredArtworks.length}}</pre>
    `
  })
}
