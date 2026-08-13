import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Stack } from '@/components/Stack'
import { Sticky } from '@/components/Sticky'
import { TextStyle } from '@/components/TextStyle'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

const meta = {
  title: 'Components/Layout/Sticky',
  component: Sticky,
  tags: ['autodocs'],
  args: {},
  argTypes: {
    position: { control: 'inline-radio', options: ['top', 'bottom'] }
  }
} satisfies Meta<typeof Sticky>

export default meta
type Story = StoryObj<typeof meta>

// Every story scrolls inside a box rather than the page, so the effect is
// visible in the docs without scrolling Storybook itself. `Sticky` finds that
// box by walking up to the nearest scrolling ancestor, so nothing has to be
// told where it is.
const scroller =
  'height: 260px; overflow-y: auto; ' +
  'border: 1px solid var(--octans-border); border-radius: var(--octans-radius-box);'

const bar =
  'padding: 12px 16px; background: var(--octans-surface); ' +
  'border-bottom: 1px solid var(--octans-border);'

/**
 * Pins content against the top of whatever scrolls it.
 */
export const Primary: Story = {
  render: () => ({
    components: { Sticky, TextStyle },
    setup: () => ({ scroller, bar }),
    template: `
      <div :style="scroller">
        <Sticky>
          <div :style="bar"><TextStyle type="strong">Stays put</TextStyle></div>
        </Sticky>
        <div style="padding: 0 16px">
          <p v-for="n in 40" :key="n">Line {{ n }}</p>
        </div>
      </div>
    `
  })
}

/**
 * `offset` is the distance to hold from the edge. It takes a number of pixels,
 * or any CSS length as a string — a `calc()`, a custom property, whatever.
 *
 * This replaced measuring the element's own `offsetTop` on mount, which pinned
 * it wherever it happened to start rather than against the edge, and left
 * content scrolling through the gap above it.
 */
export const Offset: Story = {
  render: () => ({
    components: { Sticky, TextStyle },
    setup: () => ({ scroller, bar }),
    template: `
      <div :style="scroller">
        <div style="padding: 16px">
          <TextStyle type="subdued">Scrolls away first.</TextStyle>
        </div>
        <Sticky :offset="16">
          <div :style="bar + 'border: 1px solid var(--octans-border); border-radius: var(--octans-radius-box);'">
            <TextStyle type="strong">Holds 16px from the top</TextStyle>
          </div>
        </Sticky>
        <div style="padding: 0 16px">
          <p v-for="n in 40" :key="n">Line {{ n }}</p>
        </div>
      </div>
    `
  })
}

/**
 * There is no `:stuck` selector in CSS, so the pinned state is reported instead:
 * as a `stuck` slot prop, as an `update:stuck` event, and as a plain
 * `Sticky-stuck` class on the root for stylesheets that would rather not
 * involve script. Raising a shadow only while pinned is the usual reason to
 * want it.
 */
export const StuckState: Story = {
  render: () => ({
    components: { Sticky, TextStyle, Stack },
    setup() {
      const events = ref<string[]>([])
      return {
        scroller,
        bar,
        events,
        onStuck: (value: boolean) =>
          events.value.unshift(value ? 'pinned' : 'released'),
        shadow: (stuck: boolean) =>
          stuck ? '0 2px 6px rgba(0, 0, 0, 0.16)' : 'none'
      }
    },
    template: `
      <Stack vertical>
        <div :style="scroller">
          <Sticky @update:stuck="onStuck">
            <template #default="{ stuck }">
              <div :style="[bar, { boxShadow: shadow(stuck), transition: 'box-shadow 150ms' }]">
                <TextStyle type="strong">
                  {{ stuck ? 'Pinned — note the shadow' : 'Scroll me' }}
                </TextStyle>
              </div>
            </template>
          </Sticky>
          <div style="padding: 0 16px">
            <p v-for="n in 40" :key="n">Line {{ n }}</p>
          </div>
        </div>
        <pre>{{ events.slice(0, 4).join(' · ') || 'no events yet' }}</pre>
      </Stack>
    `
  })
}

/**
 * `position="bottom"` pins against the bottom edge instead — a footer action
 * bar that stays reachable while a long form scrolls behind it.
 */
export const Bottom: Story = {
  render: () => ({
    components: { Sticky, Button, Stack, TextStyle },
    setup: () => ({
      scroller,
      footer:
        'padding: 12px 16px; background: var(--octans-surface); ' +
        'border-top: 1px solid var(--octans-border);',
      shadow: (stuck: boolean) =>
        stuck ? '0 -2px 6px rgba(0, 0, 0, 0.16)' : 'none'
    }),
    template: `
      <div :style="scroller">
        <div style="padding: 16px">
          <p v-for="n in 40" :key="n">Line {{ n }}</p>
        </div>
        <Sticky position="bottom">
          <template #default="{ stuck }">
            <div :style="[footer, { boxShadow: shadow(stuck) }]">
              <Stack alignment="center">
                <TextStyle type="subdued">Unsaved changes</TextStyle>
                <Button type="primary">Save</Button>
              </Stack>
            </div>
          </template>
        </Sticky>
      </div>
    `
  })
}

/**
 * `disabled` drops the content back into normal flow without unmounting it, for
 * turning stickiness off at a breakpoint. `stuck` reads `false` throughout.
 */
export const Disabled: Story = {
  render: () => ({
    components: { Sticky, Button, Stack, TextStyle },
    setup() {
      const disabled = ref(true)
      return { scroller, bar, disabled }
    },
    template: `
      <Stack vertical spacing="tight">
        <div :style="scroller">
          <Sticky :disabled="disabled">
            <div :style="bar">
              <TextStyle type="strong">
                {{ disabled ? 'Scrolling away with everything else' : 'Pinned' }}
              </TextStyle>
            </div>
          </Sticky>
          <div style="padding: 0 16px">
            <p v-for="n in 40" :key="n">Line {{ n }}</p>
          </div>
        </div>
        <Button @click="disabled = !disabled">
          {{ disabled ? 'Enable' : 'Disable' }}
        </Button>
      </Stack>
    `
  })
}

/**
 * A sidebar that holds while a long column scrolls beside it.
 *
 * Note the flex row has no `align-items: flex-start`. A sticky element can only
 * travel within its own parent, so shrinking that column to the card's height
 * leaves it nowhere to go and it scrolls away like anything else.
 */
export const Sidebar: Story = {
  render: () => ({
    components: { Sticky, Card, Stack, TextStyle },
    setup: () => ({ scroller }),
    template: `
      <div :style="scroller">
        <div style="display: flex; gap: 16px; padding: 16px">
          <div style="flex: 1">
            <p v-for="n in 40" :key="n">Line {{ n }}</p>
          </div>
          <div style="width: 180px">
            <Sticky :offset="16">
              <Card>
                <div style="padding: 16px">
                  <Stack vertical spacing="tight">
                    <TextStyle type="strong">Summary</TextStyle>
                    <TextStyle type="subdued">40 works on display</TextStyle>
                  </Stack>
                </div>
              </Card>
            </Sticky>
          </div>
        </div>
      </div>
    `
  })
}
