<script lang="ts" setup>
import type { LineClamperProps } from './types'

withDefaults(defineProps<LineClamperProps>(), {
  lines: 2
})
</script>

<template>
  <p
    :class="['UIElement', $style.LineClamper]"
    :style="{ '-webkit-line-clamp': lines }"
  >
    <slot />
  </p>
</template>

<style lang="scss" module>
.LineClamper {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}
</style>
