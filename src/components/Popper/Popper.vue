<script lang="ts" setup>
import { getRadixPopperPlacement } from '@/utils/radix'
import {
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger
} from 'reka-ui'
import { computed, inject, onBeforeUnmount, provide, ref, watch } from 'vue'
import type { PopperProps } from './types'

const props = withDefaults(defineProps<PopperProps>(), {
  placement: 'bottom',
  teleportTo: 'body',
  disabled: false,
  autoTriggerToggle: true,
  autoHide: false,
  hover: false,
  zIndex: 10000
})

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

const isVisible = ref(false)
const trigger = ref()

const alignment = computed(() => {
  return getRadixPopperPlacement(props.placement)
})

const slotProps = computed(() => {
  return {
    visible: isVisible.value,
    show,
    hide,
    toggle
  }
})

function handleTriggerClick() {
  if (!props.autoTriggerToggle) {
    return
  }
  toggle()
}

/**
 * Hover handling for cascading sub-menus.
 *
 * Each popper provides a `keepOpen` callback to its descendants and injects
 * its own parent's. Pointer entering any part of the popper (or any descendant
 * popper) calls `keepOpen`, which cancels the pending close timer on this
 * popper AND walks up the chain so ancestors stay open while the pointer is
 * deep inside a sub-menu. Leaving schedules a delayed close so the pointer has
 * time to travel across the gap between trigger and (teleported) content.
 */
const CLOSE_DELAY = 150
const parentKeepOpen = inject<() => void>('popperKeepOpen', () => {})
let closeTimer: ReturnType<typeof setTimeout> | undefined

function clearCloseTimer() {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = undefined
  }
}
function keepOpen() {
  clearCloseTimer()
  parentKeepOpen()
}
provide('popperKeepOpen', keepOpen)

function handlePointerEnter() {
  if (!props.hover) return
  keepOpen()
  show()
}
function handlePointerLeave() {
  if (!props.hover) return
  clearCloseTimer()
  closeTimer = setTimeout(hide, CLOSE_DELAY)
}

onBeforeUnmount(clearCloseTimer)

function show() {
  setVisible(true)
}
function hide() {
  setVisible(false)
}
function toggle() {
  setVisible(!isVisible.value)
}

function setVisible(value: boolean) {
  if (props.disabled) return
  // Avoid emitting when nothing actually changed. The `visible` watcher below
  // runs immediately on mount and would otherwise emit `update:visible(false)`,
  // which propagates up as a spurious `hide` and collapses a parent ActionList
  // sub-menu the moment it opens.
  if (isVisible.value === value) return
  isVisible.value = value
  emit('update:visible', isVisible.value)
}

/**
 * HACK: I dont want the component to automatically hide when clicking the trigger
 * This is carried over from an older UI library and can surely be improved.
 * Also, these stupid events (like interact-outside) get triggered multiple times for some reason :(
 */
function tryAutoHide(event?: Event) {
  // TODO: need to figure out how best to determine if the trigger is clicked
  const target = event?.target as HTMLElement
  const parentElement: HTMLDivElement | undefined =
    trigger.value?.$el?.parentElement
  const isPopoverInteraction = parentElement?.children[0]?.contains(target)
  if (props.autoHide && !isPopoverInteraction) {
    hide()
  }
}
function interactOutside(event: Event) {
  tryAutoHide(event)
}
function escapeKeyDown() {
  tryAutoHide()
}
watch(
  () => props.visible,
  (newVisible) => {
    setVisible(!!newVisible)
  },
  { immediate: true }
)

defineExpose({
  show,
  hide,
  toggle
})
</script>

<template>
  <!-- I dont like this, but we may need a div so that CSS classes
  are applied correctly... -->
  <div>
    <PopoverRoot :open="isVisible">
      <PopoverTrigger
        asChild
        as="div"
        @click="handleTriggerClick"
        @pointerenter="handlePointerEnter"
        @pointerleave="handlePointerLeave"
        ref="trigger"
      >
        <slot
          name="trigger"
          v-bind="slotProps"
        ></slot>
      </PopoverTrigger>
      <PopoverPortal
        :to="teleportTo"
        :disabled="!teleportTo"
      >
        <!-- TODO: need to play with settings here to make sure they are correct -->
        <!--
          `UIElement` carries the library's baseline — text colour, font,
          box-sizing. It is needed HERE because the portal moves the content to
          <body>, away from everything it was written next to, so it inherits
          the host page's defaults instead: black text and the user agent's
          serif, whatever the theme says. `asChild` merges this class onto the
          slot's own root element, which is why bring-your-own-content overlays
          get it without having to remember to. Components that build their own
          content on top of Popper (ActionListMenu) already set it themselves;
          the class is idempotent, so both is fine.
        -->
        <PopoverContent
          asChild
          class="UIElement"
          :side="alignment.side"
          :align="alignment.align"
          avoidCollisions
          sticky="partial"
          :prioritizePosition="false"
          updatePositionStrategy="optimized"
          @interact-outside="interactOutside"
          @escapeKeyDown="escapeKeyDown"
          @open-auto-focus="$event.preventDefault()"
          @close-auto-focus="$event.preventDefault()"
          @pointerenter="handlePointerEnter"
          @pointerleave="handlePointerLeave"
          :style="{
            zIndex: zIndex
          }"
        >
          <slot v-bind="slotProps">Empty</slot>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  </div>
</template>
