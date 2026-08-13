import { AppFrame } from '@/components/AppFrame'
import { Card, CardSection } from '@/components/Card'
import { ColorSelector } from '@/components/ColorSelector'
import { GlobalNav } from '@/components/GlobalNav'
import { Navigation } from '@/components/Navigation'
import { Page } from '@/components/Page'
import { SegmentedControl } from '@/components/SegmentedControl'
import { ToggleSwitch } from '@/components/ToggleSwitch'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import KitchenSink from '../../stories/ThemeBuilder/KitchenSink.vue'
// Stands in for a consumer's brand mark — this one belongs to the docs.
import logo from '../../stories/assets/octans-logo.svg'

const meta = {
  title: 'Components/Layout/AppFrame',
  component: AppFrame,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    surface: 'none',
    docs: {
      description: {
        component: [
          'The outermost shell of an application — entirely optional (every',
          'piece of chrome works without it), provided for quick app',
          'development with sane defaults. It lays out a top bar, an optional',
          'sidebar, the scrolling main content and an optional footer, hosts a',
          '`LoaderOverlay` over the content area (driven by `$ui.loader` and',
          'its own `loading` prop), and wraps everything in a `UiProvider` so',
          'tooltips work without extra setup.',
          '',
          '### Layouts',
          '',
          '- `topbar` (default) — the bar runs the full width; the sidebar',
          '  sits under it on the left.',
          '- `sidebar` — the sidebar owns the full height of the window; the',
          '  bar starts to its right.',
          '- `sidebarOnly` — `sidebar`, minus the bar. The save bar and',
          '  loading bar move to the top of the content area.',
          '',
          'The frame shares its layout through provide/inject: `GlobalNav`',
          'positions itself from it, and `Navigation`’s minimize chevron',
          '(`allowMinimize`) collapses the frame’s column — nothing needs',
          'wiring between them.',
          '',
          'Below 768px the sidebar becomes an overlay drawer: a hamburger',
          'appears in the `GlobalNav` (or floats over the content in',
          '`sidebarOnly`), and backdrop-click or Escape closes it. Resize this',
          'window to see it.',
          '',
          '### Slots',
          '',
          '- `topbar` — usually a `GlobalNav`; ignored by `sidebarOnly`',
          '- `sidebar` — usually a `Navigation`; omit it for a full-width layout',
          '- default — page content',
          '- `footer` — pinned below the scrolling content'
        ].join('\n')
      }
    }
  },
  argTypes: {
    loading: { control: 'boolean' },
    sidebarMin: { control: 'boolean' },
    layout: { control: 'select', options: ['topbar', 'sidebar', 'sidebarOnly'] }
  }
} satisfies Meta<typeof AppFrame>

export default meta
type Story = StoryObj<typeof meta>

const NAV_SECTIONS = [
  {
    items: [
      { label: 'Dashboard', icon: 'mdi:chart-line', url: '/' },
      { label: 'Exhibitions', icon: 'mdi:bullhorn', url: '/exhibitions' },
      { label: 'Artists', icon: 'mdi:account-group', url: '/artists' },
      {
        label: 'Catalogue',
        icon: 'mdi:file-document-outline',
        url: '/catalogue'
      }
    ]
  },
  {
    title: 'Settings',
    items: [
      { label: 'Account', icon: 'mdi:cog', url: '/account' },
      { label: 'Billing', icon: 'mdi:credit-card-outline', url: '/billing' }
    ]
  }
]

const PAGE_CONTENT = `
  <Page title="Dashboard" :breadcrumbs="[{label: 'Home', url: '/'}]">
    <Card title="Overview">
      <CardSection>
        Content goes here. The main area scrolls independently of the
        sidebar and the top bar.
      </CardSection>
    </Card>
  </Page>
`

