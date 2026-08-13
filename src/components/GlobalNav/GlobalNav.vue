<script lang="ts" setup>
import { useAppFrameLayout } from '@/components/AppFrame/context'
import { Icon } from '@/components/Icon'
import { LoadingBar } from '@/components/LoadingBar'
import { SaveBar, saveBar } from '@/components/SaveBar'
import { computed, watch } from 'vue'
import type {
  GlobalNavPrefixTitleActionType,
  GlobalNavProps,
  GlobalNavThemeType
} from './types'

// Scoped to the component root via `:style`, not written onto `<html>` as
// they once were — that made the colours page-global (two navs fought over
// them) and survived unmount. `SaveBar` sits inside the root, so it still
// inherits everything it needs.
//
// `dark` is the app bar's own chrome — `--octans-surface-nav` — independent
// of the app theme, the way an admin bar stays dark over a light app.
// `light` follows the app surface instead.
const themes: Record<GlobalNavThemeType, Record<string, string>> = {
  dark: {
    '--ui-globalNav-color': 'var(--octans-text-on-nav)',
    '--ui-globalNav-bgColor': 'var(--octans-surface-nav)',
    '--ui-globalNav-hoverBgColor': 'rgba(255, 255, 255, 0.3)'
  },
  light: {
    '--ui-globalNav-color': 'var(--octans-text)',
    '--ui-globalNav-bgColor': 'var(--octans-surface)',
    '--ui-globalNav-hoverBgColor': 'rgba(0, 0, 0, 0.1)'
  }
}

const props = withDefaults(defineProps<GlobalNavProps>(), {
  saveBarState: 'unchanged',
  logo: true,
  theme: 'dark',
  layoutMode: undefined,
  prefixTitleSeparator: true,
  saveBarConfirmDiscard: true
})

// NOTE: `click-title` is deliberately NOT declared as an emit. It collides with
// the `onClickTitle` prop (Vue can't tell `onClickTitle` and `@click-title`
// apart), and a declared emit makes Vue's optimized prop-update path skip the
// key forever — so `props.onClickTitle` would stay stuck at its mount value in
// production builds and the title would never pick up its button styling.
// `@click-title` still works: it compiles to the `onClickTitle` prop.
const emit = defineEmits<{
  (e: 'save'): void
  (e: 'discard'): void
}>()

// Inside an `AppFrame`, the layout comes from its context — the prop remains
// as a standalone-use override.
const frame = useAppFrameLayout()
const effectiveLayoutMode = computed(
  () =>
    props.layoutMode ??
    (frame && frame.layout !== 'topbar' ? 'alternate' : 'default')
)
const showHamburger = computed(
  () => !!frame && frame.narrow && frame.hasSidebar
)
// With `sidebarCollapse: 'hide'` on the frame, the sidebar's show/hide
// control lives here in the bar. Hovering it while the sidebar is hidden
// peeks it as an overlay.
const showSidebarToggle = computed(
  () =>
    !!frame &&
    frame.hasSidebar &&
    frame.sidebarCollapse === 'hide' &&
    !frame.narrow
)

function onToggleSidebar() {
  if (!frame) return
  frame.setPeek(false)
  frame.setSidebarMin(!frame.sidebarMin)
}

const prefixTitleActions = computed<GlobalNavPrefixTitleActionType[]>(
  () => props.prefixTitleActions || []
)
const hasPrefixTitleActions = computed(
  () => prefixTitleActions.value.length > 0
)
const showSaveBar = computed(() => saveBar.state !== 'unchanged')
const hasClickTitleListener = computed(() => !!props.onClickTitle)

const themeStyle = computed(() => ({
  ...themes[props.theme],
  '--ui-globalNav-height': '40px'
}))

function onClickTitle() {
  // `props.onClickTitle` is what `@click-title` compiles to, so this covers
  // both the listener and the explicit prop.
  props.onClickTitle?.()
}

watch(
  () => props.saveBarState,
  (value) => {
    if (value) {
      saveBar.setState(value)
    }
  },
  { immediate: true }
)
</script>

