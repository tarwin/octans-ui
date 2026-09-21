import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { Splitter } from '@/components/Splitter'
import { TextStyle } from '@/components/TextStyle'
import Pagination from './Pagination.vue'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Components/Navigation/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A live pagination for the examples below. Plain numbers in a template
 * would not re-render on `change`, so paging did nothing in the docs.
 */
const live = (attrs: string, extra = '', offset = 0) => ({
  components: { Pagination },
  setup() {
    const state = ref({ offset, limit: 10, total: 250 })
    const updateLimit = (value: number) => {
      // Changing the page size rewinds to the first page, as a table would.
      state.value = { ...state.value, limit: value, offset: 0 }
    }
    return { state, updateLimit }
  },
  template: `
    <Pagination
      :offset="state.offset"
      :limit="state.limit"
      :total="state.total"
      ${attrs}
      @change="val => state.offset = val"
      @update-limit="updateLimit"
    />
    ${extra}
  `
})

export const Primary: Story = {
  args: { offset: 0, limit: 10, total: 250 },
  render: () =>
    live(
      '',
      '<pre>offset: {{state.offset}}, limit: {{state.limit}}, total: {{state.total}}</pre>'
    )
}

/**
 * The strip always fills the same number of slots, whichever page is current:
 * the first and last page are always there, and an ellipsis takes the slot a
 * number would have. Clicking an ellipsis goes to the nearest page it hides.
 * Odd counts keep the current page centred.
 */
export const PageSlots: Story = {
  args: { offset: 120, limit: 10, total: 250 },
  render: () => ({
    components: { Pagination },
    setup() {
      const offset = ref(120)
      return { offset }
    },
    template: `
      <div style="display: grid; gap: 12px">
        <Pagination :offset="offset" :limit="10" :total="250" :page-slots="5" :show-page-size="false" @change="val => offset = val" />
        <Pagination :offset="offset" :limit="10" :total="250" :page-slots="7" :show-page-size="false" @change="val => offset = val" />
        <Pagination :offset="offset" :limit="10" :total="250" :page-slots="9" :show-page-size="false" @change="val => offset = val" />
        <Pagination :offset="offset" :limit="10" :total="250" :page-slots="11" :show-page-size="false" @change="val => offset = val" />
        <Pagination :offset="offset" :limit="10" :total="250" :page-slots="0" :show-page-size="false" @change="val => offset = val" />
      </div>
    `
  })
}

/**
 * The compact form the default `compact: 'auto'` switches to in a narrow
 * container, forced on here so it shows at any width. The page-size select
 * stays out of it unless `show-page-size="always"`.
 */
export const Compact: Story = {
  args: { offset: 50, limit: 10, total: 250 },
  render: () => live('compact', '', 50)
}

export const CompactWithoutFirstLast: Story = {
  args: { offset: 50, limit: 10, total: 250 },
  render: () => live('compact hide-first-last', '', 50)
}

/** Never compact: the full run of page numbers even on a phone. */
export const FullOnly: Story = {
  args: { offset: 50, limit: 10, total: 250 },
  render: () => live(':compact="false"', '', 50)
}

/**
 * The form is chosen by whether the full strip fits the component's own
 * container, not the screen, so a pagination in a sidebar or a card compacts
 * on a desktop too. Drag the gutter to see each one switch: the first
 * measures itself, so its slot count, page numbers and page-size select all
 * count; the second is told to compact under 400px with `compact-below`.
 */
export const InNarrowContainer: Story = {
  args: { offset: 50, limit: 10, total: 250 },
  render: () => ({
    components: { Pagination, Splitter, TextStyle },
    setup() {
      const offset = ref(50)
      const size = ref<number | string>('70%')
      return { offset, size }
    },
    template: `
      <div style="height: 160px; border: 1px solid var(--octans-border); border-radius: var(--octans-radius-box); overflow: hidden">
        <Splitter v-model:size="size" :min="160">
          <template #start>
            <div style="display: grid; gap: 16px; padding: 16px; align-content: start">
              <div>
                <TextStyle type="subdued">Measured</TextStyle>
                <Pagination :offset="offset" :limit="10" :total="250" @change="val => offset = val" />
              </div>
              <div>
                <TextStyle type="subdued">compact-below 400</TextStyle>
                <Pagination :offset="offset" :limit="10" :total="250" :compact-below="400" @change="val => offset = val" />
              </div>
            </div>
          </template>
          <template #end>
            <div style="height: 100%; padding: 16px; background: var(--octans-surface-sunken)">
              <TextStyle type="subdued">Drag the gutter</TextStyle>
            </div>
          </template>
        </Splitter>
      </div>
    `
  })
}

/**
 * `jump-to` adds a "Go to" field after the full strip. In the compact form
 * the `3 / 25` readout becomes a button that opens the same field in a
 * popover, with a Go button because a phone's numeric keypad has no Enter.
 */
export const JumpTo: Story = {
  args: { offset: 50, limit: 10, total: 250 },
  render: () => ({
    components: { Pagination },
    setup() {
      const offset = ref(50)
      return { offset }
    },
    template: `
      <div style="display: grid; gap: 12px">
        <Pagination :offset="offset" :limit="10" :total="250" jump-to :compact="false" @change="val => offset = val" />
        <Pagination :offset="offset" :limit="10" :total="250" jump-to compact @change="val => offset = val" />
      </div>
    `
  })
}

/**
 * The component fills its container, and `align` places the controls within
 * that width.
 */
export const Alignment: Story = {
  args: { offset: 50, limit: 10, total: 250 },
  render: () => ({
    components: { Pagination },
    setup() {
      const offset = ref(50)
      return { offset }
    },
    template: `
      <div style="display: grid; gap: 12px">
        <Pagination :offset="offset" :limit="10" :total="250" align="left" @change="val => offset = val" />
        <Pagination :offset="offset" :limit="10" :total="250" align="center" @change="val => offset = val" />
        <Pagination :offset="offset" :limit="10" :total="250" align="right" @change="val => offset = val" />
      </div>
    `
  })
}

export const WithoutPageSize: Story = {
  args: { offset: 50, limit: 10, total: 250 },
  render: () => live(':show-page-size="false"', '', 50)
}
