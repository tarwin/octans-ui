<script lang="ts" setup>
import { Icon } from '@/components/Icon'
import { LoaderOverlay } from '@/components/LoaderOverlay'
import { LoadingBar } from '@/components/LoadingBar'
import { SaveBar } from '@/components/SaveBar'
import { ScrollPane } from '@/components/ScrollPane'
import { UiProvider } from '@/components/UiProvider'
import { hasSlotContent } from '@/utils'
import {
  computed,
  mergeProps,
  onBeforeUnmount,
  provide,
  reactive,
  ref,
  useAttrs,
  useCssModule,
  useSlots,
  watch
} from 'vue'
import { appFrameLayoutKey, type AppFrameLayoutContextType } from './context'
import type { AppFrameProps } from './types'

const props = withDefaults(defineProps<AppFrameProps>(), {
  loading: false,
  layout: undefined,
  layoutMode: undefined,
  sidebarMin: undefined,
  sidebarCollapse: 'rail'
})

defineOptions({
  inheritAttrs: false
})

const _attrs = useAttrs()
const style = useCssModule()
const slots = useSlots()

const layout = computed(
  () =>
    props.layout ?? (props.layoutMode === 'alternate' ? 'sidebar' : 'topbar')
)
const hasSidebar = computed(() => hasSlotContent(slots.sidebar))
const hasTopbar = computed(
  () => layout.value !== 'sidebarOnly' && hasSlotContent(slots.topbar)
)

// The rail state lives here — the frame owns the column width — but it can be
// driven from two sides: the `sidebarMin` prop, and `Navigation`'s minimize
// chevron through the layout context.
const sidebarMin = ref(props.sidebarMin ?? false)
watch(
  () => props.sidebarMin,
  (value) => {
    if (value !== undefined) sidebarMin.value = value
  }
)

// Below the breakpoint the sidebar column collapses and the same content
// renders as an overlay drawer instead — opened from `GlobalNav`'s hamburger
// (or the floating one, when there is no bar).
const narrow = ref(false)
const drawerOpen = ref(false)

function toggleDrawer(open?: boolean) {
  drawerOpen.value = open ?? !drawerOpen.value
}

// With `sidebarCollapse: 'hide'`, collapsed means gone — and hovering the
// GlobalNav toggle "peeks" the hidden sidebar as an overlay.
// The close is debounced so the pointer can travel from the toggle into the
// peeked sidebar without it vanishing underway.
const hidden = computed(
  () => props.sidebarCollapse === 'hide' && sidebarMin.value && !narrow.value
)
const peekOpen = ref(false)
let peekTimer: ReturnType<typeof setTimeout> | null = null

function setPeek(value: boolean) {
  if (peekTimer) {
    clearTimeout(peekTimer)
    peekTimer = null
  }
  if (value) {
    peekOpen.value = true
  } else {
    peekTimer = setTimeout(() => {
      peekOpen.value = false
    }, 150)
  }
}
watch(hidden, (value) => {
  if (!value) peekOpen.value = false
})

function onMediaChange(event: MediaQueryListEvent | MediaQueryList) {
  narrow.value = event.matches
  if (!event.matches) drawerOpen.value = false
}

let media: MediaQueryList | null = null
// The function check also covers jsdom, which has a window but no matchMedia.
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  // $breakpointMd (768px) — below it the sidebar becomes a drawer.
  media = window.matchMedia('(max-width: 767px)')
  onMediaChange(media)
  media.addEventListener('change', onMediaChange)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') toggleDrawer(false)
}
watch(drawerOpen, (open) => {
  if (typeof window === 'undefined') return
  if (open) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  media?.removeEventListener('change', onMediaChange)
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', onKeydown)
  }
  if (peekTimer) clearTimeout(peekTimer)
})

provide(
  appFrameLayoutKey,
  reactive({
    layout,
    sidebarMin,
    setSidebarMin: (value: boolean) => {
      sidebarMin.value = value
    },
    sidebarCollapse: computed(() => props.sidebarCollapse),
    peek: peekOpen,
    setPeek,
    narrow,
    drawerOpen,
    toggleDrawer,
    hasSidebar
  }) as AppFrameLayoutContextType
)

const attrs = computed(() => {
  return mergeProps(_attrs, {
    class: [
      'UIElement',
      style.AppFrame,
      layout.value === 'topbar' && style.Layout__topbar,
      layout.value === 'sidebar' && style.Layout__sidebar,
      layout.value === 'sidebarOnly' && style.Layout__sidebarOnly,
      hasSidebar.value && style.HasSidebar,
      sidebarMin.value && style.Min,
      hidden.value && style.Hidden,
      narrow.value && style.Narrow
    ]
  })
})
</script>

