<script lang="ts" setup>
import { computed } from 'vue'
import type { StatGroupProps } from './types'

const props = withDefaults(defineProps<StatGroupProps>(), {
  minWidth: '200px',
  maxWidth: '1fr'
})

const componentStyle = computed(() => {
  const { minWidth, maxWidth } = props
  const style: { gridTemplateColumns?: string } = {}
  if (minWidth || maxWidth) {
    style.gridTemplateColumns = `repeat(
      auto-fill,
      minmax(
        ${minWidth || '200px'},
        ${maxWidth || '1fr'}
      )
    )`
  }
  return style
})
</script>

<template>
  <div
    :class="['UIElement', $style.Stats]"
    :style="componentStyle"
  >
    <slot></slot>
  </div>
</template>

<style lang="scss" module>
.Stats {
  display: grid;
  grid-column-gap: 8px;
  grid-row-gap: 8px;
}
</style>
