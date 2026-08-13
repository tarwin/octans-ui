<script lang="ts" setup>
import { ActionList, type ActionListItemType } from '@/components/ActionList'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import debounce from 'lodash-es/debounce'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { TabType, TabsProps } from './types'

const props = withDefaults(defineProps<TabsProps>(), {
  theme: 'blue',
  tabs: () => []
})

const emit = defineEmits<{
  (e: 'update:selected', value: string, tab: TabType): void
}>()

const truncatedTabMap = ref<Record<string, boolean>>({})
const tabContainer = ref<HTMLDivElement>()
const tabElements = ref<HTMLButtonElement[]>([])
const resizeObserver = ref<ResizeObserver | null>(null)

const truncatedTabs = computed(() => {
  return props.tabs.filter((tab) => truncatedTabMap.value[tab.value])
})

const truncatedTabActions = computed(() => {
  return truncatedTabs.value.map((tab) => {
    const action: ActionListItemType = {
      label: tab.label,
      icon: tab.value === props.selected ? 'mdi:check' : null,
      disabled: tab.disabled,
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
  <div :class="['UIElement', $style.Tabs, theme === 'purple' && $style.Purple]">
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
          <slot
            name="tab"
            :tab="tab"
          >
            {{ tab.label }}
            <Badge
              v-if="tab.badge"
              :status="tab.badgeStatus"
              :progress="tab.badgeProgress"
              :class="$style.Tab_badge"
            >
              {{ tab.badge }}
            </Badge>
          </slot>
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

.Purple {
  .Tab_container {
    box-shadow: inset 0 -1px 0 var(--octans-border);
  }
  .Tab {
    position: relative;
  }
  .Tab:not(.Tab__disabled) {
    &:focus {
      box-shadow:
        inset 0 0 1px 0 var(--octans-primary),
        0 0 1px 0 var(--octans-primary);
    }
    &:hover .Tab_title {
      border-color: transparent;
      color: var(--octans-text-primary);
    }
  }
  .Tab_title {
    // border-bottom: 3px solid transparent;
    color: var(--octans-text-subdued);
    padding: 16px 16px 8px;
  }
  .Tab_bar {
    position: absolute;
    bottom: -2px;
    width: 100%;
    height: 5px;
    background: var(--octans-primary);
    border-radius: var(--octans-radius-field);
  }
  .Tab__selected,
  .Tab__selected:hover {
    .Tab_title {
      border-color: transparent;
      color: var(--octans-text-primary);
      cursor: default;
    }
    .Tab_bar {
      display: block;
    }
  }
  .TruncatedTabsButton {
    button {
      color: var(--octans-text-subdued);
      &:hover {
        color: var(--octans-text-primary);
      }
    }
    &.selected {
      .Tab_bar {
        display: block;
      }
      button {
        color: var(--octans-text-primary);
      }
      border-color: var(--octans-primary);
    }
  }
}

.Tab_container {
  display: flex;
  box-shadow: inset 0 -1px 0 var(--octans-border);
}
.Tab_bar {
  display: none;
}

.Tab {
  appearance: none;
  padding: 0;
  border: none;
  background: none;
  font-size: inherit;

  &:active {
    outline: none;
  }

  &:focus {
    box-shadow:
      inset 0 0 2px 0 $focusColor,
      0 0 2px 0 $focusColor;
    outline: none;
  }

  &:hover .Tab_title {
    border-color: var(--octans-border);
    color: var(--octans-text);
  }
}

.Tab__disabled {
  opacity: 0.5;
  cursor: not-allowed;

  .Tab_title {
    cursor: not-allowed;
  }

  &:hover .Tab_title {
    border-color: transparent;
    color: var(--octans-text-subdued);
  }
}

.Tab_title {
  display: block;
  padding: 16px 16px 13px;
  border-bottom: 3px solid transparent;
  color: var(--octans-text-subdued);
  line-height: 20px;
  white-space: nowrap;
  cursor: pointer;

  .Tab__selected &,
  .Tab__selected:hover & {
    border-color: $focusColor;
    color: var(--octans-text);
    cursor: default;
  }
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
  margin-left: auto;
  padding: 0 16px;
  border-bottom: 3px solid transparent;
  &.selected {
    border-color: $focusColor;
  }
}
</style>
