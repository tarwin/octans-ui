import { Button, ButtonGroup } from '@/components/Button'
import { FormLayout } from '@/components/FormLayout'
import { Formatter } from '@/components/Formatter'
import {
  dayjs,
  getDateFormat,
  getTimezone,
  setDateFormat,
  setTimezone
} from '@/utils'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { Dayjs } from 'dayjs'
import { onUnmounted, ref } from 'vue'
import DatePicker from './DatePicker.vue'

const meta = {
  title: 'Components/Forms/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

/**
  The `type` prop defaults to "date".
  Clicking the month title allows moving "up" to the next picker level.
 */
export const Default: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const date = ref('2019-09-29 00:00:00')
      return { date }
    },
    template: `
      <div>
        <DatePicker
          label="Start Date"
          placeholder="Choose a date"
          v-model="date"
        />
        <pre>Value: {{date}}</pre>
      </div>
    `
  })
}

/**
 * On a phone-sized viewport (under 568px) the calendar opens in a sheet from
 * the bottom of the screen, behind a scrim, and the field keeps the keyboard
 * down. That is the default (`sheet="mobile"`); it is forced on here so it
 * shows at any width. `:sheet="false"` keeps the anchored panel everywhere.
 */
export const OnAPhone: Story = {
  render: () => ({
    components: { DatePicker, FormLayout },
    setup() {
      const date = ref('2019-09-29 00:00:00')
      const when = ref('2019-09-29 14:30:00')
      return { date, when }
    },
    template: `
      <FormLayout>
        <DatePicker label="Date" placeholder="Choose a date" v-model="date" sheet />
        <DatePicker label="Date and time" type="datetime" v-model="when" sheet />
        <pre>{{date}} / {{when}}</pre>
      </FormLayout>
    `
  })
}

/**
  This example shows how the type prop formats the underlying model value.
  Note how each subsequent picker will truncate more of the model value.
 */
export const TypeProp: Story = {
  render: () => ({
    components: { DatePicker, FormLayout },
    setup() {
      const date = ref('2019-09-29 00:00:00')
      return { date }
    },
    template: `
      <div>
        <FormLayout>
          <DatePicker
            v-model="date"
            type="datetime"
            label="datetime"
          />
          <DatePicker
            v-model="date"
            type="date"
            label="date"
          />
          <DatePicker
            v-model="date"
            type="month"
            label="month"
          />
          <DatePicker
            v-model="date"
            type="year"
            label="year"
          />
        </FormLayout>
        <pre>Value: {{date}}</pre>
      </div>
    `
  })
}

/**
  `date-format` sets the format one field shows and accepts, as a dayjs format.
  Try typing a date into one of them: it has to match that field's format. Text
  that doesn't match shows an error, and clears the value when you leave the
  field.

  All four share one `v-model`, so that clears all four. The value printed below
  stays in `model-format` whichever field changes it. A `datetime` field adds
  the time after the format. `month` and `year` fields ignore it.
 */
export const DateFormat: Story = {
  render: () => ({
    components: { DatePicker, FormLayout },
    setup() {
      const date = ref('2019-09-29 14:30:00')
      return { date }
    },
    template: `
      <div>
        <FormLayout>
          <DatePicker
            v-model="date"
            label="DD/MM/YYYY"
            date-format="DD/MM/YYYY"
          />
          <DatePicker
            v-model="date"
            label="YYYY-MM-DD"
            date-format="YYYY-MM-DD"
          />
          <DatePicker
            v-model="date"
            label="D MMM YYYY"
            date-format="D MMM YYYY"
          />
          <DatePicker
            v-model="date"
            type="datetime"
            label="DD/MM/YYYY, with type datetime"
            date-format="DD/MM/YYYY"
          />
        </FormLayout>
        <pre>Value: {{date}}</pre>
      </div>
    `
  })
}

/**
  Set the format once for the whole library, at install or at any time after:

  ```ts
  app.use(UI, { dateFormat: 'DD/MM/YYYY' })

  import { setDateFormat } from '@octans/ui'
  setDateFormat('DD/MM/YYYY')
  setDateFormat(null) // back to the locale's
  ```

  Fields on screen redraw, and so does a `Formatter` showing `dateNumeral`. A
  `date-format` prop still wins for its own field. The buttons call the real
  setter, so on the docs page every `DatePicker` follows them until you leave.
 */
