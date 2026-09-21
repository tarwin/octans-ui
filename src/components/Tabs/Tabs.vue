<script lang="ts" setup>
import { ActionList, type ActionListItemType } from '@/components/ActionList'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { ScrollPane } from '@/components/ScrollPane'
import debounce from 'lodash-es/debounce'
import {
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useCssModule,
  useSlots,
  watch,
  type PropType
} from 'vue'
import { overflowTabs } from './layout'
import type { TabType, TabsProps } from './types'

// `indicator` deliberately has NO default: an unset prop means "whatever the
// theme says", and `withDefaults` would erase the difference between that and
// an instance that explicitly asked for an underline.
const props = withDefaults(defineProps<TabsProps>(), {
  tabs: () => [],
  overflow: 'menu',
  scrollIndicators: true,
  menuContent: true
})

const emit = defineEmits<{
  (e: 'update:selected', value: string, tab: TabType): void
}>()

const slots = useSlots()
const $style = useCssModule()

/**
 * The indicator is drawn from four tokens, so the app-wide choice lives in the
 * theme. The prop is a named shortcut: each value is a class that overrides
 * those tokens on this instance only.
 */
const INDICATOR_CLASS = {
  underline: 'indicatorUnderline',
  bar: 'indicatorBar'
} as const

const indicatorClass = computed(() =>
  props.indicator ? $style[INDICATOR_CLASS[props.indicator]] : null
)

const truncatedTabMap = ref<Record<string, boolean>>({})
const tabContainer = ref<HTMLDivElement>()
// In scroll mode the strip sits in a ScrollPane, which owns the scrolling and
// the fades at either edge; otherwise this is the plain wrapper div.
const scrollPane = ref<InstanceType<typeof ScrollPane> | HTMLElement>()
const tabElements = ref<HTMLButtonElement[]>([])
// A component ref: the ActionList's root element is its `$el`.
const menuElement = ref<{ $el?: HTMLElement }>()
const resizeObserver = ref<ResizeObserver | null>(null)
/**
 * The height of a tab, held on the strip as a minimum: a tab in the menu is
 * taken out of the flow, so with every tab in there the strip would otherwise
 * shrink to the menu button and the content below it would jump up.
 */
const tabHeight = ref(0)

const selectedTab = computed(() =>
  props.tabs.find((tab) => tab.value === props.selected)
)

const truncatedTabs = computed(() => {
  return props.tabs.filter((tab) => truncatedTabMap.value[tab.value])
})

/**
 * What a tab renders inside its own button — the `tab` slot if the caller
 * supplied one, otherwise the icon, the label and its badge.
 *
 * Shared with the overflow menu on purpose. A tab that overflows keeps
 * whatever it was showing: previously the menu row was the bare label, so on a
 * narrow screen the badge or the custom content silently disappeared, which is
 * the moment the count usually matters most.
 */
function renderTabContent(tab: TabType) {
  if (slots.tab) return slots.tab({ tab })
  return [
    tab.icon ? h(Icon, { icon: tab.icon, class: $style.Tab_icon }) : null,
    tab.label,
    tab.badge
      ? h(
          Badge,
          {
            status: tab.badgeStatus,
            progress: tab.badgeProgress,
            class: $style.Tab_badge
          },
          () => tab.badge
        )
      : null
  ]
}

/**
 * `renderTabContent` as a component, so the template can use it too. Defined
 * once rather than inline in `:is`: a component created during render is a new
 * type every time, which remounts the whole tab body on each re-render.
 */
const TabContent = defineComponent({
  props: { tab: { type: Object as PropType<TabType>, required: true } },
  setup: (contentProps) => () => renderTabContent(contentProps.tab)
})

const truncatedTabActions = computed(() => {
  return truncatedTabs.value.map((tab) => {
    const action: ActionListItemType = {
      label: tab.label,
      icon: tab.value === props.selected ? 'mdi:check' : null,
      disabled: tab.disabled,
      content: props.menuContent ? () => renderTabContent(tab) : undefined,
      onAction: () => onChange(tab)
    }
    return action
  })
})

const hasSelectedTruncatedTab = computed(() => {
  return truncatedTabs.value.some((tab) => tab.value === props.selected)
})

function onChange(tab: TabType) {
  if (tab.disabled) return
  /**
   * Emitted when the tab changes. The first argument is the tab ID and the
   * second argument is the selected tab object.
   */
  emit('update:selected', tab.value, tab)
}

// ---- Overflow ---------------------------------------------------------------

// The menu button when there is nothing to measure: its padding, the link
// button's own, and a dots icon — or, standing in for the selected tab, that
// tab's width plus the caret.
const MENU_DOTS_WIDTH = 72
const MENU_LABEL_EXTRA = 44

