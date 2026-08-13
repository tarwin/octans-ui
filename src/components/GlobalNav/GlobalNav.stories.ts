import { GlobalNav } from '@/components/GlobalNav'
import { Button } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { useSaveBar } from '@/components/SaveBar'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
// Stands in for a consumer's brand mark. The library ships no logo of its own
// — this one belongs to the docs, not to the component.
import logo from '../../stories/assets/octans-logo.svg'

const meta = {
  title: 'Components/Navigation/GlobalNav',
  component: GlobalNav,
  tags: ['autodocs'],
  parameters: {
    surface: 'app',
    docs: {
      description: {
        component: [
          'A generic application top bar: an optional brand mark, a title with',
          'optional breadcrumb-style actions before it, and slots for whatever',
          'the app needs on the right.',
          '',
          'It also hosts two pieces of global UI: a **`SaveBar`** (driven by',
          '`$ui.saveBar` / `useSaveBar()`) and a **`LoadingBar`** (driven by',
          '`$ui.progress`). Both are components of their own now, so neither',
          'needs a `GlobalNav` — but with one, they come for free.'
        ].join('\n')
      }
    }
  },
  argTypes: {
    logo: { control: 'boolean' },
    theme: { control: 'select', options: ['dark', 'light'] },
    layoutMode: { control: 'select', options: ['default', 'alternate'] }
  }
} satisfies Meta<typeof GlobalNav>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    title: 'Dashboard',
    logo: false,
    theme: 'dark'
  }
}

/**
The `logo` slot is where your own brand mark goes — the library ships no logo of
its own. Set `logo` to `false` to reclaim the space entirely.
*/
export const WithLogo: Story = {
  args: { title: 'Dashboard', theme: 'dark' },
  render: (args) => ({
    components: { GlobalNav },
    setup: () => ({ args, logo }),
    template: `
      <GlobalNav v-bind="args">
        <template #logo>
          <div style="display:flex;align-items:center;gap:8px;font-weight:700">
            <img :src="logo" alt="" style="width:24px;height:24px" />
            Octans
          </div>
        </template>
      </GlobalNav>
    `
  })
}

/**
`prefixTitleActions` renders breadcrumb-style actions before the title, each
with an optional icon and click handler. `prefixTitleSeparator` controls the
dividers between them.
*/
export const PrefixTitleActions: Story = {
  args: {
    title: 'Edit exhibition',
    logo: false,
    prefixTitleActions: [
      { icon: 'mdi:arrow-left', onAction: () => alert('back') },
      { label: 'Exhibitions', onAction: () => alert('exhibitions') }
    ]
  }
}

/**
Supplying `onClickTitle` (or listening for `@click-title`) gives the title its
button styling and makes it interactive.
*/
export const ClickableTitle: Story = {
  args: {
    title: 'Click me',
    logo: false,
    onClickTitle: () => alert('title clicked')
  }
}

/**
The `center` and `actions` slots are free-form. Put a search field, an account
menu, a locale switcher — whatever the application needs.
*/
export const WithSlots: Story = {
  args: { title: 'Catalogue', logo: false },
  render: (args) => ({
    components: { GlobalNav, Icon },
    setup: () => ({ args }),
    template: `
      <GlobalNav v-bind="args">
        <template #center>
          <input
            placeholder="Search…"
            style="
              width:100%;max-width:420px;padding:4px 10px;
              border:0;border-radius:4px
            "
          />
        </template>
        <template #actions>
          <span style="display:flex;align-items:center;gap:14px;padding:0 8px">
            <Icon icon="mdi:bell" />
            <Icon icon="mdi:cog" />
            <span style="
              width:24px;height:24px;border-radius:50%;background:#5b8def;
              display:inline-flex;align-items:center;justify-content:center;
              font-size:11px;color:#fff
            ">AB</span>
          </span>
        </template>
      </GlobalNav>
    `
  })
}

export const LightTheme: Story = {
  args: { title: 'Dashboard', logo: false, theme: 'light' }
}

/**
The save bar appears whenever the global save bar state is anything other than
`unchanged`. Drive it through `useSaveBar()` (or `$ui.saveBar.setState()`)
rather than setting the prop directly — the state belongs to the app, and
clicking Save only announces the click.
*/
export const WithSaveBar: Story = {
  args: { title: 'Edit settings', logo: false },
  render: (args) => ({
    components: { GlobalNav, Button },
    setup() {
      const { setState } = useSaveBar({
        onSave: () => {
          setState('saving')
          setTimeout(() => setState('unchanged'), 1200)
        },
        onDiscard: () => setState('unchanged')
      })
      return { args, setState }
    },
    template: `
      <div>
        <GlobalNav v-bind="args" />
        <div style="padding:20px">
          <Button @click="setState('changed')">Make a change</Button>
        </div>
      </div>
    `
  })
}
