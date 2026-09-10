import { Button } from '@/components/Button'
import { ScrollPane } from '@/components/ScrollPane'
import { Stack } from '@/components/Stack'
import { type Meta, type StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'

const meta = {
  title: 'Components/Layout/ScrollPane',
  component: ScrollPane,
  tags: ['autodocs'],
  args: {},
  argTypes: {
    direction: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal', 'both']
    }
  }
} satisfies Meta<typeof ScrollPane>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: () => ({
    setup() {
      const disabled = ref(false)
      return {
        disabled
      }
    },
    components: { ScrollPane, Button, Stack },
    template: `
      <Stack
        vertical
        spacing="tight"
      >
        <ScrollPane
          style="max-height: 250px"
          :disabled="disabled"
        >
          <div
            v-for="n in 100"
            :key="n"
          >Line {{n}}</div>
        </ScrollPane>
        <Button
          @click="disabled = !disabled"
        >{{disabled ? 'Enable' : 'Disable'}}</Button>
      </Stack>
    `
  })
}

export const WithPadding: Story = {
  render: () => ({
    components: { ScrollPane },
    template: `
      <ScrollPane
        style="max-height: 250px"
        padding="30px"
      >
        <div
          v-for="n in 100"
          :key="n"
        >Line {{n}}</div>
      </ScrollPane>
    `
  })
}

/**
`direction="horizontal"` scrolls left and right instead, and the overflow
indicators move to the left and right edges to match.
*/
export const Horizontal: Story = {
  render: () => ({
    components: { ScrollPane },
    template: `
      <ScrollPane direction="horizontal">
        <div style="display:flex; gap:8px; width:max-content">
          <div
            v-for="n in 40"
            :key="n"
            style="
              flex:0 0 auto; width:120px; height:80px;
              display:flex; align-items:center; justify-content:center;
              background: var(--octans-surface-sunken);
              border: 1px solid var(--octans-border);
              border-radius: var(--octans-radius-box);
            "
          >Card {{n}}</div>
        </div>
      </ScrollPane>
    `
  })
}

/**
`direction="both"` scrolls either way and fades all four edges as needed. Scroll
into the middle and every indicator is showing at once.

The controls cover the cases that are easy to get wrong:

- **Shrink the content** so it fits — every indicator should go, since there is
  nothing off screen to point at.
- **Disable** the pane — the indicators go too. A disabled pane cannot be
  scrolled, so a fade would be pointing at content nobody can reach.
- **Hide indicators** — scrolling still works, the pane just says nothing about
  it.
*/
export const BothDirections: Story = {
  render: () => ({
    setup() {
      const disabled = ref(false)
      const indicators = ref(true)
      const small = ref(false)
      const rows = computed(() => (small.value ? 3 : 40))
      const cols = computed(() => (small.value ? 3 : 20))
      return { disabled, indicators, small, rows, cols }
    },
    components: { ScrollPane, Button, Stack },
    template: `
      <Stack
        vertical
        spacing="tight"
      >
        <ScrollPane
          direction="both"
          style="max-height: 250px; border: 1px solid var(--octans-border)"
          :disabled="disabled"
          :indicators="indicators"
          :watch="small"
        >
          <table style="border-collapse:collapse; width:max-content">
            <tr v-for="row in rows" :key="row">
              <td
                v-for="col in cols"
                :key="col"
                style="
                  padding:6px 14px; white-space:nowrap;
                  border:1px solid var(--octans-border);
                "
              >R{{row}} C{{col}}</td>
            </tr>
          </table>
        </ScrollPane>
        <Stack spacing="tight">
          <Button @click="small = !small">
            {{small ? 'Overflow the pane' : 'Shrink to fit'}}
          </Button>
          <Button @click="disabled = !disabled">
            {{disabled ? 'Enable scrolling' : 'Disable scrolling'}}
          </Button>
          <Button @click="indicators = !indicators">
            {{indicators ? 'Hide indicators' : 'Show indicators'}}
          </Button>
        </Stack>
      </Stack>
    `
  })
}