function resizeTabs() {
  const container = tabContainer.value
  if (!container) return
  const widths = tabElements.value.map((el) => el.offsetWidth)
  tabHeight.value = Math.max(
    0,
    ...tabElements.value.map((el) => el.offsetHeight)
  )

  if (props.overflow === 'scroll') {
    truncatedTabMap.value = {}
    return
  }

  const selectedIndex = props.tabs.findIndex(
    (tab) => tab.value === props.selected
  )
  const menuWidth = (labelled: boolean) => {
    // Measured when it is on screen in the mode being asked about, estimated
    // otherwise.
    const measured = menuElement.value?.$el?.offsetWidth
    if (measured && labelled === hasSelectedTruncatedTab.value) return measured
    return labelled ? widths[selectedIndex] + MENU_LABEL_EXTRA : MENU_DOTS_WIDTH
  }

  const hidden = overflowTabs(
    widths,
    container.clientWidth,
    selectedIndex,
    menuWidth
  )
  const map: Record<string, boolean> = {}
  props.tabs.forEach((tab, index) => {
    map[tab.value] = hidden[index]
  })
  truncatedTabMap.value = map
}

/**
 * Lays the strip out twice: the first pass can only estimate the menu button
 * when it is not on screen yet (or is about to change from dots to the
 * selected tab), the second measures the one the first pass put there.
 */
async function layout() {
  resizeTabs()
  await nextTick()
  resizeTabs()
  scrollSelectedIntoView()
}

/**
 * In scroll mode, brings the selected tab into view — with room to spare, so
 * it is not left under the pane's edge fade.
 */
function scrollSelectedIntoView() {
  if (props.overflow !== 'scroll') return
  const pane = scrollPane.value
  const index = props.tabs.findIndex((tab) => tab.value === props.selected)
  const el = tabElements.value[index]
  if (!pane || !('scrollIntoView' in pane) || !el) return
  pane.scrollIntoView(el, { inline: 'nearest', offset: 24, behavior: 'smooth' })
}

onMounted(() => {
  if (tabContainer.value) {
    // Once by hand: a background tab gets no observer callbacks until it is
    // shown, and the strip should still be laid out when it is.
    layout()
    resizeObserver.value = new ResizeObserver(
      debounce(layout, 100, {
        leading: true,
        trailing: true
      })
    )
    resizeObserver.value.observe(tabContainer.value)
  }
})

// The tabs themselves and the selection both change what fits: a new tab
// list has new widths, and the menu button grows when the selected tab is in
// the menu.
watch(
  [() => props.tabs, () => props.selected, () => props.overflow],
  async () => {
    await nextTick()
    layout()
  },
  { deep: true }
)

onBeforeUnmount(() => {
  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
    resizeObserver.value = null
  }
})
</script>

<template>
  <div :class="['UIElement', $style.Tabs, indicatorClass]">
    <component
      :is="overflow === 'scroll' ? ScrollPane : 'div'"
      ref="scrollPane"
      v-bind="
        overflow === 'scroll'
          ? {
              direction: 'horizontal',
              indicators: scrollIndicators,
              containerClass: $style.Tab_scroller
            }
          : {}
      "
    >
      <div
        :class="[
          $style.Tab_container,
          overflow === 'scroll' && $style.Tab_container__scroll
        ]"
        ref="tabContainer"
        :style="{ minHeight: tabHeight ? `${tabHeight}px` : undefined }"
      >
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          :class="[
            $style.Tab,
            tab.disabled && $style.Tab__disabled,
            selected === tab.value && $style.Tab__selected
          ]"
          @click="onChange(tab)"
          @mouseup="($event.currentTarget as HTMLElement)?.blur()"
          ref="tabElements"
          :style="{
            visibility: truncatedTabMap[tab.value] ? 'hidden' : 'visible',
            position: truncatedTabMap[tab.value] ? 'absolute' : 'relative'
          }"
        >
          <div :class="$style.Tab_title">
            <TabContent :tab="tab" />
          </div>
          <div :class="$style.Tab_bar" />
        </button>
        <ActionList
          v-if="truncatedTabActions.length > 0"
          ref="menuElement"
          :items="truncatedTabActions"
          placement="bottom-end"
          :class="[
            $style.TruncatedTabsButton,
            hasSelectedTruncatedTab && $style.selected
          ]"
        >
          <Button
            type="link"
            :icon="hasSelectedTruncatedTab ? '' : 'mdi:dots-horizontal'"
            :dropdown="hasSelectedTruncatedTab"
          >
            <template v-if="hasSelectedTruncatedTab && selectedTab">
              <TabContent
                v-if="menuContent"
                :tab="selectedTab"
              />
              <template v-else>{{ selectedTab.label }}</template>
            </template>
          </Button>
        </ActionList>
      </div>
    </component>
  </div>
