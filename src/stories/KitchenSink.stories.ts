import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { ActionList } from '@/components/ActionList'
import { Badge } from '@/components/Badge'
import { Banner } from '@/components/Banner'
import { Button, ButtonGroup } from '@/components/Button'
import { Calendar } from '@/components/Calendar'
import { CalendarHeatmap } from '@/components/CalendarHeatmap'
import { Caption } from '@/components/Caption'
import { Card, CardSection } from '@/components/Card'
import { Checkbox } from '@/components/Checkbox'
import { ChoiceList } from '@/components/ChoiceList'
import { ColorPicker } from '@/components/ColorPicker'
import { ColorSelector } from '@/components/ColorSelector'
import { DataTable } from '@/components/DataTable'
import { DatePicker } from '@/components/DatePicker'
import { Divider } from '@/components/Divider'
import { FileInput } from '@/components/FileInput'
import { Filters } from '@/components/Filters'
import { FooterHelp } from '@/components/FooterHelp'
import { Formatter } from '@/components/Formatter'
import { FormLayout, FormLayoutGroup } from '@/components/FormLayout'
import { GlobalNav } from '@/components/GlobalNav'
import { GradientPicker } from '@/components/GradientPicker'
import { Heading } from '@/components/Heading'
import { Icon } from '@/components/Icon'
import { InlineError } from '@/components/InlineError'
import { Labelled } from '@/components/Labelled'
import { Link } from '@/components/Link'
import { List, ListItem } from '@/components/List'
import { LoaderOverlay } from '@/components/LoaderOverlay'
import { LoadingBar, progress } from '@/components/LoadingBar'
import { alertModal } from '@/components/Modal'
import { NavField } from '@/components/NavField'
import { Navigation } from '@/components/Navigation'
import { OtpInput } from '@/components/OtpInput'
import { PageActions } from '@/components/PageActions'
import { Pagination } from '@/components/Pagination'
import { Popper } from '@/components/Popper'
import { ProgressBar } from '@/components/ProgressBar'
import { RadioButton } from '@/components/RadioButton'
import { RangeSlider } from '@/components/RangeSlider'
import { Rating } from '@/components/Rating'
import { ResourceList } from '@/components/ResourceList'
import { SaveBar } from '@/components/SaveBar'
import { ScrollPane } from '@/components/ScrollPane'
import { SegmentedControl } from '@/components/SegmentedControl'
import { Select } from '@/components/Select'
import { Sheet } from '@/components/Sheet'
import { SkeletonBodyText } from '@/components/SkeletonBodyText'
import { SkeletonCard } from '@/components/SkeletonCard'
import { SkeletonDisplayText } from '@/components/SkeletonDisplayText'
import { Spinner } from '@/components/Spinner'
import { Splitter } from '@/components/Splitter'
import { Stack } from '@/components/Stack'
import { Stat, StatGroup } from '@/components/StatGroup'
import { Tabs } from '@/components/Tabs'
import { Tag } from '@/components/Tag'
import { TextContainer } from '@/components/TextContainer'
import { TextField } from '@/components/TextField'
import { TextStyle } from '@/components/TextStyle'
import { Thumbnail } from '@/components/Thumbnail'
import { TimePicker } from '@/components/TimePicker'
import { TimezonePicker } from '@/components/TimezonePicker'
import { toast } from '@/components/ToastManager'
import { ToggleSwitch } from '@/components/ToggleSwitch'
import { Tooltip } from '@/components/Tooltip'
import { createGradient } from '@/utils/gradient'
import type { NavigationSectionType } from '@/components/Navigation'

/**
 * The whole library on one scrollable page — one small live example per
 * component, grouped the same way as the sidebar. For the full set of options
 * and states, open the component's own page.
 */
const meta = {
  title: 'Documentation/Kitchen Sink',
  parameters: {
    surface: 'app',
    // A gallery page has no args, so the addons panel is dead space.
    options: { showPanel: false }
  }
} satisfies Meta

export default meta
type Story = StoryObj

/** A named cell on the kitchen sink grid. */
const Tile = {
  props: { name: { type: String, required: true }, wide: Boolean },
  template: `
    <div
      class="KS_tile"
      :class="{ KS_wide: wide }"
    >
      <div class="KS_name">{{ name }}</div>
      <div class="KS_demo"><slot /></div>
    </div>
  `
}

