import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Badge from './Badge.vue'
import Stack from '../Stack/Stack.vue'
import Button from '../Button/Button.vue'
import type { BadgeSizeType, BadgeStatusType } from '../types'

const meta = {
  title: 'Components/Data Display/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Status: Story = {
  render: () => ({
    components: { Badge, Stack },
    template: `
      <Stack>
        <Badge>Default</Badge>
        <Badge status="info">Info</Badge>
        <Badge status="success">Success</Badge>
        <Badge status="warning">Warning</Badge>
        <Badge status="error">Error</Badge>
        <Badge status="new">New</Badge>
      </Stack>
    `
  })
}

export const Progress: Story = {
  render: () => ({
    components: { Badge, Stack },
    template: `
      <Stack>
        <Badge progress="incomplete">Incomplete</Badge>
        <Badge progress="partiallyComplete">Partially complete</Badge>
        <Badge progress="complete">Complete</Badge>
      </Stack>
    `
  })
}

export const Size: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <Stack>
        <Badge size="small">Small</Badge>
        <Badge size="medium">Medium</Badge>
      </Stack>
    `
  })
}

export const Icons: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <Stack>
        <Badge icon="mdi:clock-outline">Iconify</Badge>
        <Badge status="info" icon="mdi:information">Info</Badge>
        <Badge status="success" icon="mdi:check">Live</Badge>
        <Badge status="warning" icon="mdi:alert">Run out</Badge>
        <Badge status="error" icon="mdi:pause">Paused</Badge>
        <Badge status="new" icon="mdi:star">New</Badge>
        <Badge size="small" status="success" icon="mdi:check">Small</Badge>
        <Badge status="error" icon="mdi:lock" />
      </Stack>
    `
  })
}

// Every prop must survive a patch, not just a mount. The regression this guards
// against: `setup()` destructured its props, so status/progress/size/radius were
// captured once and the badge kept its original styling forever. Cycling starts
// on `undefined` — a row in a status the map doesn't colour, e.g. draft — which
// is the worst case, since the badge mounts with no status class at all and has
// to *gain* one. The element is patched rather than remounted throughout, so a
// stale capture shows up as text that changes while the colour doesn't.
export const Reactivity: Story = {
  render: () => ({
    components: { Badge, Button },
    setup() {
      const statuses: (BadgeStatusType | undefined)[] = [
        undefined,
        'warning',
        'success',
        'attention',
        'info',
        'new'
      ]
      const index = ref(0)
      const status = ref<BadgeStatusType | undefined>(statuses[0])
      const size = ref<BadgeSizeType>('medium')
      const radius = ref('20px')

      function next() {
        index.value = (index.value + 1) % statuses.length
        status.value = statuses[index.value]
        // vary the other captured props at the same time
        size.value = index.value % 2 ? 'small' : 'medium'
        radius.value = index.value % 2 ? '4px' : '20px'
      }

      return { status, size, radius, next }
    },
    template: `
      <Stack vertical>
        <Stack>
          <Button @click="next">Change status</Button>
          <Badge :status="status" :size="size" :radius="radius">
            {{ status || 'draft' }}
          </Badge>
        </Stack>
        <Stack>
          <code>
            status={{ status || 'undefined' }} size={{ size }} radius={{ radius }}
          </code>
        </Stack>
      </Stack>
    `
  })
}

// tooltipPosition takes a PopperPlacementType — "top", "top-start", "top-end"
// and so on. Anything else silently falls back to the default placement.
export const Tooltip: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <Stack>
        <Badge
          status="warning"
          tooltip="This work has reached its cumulative light exposure limit and has been rotated into storage."
        >Run Out</Badge>
        <Badge
          status="warning"
          tooltip="This work has reached its cumulative light exposure limit and has been rotated into storage."
          tooltipPosition="top"
        >Top</Badge>
        <Badge
          status="info"
          icon="mdi:information"
          tooltip="Tooltips work with icons too."
          tooltipPosition="right"
        >With an icon</Badge>
      </Stack>
    `
  })
}