/**
Every frame and navigation option, live. Switch the layout and watch the same
chrome rearrange; flip the collapse behaviour between the icon rail and
hiding entirely (with its hover-peek toggle up in the bar); move the
minimize button; toggle the active-item highlight, the brand accent stripe
(each with a colour of your choosing), the logo, and the pinned footer.
*/
export const Playground: Story = {
  render: () => ({
    components: {
      AppFrame,
      GlobalNav,
      Navigation,
      Page,
      Card,
      CardSection,
      SegmentedControl,
      ToggleSwitch,
      ColorSelector
    },
    setup() {
      const layout = ref('topbar')
      const sidebarCollapse = ref('rail')
      const minimizePosition = ref('edge')
      const navTheme = ref('light')
      const highlight = ref(true)
      const highlightColor = ref(null)
      const accentStripe = ref(false)
      const accentStripeColor = ref(null)
      const showLogo = ref(false)
      const showFooter = ref(false)

      // `highlight`/`accentStripe` take `true` (primary) or a colour string —
      // an empty picker means "use the primary".
      const navHighlight = computed(() =>
        highlight.value ? highlightColor.value || true : false
      )
      const navStripe = computed(() =>
        accentStripe.value ? accentStripeColor.value || true : false
      )

      const layouts = [
        { value: 'topbar', label: 'topbar' },
        { value: 'sidebar', label: 'sidebar' },
        { value: 'sidebarOnly', label: 'sidebarOnly' }
      ]
      const collapses = [
        { value: 'rail', label: 'rail' },
        { value: 'hide', label: 'hide' }
      ]
      const positions = [
        { value: 'edge', label: 'edge' },
        { value: 'top', label: 'top' },
        { value: 'bottom', label: 'bottom' }
      ]
      const themes = [
        { value: 'light', label: 'light' },
        { value: 'dark', label: 'dark' }
      ]

      return {
        layout,
        sidebarCollapse,
        minimizePosition,
        navTheme,
        highlight,
        highlightColor,
        accentStripe,
        accentStripeColor,
        showLogo,
        showFooter,
        navHighlight,
        navStripe,
        layouts,
        collapses,
        positions,
        themes,
        sections: NAV_SECTIONS,
        logo
      }
    },
    template: `
      <AppFrame
        :layout="layout"
        :sidebarCollapse="sidebarCollapse"
        style="height:100vh"
      >
        <template #topbar>
          <GlobalNav title="Dashboard" :logo="false" />
        </template>
        <template #sidebar>
          <Navigation
            :sections="sections"
            :theme="navTheme"
            :logo="showLogo"
            allowMinimize
            :minimizePosition="minimizePosition"
            :highlight="navHighlight"
            :accentStripe="navStripe"
          >
            <template #logo>
              <div style="display:flex;align-items:center;gap:8px;font-weight:700">
                <img :src="logo" alt="" style="width:32px;height:32px" />
                Octans
              </div>
            </template>
            <template #logoMin>
              <img :src="logo" alt="Octans" style="width:32px;height:32px" />
            </template>
            <template
              v-if="showFooter"
              #footer="{ min }"
            >
              <div style="padding:0 12px">
                <div style="display:flex;align-items:center;gap:10px;padding:8px">
                  <span style="
                    flex:0 0 32px;height:32px;border-radius:50%;
                    background:var(--octans-primary);color:var(--octans-text-on-primary);
                    display:inline-flex;align-items:center;justify-content:center;
                    font-size:13px;font-weight:600;
                  ">TS</span>
                  <span v-if="!min" style="min-width:0">
                    <span style="display:block;font-size:14px;font-weight:600">Octans</span>
                    <span style="display:block;font-size:12px;color:var(--octans-text-subdued)">
                      Tarwin Stroh-Spijer
                    </span>
                  </span>
                </div>
              </div>
            </template>
          </Navigation>
        </template>
        <Page title="Layout playground">
          <Card title="Frame">
            <CardSection>
              <div style="display:flex;flex-direction:column;gap:14px;max-width:560px">
                <div>
                  <div style="font-weight:600;margin-bottom:6px">layout</div>
                  <SegmentedControl v-model="layout" :options="layouts" />
                  <p style="margin-top:8px;color:var(--octans-text-subdued)">
                    <template v-if="layout === 'topbar'">
                      Bar over everything, nav under it.
                    </template>
                    <template v-else-if="layout === 'sidebar'">
                      Nav owns the full height, bar to its right.
                    </template>
                    <template v-else>
                      No bar; the save bar and loading bar move to the top of
                      this content area.
                    </template>
                  </p>
                </div>
                <div>
                  <div style="font-weight:600;margin-bottom:6px">sidebarCollapse</div>
                  <SegmentedControl v-model="sidebarCollapse" :options="collapses" />
                  <p style="margin-top:8px;color:var(--octans-text-subdued)">
                    <template v-if="sidebarCollapse === 'rail'">
                      Collapsing narrows the nav to an icon rail, from its own
                      chevron.
                    </template>
                    <template v-else>
                      Collapsing hides the nav entirely; the toggle moves into
                      the top bar, and hovering it peeks the nav.
                    </template>
                  </p>
                </div>
              </div>
            </CardSection>
          </Card>
          <Card title="Navigation">
            <CardSection>
              <div style="display:flex;flex-direction:column;gap:14px;max-width:560px">
                <div>
                  <div style="font-weight:600;margin-bottom:6px">minimizePosition</div>
                  <SegmentedControl v-model="minimizePosition" :options="positions" />
                </div>
                <div>
                  <div style="font-weight:600;margin-bottom:6px">theme</div>
                  <SegmentedControl v-model="navTheme" :options="themes" />
                </div>
                <div style="display:flex;align-items:center;gap:10px">
                  <ToggleSwitch v-model="highlight" />
                  <span style="flex:1">highlight — accent the active item</span>
                  <ColorSelector
                    v-if="highlight"
                    v-model="highlightColor"
                    trigger="swatch"
                    :swatchSize="24"
                    clearable
                    :label="false"
                  />
                </div>
                <div style="display:flex;align-items:center;gap:10px">
                  <ToggleSwitch v-model="accentStripe" />
                  <span style="flex:1">accentStripe — brand stripe down the edge</span>
                  <ColorSelector
                    v-if="accentStripe"
                    v-model="accentStripeColor"
                    trigger="swatch"
                    :swatchSize="24"
                    clearable
                    :label="false"
                  />
                </div>
                <label style="display:flex;align-items:center;gap:10px">
                  <ToggleSwitch v-model="showLogo" />
                  <span>logo — brand mark up top (square on the rail)</span>
                </label>
                <label style="display:flex;align-items:center;gap:10px">
                  <ToggleSwitch v-model="showFooter" />
                  <span>footer — pinned account row</span>
                </label>
                <p style="color:var(--octans-text-subdued)">
                  An empty colour swatch means the primary colour.
                </p>
              </div>
            </CardSection>
          </Card>
        </Page>
      </AppFrame>
    `
  })
}

