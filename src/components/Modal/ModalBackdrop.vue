<script lang="ts" setup>
/**
 * The dimmed sheet behind a modal. Lives in its own component because there are
 * two owners: a standalone `<Modal>` draws its own, and `<ModalHost>` draws a
 * single one for the whole stack — N modals must not compound into N layers of
 * dimming.
 */
defineProps<{ visible: boolean }>()
</script>

<template>
  <transition
    :enter-active-class="$style.backdropEnterActive"
    :leave-active-class="$style.backdropLeaveActive"
    :enter-from-class="$style.backdropEnterFrom"
    :leave-to-class="$style.backdropLeaveTo"
  >
    <div
      :class="$style.backdrop"
      v-show="visible"
    ></div>
  </transition>
</template>

<style lang="scss" module>
.backdrop {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2000;
  background: var(--octans-overlay);
  opacity: 0.32;
  will-change: opacity;
}

.backdropEnterActive,
.backdropLeaveActive {
  transition: opacity 0.15s ease;
}
.backdropEnterFrom,
.backdropLeaveTo {
  opacity: 0;
}
</style>