export const GlobalDateFormat: Story = {
  render: () => ({
    components: { Button, ButtonGroup, DatePicker, FormLayout, Formatter },
    setup() {
      const date = ref('2019-09-29 14:30:00')
      const initial = getDateFormat()
      const formats = ['DD/MM/YYYY', 'YYYY-MM-DD', 'D MMM YYYY']
      onUnmounted(() => setDateFormat(initial))
      return { date, formats, getDateFormat, setDateFormat }
    },
    template: `
      <FormLayout>
        <ButtonGroup segmented>
          <Button :pressed="!getDateFormat()" @click="setDateFormat(null)">
            Locale
          </Button>
          <Button
            v-for="format in formats"
            :key="format"
            :pressed="getDateFormat() === format"
            @click="setDateFormat(format)"
          >
            {{format}}
          </Button>
        </ButtonGroup>
        <DatePicker v-model="date" label="date" />
        <DatePicker v-model="date" type="datetime" label="datetime" />
        <DatePicker
          v-model="date"
          label="date-format=&quot;YYYY-MM-DD&quot; keeps its own"
          date-format="YYYY-MM-DD"
        />
        <div>Formatter: <Formatter type="dateNumeral" :value="date" /></div>
        <pre>Value: {{date}}</pre>
      </FormLayout>
    `
  })
}

/**
  Set the display zone once for the whole library, at install or later:

  ```ts
  app.use(UI, { timezone: 'Australia/Sydney' })

  import { setTimezone } from '@octans/ui'
  setTimezone('Australia/Sydney')
  setTimezone(null) // back to the viewer's clock
  ```

  In a `DatePicker` the zone decides what today is. Open the first field to see
  today's mark move: the two zones here are always on different dates. It does
  not convert the value, so the second field stays the same under every zone.
  A `timezone` prop overrides the zone for one field.

  `setTimezone` is not reactive, so this story remounts the fields with a `key`
  after each call. Normally you would set it before mounting. The buttons call
  the real setter, so anything else that renders on this page uses the zone too.
 */
export const GlobalTimezone: Story = {
  render: () => ({
    components: { Button, ButtonGroup, DatePicker, FormLayout, Formatter },
    setup() {
      const initial = getTimezone()
      const zones = ['Pacific/Kiritimati', 'Pacific/Pago_Pago']
      const zone = ref(initial ?? null)
      const empty = ref()
      const stored = ref('2019-09-29 14:30:00')
      const now = new Date()
      function choose(next: string | null) {
        setTimezone(next)
        zone.value = next
      }
      onUnmounted(() => setTimezone(initial))
      return { choose, empty, now, stored, zone, zones }
    },
    template: `
      <FormLayout>
        <ButtonGroup segmented>
          <Button :pressed="!zone" @click="choose(null)">Viewer's clock</Button>
          <Button
            v-for="option in zones"
            :key="option"
            :pressed="zone === option"
            @click="choose(option)"
          >
            {{option}}
          </Button>
        </ButtonGroup>
        <FormLayout :key="zone">
          <div>Now, on this clock: <Formatter type="dateTimeShort" :value="now" /></div>
          <DatePicker
            v-model="empty"
            label="Open to see today"
            placeholder="Choose a date"
          />
          <DatePicker
            v-model="stored"
            type="datetime"
            label="A stored value is not converted"
          />
          <DatePicker
            v-model="empty"
            label="timezone=&quot;UTC&quot; keeps its own today"
            placeholder="Choose a date"
            timezone="UTC"
          />
        </FormLayout>
      </FormLayout>
    `
  })
}

/**
  Allows selecting times by using the "datetime" `type`.
  The `disable-date` function is being used to disable dates after today.
  The `min-time` and `max-time` props are limiting times between 09:30am and 10:45am. Times are clamped between these ranges when the date changes.
 */
export const RestrictingDate: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const date = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))
      function disableDate(dayjsDate: Dayjs) {
        return dayjsDate.isAfter()
      }
      return { date, disableDate }
    },
    template: `
      <div>
        <DatePicker
          label="Start Date"
          placeholder="Choose a date"
          type="datetime"
          :disable-date="disableDate"
          min-time="09:30"
          max-time="10:45"
          v-model="date"
        />
        <pre>Value: {{date}}</pre>
      </div>
    `
  })
}

/**
  Allows selecting times by using the "datetime" `type`.
  The `disable-date` function is being used to disable dates after today.
  The `min-time` and `max-time` props are limiting times between 09:30am and 10:45am. Times are clamped between these ranges when the date changes.
 */
export const AutoOpenDisabled: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const date = ref('2019-09-29 00:00:00')
      return { date }
    },
    template: `
      <div>
        <DatePicker
          label="Start Date"
          placeholder="Choose a date"
          v-model="date"
          type="date"
          clearable
          :auto-open="false"
        />
        <pre>Value: {{date}}</pre>
      </div>
    `
  })
}

export const DisabledControl: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const date = ref('2019-09-29 00:00:00')
      return { date }
    },
    template: `
      <div>
        <DatePicker
          label="Start Date"
          placeholder="Choose a date"
          type="date"
          disabled
          v-model="date"
        />
        <pre>Value: {{date}}</pre>
      </div>
    `
  })
}

export const ReadonlyControl: Story = {
  render: () => ({
    components: { DatePicker },
    setup() {
      const date = ref('2019-09-29 00:00:00')
      return { date }
    },
    template: `
      <div>
        <DatePicker
          label="Start Date"
          placeholder="Choose a date"
          readonly
          type="date"
          v-model="date"
        />
        <pre>Value: {{date}}</pre>
      </div>
    `
  })
}
