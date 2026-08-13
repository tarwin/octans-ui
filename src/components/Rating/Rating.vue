<script lang="ts" setup>
import { Icon } from '@/components/Icon'
import { Labelled } from '@/components/Labelled'
import { computed, ref } from 'vue'
import type { RatingProps } from './types'

const props = withDefaults(defineProps<RatingProps>(), {
  stars: 5,
  size: 20,
  emptyIcon: 'mdi:star-outline',
  fullIcon: 'mdi:star',
  emptyColor: 'var(--octans-border-strong)',
  fullColor: 'var(--octans-rating)'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  /**
   * Fired when the value changes via interaction.
   */
  (e: 'change', value: number): void
}>()

const ICON_GAP = 4

const root = ref<HTMLElement>()
// Value being previewed while hovering. `null` when not hovering.
const hoverValue = ref<number | null>(null)
// 1-based index of the icon the pointer is over (drives tooltip position).
const hoverIndex = ref<number | null>(null)
// Whether the pointer is anywhere over the control (drives tooltip visibility
// when the control is non-interactive, where `hoverValue` stays `null`).
const rowHovered = ref(false)

const interactive = computed(() => !props.readonly && !props.disabled)
const hovering = computed(() => hoverValue.value !== null)
const step = computed(() => (props.allowHalf ? 0.5 : 1))

// The value to render — the hover preview takes precedence over the model.
const displayValue = computed(() => hoverValue.value ?? props.modelValue ?? 0)

const showTooltip = computed(() => {
  if (!props.tooltip || !rowHovered.value) return false
  // Interactive: only once the pointer is actually over an icon.
  // Non-interactive: always show the set value while hovered.
  return interactive.value ? hoverValue.value !== null : true
})

// Horizontal centre (px) of the tooltip. When interactive it sits above the
// active icon; when non-interactive (disabled / readonly) it anchors to the
// centre of the whole control since the value applies to the rating as a whole.
const tooltipLeft = computed(() => {
  if (!interactive.value || hoverIndex.value == null) {
    const total = props.stars * (props.size + ICON_GAP) - ICON_GAP
    return total / 2
  }
  return (hoverIndex.value - 1) * (props.size + ICON_GAP) + props.size / 2
})

// 0–100 fill percentage for the icon at 1-based position `i`.
function fillPercent(i: number): number {
  const fraction = displayValue.value - (i - 1)
  return Math.max(0, Math.min(1, fraction)) * 100
}

// Resolve the value a pointer event maps to for the icon at position `i`,
// honouring `allowHalf` based on which half of the icon was hit.
function valueAt(event: MouseEvent, i: number): number {
  if (!props.allowHalf) return i
  const el = event.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  return event.clientX - rect.left < rect.width / 2 ? i - 0.5 : i
}

function setValue(value: number) {
  const clamped = Math.max(0, Math.min(props.stars, value))
  if (clamped === (props.modelValue ?? 0)) return
  emit('update:modelValue', clamped)
  emit('change', clamped)
}

function onMouseMove(event: MouseEvent, i: number) {
  hoverIndex.value = i
  if (!interactive.value) return
  hoverValue.value = valueAt(event, i)
}

function onMouseEnter() {
  rowHovered.value = true
}

function onMouseLeave() {
  rowHovered.value = false
  hoverValue.value = null
  hoverIndex.value = null
}

function onClick(event: MouseEvent, i: number) {
  if (!interactive.value) return
  let value = valueAt(event, i)
  if (props.clearable && value === (props.modelValue ?? 0)) value = 0
  setValue(value)
}

function onKeydown(event: KeyboardEvent) {
  if (!interactive.value) return
  const current = props.modelValue ?? 0
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowUp':
      event.preventDefault()
      setValue(current + step.value)
      break
    case 'ArrowLeft':
    case 'ArrowDown':
      event.preventDefault()
      setValue(current - step.value)
      break
    case 'Home':
      event.preventDefault()
      setValue(0)
      break
    case 'End':
      event.preventDefault()
      setValue(props.stars)
      break
  }
}

function focus() {
  root.value?.focus()
}

defineExpose({ focus })
</script>

<template>
  <Labelled
    :label="label"
    :error="error"
    :help-text="helpText"
    :help-text-html="helpTextHtml"
    :help-link="helpLink"
  >
    <div
      ref="root"
      :class="[
        'UIElement',
        $style.Rating,
        disabled && $style.isDisabled,
        readonly && $style.isReadonly
      ]"
      :style="{
        '--rating-size': size + 'px',
        '--rating-empty': emptyColor,
        '--rating-full': (hovering ? hoverColor : null) ?? fullColor
      }"
      role="slider"
      :tabindex="interactive ? 0 : -1"
      :aria-label="label || undefined"
      :aria-valuemin="0"
      :aria-valuemax="stars"
      :aria-valuenow="modelValue ?? 0"
      :aria-readonly="readonly || undefined"
      :aria-disabled="disabled || undefined"
      @keydown="onKeydown"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
    >
      <span
        v-for="i in stars"
        :key="i"
        :class="[
          $style.Rating_star,
          interactive && $style.Rating_star__interactive
        ]"
        @mousemove="(e) => onMouseMove(e, i)"
        @click="(e) => onClick(e, i)"
      >
        <Icon
          :icon="emptyIcon"
          :class="[$style.Rating_icon, $style.Rating_empty]"
        />
        <span
          :class="$style.Rating_fullWrap"
          :style="{ width: fillPercent(i) + '%' }"
        >
          <Icon
            :icon="fullIcon"
            :class="[$style.Rating_icon, $style.Rating_full]"
          />
        </span>
      </span>
      <span
        v-if="showTooltip"
        :class="$style.Rating_tooltip"
        :style="{ left: tooltipLeft + 'px' }"
        aria-hidden="true"
      >
        {{ displayValue }}
      </span>
    </div>
  </Labelled>
</template>

<style lang="scss" module>
.Rating {
  position: relative;
  display: inline-flex;
  gap: 4px;
  font-size: var(--rating-size, 20px);
  line-height: 1;

  &:focus {
    outline: none;
  }
  &:focus-visible .Rating_star {
    // Subtle focus affordance on the whole control.
    outline: none;
  }
  &:focus-visible {
    border-radius: var(--octans-radius-field);
    box-shadow: 0 0 0 2px var(--octans-focus-ring);
  }
}

.Rating_tooltip {
  position: absolute;
  bottom: calc(100% + 6px);
  transform: translateX(-50%);
  z-index: 1;
  padding: 2px 8px;
  font-size: 12px;
  line-height: 16px;
  white-space: nowrap;
  color: var(--octans-surface);
  background: var(--octans-text);
  border-radius: var(--octans-radius-field);
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.Rating_star {
  position: relative;
  display: inline-block;
  width: 1em;
  height: 1em;
  cursor: default;
}

.Rating_star__interactive {
  cursor: pointer;
}

.Rating_icon {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  width: 1em;
  height: 1em;
  text-align: center;
  // Let pointer events fall through to the star wrapper so hit-testing is
  // consistent regardless of which layer is on top.
  pointer-events: none;
}

.Rating_empty {
  color: var(--rating-empty, var(--octans-border-strong));
}

.Rating_fullWrap {
  position: absolute;
  top: 0;
  left: 0;
  height: 1em;
  overflow: hidden;
  pointer-events: none;
}

.Rating_full {
  color: var(--rating-full, var(--octans-rating));
}

.isReadonly .Rating_star {
  cursor: default;
}

.isDisabled {
  opacity: 0.5;

  .Rating_star {
    cursor: not-allowed;
  }
}
</style>
