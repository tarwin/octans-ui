<script lang="ts" setup>
import { Icon } from '../Icon'
import { type PopperPlacementType } from '@/components/Popper'

export interface TagProps {
  /**
   * Disables the remove button.
   */
  required?: boolean
  tooltip?: string | null
  tooltipPosition?: PopperPlacementType
}

withDefaults(defineProps<TagProps>(), {
  tooltipPosition: 'top',
  required: false
})

defineEmits<{
  (e: 'remove'): void
}>()
</script>

<template>
  <span
    :class="['UIElement', $style.Tag, required && $style.Tag__isRequired]"
    :data-ui-tooltip="tooltip"
    :data-ui-tooltip-position="tooltipPosition"
  >
    <span :class="$style.Tag_text">
      <slot></slot>
    </span>
    <button
      :class="$style.Tag_button"
      :disabled="required"
      @click="$emit('remove')"
    >
      <Icon icon="mdi:close" />
    </button>
  </span>
</template>

<style lang="scss" module>
$radius: var(--octans-radius-field);
$size: 28px;

.Tag {
  display: inline-flex;
  // display: inline-block;
  grid-template-columns: auto auto;
  align-items: center;
  min-height: $size;
  padding-left: 8px;
  background: var(--octans-surface-sunken);
  border-radius: $radius;
  color: var(--octans-text);
  cursor: default;
}

// .Tag + .Tag {
//   margin-left: 4px;
// }

.Tag__isRequired {
  .Tag_button {
    cursor: not-allowed;
    color: var(--octans-text-disabled);
  }
}

.Tag_text {
  border-radius: $radius 0 0 $radius;
  flex: 0 0 auto;
}

.Tag_button {
  flex: 0 0 $size;
  width: $size;
  height: $size;
  margin-left: 4px;
  background: transparent;
  border: none;
  border-radius: 0 $radius $radius 0;
  font-size: 16px;

  &:focus {
    outline: none;
  }

  &:not(:disabled) {
    &:hover,
    &:focus {
      background: var(--octans-border-strong);
      color: var(--octans-text);
      cursor: pointer;
    }
  }
}
</style>
