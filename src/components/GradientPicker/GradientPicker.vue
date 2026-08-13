<script lang="ts" setup>
/**
 * A gradient editing surface: a bar of colour stops you can drag, and one row
 * of controls under it.
 *
 * This is the raw surface, the way `Calendar` is — no label, no popover. Use
 * `ColorSelector` with `mode="gradient"` for the form-field version.
 *
 * The stop array is kept in AUTHOR order, not sorted by position. Sorting it as
 * stops are dragged past one another would renumber them under the user's
 * pointer and change which one is selected mid-drag. Sorting is what rendering
 * and sampling do, internally, in `@/utils/gradient`.
 */
import { computed, ref } from 'vue'
import {
  createGradient,
  gradientCss,
  GRADIENT_TYPES,
  INTERPOLATION_SPACES,
  sampleGradient,
  type Gradient,
  type GradientStop,
  type GradientType,
  type InterpolationSpace
} from '@/utils/gradient'
import { formatColor, parseColor, prefersDarkText } from '@/utils/color'
import { ColorPicker } from '@/components/ColorPicker'
import { ColorSelector } from '@/components/ColorSelector'
import { Icon } from '@/components/Icon'
import type { GradientPickerProps } from './types'

const props = withDefaults(defineProps<GradientPickerProps>(), {
  alpha: false,
  hideShape: false,
  hideSpace: false,
  minStops: 2,
  maxStops: 8,
  pinStart: false,
  pinEnd: false,
  swatchShape: 'square',
  inlineColor: false,
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Gradient): void
}>()

/**
 * How far a press must travel before it counts as dragging a stop rather than
 * clicking one to select it.
 */
const DRAG_THRESHOLD = 3

const bar = ref<HTMLElement>()
const selected = ref(0)

/**
 * The pinned stops, by index into the array as it stands.
 *
 * Whichever stop is currently outermost is the one held — see `pinStart`. That
 * makes the rule "this gradient spans 0 to 100", which survives adding,
 * removing, reversing and redistributing without anyone having to remember
 * which stop used to be at the edge.
 */
function pinnedEnds(list: GradientStop[]) {
  if (!list.length) return { start: -1, end: -1 }
  let start = 0
  let end = 0
  list.forEach((stop, i) => {
    if (stop.position < list[start].position) start = i
    if (stop.position > list[end].position) end = i
  })
  return {
    start: props.pinStart ? start : -1,
    end: props.pinEnd ? end : -1
  }
}

/** Moves the outermost stops onto the edges, if they are pinned there. */
function applyPins(list: GradientStop[]): GradientStop[] {
  if (!props.pinStart && !props.pinEnd) return list
  const { start, end } = pinnedEnds(list)
  return list.map((stop, i) => {
    if (i === start) return { ...stop, position: 0 }
    if (i === end) return { ...stop, position: 100 }
    return stop
  })
}

const gradient = computed<Gradient>(() => {
  const value = props.modelValue ?? createGradient()
  // Pinned here as well as on the way out, so a value that arrives not
  // respecting the pins is shown honestly — as the picker will enforce it —
  // rather than displaying one thing and emitting another on first touch.
  return props.pinStart || props.pinEnd
    ? { ...value, stops: applyPins(value.stops) }
    : value
})

const offeredTypes = computed(() =>
  GRADIENT_TYPES.filter(
    (t) => !props.types?.length || props.types.includes(t.value)
  )
)

const showTypeControl = computed(
  () => !props.hideShape && offeredTypes.value.length > 1
)
/** Radial gradients start from the centre, so there is no angle to set. */
const showAngle = computed(
  () => !props.hideShape && gradient.value.type !== 'radial'
)

/**
 * The bar shows the colours left-to-right regardless of the shape being edited:
 * it is a view of the stops, not a preview of the painted gradient. A conic
 * gradient drawn as a cone in a 20px-high bar would be unreadable.
 */
const barCss = computed(() =>
  gradientCss({ ...gradient.value, type: 'linear', angle: 90 })
)

const stops = computed(() => gradient.value.stops)
const activeStop = computed<GradientStop | undefined>(
  () => stops.value[selected.value]
)

const canAdd = computed(() => stops.value.length < props.maxStops)
const canRemove = computed(
  () => stops.value.length > Math.max(2, props.minStops)
)

const spaceDescription = computed(
  () =>
    INTERPOLATION_SPACES.find((s) => s.value === gradient.value.space)
      ?.description
)

// --- editing --------------------------------------------------------------

function update(patch: Partial<Gradient>) {
  if (props.disabled) return
  const next = { ...gradient.value, ...patch }
  emit('update:modelValue', { ...next, stops: applyPins(next.stops) })
}

