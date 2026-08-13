<script lang="ts" setup>
import { Spinner } from '@/components/Spinner'
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { loaderHosts, loaderState } from './store'
import type { LoaderOverlayProps } from './types'

const props = withDefaults(defineProps<LoaderOverlayProps>(), {
  visible: false,
  message: 'Loading...',
  fullscreen: false
})

const shown = computed(() => props.visible || loaderState.visible)
const text = computed(() =>
  loaderState.visible && loaderState.message
    ? loaderState.message
    : props.message
)

onMounted(() => loaderHosts.add())
onBeforeUnmount(() => loaderHosts.remove())
</script>

<template>
  <div
    v-if="shown"
    :class="[
      'UIElement',
      $style.LoaderOverlay,
      fullscreen && $style.LoaderOverlay__fullscreen
    ]"
    role="alert"
    aria-busy="true"
  >
    <div :class="$style.LoaderOverlay_content">
      <!-- Replaces the spinner and message entirely. -->
      <slot>
        <Spinner
          :class="$style.LoaderOverlay_spinner"
          color="blue"
          size="small"
        />
        <div :class="$style.LoaderOverlay_text">{{ text }}</div>
      </slot>
    </div>
  </div>
</template>

<style lang="scss" module>
@import '@/styles/variables';

.LoaderOverlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: flex-start;
  justify-content: space-around;
  background: color-mix(in srgb, var(--octans-surface) 80%, transparent);
}

.LoaderOverlay__fullscreen {
  position: fixed;
  // Above the Modal backdrop (2000): a blocking "please wait" must block the
  // modal's buttons too, or they invite clicks it will ignore.
  z-index: 3000;
}

.LoaderOverlay_content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 100px;
  padding: 20px 40px;
  border-radius: var(--octans-radius-box);
  box-shadow: var(--octans-shadow-md);
  background: var(--octans-neutral-800);
  color: var(--octans-neutral-0);
}

.LoaderOverlay_text {
  margin-left: 10px;
  font-size: 20px;
}
</style>
