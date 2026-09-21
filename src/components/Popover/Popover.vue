<script lang="ts" setup>
import { getRadixPopperPlacement } from '@/utils/radix'
import {
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger
} from 'reka-ui'
import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  provide,
  ref,
  watch
} from 'vue'
import type { PopoverProps } from './types'
import { trapTab } from '@/utils/focusTrap'
import { PHONE_QUERY, useMediaQuery } from '@/utils/mediaQuery'
import { lockScroll } from '@/utils/scrollLock'

const props = withDefaults(defineProps<PopoverProps>(), {
  placement: 'bottom',
  teleportTo: 'body',
  disabled: false,
  autoTriggerToggle: true,
  autoHide: false,
  hover: false,
  surface: false,
  zIndex: 10000,
  sheet: false
})

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

const isVisible = ref(false)
const wrapper = ref<HTMLElement>()

const alignment = computed(() => {
  return getRadixPopperPlacement(props.placement)
})

/**
 * The sheet form, when `sheet` asks for it. `'mobile'` follows the viewport,
 * so a phone turned to landscape can switch back to the anchored panel.
 */
const isPhone = useMediaQuery(PHONE_QUERY)
const sheetActive = computed(() =>
  props.sheet === 'mobile' ? isPhone.value : !!props.sheet
)

const slotProps = computed(() => {
  return {
    visible: isVisible.value,
    sheet: sheetActive.value,
    show,
    hide,
    toggle
  }
})

/**
 * A sheet covers the page the way a modal does, so it takes the same care:
 * the page behind it stops scrolling, focus moves into it and Tab stays
 * there, and focus goes back to the trigger when it closes. The anchored
 * panel does none of this — it is a flyout, and focus stays where it was.
 */
const panel = ref<HTMLElement>()
let releaseScroll: (() => void) | null = null
let previouslyFocused: HTMLElement | null = null

watch(
  () => isVisible.value && sheetActive.value,
  async (open) => {
    if (open) {
      releaseScroll ??= lockScroll()
      previouslyFocused = document.activeElement as HTMLElement | null
      await nextTick()
      if (panel.value && !panel.value.contains(document.activeElement)) {
        panel.value.focus()
      }
      return
    }
    releaseScroll?.()
    releaseScroll = null
    const target = previouslyFocused
    previouslyFocused = null
    const active = document.activeElement
    const ours =
      !active || active === document.body || panel.value?.contains(active)
    if (ours && target?.isConnected) target.focus()
  }
)

function sheetKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    tryAutoHide()
    return
  }
  if (panel.value) trapTab(event, panel.value)
}

/** The scrim is never the trigger, so a tap on it is an outside click. */
function scrimClick() {
  tryAutoHide()
}

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

onBeforeUnmount(() => {
  clearCloseTimer()
  releaseScroll?.()
  releaseScroll = null
})

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
 * A click on the TRIGGER is not an outside click, even though reka reports it
 * as one: `usePointerDownOutside` only excludes the content layer, so without
 * this the trigger would close the content here and immediately reopen it in
 * `handleTriggerClick`, or vice versa, depending on which ran last.
 *
 * The wrapper below is the whole of this component's inline DOM — the content
 * is portalled away to `teleportTo` — so containment in it means "the trigger,
 * whatever shape it is". Asking the wrapper rather than the trigger element
 * keeps this working for triggers with several root nodes, or a `v-if` root,
 * where there is no single element to point at.
 *
 * `event.target` really is the clicked element and not the content root: reka
 * dispatches the custom event on `detail.originalEvent.target`.
 */
function tryAutoHide(event?: Event) {
  if (!props.autoHide) return
  const target = event?.target as Node | undefined
  const hitTrigger = !!target && !!wrapper.value?.contains(target)
  if (!hitTrigger) {
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
  <div ref="wrapper">
    <template v-if="sheetActive">
      <!--
        `display: contents`, so the wrapper adds no box: the trigger lays out
        exactly as it does in the anchored form, where reka merges onto it.
      -->
      <div
        :class="$style.sheetTrigger"
        @click="handleTriggerClick"
      >
        <slot
          name="trigger"
          v-bind="slotProps"
        ></slot>
      </div>
      <Teleport to="body">
        <div class="UIElement">
          <transition
            :enter-active-class="$style.scrimEnterActive"
            :leave-active-class="$style.scrimLeaveActive"
            :enter-from-class="$style.scrimEnterFrom"
            :leave-to-class="$style.scrimLeaveTo"
          >
            <div
              v-show="isVisible"
              :class="$style.scrim"
              :style="{ zIndex }"
              @click="scrimClick"
            ></div>
          </transition>
          <transition
            :enter-active-class="$style.sheetEnterActive"
            :leave-active-class="$style.sheetLeaveActive"
            :enter-from-class="$style.sheetEnterFrom"
            :leave-to-class="$style.sheetLeaveTo"
          >
            <div
              v-show="isVisible"
              ref="panel"
              role="dialog"
              aria-modal="true"
              tabindex="-1"
              data-popover-sheet
              :class="$style.sheet"
              :style="{ zIndex }"
              @keydown="sheetKeydown"
            >
              <div
                :class="$style.sheetHandle"
                aria-hidden="true"
              ></div>
              <slot v-bind="slotProps">Empty</slot>
            </div>
          </transition>
        </div>
      </Teleport>
    </template>
    <PopoverRoot
      v-else
      :open="isVisible"
    >
      <PopoverTrigger
        asChild
        as="div"
        @click="handleTriggerClick"
        @pointerenter="handlePointerEnter"
        @pointerleave="handlePointerLeave"
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
          content on top of Popover (ActionListMenu) already set it themselves;
          the class is idempotent, so both is fine.
        -->
        <PopoverContent
          asChild
          :class="['UIElement', surface && $style.surface]"
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

<style lang="scss" module>
/*
 * `:where()` so it stays at zero specificity. `asChild` merges this class onto
 * the CALLER's own root element, which will usually carry a class of its own —
 * and that class is the one that should win when the two disagree.
 */
:where(.surface) {
  background: var(--octans-surface);
  border: 1px solid var(--octans-border);
  border-radius: var(--octans-radius-box);
  box-shadow: var(--octans-shadow-md);
}

.sheetTrigger {
  display: contents;
}

.scrim {
  position: fixed;
  inset: 0;
  background: var(--octans-overlay);
  opacity: 0.32;
}

.sheet {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  max-height: 85vh;
  padding: 8px 16px;
  // Clears the home indicator on a phone; the fallback is the same 16px.
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  overflow: auto;
  background: var(--octans-surface);
  border-radius: var(--octans-radius-box) var(--octans-radius-box) 0 0;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.2);

  // Focused as a whole when it opens, so Tab starts from its first control;
  // a container, so no ring.
  &:focus {
    outline: none;
  }
}

.sheetHandle {
  width: 36px;
  height: 4px;
  margin: 0 auto 12px;
  background: var(--octans-border);
  border-radius: var(--octans-radius-full);
}

.scrimEnterActive,
.scrimLeaveActive {
  transition: opacity 0.2s ease;
}
.scrimEnterFrom,
.scrimLeaveTo {
  opacity: 0;
}

.sheetEnterActive,
.sheetLeaveActive {
  transition: transform 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
}
.sheetEnterFrom,
.sheetLeaveTo {
  transform: translateY(100%);
}

@media (prefers-reduced-motion: reduce) {
  .scrimEnterActive,
  .scrimLeaveActive,
  .sheetEnterActive,
  .sheetLeaveActive {
    transition: none;
  }
}
</style>
