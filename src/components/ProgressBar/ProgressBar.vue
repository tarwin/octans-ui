<script lang="ts" setup>
import { clamp, capitalize } from '@/utils'
import { computed } from 'vue'
import type { BadgeStatusType } from '../types'

export type ProgressBarSizeType = 'small' | 'medium' | 'large'
export type ProgressBarStatusType = Exclude<BadgeStatusType, 'new'>

export interface ProgressBarProps {
  /**
   * The progress value as a percentage, from `0` to `100`. Values outside
   * this range are clamped. Ignored when `indeterminate` is set.
   */
  value?: number
  /**
   * The height of the bar.
   *
   *   - small
   *   - medium (default)
   *   - large
   */
  size?: ProgressBarSizeType
  /**
   * The status of the bar, matching the statuses used by `Badge`, `Banner`,
   * etc. When omitted the bar uses the default (blue) fill.
   *
   *   - `info`
   *   - `success`
   *   - `warning` — amber
   *   - `error` — red
   *
   * `attention` is accepted as an alias of `warning` for compatibility.
   */
  status?: ProgressBarStatusType
  /**
   * Overlays an animated diagonal stripe pattern on the filled portion of the
   * bar. Useful to communicate that work is actively happening.
   */
  animated?: boolean
  /**
   * Shows a looping indeterminate animation instead of a fixed value. Use when
   * the completion amount is unknown. `value` is ignored while set.
   */
  indeterminate?: boolean
}

const props = withDefaults(defineProps<ProgressBarProps>(), {
  value: 0,
  size: 'medium',
  animated: false,
  indeterminate: false
})

const percent = computed(() => clamp(props.value, 0, 100))
</script>

<template>
  <div
    :class="[
      $style.ProgressBar,
      $style[size],
      status && $style['status' + capitalize(status)]
    ]"
    role="progressbar"
    :aria-valuemin="indeterminate ? undefined : 0"
    :aria-valuemax="indeterminate ? undefined : 100"
    :aria-valuenow="indeterminate ? undefined : percent"
  >
    <div
      :class="[
        $style.Bar,
        animated && $style.animated,
        indeterminate && $style.indeterminate
      ]"
      :style="indeterminate ? undefined : { width: percent + '%' }"
    ></div>
  </div>
</template>

<style lang="scss" module>
@import '../../styles/variables';

$trackColor: var(--octans-surface-sunken);

.ProgressBar {
  position: relative;
  width: 100%;
  background: $trackColor;
  border-radius: var(--octans-radius-full);
  overflow: hidden;
}

.Bar {
  height: 100%;
  width: 0;
  border-radius: var(--octans-radius-full);
  background-color: $focusColor;
  transition: width 0.3s ease;
}

// Sizes

.small {
  height: 4px;
}

.medium {
  height: 8px;
}

.large {
  height: 16px;
}

// Statuses (using the same colors as Badge)

.statusInfo .Bar {
  background-color: var(--octans-info-surface);
}

.statusSuccess .Bar {
  background-color: var(--octans-success-surface);
}

// `attention` is the pre-rename alias of `warning` — see BadgeStatusType.
.statusWarning .Bar,
.statusAttention .Bar {
  background-color: var(--octans-warning-surface);
}

.statusError .Bar {
  background-color: var(--octans-error-surface);
}

// Animated stripes overlay

.animated {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.2) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.2) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
  animation: progress-bar-stripes 1s linear infinite;
}

// Indeterminate sliding bar

.indeterminate {
  width: 40% !important;
  border-radius: var(--octans-radius-full);
  animation: progress-bar-indeterminate 1.4s ease-in-out infinite;
}

@keyframes progress-bar-stripes {
  from {
    background-position: 1rem 0;
  }
  to {
    background-position: 0 0;
  }
}

@keyframes progress-bar-indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(250%);
  }
}
</style>