/**
By default, scrolling past the end of a pane carries on scrolling the page
behind it — that is the browser's own behaviour, and inside normal page flow it
is usually what you want.

`contain` switches it off. Scroll each of these to the bottom and keep going:
the left one takes the page with it, the right one stops dead. Use it for panes
inside a modal, sheet or dropdown, where scrolling whatever is underneath is
never intended.

It also suppresses the rubber-band bounce and pull-to-refresh within the pane.
*/
export const NoScrollChaining: Story = {
  render: () => ({
    components: { ScrollPane },
    template: `
      <div>
        <div style="height:40vh"></div>
        <div style="display:flex; gap:16px; align-items:flex-start">
          <div style="flex:1">
            <p><strong>Default</strong> — scrolls the page at the end.</p>
            <ScrollPane
              style="max-height:200px; border:1px solid var(--octans-border)"
              padding="8px"
            >
              <div v-for="n in 60" :key="n">Line {{n}}</div>
            </ScrollPane>
          </div>
          <div style="flex:1">
            <p><strong>contain</strong> — stops at the end.</p>
            <ScrollPane
              contain
              style="max-height:200px; border:1px solid var(--octans-border)"
              padding="8px"
            >
              <div v-for="n in 60" :key="n">Line {{n}}</div>
            </ScrollPane>
          </div>
        </div>
        <div style="height:80vh"></div>
      </div>
    `
  })
}

export const ProgrammaticScrolling: Story = {
  render: () => ({
    components: { ScrollPane, Button, Stack },
    template: `
      <Stack
        vertical
        spacing="tight"
      >
        <ScrollPane
          style="max-height: 250px"
          ref="scrollPane"
        >
          <div
            v-for="n in 50"
            :key="n"
          >Line {{n}}</div>
          <div
            ref="middle"
            style="color: var(--octans-text-error); font-size: 40px"
          >Middle!</div>
          <div
            v-for="n in 50"
            :key="n + 50"
          >Line {{n + 50}}</div>
        </ScrollPane>
        <Stack spacing="tight">
          <Button @click="$refs.scrollPane.scrollTo(0, 300)">Scroll to 300px</Button>
          <Button @click="$refs.scrollPane.scrollTo(0, 0)">Scroll to top</Button>
          <Button @click="$refs.scrollPane.scrollIntoView($refs.middle)">Scroll to middle item</Button>
        </Stack>
      </Stack>
    `
  })
}

/**
 * `scrollIntoView` moves THIS pane and nothing else.
 *
 * The DOM's own `Element.scrollIntoView` walks every scrollable ancestor, so
 * calling it on an item inside a pane that lives in a dropdown, a sheet or a
 * modal is as likely to scroll the page out from under the overlay as it is to
 * move the list. The pane knows which container it owns, so it scrolls that
 * one — and it takes an element or a selector resolved inside the pane.
 *
 * `block` defaults to `"nearest"`, which moves only when the target is off an
 * edge and only as far as it takes: the right behaviour for walking a list
 * with the arrow keys, where a list that jumps on every keystroke is worse
 * than one that does not move at all.
 */
export const ScrollIntoView: Story = {
  render: () => ({
    components: { ScrollPane, Button, Stack },
    template: `
      <Stack
        vertical
        spacing="tight"
      >
        <ScrollPane
          style="max-height: 250px"
          ref="pane"
        >
          <div
            v-for="n in 80"
            :key="n"
            :id="'row-' + n"
            :style="n === 40 ? 'color: var(--octans-text-error); font-weight: 600' : ''"
          >Row {{n}}</div>
        </ScrollPane>
        <Stack spacing="tight">
          <Button @click="$refs.pane.scrollIntoView('#row-40')">Nearest</Button>
          <Button @click="$refs.pane.scrollIntoView('#row-40', { block: 'start' })">Start</Button>
          <Button @click="$refs.pane.scrollIntoView('#row-40', { block: 'center' })">Centre</Button>
          <Button @click="$refs.pane.scrollIntoView('#row-40', { block: 'end', offset: 16 })">End, 16px clear</Button>
          <Button @click="$refs.pane.scrollIntoView('#row-40', { block: 'start', behavior: 'smooth' })">Smooth</Button>
        </Stack>
      </Stack>
    `
  })
}