const NAV_SECTIONS: NavigationSectionType[] = [
  {
    id: 'main',
    items: [
      { id: 'home', label: 'Home', icon: 'mdi:home' },
      { id: 'favourites', label: 'Favourites', icon: 'mdi:star' },
      { id: 'settings', label: 'Settings', icon: 'mdi:cog' }
    ]
  }
]

// A tiny inline image so the Thumbnail tile needs no network.
const THUMB_URL =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">' +
      '<rect width="120" height="120" fill="#31575b"/>' +
      '<circle cx="84" cy="38" r="18" fill="#e0b64f"/>' +
      '<path d="M0 120 L46 62 L78 96 L96 78 L120 100 V120 Z" fill="#7fa06a"/>' +
      '</svg>'
  )

export const AllComponents: Story = {
  render: () => ({
    components: {
      Tile,
      ActionList,
      Badge,
      Banner,
      Button,
      ButtonGroup,
      Calendar,
      CalendarHeatmap,
      Caption,
      Card,
      CardSection,
      Checkbox,
      ChoiceList,
      ColorPicker,
      ColorSelector,
      DataTable,
      DatePicker,
      Divider,
      FileInput,
      Filters,
      FooterHelp,
      Formatter,
      FormLayout,
      FormLayoutGroup,
      GlobalNav,
      GradientPicker,
      Heading,
      Icon,
      InlineError,
      Labelled,
      Link,
      List,
      ListItem,
      LoaderOverlay,
      LoadingBar,
      NavField,
      Navigation,
      OtpInput,
      PageActions,
      Pagination,
      Popper,
      ProgressBar,
      RadioButton,
      RangeSlider,
      Rating,
      ResourceList,
      SaveBar,
      ScrollPane,
      SegmentedControl,
      Select,
      Sheet,
      SkeletonBodyText,
      SkeletonCard,
      SkeletonDisplayText,
      Spinner,
      Splitter,
      Stack,
      Stat,
      StatGroup,
      Tabs,
      Tag,
      TextContainer,
      TextField,
      TextStyle,
      Thumbnail,
      TimePicker,
      TimezonePicker,
      ToggleSwitch,
      Tooltip
    },
    setup() {
      // Forms
      const checkbox = ref(true)
      const choice = ref('enabled')
      const choiceOptions = [
        { label: 'Enabled', value: 'enabled' },
        { label: 'Disabled', value: 'disabled' }
      ]
      const color = ref('#5f63e8')
      const swatch = ref('#e07a30')
      const gradient = ref(
        createGradient({
          stops: [
            { color: '#ffd400', position: 0 },
            { color: '#0038ff', position: 100 }
          ]
        })
      )
      const calendarDate = ref('2026-08-13 00:00:00')
      const date = ref('2026-08-13 00:00:00')
      const files = ref([])
      const filterQuery = ref('')
      const otp = ref('')
      const radio = ref('noMinimum')
      const range = ref(40)
      const rating = ref(3)
      const segment = ref('week')
      const segmentOptions = [
        { label: 'Day', value: 'day' },
        { label: 'Week', value: 'week' },
        { label: 'Month', value: 'month' }
      ]
      const select = ref(null)
      const selectOptions = [
        { label: 'One', value: 1 },
        { label: 'Two', value: 2 },
        { label: 'Three', value: 3 }
      ]
      const firstName = ref('')
      const lastName = ref('')
      const text = ref('')
      const time = ref('09:30:00')
      const timezone = ref(null)
      const toggle = ref(true)

      // Navigation
      const tab = ref('all')
      const tabs = [
        { value: 'all', label: 'All' },
        { value: 'draft', label: 'Draft' },
        { value: 'archived', label: 'Archived' }
      ]
      const offset = ref(0)

      // Layout
      const splitSize = ref('40%')

      // Data display
      const tableColumns = [
        { key: 'artist', label: 'Artist' },
        { key: 'works', label: 'Works', format: 'integer' },
        { key: 'valuation', label: 'Valuation', format: 'currency' }
      ]
      const tableRows = [
        { artist: 'Claude Monet', works: 2500, valuation: 110250000 },
        { artist: 'Berthe Morisot', works: 860, valuation: 10900000 },
        { artist: 'Edgar Degas', works: 1200, valuation: 41600000 }
      ]
      const resourceColumns = [
        { key: 'title', label: 'Title' },
        { key: 'artist', label: 'Artist' },
        { key: 'valuation', label: 'Valuation', format: 'currency' }
      ]
      const resourceItems = [
        {
          id: 1,
          title: 'Water Lilies',
          artist: 'Claude Monet',
          valuation: 250000
        },
        {
          id: 2,
          title: 'The Cradle',
          artist: 'Berthe Morisot',
          valuation: 92000
        }
      ]
      const heatmapSeries = [
        {
          key: 'visits',
          label: 'Visits',
          colors: ['#c6e48b', '#7bc96f', '#239a3b', '#196127']
        }
      ]
      const heatmapData = Array.from({ length: 30 }, (_, i) => ({
        date: `2026-06-${String(i + 1).padStart(2, '0')}`,
        values: { visits: (i * 7) % 10 }
      }))

      // Overlays
      const sheetOpen = ref(false)

      const noop = () => {}
      const showAlert = () =>
        alertModal({
          title: 'Hello from the sink',
          content: 'Modals also come as confirm, prompt and generic helpers.',
          primaryActionLabel: 'Okay'
        })
      const showToast = () =>
        toast({
          title: 'Exhibition published',
          content: 'Your changes are now live.',
          icon: 'mdi:check'
        })

      return {
        checkbox,
        choice,
        choiceOptions,
        color,
        swatch,
        gradient,
        calendarDate,
        date,
        files,
        filterQuery,
        otp,
        radio,
        range,
        rating,
        segment,
        segmentOptions,
        select,
        selectOptions,
        firstName,
        lastName,
        text,
        time,
        timezone,
        toggle,
        tab,
        tabs,
        offset,
        splitSize,
        tableColumns,
        tableRows,
        resourceColumns,
        resourceItems,
        heatmapSeries,
        heatmapData,
        sheetOpen,
        noop,
        showAlert,
        showToast,
        progress,
        navSections: NAV_SECTIONS,
        thumbUrl: THUMB_URL
      }
    },
    template: `
      <component is="style">
        .KS_page { max-width: 1200px; margin: 0 auto; }
        .KS_intro { color: var(--octans-text-subdued); margin: 0 0 8px; }
        .KS_section { margin: 32px 0 16px; }
        .KS_section:first-of-type { margin-top: 16px; }
        .KS_grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
          align-items: start;
        }
        .KS_tile {
          background: var(--octans-surface);
          border: 1px solid var(--octans-border);
          border-radius: var(--octans-radius-box);
          padding: 16px;
          min-width: 0;
        }
        .KS_wide { grid-column: 1 / -1; }
        .KS_name {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--octans-text-subdued);
          margin-bottom: 12px;
        }
        .KS_demo { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
        .KS_pane {
          display: grid;
          place-items: center;
          height: 100%;
          background: var(--octans-surface-sunken);
          color: var(--octans-text-subdued);
        }
        .KS_note { color: var(--octans-text-subdued); font-size: 13px; margin: 0; }
      </component>

      <div class="KS_page">
        <p class="KS_intro">
          The whole library at a glance — one small example per component,
          grouped like the sidebar. Open a component's own page for every
          option and state.
        </p>

        <Heading class="KS_section">Layout</Heading>
        <div class="KS_grid">
          <Tile name="Card">
            <Card title="The Card">
              <CardSection title="Section">Cards structure every page.</CardSection>
            </Card>
          </Tile>
          <Tile name="Stack">
            <Stack>
              <Badge>One</Badge>
              <Badge>Two</Badge>
              <Badge>Three</Badge>
            </Stack>
            <Stack vertical spacing="tight">
              <Badge status="info">Vertical</Badge>
              <Badge status="info">Stack</Badge>
            </Stack>
          </Tile>
          <Tile name="Divider">
            <div>Above the line</div>
            <Divider>or</Divider>
            <div>Below the line</div>
          </Tile>
          <Tile name="FormLayout" wide>
            <FormLayout>
              <FormLayoutGroup>
                <TextField label="First name" v-model="firstName" />
                <TextField label="Last name" v-model="lastName" />
              </FormLayoutGroup>
            </FormLayout>
          </Tile>
          <Tile name="ScrollPane">
            <ScrollPane style="max-height: 120px">
              <div v-for="n in 30" :key="n">Line {{ n }}</div>
            </ScrollPane>
          </Tile>
          <Tile name="Splitter">
            <div style="height: 140px">
              <Splitter v-model:size="splitSize">
                <template #start><div class="KS_pane">Start</div></template>
                <template #end><div class="KS_pane">End</div></template>
              </Splitter>
            </div>
          </Tile>
          <Tile name="PageActions">
            <PageActions
              :primaryAction="{ label: 'Save', onAction: noop }"
              :secondaryActions="[{ label: 'Delete work', type: 'destructive', onAction: noop }]"
            />
          </Tile>
          <Tile name="FooterHelp">
            <FooterHelp>Learn more about kitchen sinks.</FooterHelp>
          </Tile>
          <p class="KS_note KS_wide">
            Also in this group: Page, Layout and AppFrame (whole-page
            scaffolding that needs the full screen — see the AppFrame
            Playground story for every layout option live) and Sticky (scroll
            behaviour, nothing to see at rest).
          </p>
        </div>

        <Heading class="KS_section">Navigation</Heading>
        <div class="KS_grid">
          <Tile name="GlobalNav" wide>
            <GlobalNav title="Dashboard" :logo="false" theme="dark" />
          </Tile>
          <Tile name="Navigation">
            <div style="height: 240px; border: 1px solid var(--octans-border); border-radius: var(--octans-radius-box); overflow: hidden">
              <Navigation :sections="navSections" location="home" highlight />
            </div>
          </Tile>
          <Tile name="Tabs">
            <Tabs :tabs="tabs" v-model:selected="tab" />
            <div>Selected: {{ tab }}</div>
          </Tile>
          <Tile name="Link">
            <div>
              Links sit
              <Link url="https://example.com">inside text</Link>
              or stand
              <Link url="https://example.com" external>alone</Link>.
            </div>
          </Tile>
          <Tile name="Pagination">
            <Pagination
              :offset="offset"
              :limit="10"
              :total="250"
              :max-pages="5"
              @change="(value) => (offset = value)"
            />
          </Tile>
        </div>

        <Heading class="KS_section">Actions</Heading>
        <div class="KS_grid">
          <Tile name="Button">
            <Stack>
              <Button type="primary">Primary</Button>
              <Button>Secondary</Button>
              <Button type="outline">Outline</Button>
              <Button type="destructive">Destructive</Button>
              <Button type="plain">Plain</Button>
              <Button type="primary" icon="mdi:plus">With icon</Button>
            </Stack>
          </Tile>
          <Tile name="ButtonGroup">
            <ButtonGroup segmented>
              <Button>Bold</Button>
              <Button>Italic</Button>
              <Button>Underline</Button>
            </ButtonGroup>
          </Tile>
          <Tile name="ActionList">
            <ActionList
              :items="[
                { label: 'Duplicate', icon: 'mdi:plus', onAction: noop },
                { label: 'Open', icon: 'mdi:arrow-right', onAction: noop }
              ]"
            >
              <Button dropdown>Options</Button>
            </ActionList>
          </Tile>
        </div>

        <Heading class="KS_section">Forms</Heading>
        <div class="KS_grid">
          <Tile name="TextField">
            <TextField label="Store name" placeholder="Type something" v-model="text" />
          </Tile>
          <Tile name="Select">
            <Select label="Amount" placeholder="Choose a value" :options="selectOptions" v-model="select" />
          </Tile>
          <Tile name="Checkbox">
            <Checkbox label="Basic checkbox" help-text="With a little help text." v-model="checkbox" />
          </Tile>
          <Tile name="RadioButton">
            <RadioButton label="No minimum" true-value="noMinimum" v-model="radio" />
            <RadioButton label="Minimum purchase" true-value="minimum" v-model="radio" />
          </Tile>
          <Tile name="ChoiceList">
            <ChoiceList label="Minimum purchase" :options="choiceOptions" v-model="choice" />
          </Tile>
          <Tile name="ToggleSwitch">
            <Stack alignment="center">
              <ToggleSwitch v-model="toggle" />
              <span>{{ toggle ? 'On' : 'Off' }}</span>
            </Stack>
          </Tile>
          <Tile name="SegmentedControl">
            <SegmentedControl :options="segmentOptions" v-model="segment" />
          </Tile>
          <Tile name="RangeSlider">
            <RangeSlider label="Number of products" :min="1" :max="100" v-model="range" />
          </Tile>
          <Tile name="Rating">
            <Rating label="Rate it" v-model="rating" />
          </Tile>
          <Tile name="OtpInput">
            <OtpInput label="Verification code" v-model="otp" />
          </Tile>
          <Tile name="DatePicker">
            <DatePicker label="Start date" placeholder="Choose a date" v-model="date" />
          </Tile>
          <Tile name="TimePicker">
            <TimePicker label="Start time" v-model="time" />
          </Tile>
          <Tile name="TimezonePicker">
            <TimezonePicker label="Timezone" guess v-model="timezone" />
          </Tile>
          <Tile name="Calendar">
            <Calendar v-model="calendarDate" />
          </Tile>
          <Tile name="ColorPicker">
            <ColorPicker v-model="color" />
          </Tile>
          <Tile name="ColorSelector">
            <ColorSelector label="Accent colour" v-model="swatch" />
          </Tile>
          <Tile name="GradientPicker">
            <GradientPicker v-model="gradient" />
          </Tile>
          <Tile name="FileInput">
            <FileInput label="Product image" v-model="files" />
          </Tile>
          <Tile name="Filters">
            <Filters v-model:query="filterQuery" />
          </Tile>
          <Tile name="Labelled">
            <Labelled label="Anything at all" help-text="Wraps a label and help text around any control.">
              <input type="text" placeholder="A bare input" />
            </Labelled>
          </Tile>
          <Tile name="InlineError">
            <InlineError message="This is an error." />
          </Tile>
          <Tile name="NavField">
            <NavField title="Advanced settings" description="A field that navigates instead of editing." />
          </Tile>
        </div>

        <Heading class="KS_section">Data Display</Heading>
        <div class="KS_grid">
          <Tile name="Badge">
            <Stack>
              <Badge>Default</Badge>
              <Badge status="info">Info</Badge>
              <Badge status="success">Success</Badge>
              <Badge status="warning">Warning</Badge>
              <Badge status="error">Error</Badge>
              <Badge status="new">New</Badge>
            </Stack>
          </Tile>
          <Tile name="Tag">
            <Stack spacing="tight">
              <Tag>Plain</Tag>
              <Tag @remove="noop">Removable</Tag>
            </Stack>
          </Tile>
          <Tile name="Icon">
            <Stack alignment="center">
              <Icon icon="mdi:star" />
              <Icon icon="mdi:home" size="32px" />
              <Icon icon="mdi:bell" badge="success" />
              <Icon icon="mdi:cog" contained />
            </Stack>
          </Tile>
          <Tile name="Thumbnail">
            <Thumbnail title="Water Lilies" subtitle="Claude Monet" :url="thumbUrl" />
          </Tile>
          <Tile name="Formatter">
            <div>Published <Formatter type="dateAgo" value="2026-08-01 09:00:00" /></div>
            <div><Formatter type="dateTimeLong" value="2026-08-01 09:00:00" /></div>
          </Tile>
          <Tile name="CalendarHeatmap">
            <CalendarHeatmap
              label="Visits"
              :data="heatmapData"
              :series="heatmapSeries"
              start-date="2026-06-01"
              end-date="2026-06-30"
            />
          </Tile>
          <Tile name="StatGroup" wide>
            <StatGroup>
              <Stat label="Works" type="number">12384</Stat>
              <Stat label="Valuation" type="currency">1523000</Stat>
              <Stat label="Last sale" type="dateTimeLong" value="2026-08-01 09:00:00" />
            </StatGroup>
          </Tile>
          <Tile name="DataTable" wide>
            <DataTable :columns="tableColumns" :rows="tableRows" />
          </Tile>
          <Tile name="ResourceList" wide>
            <ResourceList :columns="resourceColumns" :items="resourceItems" />
          </Tile>
        </div>

        <Heading class="KS_section">Typography</Heading>
        <div class="KS_grid">
          <Tile name="Heading">
            <Heading>Hello World!</Heading>
          </Tile>
          <Tile name="Caption">
            <Caption>A quiet line of supporting text.</Caption>
          </Tile>
          <Tile name="TextStyle">
            <div>
              <TextStyle type="positive">positive</TextStyle>,
              <TextStyle type="negative">negative</TextStyle>,
              <TextStyle type="strong">strong</TextStyle>,
              <TextStyle type="subdued">subdued</TextStyle> and
              <TextStyle type="code">code</TextStyle>.
            </div>
          </Tile>
          <Tile name="List">
            <List type="number">
              <ListItem>First item</ListItem>
              <ListItem>Second item</ListItem>
              <ListItem>Third item</ListItem>
            </List>
          </Tile>
          <Tile name="TextContainer">
            <TextContainer>
              <p>Paragraphs inside a TextContainer get sensible spacing.</p>
              <p>Like this second one.</p>
            </TextContainer>
          </Tile>
        </div>

        <Heading class="KS_section">Feedback</Heading>
        <div class="KS_grid">
          <Tile name="Banner">
            <Banner title="Order archived" status="info">The order was archived on August 1st.</Banner>
          </Tile>
          <Tile name="ProgressBar">
            <ProgressBar :value="40" />
            <ProgressBar :value="70" size="small" status="success" />
          </Tile>
          <Tile name="Spinner">
            <Stack alignment="center">
              <Spinner size="small" />
              <Spinner />
              <Spinner size="large" />
            </Stack>
          </Tile>
          <Tile name="LoadingBar">
            <LoadingBar />
            <Stack>
              <Button size="small" @click="progress.start()">Start</Button>
              <Button size="small" @click="progress.done()">Done</Button>
            </Stack>
          </Tile>
          <Tile name="LoaderOverlay">
            <div style="position: relative; height: 190px; overflow: hidden">
              <LoaderOverlay visible message="Loading…" />
            </div>
          </Tile>
          <Tile name="SaveBar">
            <div style="position: relative; height: 56px; overflow: hidden">
              <SaveBar state="changed" />
            </div>
          </Tile>
          <Tile name="ToastManager">
            <div><Button @click="showToast">Show a toast</Button></div>
          </Tile>
          <Tile name="SkeletonDisplayText">
            <SkeletonDisplayText />
          </Tile>
          <Tile name="SkeletonBodyText">
            <SkeletonBodyText />
          </Tile>
          <Tile name="SkeletonCard">
            <SkeletonCard />
          </Tile>
        </div>

        <Heading class="KS_section">Overlays</Heading>
        <div class="KS_grid">
          <Tile name="Modal">
            <div><Button @click="showAlert">Open a modal</Button></div>
          </Tile>
          <Tile name="Sheet">
            <div><Button @click="sheetOpen = true">Open a sheet</Button></div>
            <Sheet title="A sheet" :visible="sheetOpen" @close="sheetOpen = false">
              <p>Slides in from the edge of the screen.</p>
            </Sheet>
          </Tile>
          <Tile name="Popper">
            <Popper auto-hide>
              <template #trigger><Button dropdown>Toggle popper</Button></template>
              <div style="background: var(--octans-surface-raised); border: 1px solid var(--octans-border); border-radius: var(--octans-radius-box); box-shadow: var(--octans-shadow-md); padding: 12px">
                Bring-your-own-content overlay.
              </div>
            </Popper>
          </Tile>
          <Tile name="Tooltip">
            <div>
              <Tooltip content="Useful context on hover" placement="right">
                <TextStyle type="link">Hover me</TextStyle>
              </Tooltip>
            </div>
          </Tile>
        </div>

        <Heading class="KS_section">Utilities</Heading>
        <p class="KS_note">
          The invisible helpers have nothing to show here: UiProvider,
          EventDelegator, MaybeMountingPortal, MaybeRouterLink,
          PreventAutoComplete and SaveBarController. Each has its own page
          under Components → Utilities.
        </p>
      </div>
    `
  })
}
