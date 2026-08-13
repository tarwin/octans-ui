<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { EventDelegator } from '../EventDelegator'
import ModalBackdrop from './ModalBackdrop.vue'
import ModalStackItem from './ModalStackItem.vue'
import { modals } from './manager'

/**
 * Renders the modals opened by `alertModal()`, `confirmModal()`,
 * `promptModal()` and `genericModal()`.
 *
 * Nothing has to be placed in the page for those to work — one of these is
 * mounted on first use. Render it yourself to have the modals live inside your
 * own app instead, which is what gives them your `provide()`s and plugins.
 *
 * A `<Modal>` written directly into a template does not go through here; it is
 * standalone and always has been.
 */
onMounted(() => modals.addHost())
onUnmounted(() => modals.removeHost())

const entries = computed(() => modals.entries)
const anyVisible = computed(() => entries.value.some((entry) => entry.visible))

/**
 * One listener for the whole stack, closing only the modal on top. Each modal
 * used to add its own window-level listener, so a single Escape closed every
 * open modal at once.
 */
function onEscape() {
  modals.top?.requestClose?.()
}

/**
 * Focus follows the top of the stack. When a modal closes over another, focus
 * belongs on the one underneath rather than back on the page; when the last one
 * closes, it goes back to whatever had it before the stack opened.
 */
let previouslyFocused: HTMLElement | null = null

watch(
  () => entries.value.length,
  (count, previousCount) => {
    if (previousCount === 0 && count > 0) {
      previouslyFocused = document.activeElement as HTMLElement | null
      return
    }
    if (count === 0) {
      previouslyFocused?.focus?.()
      previouslyFocused = null
      return
    }
    if (count < previousCount) {
      // `focus` is registered by the `<Modal>` in the entry, which has to have
      // rendered its dialog before it can be focused.
      nextTick(() => modals.top?.focus?.())
    }
  }
)
</script>

<template>
  <Teleport to="body">
    <div class="UIElement">
      <EventDelegator
        v-if="anyVisible"
        @keydown.esc="onEscape"
      />
      <ModalBackdrop :visible="anyVisible" />
      <ModalStackItem
        v-for="(entry, index) in entries"
        :key="entry.id"
        :entry="entry"
        :depth="index"
      />
    </div>
  </Teleport>
</template>
