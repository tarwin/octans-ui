import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { ScrollPane } from '@/components/ScrollPane'
import { Splitter } from '@/components/Splitter'
import { Stack } from '@/components/Stack'
import { TextStyle } from '@/components/TextStyle'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import type { SplitterResizeType } from './types'

const meta = {
  title: 'Components/Layout/Splitter',
  component: Splitter,
  tags: ['autodocs'],
  args: {},
  argTypes: {
    direction: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    handle: { control: 'inline-radio', options: ['line', 'grip', 'none'] }
  }
} satisfies Meta<typeof Splitter>

export default meta
type Story = StoryObj<typeof meta>

// A Splitter fills the box it is given rather than growing to its content, so
// every story needs a box with a height. That is the same bargain any pane
// layout makes — the panes are told how much room there is, not the reverse.
const frame =
  'height: 240px; border: 1px solid var(--octans-border); ' +
  'border-radius: var(--octans-radius-box); overflow: hidden;'

const panel =
  'height: 100%; padding: 12px 16px; box-sizing: border-box; ' +
  'background: var(--octans-surface);'

const sunken = panel + 'background: var(--octans-surface-sunken);'

/**
 * Two panes and a gutter. Only the start pane has a size — the end pane takes
 * whatever is left, which is what keeps the two adding up at any width.
 *
 * Drag the gutter, or tab to it and use the arrow keys.
 */
export const Primary: Story = {
  render: () => ({
    components: { Splitter, TextStyle },
    setup() {
      const size = ref<number | string>('40%')
      return { size, frame, panel, sunken }
    },
    template: `
      <div :style="frame">
        <Splitter v-model:size="size">
          <template #start>
            <div :style="panel"><TextStyle type="strong">Start</TextStyle></div>
          </template>
          <template #end>
            <div :style="sunken">
              <TextStyle type="subdued">End — takes the remainder</TextStyle>
            </div>
          </template>
        </Splitter>
      </div>
    `
  })
}

/**
 * `direction="vertical"` stacks the panes and lays the gutter across them.
 * Everything else is identical, including which pane `size` refers to: the
 * start pane is the top one.
 */
export const Vertical: Story = {
  render: () => ({
    components: { Splitter, TextStyle },
    setup: () => ({ frame, panel, sunken }),
    template: `
      <div :style="frame">
        <Splitter direction="vertical" size="35%">
          <template #start>
            <div :style="panel"><TextStyle type="strong">Top</TextStyle></div>
          </template>
          <template #end>
            <div :style="sunken"><TextStyle type="subdued">Bottom</TextStyle></div>
          </template>
        </Splitter>
      </div>
    `
  })
}

/**
 * `min` and `max` bound the drag. They are applied as real CSS on the pane, so
 * any unit works and the bound survives the container being resized — not only
 * the pointer being dragged.
 *
 * They are also what `Home` and `End` jump to from the keyboard.
 */
export const Bounds: Story = {
  render: () => ({
    components: { Splitter, TextStyle },
    setup: () => ({ frame, panel, sunken }),
    template: `
      <div :style="frame">
        <Splitter :size="200" :min="120" max="60%">
          <template #start>
            <div :style="panel">
              <TextStyle type="strong">120px – 60%</TextStyle>
            </div>
          </template>
          <template #end>
            <div :style="sunken">
              <TextStyle type="subdued">Try to drag past either end.</TextStyle>
            </div>
          </template>
        </Splitter>
      </div>
    `
  })
}

/**
 * `collapsible` lets the start pane be shut entirely — drag it `snap` pixels
 * past its minimum, press Enter on the gutter, or bind `v-model:collapsed`.
 *
 * The gutter stays where it is when the pane shuts, so there is always
 * something to pull it back out with. Reopening returns it to the size it had
 * before, not to a default.
 */
export const Collapsible: Story = {
  render: () => ({
    components: { Splitter, Button, Stack, TextStyle },
    setup() {
      const collapsed = ref(false)
      return { collapsed, frame, panel, sunken }
    },
    template: `
      <Stack vertical spacing="tight">
        <div :style="frame">
          <Splitter
            v-model:collapsed="collapsed"
            :size="200"
            :min="140"
            collapsible
          >
            <template #start>
              <div :style="panel"><TextStyle type="strong">Sidebar</TextStyle></div>
            </template>
            <template #end="{ collapsed: shut }">
              <div :style="sunken">
                <TextStyle type="subdued">
                  {{ shut ? 'Sidebar is shut — drag the gutter right, or press Enter on it.' : 'Drag the gutter well past 140px.' }}
                </TextStyle>
              </div>
            </template>
          </Splitter>
        </div>
        <Button @click="collapsed = !collapsed">
          {{ collapsed ? 'Show sidebar' : 'Hide sidebar' }}
        </Button>
      </Stack>
    `
  })
}