</template>

<style lang="scss" module>
@import '../../styles/variables';
$textColor: var(--octans-text);

/**
 * The two named indicators, as token overrides on one instance.
 *
 * `underline` restates the stylesheet's own defaults rather than setting
 * nothing: without that, `<Tabs indicator="underline">` could not opt out of a
 * theme that moved every Tabs to the bar. Keep the two in step with the
 * `--octans-tabs-*` block in `styles/tokens.scss`.
 */
.indicatorUnderline {
  --octans-tabs-indicator-height: 3px;
  --octans-tabs-indicator-radius: 0;
  --octans-tabs-indicator-offset: 0px;
  --octans-tabs-label-gap: 16px;
}

.indicatorBar {
  --octans-tabs-indicator-height: 5px;
  --octans-tabs-indicator-radius: var(--octans-radius-field);
  --octans-tabs-indicator-offset: -2px;
  --octans-tabs-label-gap: 8px;
}

.Tab_container {
  display: flex;
  // Anchors the tabs that are in the menu, which are absolutely positioned
  // so they keep a measurable width without taking up any room.
  position: relative;
  box-shadow: inset 0 -1px 0 var(--octans-border);
}

// Every tab stays in the strip and the ScrollPane around it scrolls, fading
// the edge there is more behind. No scrollbar: the selected tab is scrolled
// into view instead, and a bar under a row of tabs reads as part of them.
.Tab_scroller {
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}
// As wide as its tabs rather than the pane, so the divider runs under all of
// them and not just the ones in view.
.Tab_container__scroll {
  display: inline-flex;
  min-width: 100%;
}

.Tab {
  appearance: none;
  // Anchors `.Tab_bar`, which is positioned against the whole tab rather than
  // the label, so the offset token can drop it onto the container's divider.
  position: relative;
  // A flex item shrinks to fit by default, which in a scrolling strip would
  // squash the tabs rather than let the strip scroll.
  flex-shrink: 0;
  padding: 0;
  border: none;
  background: none;
  // Was `font-size: inherit`, which got the size but left the family at the
  // user agent's Arial — a `<button>` inherits neither on its own.
  font: inherit;

  &:active {
    outline: none;
  }

  &:focus {
    box-shadow:
      inset 0 0 2px 0 $focusColor,
      0 0 2px 0 $focusColor;
    outline: none;
  }

  &:not(.Tab__disabled):hover .Tab_title {
    color: var(--octans-text);
  }
}

/**
 * The mark itself — one element for both indicators, shaped by the tokens.
 * It replaced a `border-bottom` on the label, which could not be rounded or
 * moved off the label's own box.
 */
.Tab_bar {
  display: none;
  position: absolute;
  bottom: var(--octans-tabs-indicator-offset);
  width: 100%;
  height: var(--octans-tabs-indicator-height);
  background: var(--octans-primary);
  border-radius: var(--octans-tabs-indicator-radius);
}

// Hover previews the mark in the divider colour. Excluding the selected tab
// keeps this from outranking the rule below on a hovered selected tab.
.Tab:not(.Tab__disabled):not(.Tab__selected):hover .Tab_bar {
  display: block;
  background: var(--octans-border);
}

.Tab__selected {
  .Tab_bar {
    display: block;
  }
  .Tab_title {
    color: var(--octans-text);
    cursor: default;
  }
}

.Tab__disabled {
  opacity: 0.5;
  cursor: not-allowed;

  .Tab_title {
    cursor: not-allowed;
  }
}

.Tab_title {
  display: block;
  padding: 16px 16px var(--octans-tabs-label-gap);
  color: var(--octans-text-subdued);
  line-height: 20px;
  white-space: nowrap;
  cursor: pointer;
}

.Tab_icon {
  margin-right: 6px;
  vertical-align: -0.15em;
}

.Tab_badge {
  position: relative;
  top: -1px;
  margin-left: 5px;
  line-height: 15px;
}

.TruncatedTabsButton {
  display: flex;
  align-items: center;
  position: relative;
  flex-shrink: 0;
  margin-left: auto;
  padding: 0 16px;

  // Stands in for the selected tab's own mark while that tab is in the menu,
  // so it has to be drawn from the same tokens.
  &.selected::after {
    content: '';
    position: absolute;
    right: 0;
    bottom: var(--octans-tabs-indicator-offset);
    left: 0;
    height: var(--octans-tabs-indicator-height);
    background: var(--octans-primary);
    border-radius: var(--octans-tabs-indicator-radius);
  }
}
</style>