/**
The common arrangement: a `GlobalNav` in the `topbar` slot and a `Navigation`
in the `sidebar` slot. With the `topbar` layout the bar spans the full width
and the nav sits under it.
*/
export const Default: Story = {
  args: { layout: 'topbar' },
  render: (args) => ({
    components: { AppFrame, GlobalNav, Navigation, Page, Card, CardSection },
    setup: () => ({ args, sections: NAV_SECTIONS }),
    template: `
      <AppFrame v-bind="args" style="height:100vh">
        <template #topbar>
          <GlobalNav title="Dashboard" :logo="false" />
        </template>
        <template #sidebar>
          <Navigation :sections="sections" :logo="false" highlight />
        </template>
        ${PAGE_CONTENT}
      </AppFrame>
    `
  })
}

/**
With `layout: 'sidebar'` the sidebar runs the full height of the window and
the top bar starts to its right. The `GlobalNav` reads
the layout from the frame's context; it needs no prop of its own.
*/
export const SidebarLayout: Story = {
  args: { layout: 'sidebar' },
  render: (args) => ({
    components: { AppFrame, GlobalNav, Navigation, Page, Card, CardSection },
    setup: () => ({ args, sections: NAV_SECTIONS }),
    template: `
      <AppFrame v-bind="args" style="height:100vh">
        <template #topbar>
          <GlobalNav title="Dashboard" :logo="false" />
        </template>
        <template #sidebar>
          <Navigation :sections="sections" theme="dark" :logo="false" allowMinimize highlight />
        </template>
        ${PAGE_CONTENT}
      </AppFrame>
    `
  })
}

/**
`layout: 'sidebarOnly'` is the sidebar layout with no top bar at all — the
whole chrome is the nav. The save bar and the loading bar (usually hosted by
`GlobalNav`) move to the top of the content area; on narrow viewports a
floating hamburger opens the nav as a drawer.
*/
export const SidebarOnly: Story = {
  args: { layout: 'sidebarOnly' },
  render: (args) => ({
    components: { AppFrame, Navigation, Page, Card, CardSection },
    setup: () => ({ args, sections: NAV_SECTIONS }),
    template: `
      <AppFrame v-bind="args" style="height:100vh">
        <template #sidebar>
          <Navigation :sections="sections" :logo="false" allowMinimize highlight />
        </template>
        ${PAGE_CONTENT}
      </AppFrame>
    `
  })
}

/**
With `sidebarCollapse: 'hide'`, collapsing removes the sidebar entirely and
the toggle moves into the `GlobalNav` — where
`Navigation`'s own chevron stands down. While hidden, **hovering the toggle
peeks the sidebar** as an overlay without committing to reopening it.
*/
export const HidingSidebar: Story = {
  args: { layout: 'sidebar', sidebarCollapse: 'hide' },
  render: (args) => ({
    components: { AppFrame, GlobalNav, Navigation, Page, Card, CardSection },
    setup: () => ({ args, sections: NAV_SECTIONS }),
    template: `
      <AppFrame v-bind="args" style="height:100vh">
        <template #topbar>
          <GlobalNav title="Dashboard" :logo="false" />
        </template>
        <template #sidebar>
          <Navigation :sections="sections" :logo="false" highlight />
        </template>
        <Page title="Hiding sidebar">
          <Card>
            <CardSection>
              Use the toggle at the left of the top bar: click hides the
              sidebar completely; once hidden, hovering the same toggle peeks
              it, and clicking brings it back.
            </CardSection>
          </Card>
        </Page>
      </AppFrame>
    `
  })
}

