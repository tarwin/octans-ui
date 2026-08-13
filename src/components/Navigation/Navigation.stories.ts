import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Navigation from './Navigation.vue'
// Stands in for a consumer's brand mark — this one belongs to the docs.
import logo from '../../stories/assets/octans-logo.svg'

/** 
  The navigation component is used to display the primary navigation in the
  sidebar of the frame of an application. Navigation includes a list of links that
  users use to move between sections of the application.

  The component takes an array of `Section` objects which themselves have arrays
  of `PrimaryItem` objects that represent links in each section.
*/
const meta = {
  title: 'Components/Navigation/Navigation',
  component: Navigation,
  parameters: { surface: 'app' },
  tags: ['autodocs'],
  args: {}
} satisfies Meta<typeof Navigation>

export default meta
type Story = StoryObj<typeof meta>

/**
 * By default the navigation component will use the `url` you define on items to
 * determine whether they are active based on the current page URL.

 * When also using Vue Router, you can pass
 * [Location](https://router.vuejs.org/api/#to) objects as the `url` property.
 */
export const RouteBasedMatching: Story = {
  render: () => ({
    components: { Navigation },
    template: `
      <pre>$route.path: NO ROUTE</pre>
      <Navigation
        :sections="[
          {
            items: [
              {
                id: 'appFrame',
                label: 'AppFrame',
                url: '/Components/AppFrame'
              },
              {
                id: 'navigation',
                label: 'Navigation',
                active: true,
                url: '/Components/Navigation',
                items: [{
                  id:'nav2',
                  label:'nav3'
                }]
              },
              {
                id: 'page',
                label: 'Page',
                url: '/Components/Page'
              }
            ]
          }
        ]"
      />
    `
  })
}

// ### Programmattic matching

// Normally the selected item state is determined using route-based matching which
// compares the current browser location to the URL of each item.

// If you do not use URLs with items, or want to bypassed the route-based matching
// algorithm you can instead provide a `location` value. This should match an ID of
// an item.

// When using `location` and also defining `url`s on items, the browser will try to
// navigate to the clicked item URL by default. To disable this, use the
// `prevent-default` prop.

// ```vue
// <template>
//   <div>
//     <pre>location: {{ location }}</pre>
//     <Navigation
//       :location="location"
//       @update:location="(val) => (location = val)"
//       prevent-default
//       :sections="[
//         {
//           items: [
//             {
//               id: 'home',
//               url: '/',
//               label: 'Home',
//               icon: 'mdi:home'
//             },
//             {
//               id: 'exhibitions',
//               url: '/exhibitions',
//               label: 'Exhibitions',
//               icon: 'mdi:inbox-arrow-down',
//               badge: '3',
//               items: [
//                 {
//                   id: 'exhibitions',
//                   url: '/exhibitions',
//                   label: 'All exhibitions'
//                 },
//                 {
//                   id: 'draftExhibitions',
//                   url: '/exhibitions/draft',
//                   label: 'Drafts'
//                 },
//                 {
//                   id: 'archivedExhibitions',
//                   url: '/exhibitions/archived',
//                   label: 'Archived'
//                 }
//               ]
//             },
//             {
//               id: 'works',
//               url: '/works',
//               label: 'Works',
//               icon: 'mdi:image-frame',
//               items: [
//                 {
//                   id: 'works',
//                   url: '/works',
//                   label: 'All works'
//                 },
//                 {
//                   id: 'storage',
//                   url: '/works/storage',
//                   label: 'Storage'
//                 }
//               ]
//             }
//           ]
//         }
//       ]"
//     />
//   </div>
// </template>

// <script>
// export default {
//   data() {
//     return {
//       location: 'home'
//     }
//   }
// }
// </script>
// ```

/**
An item with `subMenu` drills into a whole replacement menu — the settings-area
pattern — with a Back control at the top to return to the menu before it.
Clicking such an item opens the menu instead of navigating; a chevron marks it.

Menus can nest: a `subMenu` item inside a sub-menu drills one level further,
and Back walks out one level at a time.
*/
export const DrillDown: Story = {
  render: () => ({
    components: { Navigation },
    setup() {
      const sections = [
        {
          id: 'main',
          items: [
            { id: 'home', label: 'Home', icon: 'mdi:home' },
            { id: 'catalogue', label: 'Catalogue', icon: 'mdi:image-frame' },
            {
              id: 'settings',
              label: 'Settings',
              icon: 'mdi:cog',
              subMenu: {
                title: 'Settings',
                sections: [
                  {
                    id: 'org',
                    items: [
                      { id: 'organization', label: 'Organization' },
                      { id: 'integrations', label: 'Integrations' },
                      { id: 'billing', label: 'Billing' }
                    ]
                  },
                  {
                    id: 'templates',
                    title: 'Templates',
                    items: [
                      { id: 'reportTemplates', label: 'Report Templates' },
                      { id: 'emailTemplates', label: 'Email Templates' }
                    ]
                  }
                ]
              }
            }
          ]
        }
      ]
      return { sections }
    },
    template: `
      <div style="max-width:240px">
        <Navigation :sections="sections" prevent-default />
      </div>
    `
  })
}

