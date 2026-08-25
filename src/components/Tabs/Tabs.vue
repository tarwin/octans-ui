<script lang="ts" setup>
import { ActionList, type ActionListItemType } from '@/components/ActionList'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import debounce from 'lodash-es/debounce'
import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  useCssModule,
  useSlots,
  type PropType
} from 'vue'
import type { TabType, TabsProps } from './types'

// `indicator` deliberately has NO default: an unset prop means "whatever the
// theme says", and `withDefaults` would erase the difference between that and
// an instance that explicitly asked for an underline.
const props = withDefaults(defineProps<TabsProps>(), {
  tabs: () => []
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
const tabElements = ref<HTMLButtonElement[]>([])
const resizeObserver = ref<ResizeObserver | null>(null)

const truncatedTabs = computed(() => {
  return props.tabs.filter((tab) => truncatedTabMap.value[tab.value])
})

/**
 * What a tab renders inside its own button — the `tab` slot if the caller
 * supplied one, otherwise the label and its badge.
 *
 * Shared with the overflow menu on purpose. A tab that overflows keeps
 * whatever it was showing: previously the menu row was the bare label, so on a
 * narrow screen the badge or the custom content silently disappeared, which is
 * the moment the count usually matters most.
 */
function renderTabContent(tab: TabType) {
  if (slots.tab) return slots.tab({ tab })
  return [
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
      content: () => renderTabContent(tab),
      onAction: () => onChange(tab)
    }
    return action
  })
})

const hasSelectedTruncatedTab = computed(() => {
  return truncatedTabs.value.some((tab) => tab.value === props.selected)
})

const truncatedTabLabel = computed(() => {
  const selectedTab = props.tabs.find((tab) => tab.value === props.selected)
  return (hasSelectedTruncatedTab.value && selectedTab?.label) || ''
})

function onChange(tab: TabType) {
  if (tab.disabled) return
  /**
   * Emitted when the tab changes. The first argument is the tab ID and the
   * second argument is the selected tab object.
   */
  emit('update:selected', tab.value, tab)
}

function resizeTabs() {
  // A map of all tab IDs and whether they should be hidden
  const newTruncatedTabMap: Record<string, boolean> = {}
  const tabsContainerWidth = tabContainer.value?.getBoundingClientRect().width
  // Start with an initial width to compensate for the truncated button that
  // might need to be shown.
  let currentWidth = 150
  tabElements.value.forEach((tabEl, index) => {
    const tab = props.tabs[index]
    const width = tabEl.offsetWidth
    currentWidth += width
    newTruncatedTabMap[tab.value] = currentWidth >= (tabsContainerWidth || 0)
  })
  truncatedTabMap.value = newTruncatedTabMap
}

onMounted(() => {
  if (tabContainer.value) {
    resizeObserver.value = new ResizeObserver(
      debounce(resizeTabs, 100, {
        leading: true,
        trailing: true
      })
    )
    resizeObserver.value.observe(tabContainer.value)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
    resizeObserver.value = null
  }
})
</script>

<template>
  <div :class="['UIElement', $style.Tabs, indicatorClass]">
    <div
      :class="$style.Tab_container"
      ref="tabContainer"
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
        :items="truncatedTabActions"
        placement="bottom-end"
        :class="[
          $style.TruncatedTabsButton,
          hasSelectedTruncatedTab && $style.selected
        ]"
      >
        <Button
          type="link"
          :icon="truncatedTabLabel ? '' : 'mdi:dots-horizontal'"
          :dropdown="!!truncatedTabLabel"
        >
          {{ truncatedTabLabel }}
        </Button>
      </ActionList>
    </div>
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
  box-shadow: inset 0 -1px 0 var(--octans-border);
}

.Tab {
  appearance: none;
  // Anchors `.Tab_bar`, which is positioned against the whole tab rather than
  // the label, so the offset token can drop it onto the container's divider.
  position: relative;
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