/** Whether this stop is held on an edge and so cannot be moved. */
function isPinned(index: number) {
  const { start, end } = pinnedEnds(stops.value)
  return index === start || index === end
}

function updateStop(index: number, patch: Partial<GradientStop>) {
  const next = stops.value.map((stop, i) =>
    i === index ? { ...stop, ...patch } : stop
  )
  update({ stops: next })
}

function setStopColor(value: string) {
  if (activeStop.value && value) {
    updateStop(selected.value, { color: value })
  }
}

function setStopPosition(index: number, position: number) {
  // `applyPins` would put it straight back, but refusing here is what stops the
  // handle twitching under a drag it is never going to follow.
  if (isPinned(index)) return
  updateStop(index, { position: clampPosition(position) })
}

const clampPosition = (n: number) =>
  Math.min(100, Math.max(0, Number.isFinite(n) ? n : 0))

/**
 * Adds a stop at `position`, coloured with whatever the gradient already shows
 * there — so adding one never changes how the gradient looks, it only gives you
 * a handle on a colour that was already passing through.
 */
function addStop(position: number) {
  if (!canAdd.value || props.disabled) return
  const at = clampPosition(position)
  const sampled = sampleGradient(gradient.value, at / 100)
  const color = sampled
    ? formatColor(sampled, 'hex', props.alpha)
    : (activeStop.value?.color ?? '#ffffff')

  update({ stops: [...stops.value, { color, position: at }] })
  // `stops` still reflects the old array — the new one arrives back as a prop.
  // Its old length is therefore the index the appended stop will have.
  selected.value = stops.value.length
}

function removeStop(index: number) {
  if (!canRemove.value || props.disabled) return
  update({ stops: stops.value.filter((_, i) => i !== index) })
  // Likewise the old length: one fewer stop means the last valid index becomes
  // `length - 2`.
  selected.value = Math.max(0, Math.min(selected.value, stops.value.length - 2))
}

function distribute() {
  // Sorting here is correct — the user asked for even spacing, so the visual
  // order is the order they mean.
  const sorted = [...stops.value].sort((a, b) => a.position - b.position)
  const last = sorted.length - 1
  update({
    stops: sorted.map((stop, i) => ({
      ...stop,
      position: last === 0 ? 0 : (i / last) * 100
    }))
  })
  selected.value = 0
}

function reverse() {
  update({
    stops: stops.value.map((stop) => ({
      ...stop,
      position: 100 - stop.position
    }))
  })
}

// --- pointer handling -----------------------------------------------------

/** Where along the bar a pointer event landed, 0–100. */
function positionFromEvent(event: PointerEvent) {
  const box = bar.value?.getBoundingClientRect()
  if (!box?.width) return 0
  return clampPosition(((event.clientX - box.left) / box.width) * 100)
}

/** Clicking the bar itself — as opposed to a handle on it — adds a stop. */
function onBarDown(event: PointerEvent) {
  if (props.disabled || event.target !== event.currentTarget) return
  addStop(positionFromEvent(event))
}

function onHandleDown(index: number, event: PointerEvent) {
  if (props.disabled) return
  selected.value = index

  const el = event.currentTarget as HTMLElement
  // Optional because pointer capture is not universal — jsdom has no such
  // method at all, and losing it costs only the drag-past-the-edge case.
  el.setPointerCapture?.(event.pointerId)

  // Clicking a handle to select it must not move it. A press only becomes a
  // drag once it has travelled — without this, the sub-pixel wobble in an
  // ordinary click knocks the stop a fraction of a percent off wherever it was.
  const startX = event.clientX
  let dragging = false
  const move = (e: PointerEvent) => {
    if (!dragging) {
      if (Math.abs(e.clientX - startX) < DRAG_THRESHOLD) return
      dragging = true
    }
    setStopPosition(index, positionFromEvent(e))
  }
  const stop = () => {
    el.removeEventListener('pointermove', move)
    el.removeEventListener('pointerup', stop)
    el.removeEventListener('pointercancel', stop)
  }

  el.addEventListener('pointermove', move)
  el.addEventListener('pointerup', stop)
  el.addEventListener('pointercancel', stop)
}

function onHandleKey(index: number, event: KeyboardEvent) {
  if (props.disabled) return
  const stop = stops.value[index]
  if (!stop) return
  const step = event.shiftKey ? 10 : 1

  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowDown':
      setStopPosition(index, stop.position - step)
      break
    case 'ArrowRight':
    case 'ArrowUp':
      setStopPosition(index, stop.position + step)
      break
    case 'Home':
      setStopPosition(index, 0)
      break
    case 'End':
      setStopPosition(index, 100)
      break
    case 'Delete':
    case 'Backspace':
      removeStop(index)
      break
    default:
      return
  }
  event.preventDefault()
}

