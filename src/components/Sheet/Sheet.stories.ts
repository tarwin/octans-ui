import { Badge } from '@/components/Badge'
import { Banner } from '@/components/Banner'
import { Button } from '@/components/Button'
import { Card, CardSection } from '@/components/Card'
import { TextField } from '@/components/TextField'
import { Icon } from '@/components/Icon'
import { alertModal, genericModal } from '@/components/Modal'
import { Select } from '@/components/Select'
import { Stack } from '@/components/Stack'
import { TextStyle } from '@/components/TextStyle'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import Sheet from './Sheet.vue'
import { toast } from '@/components/ToastManager'

/**
 * A Sheet is a large panel that slides in from an edge of the screen — the
 * right by default, or any of the four via `edge`. Sheets stack on top of each
 * other — background sheets "peek" out behind the active one — and are useful
 * for secondary flows that need more room than a Modal.
 *
 * `size` is the sheet's extent along the axis it slides on: its width for a
 * left or right sheet, its height for a top or bottom one.
 *
 * The sheet is always three parts: a fixed header (title, close, actions), a
 * scrolling content area, and the backdrop. Only the middle part scrolls, so
 * the actions stay reachable however long the content gets.
 */
const meta = {
  title: 'Components/Overlays/Sheet',
  component: Sheet,
  tags: ['autodocs'],
  args: {},
  argTypes: {
    edge: {
      control: 'inline-radio',
      options: ['right', 'left', 'top', 'bottom']
    }
  }
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Sample content shared by the scrolling stories. Enough sections to overflow
 * any sheet, and varied enough that it is obvious which part is moving.
 */
const SECTIONS = [
  {
    title: 'Overview',
    body: 'A short summary of what this record is and why it exists. The first section is usually the one people read, so it stays above the fold.',
    status: 'success',
    statusLabel: 'Active'
  },
  {
    title: 'Audience',
    body: 'Who this applies to. Rules are evaluated top to bottom and the first match wins, which is why order matters here more than it looks like it should.',
    status: 'info',
    statusLabel: '3 rules'
  },
  {
    title: 'Schedule',
    body: 'When it runs. Times are stored in UTC and displayed in the viewer’s own timezone, so two people looking at the same record can see different clock times.',
    status: 'warning',
    statusLabel: 'Ends soon'
  },
  {
    title: 'Appearance',
    body: 'Colours, spacing and typography. Anything not set here falls back to the theme, so an empty section means "inherit" rather than "nothing".',
    status: undefined,
    statusLabel: ''
  },
  {
    title: 'Content',
    body: 'The text and images shown to the end user. Long enough to wrap over several lines so the reading measure is visible when padding is on.',
    status: undefined,
    statusLabel: ''
  },
  {
    title: 'Delivery rules',
    body: 'Frequency caps, cooldowns and exclusions. These compose, so a record can be eligible by one rule and held back by another at the same time.',
    status: 'error',
    statusLabel: 'Capped'
  },
  {
    title: 'Goals',
    body: 'What counts as success, and the window in which it has to happen. Changing the window retroactively changes the reported numbers.',
    status: undefined,
    statusLabel: ''
  },
  {
    title: 'Integrations',
    body: 'Outbound connections. Each one is independent — disabling a single integration never disables the record itself.',
    status: 'info',
    statusLabel: '2 connected'
  },
  {
    title: 'Notifications',
    body: 'Who gets told, and how. Digest emails batch overnight; alerts go out immediately.',
    status: undefined,
    statusLabel: ''
  },
  {
    title: 'Advanced',
    body: 'Escape hatches and overrides. Everything in here is deliberately dull to look at, because reaching for it should feel like a decision.',
    status: undefined,
    statusLabel: ''
  }
]

export const Default: Story = {
  render: () => ({
    components: { Sheet, Button, Stack },
    setup() {
      const s1 = ref(false)
      const s2 = ref(false)
      const s3 = ref(false)
      const showToast = () => {
        toast({ title: 'test' })
      }
      const showModal = () => {
        genericModal({ title: 'test' })
      }
      return {
        s1,
        s2,
        showToast,
        showModal,
        s3
      }
    },
    template: `
      <div>
        <Stack spacing="tight">
          <Button @click="showToast">Toast</Button>
          <Button @click="showModal">Modal</Button>
          <Button @click="s1 = !s1">Toggle 1 ({{s1}})</Button>
          <Button @click="s2 = !s2">Toggle 2 ({{s2}})</Button>
          <Button @click="s3 = !s3">Toggle 3 ({{s3}})</Button>
        </Stack>
        <Sheet title="First sheet" :visible="s1" @close="s1 = false">
          <Stack
            vertical
            spacing="tight"
          >
            <div>This is the sheet content</div>
            <Stack spacing="tight">
              <Button @click="showModal">Modal</Button>
              <Button @click="s2 = true">Show 2</Button>
            </Stack>
          </Stack>
        </Sheet>
        <Sheet title="Second sheet" :visible="s2" @close="s2 = false">
          <Stack
            vertical
            spacing="tight"
          >
            <div>Sheet 2</div>
            <Button @click="s3 = true">Show 3</Button>
          </Stack>
        </Sheet>
        <Sheet title="Third sheet" :visible="s3" @close="s3 = false">
          Sheet 3
        </Sheet>
      </div>
    `
  })
}

/**
`padded` does two things at once, and it is worth knowing they are separate:

1. It puts a **30px gutter** around the content, inside the scrolling area — so
   the scrollbar still sits against the sheet edge rather than floating in from
   it.
2. It caps the content at a **900px reading measure** and centres it. On a wide
   sheet this is the more noticeable of the two, and it is why a padded 1600px
   sheet does not give you 1600px-wide paragraphs.

Without it the content area is completely flush, which is what you want for
anything that supplies its own edges — a full-bleed table, an image, a map, or
a list whose rows should run the whole width.

Toggle it from the header and watch both effects at once. The sheet is 1100px
wide so the 900px cap actually bites.
*/
export const Padding: Story = {
  render: () => ({
    components: { Sheet, Button, Card, CardSection, Stack },
    setup() {
      const visible = ref(false)
      const padded = ref(true)
      return { visible, padded }
    },
    template: `
      <div>
        <Button @click="visible = true">Open sheet</Button>
        <Sheet
          :title="padded ? 'padded' : 'not padded'"
          :size="1100"
          :padded="padded"
          :visible="visible"
          @close="visible = false"
        >
          <template #actions>
            <Button @click="padded = !padded">
              {{ padded ? 'Turn padding off' : 'Turn padding on' }}
            </Button>
          </template>

          <Card title="Where the edges are">
            <CardSection>
              <p>
                With padding on, this card floats 30px clear of the sheet and
                stops at 900px however wide the sheet gets. With it off, the
                card runs edge to edge and the corner radius sits flush against
                the sheet — which usually looks like a mistake for a card, and
                exactly right for a table.
              </p>
            </CardSection>
            <CardSection subdued>
              A second section, so the internal dividers are visible against
              both backgrounds.
            </CardSection>
          </Card>

          <div style="height: 16px"></div>

          <div
            style="
              background: var(--octans-surface);
              border-top: 1px solid var(--octans-border);
              border-bottom: 1px solid var(--octans-border);
            "
          >
            <div
              v-for="n in 6"
              :key="n"
              style="
                display:flex; justify-content:space-between;
                padding: 12px 16px;
                border-top: 1px solid var(--octans-border);
              "
            >
              <span>Full-bleed row {{ n }}</span>
              <span style="color: var(--octans-text-subdued)">unpadded suits this</span>
            </div>
          </div>
        </Sheet>
      </div>
    `
  })
}

/**
The header never moves. Only the content area between it and the bottom of the
sheet scrolls, so the close button and the actions stay reachable no matter how
far down the content goes.

The scroll area is a [`ScrollPane`](/docs/scrollpane--docs) with `contain` set,
which means reaching the bottom does **not** carry on scrolling the page behind
the sheet. It also fades the top and bottom edges while there is more content
that way — scroll into the middle and both fades show at once.

Open this and scroll: the title bar, the search field in the actions slot and
the Save button all stay put.
*/
export const ScrollingContent: Story = {
  render: () => ({
    components: {
      Sheet,
      Button,
      Card,
      CardSection,
      Badge,
      Banner,
      Stack,
      TextField,
      Icon,
      TextStyle
    },
    setup() {
      const visible = ref(false)
      const sections = SECTIONS
      return { visible, sections }
    },
    template: `
      <div>
        <Button @click="visible = true">Open a long sheet</Button>
        <Sheet
          title="Campaign settings"
          :visible="visible"
          :size="880"
          :primaryAction="{ label: 'Save', onAction: () => visible = false }"
          padded
          @close="visible = false"
        >
          <template #actions>
            <TextField placeholder="Search settings">
              <template #prefix>
                <Icon icon="mdi:magnify" />
              </template>
            </TextField>
          </template>

          <Banner
            title="This campaign is live"
            status="info"
          >
            Changes are applied as soon as they are saved. There is no draft
            state for a campaign that has already started.
          </Banner>

          <div style="height: 16px"></div>

          <Stack
            vertical
            spacing="loose"
          >
            <Card
              v-for="section in sections"
              :key="section.title"
              :title="section.title"
            >
              <CardSection>
                <Stack
                  vertical
                  spacing="tight"
                >
                  <Badge
                    v-if="section.status"
                    :status="section.status"
                  >{{ section.statusLabel }}</Badge>
                  <p>{{ section.body }}</p>
                </Stack>
              </CardSection>
              <CardSection subdued>
                <TextStyle type="subdued">
                  Last changed 3 days ago by another member of your team.
                </TextStyle>
              </CardSection>
            </Card>
          </Stack>

          <div style="height: 24px"></div>

          <TextStyle type="subdued">
            You have reached the end. Notice the page behind the sheet did not
            move — that is <code>contain</code> on the scroll pane.
          </TextStyle>
        </Sheet>
      </div>
    `
  })
}

/**
Content that scrolls **and** a form that has to stay usable while it does. The
fields are real, so tabbing through them scrolls the pane rather than the page,
and the primary action never leaves the screen.

This is the shape most sheets end up being: a header you can always reach, a
long body, and a save at the top right.
*/
export const ScrollingForm: Story = {
  render: () => ({
    components: {
      Sheet,
      Button,
      Card,
      CardSection,
      Select,
      Stack,
      TextField,
      TextStyle
    },
    setup() {
      const visible = ref(false)
      const name = ref('Spring promotion')
      const notes = ref('')
      const frequency = ref('daily')
      const frequencies = [
        { label: 'Hourly', value: 'hourly' },
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' }
      ]
      const groups = Array.from({ length: 8 }, (_, i) => `Group ${i + 1}`)
      return { visible, name, notes, frequency, frequencies, groups }
    },
    template: `
      <div>
        <Button @click="visible = true">Open form sheet</Button>
        <Sheet
          title="Edit campaign"
          :visible="visible"
          :primaryAction="{ label: 'Save', onAction: () => visible = false }"
          :secondaryActions="[{ label: 'Cancel', onAction: () => visible = false }]"
          padded
          @close="visible = false"
        >
          <Stack
            vertical
            spacing="loose"
          >
            <Card title="Details">
              <CardSection>
                <Stack
                  vertical
                  spacing="tight"
                >
                  <TextField
                    v-model="name"
                    label="Name"
                  />
                  <Select
                    v-model="frequency"
                    label="Send frequency"
                    :options="frequencies"
                  />
                  <TextField
                    v-model="notes"
                    label="Internal notes"
                    multiline
                    placeholder="Only visible to your team"
                  />
                </Stack>
              </CardSection>
            </Card>

            <Card
              v-for="group in groups"
              :key="group"
              :title="group"
            >
              <CardSection>
                <Stack
                  vertical
                  spacing="tight"
                >
                  <TextField
                    :label="group + ' label'"
                    placeholder="Leave blank to inherit"
                  />
                  <TextStyle type="subdued">
                    Scroll down — the Save button in the header stays where it
                    is, so a long form never hides its own commit.
                  </TextStyle>
                </Stack>
              </CardSection>
            </Card>
          </Stack>
        </Sheet>
      </div>
    `
  })
}

/**
`size` is the sheet's extent along the axis it slides on. It is clamped to the
screen once the sheet becomes the foreground sheet, so asking for 3000px on a
1440px screen gives you a full-screen sheet rather than one running off the
side.

Resize the browser with the 3000px one open to watch the clamp track the
window.
*/
export const Sizes: Story = {
  render: () => ({
    components: { Sheet, Button, Stack, TextStyle },
    setup() {
      const sizes = [360, 700, 1100, 3000]
      const open = ref(0)
      return { sizes, open }
    },
    template: `
      <div>
        <Stack spacing="tight">
          <Button
            v-for="size in sizes"
            :key="size"
            @click="open = size"
          >{{ size }}px</Button>
        </Stack>
        <Sheet
          v-for="size in sizes"
          :key="size"
          :title="'size = ' + size"
          :size="size"
          :visible="open === size"
          padded
          @close="open = 0"
        >
          <p>
            This sheet asked for <strong>{{ size }}px</strong>.
          </p>
          <p v-if="size >= 3000">
            <TextStyle type="subdued">
              More than any normal screen, so it is clamped to the window width
              instead. Resize the window and it follows.
            </TextStyle>
          </p>
        </Sheet>
      </div>
    `
  })
}

/**
Each edge slides along its own axis and stretches across the other. `size`
means width for `left`/`right` and height for `top`/`bottom`, which is why it
is no longer called `width`.
*/
export const Edges: Story = {
  render: () => ({
    components: { Sheet, Button },
    setup() {
      const open = ref<string | null>(null)
      const edges = ['right', 'left', 'top', 'bottom'] as const
      return { open, edges }
    },
    template: `
      <div>
        <div style="display:flex; gap:8px">
          <Button
            v-for="edge in edges"
            :key="edge"
            @click="open = edge"
          >From {{ edge }}</Button>
        </div>
        <Sheet
          v-for="edge in edges"
          :key="edge"
          :edge="edge"
          :size="edge === 'top' || edge === 'bottom' ? 320 : 520"
          :title="'Sheet from the ' + edge"
          :visible="open === edge"
          padded
          @close="open = null"
        >
          <p>
            This sheet entered from the <strong>{{ edge }}</strong> and will
            leave the same way.
          </p>
          <p>
            The header, actions and scrolling content are identical whichever
            edge is used — only the axis changes.
          </p>
        </Sheet>
      </div>
    `
  })
}

/**
Stacking works on every edge. Background sheets are pushed toward the middle of
the screen by `peek` pixels, so they stay visible behind whatever covers them.
*/
export const StackedFromBottom: Story = {
  render: () => ({
    components: { Sheet, Button },
    setup() {
      const s1 = ref(false)
      const s2 = ref(false)
      const s3 = ref(false)
      return { s1, s2, s3 }
    },
    template: `
      <div>
        <Button @click="s1 = true">Open</Button>
        <Sheet edge="bottom" :size="420" title="First" :visible="s1" @close="s1 = false">
          <Button @click="s2 = true">Show second</Button>
        </Sheet>
        <Sheet edge="bottom" :size="420" title="Second" :visible="s2" @close="s2 = false">
          <Button @click="s3 = true">Show third</Button>
        </Sheet>
        <Sheet edge="bottom" :size="420" title="Third" :visible="s3" @close="s3 = false">
          The two behind this one peek out below it.
        </Sheet>
      </div>
    `
  })
}

/**
`peek` is how much of a sheet stays visible once something covers it, and it
accumulates down the stack: with three sheets open, the bottom one is pushed by
its own peek plus the one above it.

Each sheet here uses a different value so the effect is legible — 0 hides the
sheet behind completely, 200 leaves a wide margin you can click to dismiss back
down the stack.

> `peek` is read when the sheet mounts, so changing it on an already-open sheet
> has no effect. Set it per sheet rather than binding it to a live control.
*/
export const Peeking: Story = {
  render: () => ({
    components: { Sheet, Button, Stack, TextStyle },
    setup() {
      const s1 = ref(false)
      const s2 = ref(false)
      const s3 = ref(false)
      return { s1, s2, s3 }
    },
    template: `
      <div>
        <Button @click="s1 = true">Open the stack</Button>
        <Sheet
          title="Bottom — peek 200"
          :peek="200"
          :visible="s1"
          padded
          @close="s1 = false"
        >
          <Stack vertical spacing="tight">
            <p>This one leaves 200px showing once it is covered.</p>
            <Button @click="s2 = true">Open the next</Button>
          </Stack>
        </Sheet>
        <Sheet
          title="Middle — peek 60"
          :peek="60"
          :visible="s2"
          padded
          @close="s2 = false"
        >
          <Stack vertical spacing="tight">
            <p>This one leaves only a 60px sliver.</p>
            <Button @click="s3 = true">Open the last</Button>
          </Stack>
        </Sheet>
        <Sheet
          title="Top"
          :visible="s3"
          padded
          @close="s3 = false"
        >
          <TextStyle type="subdued">
            The offsets add up, so the bottom sheet is pushed by 200 + 60 with
            all three open.
          </TextStyle>
        </Sheet>
      </div>
    `
  })
}

export const Nested: Story = {
  render: () => ({
    components: { Sheet, Button },
    setup() {
      const s1 = ref(false)
      const s2 = ref(false)
      function open() {
        s1.value = true
        nextTick(() => {
          s2.value = true
        })
      }
      function close() {
        s1.value = false
        s2.value = false
      }
      return {
        s1,
        s2,
        open,
        close
      }
    },
    template: `
      <div>
        <div>
          <Button @click="open">Open both</Button>
        </div>
        <Sheet title="First sheet" :visible="s1" @close="s1 = false" color="red">
          <Sheet title="Second sheet" :visible="s2" @close="close" color="blue">
            Sheet 2 content
          </Sheet>
          Sheet 1 content
        </Sheet>
      </div>
    `
  })
}

/**
The `external` slot renders outside the sheet's container, before the backdrop.
Use it for a sheet declared *inside* another sheet: the child teleports to the
sheet layer either way, but declaring it in `external` keeps its placeholder
out of the parent's scrolling content, where it would otherwise sit among the
padded, measure-capped children.

Everything else — including the parent's own scroll position — behaves the
same.
*/
export const ExternalSlot: Story = {
  render: () => ({
    components: { Sheet, Button, Stack, TextStyle },
    setup() {
      const parent = ref(false)
      const child = ref(false)
      return { parent, child }
    },
    template: `
      <div>
        <Button @click="parent = true">Open parent</Button>
        <Sheet
          title="Parent"
          :visible="parent"
          padded
          @close="parent = false"
        >
          <template #external>
            <Sheet
              title="Child (declared in #external)"
              :size="480"
              :visible="child"
              padded
              @close="child = false"
            >
              <TextStyle type="subdued">
                Declared in the parent's <code>external</code> slot, so nothing
                about it participates in the parent's content layout.
              </TextStyle>
            </Sheet>
          </template>

          <Stack vertical spacing="tight">
            <p>Scroll down and open the child — the parent keeps its place.</p>
            <div v-for="n in 40" :key="n">Line {{ n }}</div>
            <Button @click="child = true">Open the child sheet</Button>
          </Stack>
        </Sheet>
      </div>
    `
  })
}

export const Actions: Story = {
  render: () => ({
    components: { Sheet, Button },
    setup() {
      const visible = ref(false)
      return {
        visible,
        alert: alertModal
      }
    },
    template: `
      <div>
        <div>
          <Button @click="visible = true">Show</Button>
        </div>
        <Sheet
          title="Sheet with actions"
          :primaryAction="{
            label: 'Close',
            type: 'destructive',
            onAction: () => visible = false
          }"
          :secondaryActions="[
            {label: 'test1', onAction: () => alert({content: 'test 1'})},
            {label: 'test2', onAction: () => alert({content: 'test 2'})}
          ]"
          :visible="visible"
          @close="visible = false"
        >
          This is the sheet content
        </Sheet>
      </div>
    `
  })
}

export const ActionsSlot: Story = {
  render: () => ({
    components: { Sheet, Button, TextField, Icon },
    setup() {
      const visible = ref(false)
      return {
        visible
      }
    },
    template: `
      <div>
        <Button @click="visible = true">Show</Button>
        <Sheet
          title="Sheet with actions slot"
          :visible="visible"
          @close="visible = false"
        >
          <template v-slot:actions>
            <TextField placeholder="Search me">
              <template #prefix>
                <Icon icon="mdi:magnify" />
              </template>
            </TextField>
            <Button
              type="primary"
              @click="visible = false"
            >Action 1</Button>
          </template>
          This is the sheet content
        </Sheet>
      </div>
    `
  })
}

export const ActionsSlotMix: Story = {
  render: () => ({
    components: { Sheet, Button, TextField, Icon },
    setup() {
      const visible = ref(false)
      return {
        visible,
        alert: alertModal
      }
    },
    template: `
      <div>
        <div>
          <Button @click="visible = true">Show</Button>
        </div>
        <Sheet
          title="Sheet with actions"
          :primaryAction="{
            label: 'Close',
            type: 'destructive',
            onAction: () => visible = false
          }"
          :secondaryActions="[
            {label: 'test1', onAction: () => alert({content: 'test 1'})},
            {label: 'test2', onAction: () => alert({content: 'test 2'})}
          ]"
          :visible="visible"
          @close="visible = false"
        >
          <template v-slot:actions>
            <TextField placeholder="Search me">
              <template #prefix>
                <Icon icon="mdi:magnify" />
              </template>
            </TextField>
          </template>
          This is the sheet content
        </Sheet>
      </div>
    `
  })
}

/**
 * Use the `color` prop to add an accent strip along the top of the sheet
 * header. Any CSS color value works.
 */
export const Colors: Story = {
  render: () => ({
    components: { Sheet, Button },
    setup() {
      const colors = ['#2196F3', '#4caf50', '#ff9800', '#e91e63', '#9c27b0']
      const open = ref('')
      return {
        colors,
        open
      }
    },
    template: `
      <div>
        <div>
          <Button
            v-for="color in colors"
            :key="color"
            @click="open = color"
          >{{ color }}</Button>
        </div>
        <Sheet
          v-for="color in colors"
          :key="color"
          :title="'Sheet (' + color + ')'"
          :color="color"
          :visible="open === color"
          @close="open = ''"
          padded
        >
          This sheet uses <code>color="{{ color }}"</code>.
        </Sheet>
      </div>
    `
  })
}

/**
`loading` covers the whole sheet with a spinner and, importantly, **blocks
closing** — neither the close button nor the backdrop will dismiss it while a
save is in flight. That is the point of the prop: it is not just a spinner, it
is a guard.

Try clicking the backdrop during the two seconds.
*/
export const Loading: Story = {
  render: () => ({
    components: { Sheet, Button },
    setup() {
      const loading = ref(false)
      const visible = ref(false)
      function doLoad() {
        loading.value = true
        setTimeout(() => (loading.value = false), 2000)
      }
      return {
        loading,
        visible,
        doLoad
      }
    },
    template: `
      <div>
        <div>
          <Button @click="visible = true">Open sheet</Button>
        </div>
        <div class="Wrapper">
          <Sheet
            title="Sheet"
            :visible="visible"
            :loading="loading"
            @close="visible = false"
            padded
          >
            <Button @click="doLoad">Load for 2 seconds</Button>
          </Sheet>
        </div>
      </div>
    `
  })
}

/**
The four lifecycle events bracket the two animations:

- `before-open` fires before the slide in starts, while the sheet is still off
  screen.
- `after-open` fires when it finishes — this is when the content area becomes
  scrollable, so it is the right moment to focus a field or measure something.
- `before-close` / `after-close` do the same for the way out.

`close` is different: it is the *request* to close, emitted when the user
clicks the backdrop or the close button, and it is the one you act on. It does
not fire while `loading`. `update` carries the same request as a boolean for
`v-model`-style binding.
*/
export const Events: Story = {
  render: () => ({
    components: { Sheet, Button, Stack },
    setup() {
      const visible = ref(false)
      const log = ref<string[]>([])
      const record = (name: string) => {
        log.value = [
          `${new Date().toLocaleTimeString()} — ${name}`,
          ...log.value
        ].slice(0, 12)
      }
      return { visible, log, record }
    },
    template: `
      <div>
        <Stack spacing="tight">
          <Button @click="visible = true">Open</Button>
          <Button @click="log = []">Clear log</Button>
        </Stack>
        <pre
          style="
            margin-top: 12px; padding: 12px; min-height: 180px;
            background: var(--octans-surface-sunken);
            border: 1px solid var(--octans-border);
            border-radius: var(--octans-radius-box);
          "
        >{{ log.length ? log.join('\\n') : 'Open the sheet to see events.' }}</pre>
        <Sheet
          title="Lifecycle events"
          :visible="visible"
          padded
          @before-open="record('before-open')"
          @after-open="record('after-open')"
          @before-close="record('before-close')"
          @after-close="record('after-close')"
          @update="v => record('update — ' + v)"
          @close="record('close'); visible = false"
        >
          Close this and watch the order the events arrive in. The gap between
          <code>before-close</code> and <code>after-close</code> is the exit
          animation.
        </Sheet>
      </div>
    `
  })
}

/**
`containerClass` styles the sheet panel itself — background, border, shadow —
and `contentClass` styles the wrapper immediately around your content, inside
the scroll area.

Both take whatever `:class` takes: a string, or an object of
`{ className: condition }`.

The header is deliberately not exposed this way. Use `color` for the accent
strip, or the `actions` slot for anything else that belongs up there.
*/
export const StyleHooks: Story = {
  render: () => ({
    components: { Sheet, Button, Card, CardSection },
    setup() {
      const visible = ref(false)
      const tinted = ref(true)

      // In an app these two classes would live in your stylesheet. They are
      // injected here because Vue's runtime template compiler drops `<style>`
      // tags from a client template, and because the sheet teleports out to
      // `#sheetManager` — a scoped style on the story would not reach it.
      const STYLE_ID = 'sheet-story-styles'
      onMounted(() => {
        if (document.getElementById(STYLE_ID)) return
        const el = document.createElement('style')
        el.id = STYLE_ID
        el.textContent = `
          .story-sheet-container { background: #1b1d29; }
          .story-sheet-content {
            color: #e7e9f5;
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          }
        `
        document.head.appendChild(el)
      })
      onBeforeUnmount(() => {
        document.getElementById(STYLE_ID)?.remove()
      })

      return { visible, tinted }
    },
    template: `
      <div>
        <Button @click="visible = true">Open styled sheet</Button>
        <Sheet
          title="Restyled"
          :visible="visible"
          :containerClass="{ 'story-sheet-container': tinted }"
          contentClass="story-sheet-content"
          padded
          @close="visible = false"
        >
          <template #actions>
            <Button @click="tinted = !tinted">
              {{ tinted ? 'Remove container class' : 'Apply container class' }}
            </Button>
          </template>
          <p>
            The panel background comes from <code>containerClass</code>, bound
            as an object so it can be toggled. The monospace text comes from
            <code>contentClass</code>, bound as a plain string.
          </p>
          <Card title="Cards keep their own surface">
            <CardSection>
              Only the sheet is restyled — anything inside it still uses the
              theme, which is usually what you want.
            </CardSection>
          </Card>
        </Sheet>
      </div>
    `
  })
}

/**
 * Use `animateInDuration` and `animateOutDuration` (milliseconds) to control
 * how long the open and close animations take. Set either to `0` to skip the
 * animation entirely.
 */
export const AnimationDuration: Story = {
  render: () => ({
    components: { Sheet, Button },
    setup() {
      const examples = [
        { label: 'Default (700 / 700)', inMs: 700, outMs: 700 },
        { label: 'Fast (150 / 150)', inMs: 150, outMs: 150 },
        { label: 'Slow (2000 / 2000)', inMs: 2000, outMs: 2000 },
        { label: 'Instant in, slow out (0 / 1500)', inMs: 0, outMs: 1500 },
        { label: 'No animation (0 / 0)', inMs: 0, outMs: 0 }
      ]
      const open = ref(-1)
      return {
        examples,
        open
      }
    },
    template: `
      <div>
        <div>
          <Button
            v-for="(example, i) in examples"
            :key="i"
            @click="open = i"
          >{{ example.label }}</Button>
        </div>
        <Sheet
          v-for="(example, i) in examples"
          :key="i"
          :title="example.label"
          :animateInDuration="example.inMs"
          :animateOutDuration="example.outMs"
          :visible="open === i"
          @close="open = -1"
          padded
        >
          Opens in {{ example.inMs }}ms, closes in {{ example.outMs }}ms.
        </Sheet>
      </div>
    `
  })
}

/**
 * Set your own open/close durations (in milliseconds) and try them out.
 * Use `0` for either value to skip that animation.
 */
export const AnimationDurationPlayground: Story = {
  render: () => ({
    components: { Sheet, Button, TextField },
    setup() {
      const inMs = ref(700)
      const outMs = ref(700)
      const visible = ref(false)
      return {
        inMs,
        outMs,
        visible
      }
    },
    template: `
      <div>
        <div style="display: flex; gap: 12px; align-items: flex-end; max-width: 420px;">
          <TextField
            v-model="inMs"
            label="animateInDuration"
            type="number"
            :min="0"
            :step="50"
            suffix="ms"
          />
          <TextField
            v-model="outMs"
            label="animateOutDuration"
            type="number"
            :min="0"
            :step="50"
            suffix="ms"
          />
          <Button @click="visible = true">Open sheet</Button>
        </div>
        <Sheet
          title="Animation playground"
          :animateInDuration="Number(inMs)"
          :animateOutDuration="Number(outMs)"
          :visible="visible"
          @close="visible = false"
          padded
        >
          Opened in {{ Number(inMs) }}ms — will close in {{ Number(outMs) }}ms.
          <br /><br />
          Change the values above, then reopen to feel the difference.
        </Sheet>
      </div>
    `
  })
}
