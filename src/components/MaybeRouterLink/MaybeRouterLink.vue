<script lang="ts" setup>
import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  ref,
  useAttrs
} from 'vue'
import type { MaybeRouterLinkProps } from './types'

const props = withDefaults(defineProps<MaybeRouterLinkProps>(), {
  tag: 'a',
  custom: false,
  exactPath: true,
  plain: false,
  matchRoutes: true
})

// TODO: is this needed?
let didInitHistoryHooks = false
const instance = getCurrentInstance()

const attrs = useAttrs()
// Read the router and RouterLink off the app context rather than importing
// them. vue-router is an optional peer dependency, so a static import would
// make the whole bundle fail to load for consumers who don't install it.
// Both are absent without a router, which is exactly the fallback path this
// component already handles.
//
// NOTE: `<RouterLink>` must NOT be referenced by name in the template. Vue
// hoists `resolveComponent('RouterLink')` above the `v-if`, so it would warn
// "Failed to resolve component" on every render in a router-less app even
// though the branch never runs.
const $router = (
  instance?.appContext.config.globalProperties as
    { $router?: unknown } | undefined
)?.$router
const routerLink = computed(
  () => instance?.appContext.components?.['RouterLink']
)
const onHistoryChange = ref<() => void>()

defineOptions({
  inheritAttrs: false
})

type HistoryHandlerFn = typeof history.pushState // same as replaceState
function wrapHandler(
  handler: HistoryHandlerFn,
  type: 'ui-history-change'
): HistoryHandlerFn {
  return function (...args) {
    const result = handler(...args)
    window.dispatchEvent(new Event(type))
    return result
  }
}

function initHistoryHooks() {
  if (!didInitHistoryHooks) {
    didInitHistoryHooks = true
    history.pushState = wrapHandler(history.pushState, 'ui-history-change')
    history.replaceState = wrapHandler(
      history.replaceState,
      'ui-history-change'
    )
  }
}

function $forceUpdate() {
  instance?.proxy?.$forceUpdate()
}

const isExternal = computed(() => {
  const url = props.to
  if (typeof url === 'string') {
    return new URL(url, location.href).origin !== location.origin
  }
  if (url && typeof url === 'object') {
    // Allow forcing as an external url
    return !!url.external
  }
  return false
})

const passthroughAttrs = computed(() => {
  return attrs
})

const slotProps = computed(() => {
  const slotProps: {
    href?: string
    isActive: boolean
    isExactActive: boolean
  } = {
    isActive: false,
    isExactActive: false
  }
  const path =
    typeof props.to === 'string' ? props.to : props.to && props.to.path
  if (props.to && !path) {
    throw new Error(
      `<maybe-router-link with to='${JSON.stringify(
        props.to
      )}' requires a string or {"path": string} value for "to" when "matchRoutes" is false OR when NOT using VueRouter.`
    )
  }
  if (path) {
    const url = new URL(path, location.href)
    slotProps.href = url.href
    if (props.matchRoutes) {
      slotProps.isActive =
        !isExternal.value && location.pathname.startsWith(url.pathname)
      slotProps.isExactActive =
        !isExternal.value && location.pathname === url.pathname
    }
  }
  return slotProps
})

if (!$router) {
  initHistoryHooks()
  onHistoryChange.value = () => $forceUpdate()
  window.addEventListener('ui-history-change', onHistoryChange.value)
}
onBeforeUnmount(() => {
  if (onHistoryChange.value) {
    window.removeEventListener('ui-history-change', onHistoryChange.value)
    onHistoryChange.value = undefined
  }
})
</script>

<template>
  <template v-if="matchRoutes && !isExternal && $router && routerLink && to">
    <component
      :is="routerLink"
      v-if="custom"
      :to="to"
      custom
    >
      <template #default="props">
        <slot v-bind="props"></slot>
      </template>
    </component>
    <component
      :is="routerLink"
      v-else
      v-bind="passthroughAttrs"
      :to="to"
      :class="['UIElement', plain && $style.plain]"
    >
      <template #default="props">
        <slot v-bind="props"></slot>
      </template>
    </component>
  </template>
  <slot
    v-else-if="custom"
    v-bind="slotProps"
  ></slot>
  <component
    v-else
    :is="tag"
    v-bind="passthroughAttrs"
    :class="['UIElement', plain && $style.plain]"
    :href="tag === 'a' ? slotProps.href : undefined"
  >
    <slot v-bind="slotProps"></slot>
  </component>
</template>

<style lang="scss" module>
.plain {
  color: inherit;
  text-decoration: none;
}
</style>
