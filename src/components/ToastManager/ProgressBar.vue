<script lang="ts" setup>
import { clamp } from '@/utils'
import { computed } from 'vue'

export interface ProgressBarProps {
  value?: number
}

const props = withDefaults(defineProps<ProgressBarProps>(), {
  value: 0
})

const percent = computed(() => {
  return clamp(props.value, 0, 100)
})
</script>

<template>
  <div :class="$style.ProgressBar">
    <div :class="$style.Track">
      <div :class="$style.InnerTrack"></div>
      <div
        :class="$style.Bar"
        :style="'width: ' + percent + '%'"
      ></div>
    </div>
  </div>
</template>

<style lang="scss" module>
@import '../../styles/variables';

$trackColor: var(--octans-border-strong);
$barColor: $focusColor;

.Track {
  height: 8px;
  position: relative;
  border-radius: var(--octans-radius-field);
  overflow: hidden;
}

.InnerTrack {
  position: absolute;
  top: 1px;
  width: 100%;
  height: 6px;
  background: $trackColor;
  border-radius: var(--octans-radius-field);
}

.Bar {
  position: relative;
  z-index: 1;
  height: 8px;
  background: $barColor;
  transition: width 0.2s ease;
}
</style>