<template>
  <UiProvider>
    <div
      v-bind="attrs"
      data-app-frame
    >
      <!--
        A plain div rather than a ScrollPane: `Navigation` manages its own
        scrolling now (that is what pins its footer), and for anything else
        the `overflow-y: auto` here still scrolls.
      -->
      <div
        v-if="hasSidebar"
        :class="[
          $style.SideBar,
          (narrow || hidden) && $style.SideBar__drawer,
          ((narrow && drawerOpen) || (hidden && peekOpen)) &&
            $style.SideBar__drawerOpen
        ]"
        @mouseenter="hidden && peekOpen && setPeek(true)"
        @mouseleave="hidden && setPeek(false)"
      >
        <slot name="sidebar"></slot>
      </div>
      <div
        v-if="narrow && drawerOpen"
        :class="$style.Backdrop"
        @click="toggleDrawer(false)"
      ></div>

      <div
        v-if="hasTopbar"
        :class="$style.TopBar"
        data-app-frame-global-nav
      >
        <slot name="topbar"></slot>
      </div>
      <div :class="$style.Content">
        <!--
          Covers the content area only, leaving the nav usable. `$ui.loader`
          shows the same overlay; this one being mounted is also what stops a
          second, full-viewport overlay from auto-mounting.
        -->
        <LoaderOverlay :visible="loading" />
        <!--
          With no bar to host them, the save bar and the loading bar sit at
          the top of the content area instead. `alternate` zeroes the save
          bar's sidebar offset — the content area already starts right of the
          sidebar.
        -->
        <template v-if="layout === 'sidebarOnly'">
          <SaveBar layoutMode="alternate" />
          <LoadingBar />
          <button
            v-if="narrow"
            :class="$style.DrawerButton"
            type="button"
            aria-label="Menu"
            @click="toggleDrawer()"
          >
            <Icon icon="mdi:menu" />
          </button>
        </template>
        <ScrollPane
          :class="$style.Main"
          :container-style="{
            display: 'flex'
          }"
        >
          <div :class="$style.Main_content">
            <slot></slot>
          </div>
          <div
            v-if="$slots.footer"
            :class="$style.Footer"
          >
            <slot name="footer"></slot>
          </div>
        </ScrollPane>
      </div>
    </div>
  </UiProvider>
</template>

<style lang="scss" module>
@import '@/styles/variables';
@import '@/styles/mixins';

.AppFrame {
  --octans-page-padding-x: var(--octans-appframe-page-padding-x);

  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  overflow: hidden;
  background: var(--octans-surface-app);

  &.HasSidebar {
    --ui-sideNav-width: 240px;
  }
  &.Min {
    --ui-sideNav-width: 64px;
  }
  // The column collapses; the sidebar renders as a drawer instead.
  &.Narrow {
    --ui-sideNav-width: 0px;
  }
  // `sidebarCollapse: 'hide'` + collapsed: the sidebar is gone entirely,
  // available as a hover-peek overlay from the GlobalNav toggle.
  &.Hidden {
    --ui-sideNav-width: 0px;
  }
}

// `topbar`: the bar spans the full width, the sidebar sits under it.
.Layout__topbar {
  .TopBar {
    grid-area: 1 / 1 / 2 / 3;
  }
  .SideBar {
    grid-area: 2 / 1 / 3 / 2;
  }
  .Content {
    grid-area: 2 / 2 / 3 / 3;
  }
}

// `sidebar` and `sidebarOnly`: the sidebar owns the full height; the bar —
// when there is one — starts to its right.
.Layout__sidebar,
.Layout__sidebarOnly {
  .SideBar {
    grid-area: 1 / 1 / 3 / 2;
  }
  .TopBar {
    grid-area: 1 / 2 / 2 / 3;
  }
  .Content {
    grid-area: 2 / 2 / 3 / 3;
  }
}
.Layout__sidebarOnly .Content {
  grid-area: 1 / 2 / 3 / 3;
}

.TopBar {
  position: relative;
  box-shadow: var(--octans-shadow-sm);
}

.Content {
  position: relative;
  display: flex;
  flex: 1;
  overflow: hidden;
}

.SideBar {
  border-right: 1px solid var(--octans-border);
  overflow-x: hidden;
  overflow-y: auto;
  width: var(--ui-sideNav-width);
  transition: width 0.2s ease-in-out;

  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: none;
  }
  ::-webkit-scrollbar-thumb {
    background: var(--octans-scrollbar-thumb);
    border-radius: var(--octans-radius-field);
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--octans-scrollbar-thumb-hover);
  }

  &.Min {
    ::-webkit-scrollbar {
      width: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      border-right: none;
    }
  }
}

// The drawer form of the same sidebar: fixed over the page, slid in and out.
// `position: fixed` also takes it out of the grid, which is what lets the
// column collapse to nothing underneath it.
.SideBar__drawer {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1200;
  width: var(--ui-sideNav-maxWidth, 240px);
  background: var(--octans-surface-app);
  border-right: 1px solid var(--octans-border);
  transform: translateX(-100%);
  transition: transform 0.2s ease-in-out;
}
.SideBar__drawerOpen {
  transform: translateX(0);
  box-shadow: var(--octans-shadow-md);
}

.Backdrop {
  position: fixed;
  inset: 0;
  z-index: 1199;
  background: var(--octans-overlay);
}

// The way into the drawer when there is no bar to hold a hamburger.
.DrawerButton {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--octans-border);
  border-radius: var(--octans-radius-field);
  background: var(--octans-surface);
  color: var(--octans-text);
  box-shadow: var(--octans-shadow-sm);
  font-size: 18px;
  &:hover {
    cursor: pointer;
    background: var(--octans-surface-hover);
  }
}

.Main {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}
.Main_content {
  flex: 1;
  max-width: calc(100vw - var(--ui-sideNav-width));
}

.Footer {
  // overflow: hidden;
}
</style>
