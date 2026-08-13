<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { loadingBarState, loadingBarHosts } from './store'
import type { LoadingBarProps } from './types'

const props = withDefaults(defineProps<LoadingBarProps>(), {
  fixed: false,
  height: 4
})

const heightCss = computed(() =>
  typeof props.height === 'number' ? `${props.height}px` : props.height
)

onMounted(() => loadingBarHosts.add())
onBeforeUnmount(() => loadingBarHosts.remove())
</script>

<template>
  <!--
    An indeterminate progressbar (no aria-valuenow): the trickle numbers are
    theatre, not measurement, and should not be announced as fact.
  -->
  <div
    v-if="loadingBarState.value > 0"
    :class="['UIElement', $style.LoadingBar, fixed && $style.LoadingBar__fixed]"
    :style="{ width: `${loadingBarState.value}%`, height: heightCss }"
    role="progressbar"
    aria-label="Loading"
  ></div>
</template>

<style lang="scss" module>
@import '@/styles/variables';

.LoadingBar {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  background: var(--ui-loadingBar-color, var(--octans-primary));
  transition: width 0.3s ease;
}

.LoadingBar__fixed {
  position: fixed;
  // Above the Modal backdrop (2000): a page navigating away is still loading,
  // and the bar saying so should not be hidden by whatever is open.
  z-index: 3000;
}
</style>
