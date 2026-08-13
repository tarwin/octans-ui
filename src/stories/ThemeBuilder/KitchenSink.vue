<script lang="ts" setup>
/**
 * A dense sample of the library, used to preview a theme.
 *
 * Chosen to exercise the tokens that are easy to get wrong: raised surfaces,
 * subdued text, borders, focus rings, status colours, selection, disabled
 * states and skeletons. If a theme looks right here it will usually hold up
 * elsewhere.
 *
 * Laid out as CSS multi-columns rather than a grid: cards stack down each
 * column independently, so one tall card (the calendar, the inputs) lengthens
 * its own column instead of stretching a whole grid row and pushing
 * everything below it down.
 */
import { ref } from 'vue'
import { Badge } from '@/components/Badge'
import { Banner } from '@/components/Banner'
import { Button } from '@/components/Button'
import { Calendar } from '@/components/Calendar'
import { Card, CardSection } from '@/components/Card'
import { Checkbox } from '@/components/Checkbox'
import { DataTable } from '@/components/DataTable'
import { Heading } from '@/components/Heading'
import { Icon } from '@/components/Icon'
import { InlineError } from '@/components/InlineError'
import { Link } from '@/components/Link'
import { Pagination } from '@/components/Pagination'
import { ProgressBar } from '@/components/ProgressBar'
import { RadioButton } from '@/components/RadioButton'
import { Rating } from '@/components/Rating'
import { Select } from '@/components/Select'
import { SkeletonBodyText } from '@/components/SkeletonBodyText'
import { Spinner } from '@/components/Spinner'
import { Stack } from '@/components/Stack'
import { Tabs } from '@/components/Tabs'
import { Tag } from '@/components/Tag'
import { TextField } from '@/components/TextField'
import { TextStyle } from '@/components/TextStyle'
import { ToggleSwitch } from '@/components/ToggleSwitch'

const text = ref('Editable value')
const choice = ref('a')
const checked = ref(true)
const toggled = ref(true)
const selected = ref('one')
const rating = ref(3.5)
const tab = ref('all')
const date = ref('2026-08-15 00:00:00')
const pageOffset = ref(25)

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' }
]

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'plan', label: 'Plan' },
  { key: 'spend', label: 'Spend', format: 'currency', sortable: true }
]
const rows = [
  { id: 1, name: 'Ada Ashby', plan: 'Pro', spend: 128.5 },
  { id: 2, name: 'Bo Cardoso', plan: 'Starter', spend: 42 },
  { id: 3, name: 'Cleo Rosendahl', plan: 'Enterprise', spend: 980.25 }
]
</script>