/** A handle sitting on a pale colour needs a dark outline, and vice versa. */
function handleIsLight(color: string) {
  const parsed = parseColor(color)
  return parsed ? prefersDarkText(parsed) : false
}
</script>

<template>
  <div
    :class="[
      $style.GradientPicker,
      disabled && $style.GradientPicker__disabled
    ]"
  >
    <div :class="$style.GradientPicker_barWrap">
      <div
        ref="bar"
        :class="$style.GradientPicker_bar"
        :style="{ backgroundImage: barCss }"
        :title="canAdd ? 'Click to add a stop' : 'Maximum stops reached'"
        @pointerdown="onBarDown"
      >
        <button
          v-for="(stop, index) in stops"
          :key="`stop-${index}`"
          type="button"
          :class="[
            $style.GradientPicker_handle,
            index === selected && $style.GradientPicker_handle__selected,
            isPinned(index) && $style.GradientPicker_handle__pinned,
            handleIsLight(stop.color) && $style.GradientPicker_handle__light
          ]"
          :style="{ left: `${stop.position}%` }"
          role="slider"
          :aria-label="`Stop ${index + 1} position`"
          :aria-valuemin="0"
          :aria-valuemax="100"
          :aria-valuenow="Math.round(stop.position)"
          :aria-valuetext="`${Math.round(stop.position)} percent, ${stop.color}${
            isPinned(index) ? ', pinned' : ''
          }`"
          :aria-readonly="isPinned(index)"
          :title="isPinned(index) ? 'Pinned to the edge' : undefined"
          :disabled="disabled"
          @pointerdown.stop="onHandleDown(index, $event)"
          @keydown="onHandleKey(index, $event)"
          @click.stop
        >
          <span
            :class="$style.GradientPicker_handleFill"
            :style="{ background: stop.color }"
          />
        </button>
      </div>
    </div>

    <!--
      One row. Everything is named by `title` and `aria-label` rather than by a
      visible caption above each field — five stacked caption/field pairs was
      most of what made this too tall to sit inside a popover.
    -->
    <div :class="$style.GradientPicker_toolbar">
      <ColorSelector
        v-if="!inlineColor"
        :class="$style.GradientPicker_stopColor"
        :model-value="activeStop?.color ?? ''"
        :alpha="alpha"
        :swatches="swatches"
        :swatch-shape="swatchShape"
        :show-value="false"
        :disabled="disabled || !activeStop"
        placement="bottom-start"
        @update:model-value="setStopColor($event as string)"
      />

      <input
        type="number"
        min="0"
        max="100"
        step="1"
        :class="$style.GradientPicker_number"
        aria-label="Position of the selected stop"
        title="Position of the selected stop"
        :value="Math.round(activeStop?.position ?? 0)"
        :disabled="disabled || !activeStop || isPinned(selected)"
        @change="
          setStopPosition(
            selected,
            Number(($event.target as HTMLInputElement).value)
          )
        "
      />

      <button
        type="button"
        :class="$style.GradientPicker_icon"
        :disabled="disabled || !canAdd"
        title="Add a stop halfway along"
        aria-label="Add a stop halfway along"
        @click="addStop(50)"
      >
        <Icon icon="mdi:plus" />
      </button>
      <button
        type="button"
        :class="$style.GradientPicker_icon"
        :disabled="disabled || !canRemove"
        title="Remove the selected stop"
        aria-label="Remove the selected stop"
        @click="removeStop(selected)"
      >
        <Icon icon="mdi:minus" />
      </button>
      <button
        type="button"
        :class="$style.GradientPicker_icon"
        :disabled="disabled"
        title="Space the stops evenly"
        aria-label="Space the stops evenly"
        @click="distribute"
      >
        <Icon icon="mdi:format-horizontal-align-center" />
      </button>
      <button
        type="button"
        :class="$style.GradientPicker_icon"
        :disabled="disabled"
        title="Flip the gradient end for end"
        aria-label="Flip the gradient end for end"
        @click="reverse"
      >
        <Icon icon="mdi:swap-horizontal" />
      </button>

      <select
        v-if="!hideSpace"
        :class="$style.GradientPicker_select"
        aria-label="Blend in which colour space"
        :value="gradient.space"
        :disabled="disabled"
        :title="spaceDescription"
        @change="
          update({
            space: ($event.target as HTMLSelectElement)
              .value as InterpolationSpace
          })
        "
      >
        <option
          v-for="space in INTERPOLATION_SPACES"
          :key="space.value"
          :value="space.value"
          :title="space.description"
        >
          {{ space.label }}
        </option>
      </select>

      <select
        v-if="showTypeControl"
        :class="$style.GradientPicker_select"
        aria-label="Shape of the gradient"
        :value="gradient.type"
        :disabled="disabled"
        :title="
          offeredTypes.find((t) => t.value === gradient.type)?.description
        "
        @change="
          update({
            type: ($event.target as HTMLSelectElement).value as GradientType
          })
        "
      >
        <option
          v-for="type in offeredTypes"
          :key="type.value"
          :value="type.value"
          :title="type.description"
        >
          {{ type.label }}
        </option>
      </select>

      <input
        v-if="showAngle"
        type="number"
        min="0"
        max="360"
        step="15"
        :class="$style.GradientPicker_number"
        aria-label="Angle of the gradient"
        title="Angle of the gradient, in degrees"
        :value="gradient.angle"
        :disabled="disabled"
        @change="
          update({ angle: Number(($event.target as HTMLInputElement).value) })
        "
      />
    </div>

    <ColorPicker
      v-if="inlineColor"
      :model-value="activeStop?.color ?? ''"
      :alpha="alpha"
      :swatches="swatches"
      :swatch-shape="swatchShape"
      :disabled="disabled || !activeStop"
      @update:model-value="setStopColor"
    />
  </div>
</template>

<style lang="scss" module>
@import '../../styles/variables';

$handleWidth: 14px;
$barHeight: 22px;
$rowHeight: 26px;

.GradientPicker {
  display: flex;
  flex-direction: column;
  gap: $s2;
  width: 100%;
  min-width: 220px;
  font-family: var(--octans-font);
  color: var(--octans-text);
}

.GradientPicker__disabled {
  opacity: 0.5;
  pointer-events: none;
}

// The handles hang below the bar, so the wrapper reserves the room rather than
// letting them overlap the toolbar.
.GradientPicker_barWrap {
  padding-bottom: 10px;
}

.GradientPicker_bar {
  position: relative;
  height: $barHeight;
  border: 1px solid var(--octans-border-strong);
  border-radius: var(--octans-radius-field);
  cursor: copy;
  touch-action: none;
  // Behind the gradient, so a stop with alpha reads as transparent rather than
  // as a lighter colour.
  background-color: var(--octans-surface);
}

.GradientPicker_handle {
  position: absolute;
  top: 100%;
  width: $handleWidth;
  height: $handleWidth;
  margin: -3px 0 0 (-0.5 * $handleWidth);
  padding: 0;
  background: var(--octans-surface);
  border: 1px solid var(--octans-border-strong);
  border-radius: var(--octans-radius-field);
  cursor: grab;
  overflow: hidden;
  touch-action: none;

  &:active {
    cursor: grabbing;
  }
  &:focus-visible {
    outline: 2px solid $focusColor;
    outline-offset: 2px;
  }
}

.GradientPicker_handle__selected {
  // Grown rather than recoloured: the handle's own fill is the stop's colour,
  // so any selection colour would fight with it.
  box-shadow:
    0 0 0 2px var(--octans-surface),
    0 0 0 4px var(--octans-primary);
}

// Pinned to an edge: no grab cursor, because it will not move.
.GradientPicker_handle__pinned {
  cursor: default;

  &:active {
    cursor: default;
  }
}

// A near-white stop needs a darker edge or the handle disappears.
.GradientPicker_handle__light {
  border-color: var(--octans-text-subdued);
}

.GradientPicker_handleFill {
  display: block;
  width: 100%;
  height: 100%;
}

.GradientPicker_toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: $s1;
  align-items: center;
}

// The stop's colour trigger, shrunk to match the rest of the row — here it is
// one control among several, not the subject of a form.
.GradientPicker_stopColor button {
  min-height: $rowHeight;
  padding: 2px 4px;
}

.GradientPicker_number,
.GradientPicker_select,
.GradientPicker_icon {
  min-height: $rowHeight;
  padding: 2px 4px;
  background: var(--octans-surface-sunken);
  color: var(--octans-text);
  border: 1px solid var(--octans-border-strong);
  border-radius: var(--octans-radius-field);
  font: inherit;
  font-size: 12px;

  &:focus-visible {
    outline: 2px solid $focusColor;
    outline-offset: 1px;
  }
  &:disabled {
    opacity: 0.5;
  }
}

.GradientPicker_number {
  width: 52px;
}

.GradientPicker_select {
  cursor: pointer;
}

.GradientPicker_icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: $rowHeight;
  padding: 0;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--octans-surface-hover);
  }
  &:disabled {
    cursor: not-allowed;
  }
}
</style>