/**
Everything at once, in the shape of a real product sidebar: a logo up top
(`logo` slot, with `logoMin` taking over on the icon rail), icons on the
section headers — which are what keep sections apart when minimized — the
active item marked with `highlight`'s left-edge bar, the floating edge
minimize button, and a pinned `footer` with the account row.

Try the edge chevron: the sections scroll in the middle while the logo and
footer stay put, and the section icons remain as landmarks on the rail.
*/
export const FullSidebar: Story = {
  render: () => ({
    components: { Navigation },
    setup() {
      const location = ref('list')
      // Standalone, the menu does not own its width — the container does, the
      // way AppFrame's sidebar column does. `toggle-min` is the hook.
      const min = ref(false)
      const sections = [
        {
          id: 'assessments',
          title: 'Assessments',
          icon: 'mdi:clipboard-outline',
          items: [
            { id: 'list', label: 'List', icon: 'mdi:format-list-bulleted' },
            { id: 'map', label: 'Map', icon: 'mdi:map-outline' },
            { id: 'calendar', label: 'Calendar', icon: 'mdi:calendar-outline' },
            { id: 'create', label: 'Create', icon: 'mdi:plus-circle-outline' }
          ]
        },
        {
          id: 'reports',
          title: 'Reports',
          icon: 'mdi:chart-box-outline',
          items: [
            { id: 'reportAssessments', label: 'Assessments' },
            { id: 'observations', label: 'Observations' },
            { id: 'changelog', label: 'Changelog' }
          ]
        },
        {
          id: 'settings',
          title: 'Settings',
          icon: 'mdi:cog-outline',
          items: [
            {
              id: 'settingsMenu',
              label: 'All settings',
              subMenu: {
                title: 'Settings',
                sections: [
                  {
                    id: 'settingsMain',
                    items: [
                      { id: 'organization', label: 'Organization' },
                      { id: 'integrations', label: 'Integrations' },
                      { id: 'billing', label: 'Billing' }
                    ]
                  }
                ]
              }
            }
          ]
        }
      ]
      return { location, sections, logo, min }
    },
    template: `
      <div
        :style="{
          width: min ? '64px' : '260px',
          transition: 'width 0.2s ease-in-out'
        }"
        style="
          height:560px; display:flex;
          border:1px solid var(--octans-border);
          border-radius:var(--octans-radius-box); overflow:hidden;
          background:var(--octans-surface-app);
        "
      >
        <Navigation
          :sections="sections"
          v-model:location="location"
          logo
          allowMinimize
          highlight
          accentStripe
          prevent-default
          @toggle-min="min = $event"
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
          <template #footer="{ min }">
            <div style="padding:0 12px">
              <div style="
                display:flex;align-items:center;gap:10px;padding:8px;
                border-radius:var(--octans-radius-field);cursor:pointer;
              ">
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
      </div>
    `
  })
}

/**
`highlight` marks the active item with a bar on the sidebar's left edge. Bare
`highlight` uses the primary colour; passing a CSS colour string uses that —
`highlight="#e07a30"` here. It can also be themed per-container through
`--ui-nav-highlightColor`.
*/
export const HighlightColor: Story = {
  render: () => ({
    components: { Navigation },
    setup() {
      const location = ref('map')
      const sections = [
        {
          id: 'main',
          items: [
            { id: 'list', label: 'List', icon: 'mdi:format-list-bulleted' },
            { id: 'map', label: 'Map', icon: 'mdi:map-outline' },
            { id: 'calendar', label: 'Calendar', icon: 'mdi:calendar-outline' }
          ]
        }
      ]
      return { location, sections }
    },
    template: `
      <div
        style="
          width:240px; border:1px solid var(--octans-border);
          border-radius:var(--octans-radius-box); overflow:hidden;
          background:var(--octans-surface-app); padding-bottom: 8px;
        "
      >
        <Navigation
          :sections="sections"
          v-model:location="location"
          highlight="#e07a30"
          prevent-default
        />
      </div>
    `
  })
}
