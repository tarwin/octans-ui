import { Button } from '@/components/Button'
import { FormLayout } from '@/components/FormLayout'
import {
  Select,
  type SelectOptionType,
  type SelectOptionGroupType
} from '@/components/Select'
import { Stack } from '@/components/Stack'
import { Tag } from '@/components/Tag'
import countries from '@/data/countries.json'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { nextTick, ref } from 'vue'

const meta = {
  title: 'Components/Forms/Select',
  component: Select,
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  render: () => ({
    components: { Select },
    template: `
      <Select
        placeholder="Choose a value"
        :options="[
          {label: 'One', value: 1},
          {label: 'Two', value: 2},
          {label: 'Three', value: 3}
        ]"
      />
    `
  })
}

/**
  Press and hold the control, drag onto an option and release — the way a native
  `<select>` behaves. The menu opens on press, the highlight follows the pointer,
  and the option under it when you let go is the one you get.

  A plain click still works exactly as before: a release that has not travelled
  from where it started is treated as a click, so the menu opens and stays open
  for a second click. Without that rule the menu would open under your pointer
  and the release that opened it would pick whatever happened to appear there.

  In `multiple` mode a release toggles the option and leaves the menu open, so
  you can keep going.

  Set `:drag-select="false"` to require a separate click for each step.
 */
