<script lang="ts" setup>
import { Formatter } from '@/components/Formatter'
import { emptyValuePlaceholder } from '@/utils/format'
import { computed } from 'vue'
import type { StatProps } from './types'

const props = withDefaults(defineProps<StatProps>(), {
  multiline: false
})

const formatterProps = computed(() => {
  const valueExists = props.value || props.value === 0
  if (!valueExists) return null
  return {
    type: props.type || '', // ?
    value: props.value,
    locale: props.locale,
    currency: props.currency
  }
})
</script>

<template>
  <div :class="$style.Stat">
    <div
      v-if="label"
      :class="$style.Stat_label"
    >
      {{ label }}
    </div>
    <div :class="[$style.Stat_value, multiline && $style.Stat_multiline]">
      <Formatter
        v-if="formatterProps"
        v-bind="formatterProps"
      />
      <slot v-else>{{ emptyValuePlaceholder }}</slot>
    </div>
  </div>
</template>

<style lang="scss" module>
.Stat_label {
  padding-bottom: 2px;
  color: var(--octans-text);
  font-weight: 500;
}
.Stat_value {
  color: var(--octans-text-subdued);
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.Stat_multiline {
  overflow: auto;
  overflow-wrap: break-word;
  white-space: normal;
}
</style>