<template>
  <div
    :class="['UIElement', $style.GlobalNav, showSaveBar && $style.hasSaveBar]"
    :style="themeStyle"
    :data-theme="theme"
  >
    <SaveBar
      :translations="saveBarTranslations || {}"
      :layoutMode="effectiveLayoutMode"
      :confirmDiscard="saveBarConfirmDiscard"
      @save="emit('save')"
      @discard="emit('discard')"
    ></SaveBar>
    <div :class="$style.GlobalNav_bar">
      <!-- The way into the sidebar drawer on narrow viewports. -->
      <button
        v-if="showHamburger"
        :class="$style.Hamburger"
        type="button"
        aria-label="Menu"
        @click="frame?.toggleDrawer()"
      >
        <Icon icon="mdi:menu" />
      </button>
      <!--
        Shows/hides the sidebar when the frame collapses by hiding. Hovering
        while hidden peeks the sidebar without committing to it.
      -->
      <button
        v-if="showSidebarToggle"
        :class="$style.Hamburger"
        type="button"
        :aria-label="frame?.sidebarMin ? 'Expand sidebar' : 'Collapse sidebar'"
        :data-ui-tooltip="
          frame?.sidebarMin ? 'Expand sidebar' : 'Collapse sidebar'
        "
        data-ui-tooltip-position="bottom"
        @click="onToggleSidebar"
        @mouseenter="frame?.sidebarMin && frame?.setPeek(true)"
        @mouseleave="frame?.setPeek(false)"
      >
        <Icon :icon="frame?.sidebarMin ? 'mdi:menu-open' : 'mdi:menu-close'" />
      </button>
      <!-- Supply your own brand mark. -->
      <slot
        v-if="logo"
        name="logo"
      ></slot>
      <div
        v-if="hasPrefixTitleActions || title"
        :class="[$style.TitleWrapper, logo && $style.TitleWrapper__withLogo]"
      >
        <template v-if="hasPrefixTitleActions">
          <template
            v-for="(action, index) in prefixTitleActions"
            :key="`action-${index}`"
          >
            <div
              :class="[$style.Title, $style.Title__button]"
              @click="() => action.onAction?.()"
            >
              <Icon
                v-if="action.icon"
                :icon="action.icon"
                :class="[
                  $style.Title__icon,
                  action.label && $style.Title__icon__withLabel
                ]"
              />
              {{ action.label }}
            </div>
            <div
              v-if="
                prefixTitleSeparator &&
                (index < prefixTitleActions.length - 1 || title)
              "
              :key="`sep-${index}`"
              style="display: flex"
            >
              <div :class="$style.TitleSeparator" />
            </div>
          </template>
        </template>
        <div
          v-if="title"
          :class="[$style.Title, hasClickTitleListener && $style.Title__button]"
          @click="onClickTitle"
        >
          {{ title }}
        </div>
      </div>

      <!-- Free-form area in the middle of the bar, e.g. a search field. -->
      <div :class="$style.Center">
        <slot name="center"></slot>
      </div>

      <!--
        Right-hand side of the bar. Put your own account menu, notifications,
        locale switcher or anything else here.
      -->
      <div :class="$style.Right">
        <slot name="actions"></slot>
        <slot></slot>
      </div>
    </div>
    <LoadingBar />
  </div>
</template>

<style lang="scss" module>
@import '@/styles/variables';
@import '@/styles/mixins';
@import './common.module.scss';

.GlobalNav {
  --gNav-defaultTextColor: var(--octans-text);
  position: relative;
}

.GlobalNav_bar {
  display: flex;
  align-items: center;
  height: var(--ui-globalNav-height);
  padding: 0 10px;
  background: var(--ui-globalNav-bgColor);
  color: var(--ui-globalNav-color);
}

.TitleWrapper {
  display: flex;
  align-items: center;
}
.TitleWrapper__withLogo {
  margin-left: 10px;
}
.Title {
  font-weight: bold;
  font-size: 16px;
}
.Title__button {
  @include navButtonBase;
}
.Hamburger {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
  padding: 4px 6px;
  border: none;
  border-radius: var(--octans-radius-field);
  background: transparent;
  color: inherit;
  font-size: 18px;
  &:hover {
    cursor: pointer;
    background: var(--ui-globalNav-hoverBgColor);
  }
}
.Title__icon__withLabel {
  margin-right: 8px;
}
.TitleSeparator {
  width: 1px;
  height: 16px;
  margin: 0 2px;
  background: var(--ui-globalNav-color);
  opacity: 0.7;
  align-self: center;
}

.Center {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
  min-width: 0;
}

.Right {
  display: flex;
  align-items: center;
  margin-left: auto;
}

// While the save bar covers the nav, the bar's normal colour would vanish
// against it — `LoadingBar` reads this hook.
.hasSaveBar {
  --ui-loadingBar-color: var(--octans-primary-active);
}
</style>