export const PressAndDrag: Story = {
  render: () => ({
    components: { Select },
    setup() {
      const options = [
        { label: 'Mercury', value: 'mercury' },
        { label: 'Venus', value: 'venus' },
        { label: 'Earth', value: 'earth' },
        { label: 'Mars', value: 'mars' },
        { label: 'Jupiter', value: 'jupiter' },
        { label: 'Saturn', value: 'saturn' }
      ]
      return { options }
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px">
        <Select
          label="Drag to select (the default)"
          placeholder="Press and drag"
          :options="options"
        />
        <Select
          label="Multiple — stays open as you go"
          placeholder="Press and drag"
          multiple
          :options="options"
        />
        <Select
          label="Click only"
          placeholder="Click, then click"
          :drag-select="false"
          :options="options"
        />
      </div>
    `
  })
}

export const MultipleValues: Story = {
  render: () => ({
    components: { Select },
    template: `
      <Select
        placeholder="Choose a value"
        :options="[
          {label: 'One', value: 1},
          {label: 'Two', value: 2},
          {label: 'Three', value: 3}
        ]"
        multiple
      />
    `
  })
}

/**
Try keyboard navigation shortcuts:

- `ENTER/UP/DOWN` to open a focused dropdown.
- `UP/DOWN` to navigate an opened dropdown.
- `ENTER` to toggle a highlighted option.
- `ESCAPE/TAB` to close an opened dropdown.

Toggle All action:

- This example also demonstrates the `toggle-all` prop for the multiple Selects.
- Try using this action while some options have been filtered using the search
  input.
*/
export const LargeListOfOptions: Story = {
  render: () => ({
    components: { Select, FormLayout },
    setup() {
      return {
        countries
      }
    },
    template: `
      <FormLayout>
        <Select
          label="Single value"
          placeholder="Choose a value"
          :options="countries"
          :searchable="false"
        />
        <Select
          label="Multiple values"
          placeholder="Choose a value"
          :options="countries"
          :searchable="false"
          multiple
          toggle-all
        />
        <Select
          label="Single value (searchable)"
          placeholder="Choose a value"
          :options="countries"
          :searchable="true"
        />
        <Select
          label="Multiple values (searchable)"
          placeholder="Choose a value"
          :options="countries"
          :searchable="true"
          multiple
          toggle-all
        />
      </FormLayout>
    `
  })
}

export const NoOptions: Story = {
  render: () => ({
    components: { Select },
    template: `
      <Select
        label="Works"
        placeholder="Choose a work"
        no-options="This exhibition has no works."
        :options="[]"
      />
    `
  })
}

export const Disabled: Story = {
  render: () => ({
    components: { Select },
    template: `
      <Select
        placeholder="Choose a value"
        :options="[
          {label: 'One', value: 1},
          {label: 'Two', value: 2},
          {label: 'Three', value: 3}
        ]"
        :modelValue="2"
        disabled
      />
    `
  })
}

/**
Select has an `empty-value` prop which it uses to determine which model values
should be considered "empty".

This defaults to an array of `[null, undefined]` meaning that both `null` or
`undefined` values will be considered empty values.

  - For single value selects, the first empty value will be emitted when cleared. By default this means `null` will be emitted when cleared.
  - For multiple value selects, an empty array will be emited when cleared.
*/
export const Clearable: Story = {
  render: () => ({
    components: { Select },
    setup() {
      const value = ref(1)
      return {
        value
      }
    },
    template: `
      <Select
        placeholder="Choose a value"
        :options="[
          {label: 'One', value: 1},
          {label: 'Two', value: 2},
          {label: 'Three', value: 3}
        ]"
        clearable
        v-model="value"
      />
      <pre>value: {{value}}</pre>
      <pre>value is null: {{value === null}}</pre>
      <pre>value is undefined: {{value === undefined}}</pre>
    `
  })
}

export const Readonly: Story = {
  render: () => ({
    components: { Select },
    template: `
      <Select
        placeholder="Choose a value"
        :options="[
          {label: 'One', value: 1},
          {label: 'Two', value: 2},
          {label: 'Three', value: 3}
        ]"
        :modelValue="2"
        readonly
      />
    `
  })
}

export const SingleBoundToValue: Story = {
  render: () => ({
    components: { Select },
    setup() {
      const selected = ref(2)
      return {
        selected
      }
    },
    template: `
      <Select
        placeholder="Choose a value"
        :options="[
          {label: 'One', value: 1},
          {label: 'Two', value: 2},
          {label: 'Three', value: 3}
        ]"
        v-model="selected"
      />
      <pre>selected: {{selected}}</pre>
    `
  })
}

export const MultipleBoundToValue: Story = {
  render: () => ({
    components: { Select },
    setup() {
      const selected = ref<number[]>([3])
      return {
        selected
      }
    },
    template: `
      <Select
        placeholder="Choose a value"
        :options="[
          {label: 'One', value: 1},
          {label: 'Two', value: 2},
          {label: 'Three', value: 3}
        ]"
        v-model="selected"
        multiple
      />
      <pre>selected: {{selected}}</pre>
    `
  })
}

export const OptionsWithDescriptions: Story = {
  render: () => ({
    components: { Select },
    template: `
      <Select
        placeholder="Choose a value"
        :options="[
          {label: 'One', description: 'This is a description', value: 1},
          {label: 'Two', description: 'This is a description', value: 2},
          {label: 'Three', value: 3}
        ]"
        multiple
      />
    `
  })
}

export const OptionGroups: Story = {
  render: () => ({
    components: { Select },
    template: `
      <Select
        placeholder="Choose a value"
        :option-groups="[
          {
            title: 'Group one',
            options: [
              {label: 'One', value: 1},
              {label: 'Two', value: 2}
            ]
          },
          {
            title: 'Group two',
            options: [
              {label: 'Three', value: 3},
              {label: 'Four', value: 4}
            ]
          }
        ]"
        multiple
      />
    `
  })
}

/**
By default the select dropdown will show a input to filter items if there are
more than 10 options defined. You can explicitly set searchable to `true` or
`false` to force this behavior.

Adding the `searchable` prop without a value is the same as setting it to `true`.
*/
export const Searchable: Story = {
  render: () => ({
    components: { Select, FormLayout, Button },
    setup() {
      const searchable = ref<boolean | string>(true)
      const options = ref([
        { label: 'One', description: 'Apples and bananas', value: 1 },
        { label: 'Two', description: 'Bangers and mash', value: 2 },
        { label: 'Three', value: 3 }
      ])
      const addOptions = () => {
        const start = options.value.length + 1
        for (let i = start; i < start + 5; i++) {
          options.value.push({
            label: `Option ${i}`,
            value: i
          })
        }
      }

      return {
        searchable,
        addOptions,
        options
      }
    },
    template: `
      <FormLayout>
        <Select
          label="Select some options"
          placeholder="Choose a value"
          :options="options"
          :searchable="searchable"
        />
        <Select
          label="Searchable mode"
          :options="[
            {label: 'auto', value: 'auto'},
            {label: 'true (Always)', value: true},
            {label: 'false (Never)', value: false}
          ]"
          v-model="searchable"
        />
        <Button @click="addOptions">Add more options</Button>
      </FormLayout>
    `
  })
}

export const SelectedOptionsAsTags: Story = {
  render: () => ({
    components: { Select },
    setup() {
      const selected = ref<number[]>([2, 1])
      return {
        selected
      }
    },
    template: `
      <Select
        placeholder="Choose a value"
        :options="[
          {label: 'One', value: 1},
          {label: 'Two', value: 2},
          {label: 'Three', value: 3}
        ]"
        multiple
        v-model="selected"
        tags
        help-text="This is a help text"
      />
      <pre>selected: {{selected}}</pre>
    `
  })
}

/**
`fuzzy` loosens the search: every character of the query has to appear in the
label or description **in order**, but not necessarily together. Matches are
re-ordered best-first, which a substring filter has no need to do.

Try `gwp`, `strnght`, or `mnt` — none of which a substring search would find.
Then try the same queries with the second Select, which uses the default
substring match.

Worth turning on for long lists of things people only half-remember. Worth
leaving off for short lists, where it mostly adds noise.
*/
export const FuzzySearch: Story = {
  render: () => ({
    components: { Select },
    setup() {
      const options = [
        {
          label: 'The Starry Night',
          value: 1,
          description: 'Vincent van Gogh'
        },
        {
          label: 'Girl with a Pearl Earring',
          value: 2,
          description: 'Johannes Vermeer'
        },
        { label: 'Impression, Sunrise', value: 3, description: 'Claude Monet' },
        { label: 'Water Lilies', value: 4, description: 'Claude Monet' },
        {
          label: 'The Great Wave off Kanagawa',
          value: 5,
          description: 'Katsushika Hokusai'
        },
        { label: 'The Night Watch', value: 6, description: 'Rembrandt' },
        { label: 'The Hay Wain', value: 7, description: 'John Constable' },
        {
          label: 'Wanderer above the Sea of Fog',
          value: 8,
          description: 'Caspar David Friedrich'
        }
      ]
      return { options }
    },
    template: `
      <div style="display:flex; gap:16px; align-items:flex-start">
        <Select
          label="Fuzzy"
          placeholder="Search…"
          :options="options"
          fuzzy
          searchable
          style="flex:1"
        />
        <Select
          label="Substring (default)"
          placeholder="Search…"
          :options="options"
          searchable
          style="flex:1"
        />
      </div>
    `
  })
}

/**
The default filter function will show any option whose label matches the search
text (case-insensitibe).

`filterFn` replaces it entirely, and takes precedence over `fuzzy`.

This example demonstrates a custom filter function that also filters on the
group title and array of keywords in each option.

Try searching for "apple", "potato" or "candy".
*/
export const CustomFilterFunction: Story = {
  render: () => ({
    components: { Select },
    setup() {
      const selected = ref<number[]>([])
      const filterOptions = (
        searchText: string,
        options: (SelectOptionType & { keywords: string[] })[],
        group: SelectOptionGroupType
      ) => {
        const pattern = new RegExp(searchText, 'i')
        return options.filter((opt) => {
          return (
            pattern.test(opt.label) ||
            opt.keywords.find((word) => pattern.test(word)) ||
            pattern.test(group.title)
          )
        })
      }
      return {
        selected,
        filterOptions
      }
    },
    template: `
      <Select
        placeholder="Choose some foods"
        searchable
        :option-groups="[
          {
            title: 'Healthy foods',
            options: [
              {
                label: 'Fruit',
                keywords: ['apple', 'banana'],
                value: 'fruit'
              },
              {
                label: 'Veggies',
                keywords: ['potato', 'broccoli'],
                value: 'veggies'
              }
            ]
          },
          {
            title: 'Junk food',
            options: [
              {
                label: 'Snacks',
                keywords: ['chips', 'candy'],
                value: 'snacks'
              },
              {
                label: 'Dessert',
                keywords: ['chocolate', 'ice cream'],
                value: 'dessert'
              }
            ]
          }
        ]"
        :filter-fn="filterOptions"
        multiple
        v-model="selected"
      />
      <pre>selected: {{selected}}</pre>
    `
  })
}

export const DisabledOptions: Story = {
  render: () => ({
    components: { Select },
    template: `
      <Select
        placeholder="Choose a value"
        :options="[
          {label: 'One', value: 1},
          {label: 'Two', value: 2, disabled: true},
          {label: 'Three', value: 3}
        ]"
        multiple
      />
    `
  })
}

export const LoadingState: Story = {
  render: () => ({
    components: { Select },
    template: `
      <Select
        placeholder="Choose a value"
        :options="[
          {label: 'One', value: 1},
          {label: 'Two', value: 2, disabled: true},
          {label: 'Three', value: 3}
        ]"
        multiple
        loading
      />
    `
  })
}

/**
By default, only the label of the currently selected option is rendered. Use the
`show-description` prop to also render the option description. The description
will be rendered on a single line and truncated if the text is too long.

**Limitations:**

  - This only applies to single-value selections (when `multiple` is false).

  - When this feature is used within a LayoutSectionAnnotated component, the
    `max-width` of the description is limited to prevent weird behaviour in the
    layout section.
*/
export const ShowSelectedOptionDescription: Story = {
  render: () => ({
    components: { Select },
    template: `
      <div style="max-width: 500px">
        <Select
          placeholder="Choose a value"
          show-description
          help-text="This element is in a container with max-width: 500px"
          :options="[
            {
              label: 'One',
              description: 'Works in this category are held in climate-controlled storage and are not rotated onto the public floor without a written condition report from the registrar. They remain listed in the online catalogue and may still be requested for study in the reading room by appointment.',
              value: 1
            },
            {
              label: 'Two',
              value: 2
              },
            {
              label: 'Three',
              description: 'A short description for the option!',
              value: 3
            }
          ]"
          :modelValue="1"
        />
      </div>
      <br>
      <div>
        <Select
          placeholder="Choose a value"
          help-text="This element is in a container with no max width"
          show-description
          :options="[
            {
              label: 'One',
              description: 'Works in this category are held in climate-controlled storage and are not rotated onto the public floor without a written condition report from the registrar. They remain listed in the online catalogue and may still be requested for study in the reading room by appointment.',
              value: 1
            },
            {
              label: 'Two',
              value: 2
              },
            {
              label: 'Three',
              description: 'A short description for the option!',
              value: 3
            }
          ]"
          :modelValue="1"
        />
      </div>
    `
  })
}

/**
The component is designed the handle invalid values the same way the native
`<select>` does:

- When there is an invalid value and `multiple` is disabed, the
  component will appear blank.
- When `multiple` is enabled only the valid options will be shown.
*/
export const SelectWithInvalidValue: Story = {
  render: () => ({
    components: { Select, Stack },
    template: `
      <Stack vertical>
        <Select
          placeholder="Choose a value"
          :options="[
            {label: 'One', value: 1},
            {label: 'Two', value: 2, disabled: true},
            {label: 'Three', value: 3}
          ]"
          :modelValue="4"
        />
        <Select
          placeholder="Choose a value"
          :options="[
            {label: 'One', value: 1},
            {label: 'Two', value: 2, disabled: true},
            {label: 'Three', value: 3}
          ]"
          multiple
          :modelValue="[1, 4, 3]"
        />
      </Stack>
    `
  })
}

/**
Tests label, placeholder, error, tags, multiple, option groups, disabled option
and filter function.
*/
export const ComplexTest: Story = {
  render: () => ({
    components: { Select, Stack },
    setup() {
      const selected = ref<string[]>(['veggies', 'snacks'])
      const filterOptions = (
        searchText: string,
        options: (SelectOptionType & { keywords: string[] })[],
        group: SelectOptionGroupType
      ) => {
        const pattern = new RegExp(searchText, 'i')
        return options.filter((opt) => {
          return (
            pattern.test(opt.label) ||
            opt.keywords.find((word) => pattern.test(word)) ||
            pattern.test(group.title)
          )
        })
      }
      return {
        selected,
        filterOptions
      }
    },
    template: `
      <Select
        placeholder="Choose a value"
        searchable
        :option-groups="[
          {
            title: 'Healthy foods',
            options: [
              {
                label: 'Fruit',
                disabled: true,
                keywords: ['apple', 'banana'],
                value: 'fruit'
              },
              {
                label: 'Veggies',
                keywords: ['potato', 'broccoli'],
                value: 'veggies'
              }
            ]
          },
          {
            title: 'Junk food',
            options: [
              {
                label: 'Snacks',
                keywords: ['chips', 'candy'],
                value: 'snacks'
              },
              {
                label: 'Dessert',
                keywords: ['chocolate', 'ice cream'],
                value: 'dessert'
              }
            ]
          }
        ]"
        :filter-fn="filterOptions"
        multiple
        tags
        label="Foods"
        error="This is an error"
        v-model="selected"
      />
      <pre>selected: {{selected}}</pre>
    `
  })
}

/**
Programmatically set focus using the `focus()` method.
*/
export const ProgrammaticFocus: Story = {
  render: () => ({
    components: { Select, Button },
    setup() {
      const select = ref<InstanceType<typeof Select> | null>(null)
      return {
        select,
        click: () => {
          setTimeout(() => {
            select.value?.focus()
          }, 500)
        }
      }
    },
    template: `
      <Select
        placeholder="Choose a value"
        :options="[
          {label: 'One', value: 1},
          {label: 'Two', value: 2},
          {label: 'Three', value: 3}
        ]"
        ref="select"
      />
      <br>
      <Button @click="click">Focus after 500ms</Button>
    `
  })
}

/**
Options can be defined with an `archived` property which when set will only
display the option in the dropdown list if the option value has ever been
selected during the component lifecycle.

This is useful to allow deprecated options to keep working in an application,
while only showing them when they are relevant to users. For example, a dropdown
could list the galleries a work can be assigned to. Some galleries may be closed
and should not be selectable unless the current record already refers to that
gallery.

#### Archived Options: Single values

The archived option with value 3 won't be visible unless the Select is
initialized with the value or it is programmatically set after creation.
*/
export const ArchivedOptionsSingleValues: Story = {
  render: () => ({
    components: { Select, Button, Stack },
    setup() {
      const visible = ref(true)
      const value = ref<number | null>(null)
      const options = ref<SelectOptionType[]>([
        { label: 'One', value: 1 },
        { label: 'Two', value: 2 },
        { label: 'Three', value: 3, archived: true }
      ])

      const reset = () => {
        value.value = null
        visible.value = false
        nextTick(() => (visible.value = true))
      }
      const setValue = (_value: number) => {
        value.value = _value
      }
      const changeOptions = () => {
        options.value = [
          { label: 'One', value: 1, archived: true },
          { label: 'Two', value: 2 },
          { label: 'Three', value: 3, archived: true }
        ]
      }

      return {
        visible,
        value,
        options,
        reset,
        setValue,
        changeOptions
      }
    },
    template: `
      <Stack
        vertical
        spacing="tight"
      >
        <Select
          v-if="visible"
          placeholder="Choose a value"
          :options="options"
          :modelValue="value"
        />
        <Stack spacing="tight">
          <Button @click="setValue(1)">Set value to 1</Button>
          <Button @click="setValue(2)">Set value to 2</Button>
          <Button @click="setValue(3)">Set value to 3</Button>
          <Button @click="reset">Reset</Button>
          <Button @click="changeOptions">Change Options</Button>
        </Stack>
      </Stack>
    `
  })
}

/**
#### Archived Options: Multiple values

The archived option with value 3 won't be visible unless the Select is
initialized with the value or it is programmatically set after creation.
 */
export const ArchivedOptionsMultipleValues: Story = {
  render: () => ({
    components: { Select, Button, Stack },
    setup() {
      const visible = ref(true)
      const value = ref<number | null>(null)
      const options = ref<SelectOptionType[]>([])

      const reset = () => {
        value.value = null
        options.value = [
          { label: 'One', value: 1 },
          { label: 'Two', value: 2 },
          { label: 'Three', value: 3, archived: true }
        ]
        visible.value = false
        nextTick(() => (visible.value = true))
      }
      const setValue = (_value: number) => {
        value.value = _value
      }
      const changeOptions = () => {
        options.value = [
          { label: 'One', value: 1, archived: true },
          { label: 'Two', value: 2 },
          { label: 'Three', value: 3, archived: true }
        ]
      }

      reset()

      return {
        visible,
        value,
        options,
        reset,
        setValue,
        changeOptions
      }
    },
    template: `
      <Stack
        vertical
        spacing="tight"
      >
        <Select
          v-if="visible"
          placeholder="Choose a value"
          :options="options"
          :modelValue="value"
          multiple
        />
        <Stack spacing="tight">
          <Button @click="setValue(1)">Set value to 1</Button>
          <Button @click="setValue(2)">Set value to 2</Button>
          <Button @click="setValue(3)">Set value to 3</Button>
          <Button @click="reset">Reset</Button>
          <Button @click="changeOptions">Change Options</Button>
        </Stack>
      </Stack>
    `
  })
}

/**
If you have a `Select` that is very thin and the dropdown is too narrow to
display the options, you can force the dropdown to be wider by setting the
`dropdown-min-width` prop.
*/
export const ForcingDropdownWidth: Story = {
  render: () => ({
    components: { Select, Button },
    setup() {
      const options = ref<SelectOptionType[]>([
        { label: '+1', description: 'United States', value: 1 },
        { label: '+43', description: 'United Kingdom', value: 2 },
        { label: '+61', description: 'United States', value: 3 }
      ])

      return {
        options
      }
    },
    template: `
      <div>
        <div style="width: 60px;">
          <Select
            label="Small wrapper, min width set to 200px"
            placeholder=""
            :options="options"
            dropdown-min-width="200px"
            :searchable="true"
          />
        </div>

        <div>
          <Select
            label="Large wrapper, min width set to 200px"
            placeholder=""
            :options="options"
            dropdown-min-width="200px"
            :searchable="true"
          />
        </div>

        <div>
          <Select
            label="Small wrapper, no min set"
            placeholder=""
            :options="options"
            :searchable="true"
          />
        </div>
      </div>
    `
  })
}

export const SlotOption: Story = {
  render: () => ({
    components: { Select },
    template: `
      <Select
        placeholder="Choose a value"
        :options="[
          {label: 'One', value: 1},
          {label: 'Two', value: 2},
          {label: 'Three', value: 3}
        ]"
        multiple
      >
        <template #option="{option, selected}">
          <div style="border: 1px solid red">
            {{selected ? '✅' : '❌'}} {{option.label}} ({{option.value}})
          </div>
        </template>
      </Select>
    `
  })
}

export const SlotDisplay: Story = {
  render: () => ({
    components: { Select },
    template: `
      <Select
        placeholder="Choose a value"
        :options="[
          {label: 'Cow', value: 1, emoji: '🐮'},
          {label: 'Point', value: 2, emoji: '👈'},
          {label: 'Flower', value: 3, emoji: '🌸' },
          {label: 'Smile', value: 4, emoji: '🙂' },
          {label: 'Bow', value: 5, emoji: '🎀' },
          {label: 'Train', value: 6, emoji: '🚇' },
          {label: 'Weather', value: 7, emoji: '🌤' },
          {label: 'Clock', value: 8, emoji: '🕑' },
          {label: 'Mushroom', value: 9, emoji: '🍄' },
          {label: 'Hotel', value: 10, emoji: '🏨' },
          {label: 'Chili', value: 11, emoji: '🎋' },
        ]"
        multiple
      >
        <template #display="{selectedOptions, displayText}">
          <template v-if="selectedOptions.length">
            {{ selectedOptions.map((opt) => { return opt.emoji }).join(', ') }}
          </template>
          <span v-else v-html="displayText"></span>
        </template>
      </Select>
    `
  })
}

export const SlotTag: Story = {
  render: () => ({
    components: { Select },
    template: `
      <Select
        placeholder="Choose a value"
        :options="[
          {label: 'Cow', value: 1, emoji: '🐮'},
          {label: 'Point', value: 2, emoji: '👈'},
          {label: 'Flower', value: 3, emoji: '🌸' },
          {label: 'Smile', value: 4, emoji: '🙂' },
          {label: 'Bow', value: 5, emoji: '🎀' },
          {label: 'Train', value: 6, emoji: '🚇' },
          {label: 'Weather', value: 7, emoji: '🌤' },
          {label: 'Clock', value: 8, emoji: '🕑' },
          {label: 'Mushroom', value: 9, emoji: '🍄' },
          {label: 'Hotel', value: 10, emoji: '🏨' },
          {label: 'Chili', value: 11, emoji: '🎋' },
        ]"
        multiple
        tags
      >
        <template #tags="{selectedOptions, removeFn}">
          <span
            v-for="option in selectedOptions"
            @click="removeFn(option)"
            class="CustomTag"
          >{{ option.label }} {{ option.emoji }}</span>
        </template>
      </Select>
      <component is="style">
        .CustomTag {
          border: 1px solid #ccc;
          padding: 5px;
          border-radius: 5px;
          cursor: pointer;
        }
      </component>
    `
  })
}

export const SlotTagTags: Story = {
  render: () => ({
    components: { Select, Tag },
    template: `
      <Select
        placeholder="Choose a value"
        :options="[
          {label: 'Cow', value: 1, emoji: '🐮'},
          {label: 'Point', value: 2, emoji: '👈'},
          {label: 'Flower', value: 3, emoji: '🌸' },
          {label: 'Smile', value: 4, emoji: '🙂' },
          {label: 'Bow', value: 5, emoji: '🎀' },
          {label: 'Train', value: 6, emoji: '🚇' },
          {label: 'Weather', value: 7, emoji: '🌤' },
          {label: 'Clock', value: 8, emoji: '🕑' },
          {label: 'Mushroom', value: 9, emoji: '🍄' },
          {label: 'Hotel', value: 10, emoji: '🏨' },
          {label: 'Chili', value: 11, emoji: '🎋' },
        ]"
        multiple
        tags
      >
        <template #tags="{selectedOptions, removeFn}">
          <Tag
            v-for="option of selectedOptions"
            :key="option.label"
            @remove="removeFn(option)"
          >{{ option.emoji }} {{ option.label }}</Tag>
        </template>
      </Select>
    `
  })
}