/**
 * `snapTo` quantises DRAGGING to fixed increments — a number of pixels, or a
 * percentage of the container. Drag this one and it lands only on tenths.
 *
 * It deliberately does not touch the keyboard: `step` still moves the arrows
 * five pixels at a time here, because the keyboard is the precise instrument
 * and a coarse grid should not make it coarse too. `Home` and `End` go to the
 * exact bounds for the same reason, and a double-click resets to the exact
 * size given.
 *
 * Not to be confused with `snap`, which is how far past its minimum a pane
 * must be dragged before it shuts.
 */
export const Steps: Story = {
  render: () => ({
    components: { Splitter, Stack, TextStyle },
    setup() {
      const size = ref<number | string>('50%')
      return { size, frame, panel, sunken }
    },
    template: `
      <Stack vertical spacing="tight">
        <div :style="frame">
          <Splitter v-model:size="size" snap-to="10%" :step="5" handle="grip">
            <template #start>
              <div :style="panel"><TextStyle type="strong">Tenths</TextStyle></div>
            </template>
            <template #end>
              <div :style="sunken">
                <TextStyle type="subdued">
                  Drag for stops; tab to the gutter and use the arrows for 5px.
                </TextStyle>
              </div>
            </template>
          </Splitter>
        </div>
        <pre>size = {{ JSON.stringify(size) }}</pre>
      </Stack>
    `
  })
}

/**
 * `handle` picks what the gutter draws: `line` is a hairline, `grip` puts a
 * grab bar on it for gutters people are meant to reach for, and `none` draws
 * nothing while staying draggable. The `handle` slot replaces all three.
 *
 * `hitArea` widens the grabbable band over the panes either side without the
 * gutter taking any more room in the layout — worth raising for touch, at the
 * cost of the pane content right beside the gutter no longer being clickable.
 *
 * Colours come from `--Splitter-gutterColor`, `--Splitter-gutterHoverColor`
 * and `--Splitter-gutterActiveColor`, with `--Splitter-gutterSize` for the
 * width. The root also carries plain `Splitter-dragging` and
 * `Splitter-collapsed` classes, so a stylesheet can restyle the drag without
 * involving script.
 */
export const Handles: Story = {
  render: () => ({
    components: { Splitter, Stack, TextStyle },
    setup: () => ({ frame, panel, sunken }),
    template: `
      <Stack vertical>
        <div v-for="h in ['line', 'grip', 'none']" :key="h" :style="frame + 'height: 120px'">
          <Splitter size="30%" :handle="h" :hit-area="h === 'none' ? 24 : undefined">
            <template #start>
              <div :style="panel"><TextStyle type="strong">handle="{{ h }}"</TextStyle></div>
            </template>
            <template #end>
              <div :style="sunken">
                <TextStyle type="subdued">
                  {{ h === 'none' ? 'Nothing drawn — still draggable, with a 24px hit area.' : '&nbsp;' }}
                </TextStyle>
              </div>
            </template>
          </Splitter>
        </div>
        <div :style="frame + 'height: 120px'">
          <Splitter size="30%">
            <template #handle="{ dragging }">
              <div :style="{
                width: '100%',
                height: '100%',
                background: dragging ? 'var(--octans-primary)' : 'var(--octans-surface-sunken)',
                borderLeft: '1px solid var(--octans-border)',
                borderRight: '1px solid var(--octans-border)'
              }"></div>
            </template>
            <template #start>
              <div :style="panel"><TextStyle type="strong">#handle slot</TextStyle></div>
            </template>
            <template #end>
              <div :style="sunken">
                <TextStyle type="subdued">Bound with <code>dragging</code> and <code>collapsed</code>.</TextStyle>
              </div>
            </template>
          </Splitter>
        </div>
      </Stack>
    `
  })
}

