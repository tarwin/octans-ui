import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MaybeRouterLink from './MaybeRouterLink.vue'
import { RouterLink } from 'vue-router'
import { ref } from 'vue'
import { alertModal } from '../Modal'

/*
  `<maybe-router-link>` is a utility component which aims to provide the core
  features of [Vue Router's](https://router.vuejs.org)
  [<router-link>](https://router.vuejs.org/api/#router-link) component
  independently of whether your app is using a router or not.

    - This allows you to make use of all the powerful features of Vue Router when
      you are using it such as referring to links as **named routes**.

    - When not using Vue Router, the component aims to mimic some of the same featires provided by `<router-link>`.

  ### Exact path matching

  MaybeRouterLink defaults `exact-path` defaults to `true` unlike in RouterLink
  where it is disabled by default. Enabling this ignores the "query" part of the
  URL when matching routes which is more useful in this component library.
*/
const meta = {
  title: 'Components/Utilities/MaybeRouterLink',
  component: MaybeRouterLink,
  tags: ['autodocs']
} satisfies Meta<typeof MaybeRouterLink>

export default meta
type Story = StoryObj<typeof meta>

/*
  As expected, internal links (URLs where the origin matches the current page's
  origin) work the same.
*/
export const InternalLink: Story = {
  render: () => ({
    components: { MaybeRouterLink, RouterLink },
    setup() {
      const items = ref([
        {
          id: 'google',
          url: 'https://www.google.com'
        },
        {
          id: 'bing',
          url: 'https://www.bing.com'
        }
      ])
      function onClickItem(item: any) {
        console.log('click link', item)
      }
      return {
        items,
        onClickItem,
        location: window.location
      }
    },
    template: `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px 40px;">
        <b>Router Link</b>
        <b>Maybe Router Link</b>
        <div>
          <code>&lt;router-link to="/Components"&gt;</code>
          <br>
          <router-link v-if="$router" to="/Components"></router-link> ✅
        </div>
        <div>
          <code>&lt;maybe-router-link to="/Components"&gt;</code>
          <br>
          <maybe-router-link to="/Components"></maybe-router-link> ✅
        </div>
        <!-- Custom -->
        <div>
          <code>&lt;router-link to="/Components" custom&gt;</code>
          <br>
          <router-link v-if="$router" to="/Components" custom>
            <template #default="{href}">
              <div>
                <b>href:</b> {{href}} ✅
              </div>
            </template>
          </router-link>
        </div>
        <div>
          <code>&lt;maybe-router-link to="/Components" custom&gt;</code>
          <br>
          <maybe-router-link to="/Components" custom>
            <template #default="{href}">
              <div>
                <b>href:</b> {{href}} ✅
              </div>
            </template>
          </maybe-router-link>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <MaybeRouterLink
          v-for="(item, index) in items"
          :key="index"
          :to="item.url"
          @click="onClickItem(item)"
        >
          <div style="border: 2px solid red">{{item.id}}</div>
        </MaybeRouterLink>
      </div>
      <component is="style">
        a:after {
          content: attr(href);
          color: green;
          text-decoration: none;
        }
      </component>
    `
  })
}

/*
  RouterLink does not support external links as it is only designed for
  internal app routing. This makes it harder to use in components which need to
  render lists of links which may include external links. `<maybe-router-link>`
  improves on this by adding support for it:
*/
export const ExternalLink: Story = {
  render: () => ({
    components: { MaybeRouterLink },
    template: `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px 40px;">
        <b>Router Link</b>
        <b>Maybe Router Link</b>
        <div>
          <code>&lt;router-link to="https://example.com"&gt;</code>
          <br>
          <router-link v-if="$router" to="https://example.com"></router-link> ❌
        </div>
        <div>
          <code>&lt;maybe-router-link to="https://example.com"&gt;</code>
          <br>
          <maybe-router-link to="https://example.com"></maybe-router-link> ✅
        </div>
        <!-- Custom -->
        <div>
          <code>&lt;router-link to="https://example.com" custom&gt;</code>
          <br>
          <router-link v-if="$router" to="https://example.com" custom>
            <template #default="{href}">
              <div>
                <b>href:</b> {{href}} ❌
              </div>
            </template>
          </router-link>
        </div>
        <div>
          <code>&lt;maybe-router-link to="https://example.com" custom&gt;</code>
          <br>
          <maybe-router-link to="https://example.com" custom>
            <template #default="{href}">
              <div>
                <b>href:</b> {{href}} ✅
              </div>
            </template>
          </maybe-router-link>
        </div>
      </div>
      <component is="style">
        a:after {
          content: attr(href);
          color: green;
          text-decoration: none;
        }
      </component>
    `
  })
}

/*
  Normally when using Vue Router's [Hash Mode](https://router.vuejs.org/api/#mode)
  it becomes impossible to use `<router-link>` to link to a non-routed path that
  excludes the `/#/` prefix.

  This is possible when using `<maybe-router-link>` by passing an object in the
  form of `{path: '/location', external: true}`.
*/
export const ForceInternalLinkTreatedAsExternal: Story = {
  render: () => ({
    components: { MaybeRouterLink },
    template: `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px 40px;">
        <b>Router Link</b>
        <b>Maybe Router Link</b>
        <div>
          <em>This feature is not supported in <code>&lt;router-link&gt;</code> and "external" is not a valid property.</em>
        </div>
        <div>
          <code>&lt;maybe-router-link :to="{path: '/Components', external: true}"&gt;</code>
          <br>
          <maybe-router-link :to="{path: '/Components', external: true}"></maybe-router-link> ✅
        </div>
      </div>
      <component is="style">
        a:after {
          content: attr(href);
          color: green;
          text-decoration: none;
        }
      </component>
    `
  })
}

/*
  By default, the component will wrap the default slot content with `tag` (which
  defaults to an `<a>`). In some scenarios this is undesirable and `custom` can be
  used to prevent this and instead expose the route state using the default scoped
  slot.
*/
export const CustomRendering: Story = {
  render: () => ({
    components: { MaybeRouterLink },
    template: `
      <maybe-router-link
        to="/Components"
        custom
      >
        <template #default="{href, isActive, isExactActive}">
          <div>
            Whatever content I like<br>
            isActive: {{isActive}}<br>
            isExactActive: {{isExactActive}}<br>
            <a :href="href">{{href}}</a>
          </div>
        </template>
      </maybe-router-link>
    `
  })
}

/*
  You need to use `@click` to attach click handlers.
*/
export const ClickEvents: Story = {
  render: () => ({
    components: { MaybeRouterLink },
    setup() {
      return {
        alert: alertModal
      }
    },
    template: `
      <div>
        <maybe-router-link
          to="/Components"
          @click="alert({
            title: 'Click!',
            content: 'You clicked a thingo!'
          })"
        >Click me please</maybe-router-link>
      </div>
    `
  })
}
