<script lang="ts">
import { Icon } from '@/components/Icon'
import { defineComponent } from 'vue'

import { $t } from '@/utils/translate'

export default defineComponent({
  components: {
    Icon
  },
  props: {
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isDragging: false,
      error: null as string | null
    }
  },
  methods: {
    $t,
    onClick(event: MouseEvent) {
      event.stopImmediatePropagation()
      this.$emit('click')
    },
    onDrop(event: DragEvent) {
      event.stopImmediatePropagation()
      const files = event.dataTransfer?.files
      if (!files) return
      const count = files.length
      this.isDragging = false
      if (count) {
        if (this.multiple || count === 1) {
          this.$emit('drop', files)
        } else {
          this.error = 'You can only drop a single file, please try again.'
        }
      }
    },
    onDragEnter() {
      this.isDragging = true
      this.error = null
    }
  }
})
</script>

<template>
  <div
    :class="[
      $style.DropZone,
      isDragging && $style.isDragging,
      error && $style.hasError
    ]"
    @click="onClick"
    @drop.prevent="onDrop"
    @dragenter.prevent="onDragEnter"
    @dragleave.prevent="isDragging = false"
    @dragover.prevent
  >
    <div :class="$style.Content">
      <div v-if="error">{{ error }}</div>
      <div v-else>
        <Icon
          icon="mdi:file-upload-outline"
          style="margin-right: 6px"
        />
        {{ $t('ui.fileInput.dropHere') }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" module>
@import '../../styles/variables';

$dropBorderColor: var(--octans-border-input);
$borderHoverColor: $focusColor;
$bgHoverColor: color-mix(in srgb, var(--octans-primary) 10%, transparent);

.DropZone {
  padding: 12px;
  border: 2px dashed $dropBorderColor;
  border-radius: var(--octans-radius-box);
  color: $textSubduedColor;
  font-size: 18px;
  text-align: center;
  cursor: pointer;

  &:hover,
  &.isDragging {
    background: $bgHoverColor;
    border-color: $borderHoverColor;
    color: $focusColor;
  }
}

.isDragging .Content {
  pointer-events: none;
}

.hasError {
  background: var(--octans-error-surface);
  border-color: $errorColor;
  color: $errorColor;

  &:hover {
    background: color-mix(in srgb, var(--octans-error) 18%, transparent);
    border-color: $errorColor;
    color: $errorColor;
  }
}
</style>