<template>
  <div :class="$style.Sink">
    <div :class="$style.Columns">
      <Card
        :class="$style.Item"
        title="Buttons"
      >
        <!--
          One row per idea: hierarchy, quiet forms, the destructive modifier,
          the colour axis, then sizes and fixings. The masonry layout means a
          tall card only lengthens its own column, so this one can afford to
          be thorough — buttons touch more tokens than anything else.
        -->
        <CardSection>
          <Stack spacing="tight">
            <Button type="primary">Primary</Button>
            <Button>Default</Button>
            <Button type="secondary">Secondary</Button>
            <Button type="outline">Outline</Button>
          </Stack>
          <div style="height: 8px" />
          <Stack
            spacing="tight"
            alignment="center"
          >
            <Button type="plain">Plain</Button>
            <Button type="link">Link</Button>
            <Button
              type="primary"
              invert
            >
              Invert
            </Button>
            <Button
              type="primary"
              disabled
            >
              Disabled
            </Button>
          </Stack>
          <div style="height: 8px" />
          <Stack
            spacing="tight"
            alignment="center"
          >
            <Button type="destructive">Destructive</Button>
            <Button
              type="outline"
              destructive
            >
              Outline
            </Button>
            <Button
              type="secondary"
              destructive
            >
              Tonal
            </Button>
            <Button
              type="link"
              destructive
            >
              Link
            </Button>
          </Stack>
          <div style="height: 8px" />
          <Stack spacing="tight">
            <Button
              type="primary"
              color="secondary"
            >
              Solid secondary
            </Button>
            <Button
              type="primary"
              color="tertiary"
            >
              Solid tertiary
            </Button>
            <Button
              type="secondary"
              color="tertiary"
            >
              Tonal tertiary
            </Button>
          </Stack>
          <div style="height: 8px" />
          <Stack
            spacing="tight"
            alignment="center"
          >
            <Button size="small">Small</Button>
            <Button size="large">Large</Button>
            <Button
              icon="mdi:magnify"
              tooltip="Buttons can carry tooltips"
            />
            <Button
              icon="mdi:bell"
              badge="3"
              badge-status="warning"
            />
            <Button dropdown>Menu</Button>
          </Stack>
        </CardSection>
      </Card>

      <Card
        :class="$style.Item"
        title="Text inputs"
      >
        <CardSection>
          <TextField
            v-model="text"
            label="Text field"
            help-text="Help text uses the subdued token."
          />
          <div style="height: 10px" />
          <TextField
            model-value="Invalid"
            label="With an error"
            error="Something is wrong"
          />
          <div style="height: 10px" />
          <TextField
            model-value="Cannot touch this"
            label="Disabled"
            disabled
          />
          <div style="height: 10px" />
          <Select
            v-model="selected"
            label="Select"
            :options="[
              { label: 'Option one', value: 'one' },
              { label: 'Option two', value: 'two' }
            ]"
          />
        </CardSection>
      </Card>

      <Card
        :class="$style.Item"
        title="Choices"
      >
        <CardSection>
          <Checkbox
            v-model="checked"
            label="Checkbox"
          />
          <RadioButton
            v-model="choice"
            true-value="a"
            label="Radio A"
          />
          <RadioButton
            v-model="choice"
            true-value="b"
            label="Radio B"
          />
          <div style="height: 10px" />
          <Stack
            spacing="tight"
            alignment="center"
          >
            <ToggleSwitch v-model="toggled" />
            <Rating v-model="rating" />
          </Stack>
          <InlineError message="Inline error message" />
        </CardSection>
      </Card>

      <Card
        :class="$style.Item"
        title="Status"
      >
        <CardSection>
          <Stack
            vertical
            spacing="tight"
          >
            <Banner status="info">Informational banner</Banner>
            <Banner status="success">Success banner</Banner>
            <Banner status="warning">Warning banner</Banner>
            <Banner status="error">Error banner</Banner>
          </Stack>
        </CardSection>
      </Card>

      <Card
        :class="$style.Item"
        title="Indicators"
      >
        <CardSection>
          <Stack spacing="tight">
            <Badge>Default</Badge>
            <Badge status="info">Info</Badge>
            <Badge status="success">Success</Badge>
            <Badge status="warning">Warning</Badge>
            <Badge status="error">Error</Badge>
          </Stack>
          <div style="height: 12px" />
          <Stack spacing="tight">
            <Tag>Tag one</Tag>
            <Tag>Tag two</Tag>
          </Stack>
          <div style="height: 12px" />
          <ProgressBar :value="62" />
          <div style="height: 8px" />
          <ProgressBar
            :value="85"
            status="warning"
          />
          <div style="height: 12px" />
          <Stack spacing="tight">
            <Spinner size="small" />
            <Icon
              icon="mdi:information"
              size="20px"
            />
            <Icon
              icon="mdi:alert"
              size="20px"
            />
            <Icon
              icon="mdi:check-circle"
              size="20px"
            />
          </Stack>
        </CardSection>
      </Card>

      <Card :class="$style.Item">
        <Tabs
          :tabs="tabs"
          v-model:selected="tab"
        />
        <CardSection>
          Tabs use the primary role for the active tab. Selected:
          <TextStyle type="subdued">{{ tab }}</TextStyle>
        </CardSection>
      </Card>

      <Card
        :class="$style.Item"
        title="Typography"
      >
        <CardSection>
          <Heading>Heading</Heading>
          <p>
            Body text with a <Link url="https://example.com">link</Link> and
            <TextStyle type="subdued">subdued text</TextStyle>,
            <TextStyle type="positive">positive</TextStyle> and
            <TextStyle type="negative">negative</TextStyle> variations.
          </p>
          <div style="height: 10px" />
          <SkeletonBodyText :lines="3" />
        </CardSection>
      </Card>

      <Card
        :class="$style.Item"
        title="Calendar"
      >
        <CardSection>
          <!-- Exercises surface-selected, surface-hover and the link buttons. -->
          <Calendar v-model="date" />
        </CardSection>
      </Card>
    </div>

    <Card title="Data table">
      <DataTable
        :columns="columns"
        :rows="rows"
      />
      <CardSection>
        <Pagination
          :offset="pageOffset"
          :limit="25"
          :total="250"
          :max-pages="5"
          @change="(o: number) => (pageOffset = o)"
        />
      </CardSection>
    </Card>
  </div>
</template>

<style lang="scss" module>
.Sink {
  // The preview stands in for an application shell, so it paints the app
  // background token rather than inheriting Storybook's.
  padding: 16px;
  background: var(--octans-surface-app);
  border-radius: var(--octans-radius-box);
  color: var(--octans-text);
  font-family: var(--octans-font);
}

// Masonry-ish: each card breaks to the next column whole, and column count
// follows the available width. No row heights, so nothing gets pushed down by
// a tall neighbour.
.Columns {
  columns: 320px;
  column-gap: 12px;
  margin-bottom: 12px;
}

.Item {
  break-inside: avoid;
  margin-bottom: 12px;
}
</style>
