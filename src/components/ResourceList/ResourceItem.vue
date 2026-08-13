<script lang="ts" setup>
const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <div
    :class="['UIElement', $style.ResourceItem]"
    @click="emit('click')"
  >
    <slot />
  </div>
</template>

<style lang="scss" module>
.ResourceItem {
  display: flex;
  align-items: center;
  min-height: 65px;
  padding: 8px 16px;

  &:first-child {
    border-radius: var(--octans-radius-box) var(--octans-radius-box) 0 0;
  }

  &:last-child {
    border-radius: 0 0 var(--octans-radius-box) var(--octans-radius-box);
  }

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    cursor: pointer;
  }
}

.ResourceItem + .ResourceItem {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
