<script setup lang="ts">
import { type VNodeChild } from 'vue'
import { type PopoverPlacementType } from '../Popover'
import { type ActionTooltipPositionType } from '../types'
import Popover from '../Popover/Popover.vue'
import ActionListMenu from './ActionListMenu.vue'

export interface ActionListProps {
  /**
   * A single list of actions to render.
   */
  items?: ActionListItemType[]
  /**
   * Groups of actions to render.
   */
  sections?: ActionListSectionType[]
  placement?: PopoverPlacementType
  disabled?: boolean
  /**
   * Custom z-index for the popover.
   */
  zIndex?: number
  /**
   * Open sub-menus on hover instead of click. Propagates to all nested levels.
   */
  autoOpen?: boolean
  /**
   * Internal: makes this list's own trigger open on hover. Set by the parent
   * menu when `autoOpen` is enabled; not meant to be set directly.
   */
  hoverTrigger?: boolean
}

export interface ActionListItemType {
  label: string
  // See `Icon` component.
  icon?: string | null
  /**
   * Secondary text shown beneath the label.
   */
  helpText?: string
  /**
   * Renders the row's body in place of `label` (and `helpText`), for items
   * that are more than text — a label with a Badge beside it, say. `label` is
   * still required: it stays the item's accessible, sortable name, and is what
   * a consumer reading the items back gets.
   */
  content?: () => VNodeChild
  disabled?: boolean
  url?: string
  external?: boolean
  /**
   * Tooltip to show when hovering the item.
   */
  tooltip?: string
  /**
   * Tooltip position, "top", "bottom", "right" or "left".
   */
  tooltipPosition?: ActionTooltipPositionType
  onAction?(): void
  items?: ActionListItemType[]
  sections?: ActionListSectionType[]
}

export interface ActionListSectionType {
  items: ActionListItemType[]
  title?: string
}

withDefaults(defineProps<ActionListProps>(), {
  items: () => [],
  placement: 'bottom-start'
})

const emit = defineEmits<{
  (e: 'show'): void
  (e: 'hide'): void
  /**
   * An action was selected somewhere in this (sub) menu, so the whole chain
   * should close. Distinct from `hide`, which only reflects this popover's own
   * open/closed state and must NOT collapse parent menus.
   */
  (e: 'close'): void
}>()

function handleClose(hide: () => void) {
  // Hide our own popover
  hide()
  // Bubble up so ancestor menus close too (an action was selected)
  emit('close')
}

function onUpdateVisible(isVisible: boolean) {
  if (isVisible) {
    emit('show')
  } else {
    emit('hide')
  }
}
</script>

<template>
  <Popover
    v-if="$slots.default"
    auto-hide
    :auto-trigger-toggle="!hoverTrigger"
    :hover="hoverTrigger"
    :placement="placement"
    :z-index="zIndex"
    @update:visible="onUpdateVisible"
  >
    <template #default="{ hide }">
      <ActionListMenu
        :items="items"
        :sections="sections"
        :auto-open="autoOpen"
        @close="handleClose(hide)"
      />
    </template>
    <template #trigger>
      <slot></slot>
    </template>
  </Popover>
  <ActionListMenu
    v-else
    :items="items"
    :sections="sections"
    :auto-open="autoOpen"
    @close="emit('close')"
  />
</template>