/**
Omit the `sidebar` slot entirely and the content takes the full width — the
grid column collapses rather than leaving a gap.
*/
export const NoSidebar: Story = {
  render: (args) => ({
    components: { AppFrame, GlobalNav, Page, Card, CardSection },
    setup: () => ({ args }),
    template: `
      <AppFrame v-bind="args" style="height:100vh">
        <template #topbar>
          <GlobalNav title="Dashboard" :logo="false" />
        </template>
        ${PAGE_CONTENT}
      </AppFrame>
    `
  })
}

/**
`allowMinimize` on the `Navigation` gives it a collapse chevron, and the
frame's column follows through the layout context — no wiring between the two.
The `sidebarMin` prop on the frame does the same from outside (a saved user
preference, say).
*/
export const CollapsibleSidebar: Story = {
  render: () => ({
    components: {
      AppFrame,
      GlobalNav,
      Navigation,
      Page,
      Card,
      CardSection
    },
    setup: () => ({ sections: NAV_SECTIONS }),
    template: `
      <AppFrame style="height:100vh">
        <template #topbar>
          <GlobalNav title="Dashboard" :logo="false" />
        </template>
        <template #sidebar>
          <Navigation :sections="sections" :logo="false" allowMinimize highlight />
        </template>
        <Page title="Dashboard">
          <Card>
            <CardSection>
              Use the chevron at the top of the sidebar to collapse it to an
              icon rail.
            </CardSection>
          </Card>
        </Page>
      </AppFrame>
    `
  })
}

/**
`loading` shows a blocking overlay over the content area. The same overlay is
driven by `$ui.loader.show()`, which can also carry a message.
*/
export const Loading: Story = {
  args: { loading: true },
  render: (args) => ({
    components: { AppFrame, GlobalNav, Page, Card, CardSection },
    setup: () => ({ args }),
    template: `
      <AppFrame v-bind="args" style="height:100vh">
        <template #topbar>
          <GlobalNav title="Dashboard" :logo="false" />
        </template>
        ${PAGE_CONTENT}
      </AppFrame>
    `
  })
}

/**
The whole shell with a real page in it: nav, top bar, and a `Page` full of
components — the same kitchen sink the Theme Builder previews.

The page header collapses its secondary actions by querying the PAGE's own
width (`@container`), not the viewport's — narrow the window and note the
actions fold into "…" while the sidebar still has its 240px.
*/
export const KitchenSinkPage: Story = {
  render: (args) => ({
    components: {
      AppFrame,
      GlobalNav,
      Navigation,
      Page,
      KitchenSink
    },
    setup: () => ({
      args,
      sections: NAV_SECTIONS,
      pageActions: [
        { label: 'Export', icon: 'mdi:download' },
        { label: 'Share', icon: 'mdi:share-variant' }
      ],
      primaryAction: { label: 'New artwork', type: 'primary' }
    }),
    template: `
      <AppFrame v-bind="args" style="height:100vh">
        <template #topbar>
          <GlobalNav title="Dashboard" :logo="false" />
        </template>
        <template #sidebar>
          <Navigation :sections="sections" :logo="false" highlight />
        </template>
        <Page
          title="Everything at once"
          subtitle="Every component family on one page"
          :breadcrumbs="[{label: 'Home', url: '/'}]"
          :secondaryActions="pageActions"
          :primaryAction="primaryAction"
        >
          <KitchenSink />
        </Page>
      </AppFrame>
    `
  })
}

/**
The `footer` slot is pinned below the scrolling content.
*/
export const WithFooter: Story = {
  render: (args) => ({
    components: { AppFrame, GlobalNav, Page, Card, CardSection },
    setup: () => ({ args }),
    template: `
      <AppFrame v-bind="args" style="height:100vh">
        <template #topbar>
          <GlobalNav title="Dashboard" :logo="false" />
        </template>
        ${PAGE_CONTENT}
        <template #footer>
          <div style="padding:16px;text-align:center;opacity:.7">
            Footer content
          </div>
        </template>
      </AppFrame>
    `
  })
}