/**
 * `deferred` holds the panes still during a drag and shows a line where the
 * split will land, reflowing once on release.
 *
 * For panes whose layout is expensive — a wide table, a chart, an embedded map
 * — where reflowing every frame stutters. The pane here is deliberately heavy
 * so the difference is visible; compare it with `Primary`.
 */
export const Deferred: Story = {
  render: () => ({
    components: { Splitter, ScrollPane, TextStyle },
    setup: () => ({ frame, panel, sunken }),
    template: `
      <div :style="frame">
        <Splitter size="30%" deferred>
          <template #start>
            <div :style="panel"><TextStyle type="strong">Held still</TextStyle></div>
          </template>
          <template #end>
            <ScrollPane :style="sunken">
              <table style="width: 100%; border-collapse: collapse">
                <tr v-for="n in 60" :key="n">
                  <td v-for="c in 6" :key="c" style="padding: 2px 8px; white-space: nowrap">
                    Cell {{ n }}.{{ c }}
                  </td>
                </tr>
              </table>
            </ScrollPane>
          </template>
        </Splitter>
      </div>
    `
  })
}

/**
 * Three panes is a Splitter nested inside a pane of another one.
 *
 * That is the deliberate trade of a two-pane component: the inner ratio holds
 * when the outer split is dragged, which is what you want for a sidebar beside
 * a split editor — and it means there is only ever one size to think about at
 * each level.
 */
export const Nested: Story = {
  render: () => ({
    components: { Splitter, TextStyle },
    setup: () => ({ frame, panel, sunken }),
    template: `
      <div :style="frame">
        <Splitter :size="140" :min="80">
          <template #start>
            <div :style="panel"><TextStyle type="strong">Nav</TextStyle></div>
          </template>
          <template #end>
            <Splitter direction="vertical" size="60%">
              <template #start>
                <div :style="sunken"><TextStyle type="strong">Editor</TextStyle></div>
              </template>
              <template #end>
                <div :style="panel"><TextStyle type="subdued">Console</TextStyle></div>
              </template>
            </Splitter>
          </template>
        </Splitter>
      </div>
    `
  })
}

/**
 * `v-model:size` speaks whatever unit you gave it — a percentage stays a
 * percentage, so the layout keeps responding to the container. `resize` reports
 * both units at once, plus the collapsed state, for the cases where you need
 * the one the model is not in.
 *
 * Drag this one and watch both numbers.
 */
export const Reporting: Story = {
  render: () => ({
    components: { Splitter, Card, Stack, TextStyle },
    setup() {
      const size = ref<number | string>('40%')
      const detail = ref<SplitterResizeType | null>(null)
      return {
        size,
        detail,
        onResize: (value: SplitterResizeType) => (detail.value = value),
        frame,
        panel,
        sunken
      }
    },
    template: `
      <Stack vertical spacing="tight">
        <div :style="frame">
          <Splitter v-model:size="size" @resize="onResize">
            <template #start>
              <div :style="panel"><TextStyle type="strong">Drag me</TextStyle></div>
            </template>
            <template #end>
              <div :style="sunken"><TextStyle type="subdued">…</TextStyle></div>
            </template>
          </Splitter>
        </div>
        <pre>size = {{ JSON.stringify(size) }}
resize = {{ detail ? JSON.stringify(detail) : 'nothing yet' }}</pre>
      </Stack>
    `
  })
}

/**
 * `storageKey` remembers the size and collapsed state in `localStorage` and
 * restores them on mount, so a layout the user arranged survives a reload.
 *
 * Drag this one, then refresh the page. Double-click the gutter to put it back
 * to the size it was designed at.
 *
 * Storage being unavailable is not an error — in private browsing, or a
 * sandboxed frame, the splitter simply forgets.
 */
export const Persisted: Story = {
  render: () => ({
    components: { Splitter, TextStyle },
    setup: () => ({ frame, panel, sunken }),
    template: `
      <div :style="frame">
        <Splitter :size="180" :min="100" storage-key="storybook-demo" collapsible>
          <template #start>
            <div :style="panel"><TextStyle type="strong">Remembered</TextStyle></div>
          </template>
          <template #end>
            <div :style="sunken">
              <TextStyle type="subdued">Drag, then reload the page.</TextStyle>
            </div>
          </template>
        </Splitter>
      </div>
    `
  })
}
