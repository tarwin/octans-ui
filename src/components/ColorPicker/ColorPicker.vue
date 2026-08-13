<script lang="ts" setup>
/**
 * A colour picking surface: saturation/brightness square, hue slider, optional
 * alpha slider, and a text field.
 *
 * This is the raw surface, the way `Calendar` is — no label, no popover. Use
 * `ColorSelector` for the form-field version.
 *
 * ACCESSIBILITY: the text field is the primary accessible path, and it accepts
 * every format the picker can emit. The hue and alpha tracks are genuine
 * one-dimensional sliders and carry the full `role="slider"` contract. The
 * square is two-dimensional, which ARIA has no honest role for, so it is a
 * focusable control with arrow-key support and a live description rather than a
 * slider that lies about having one value.
 */
import { computed, onMounted, ref, useId, watch } from 'vue'
import {
  COLOR_FORMATS,
  detectFormat,
  formatColor,
  hsvToRgb,
  parseColor,
  prefersDarkText,
  rgbToHsv,
  type ColorFormat,
  type Rgba
} from '@/utils/color'
import { Icon } from '@/components/Icon'
import type { ColorPickerProps } from './types'

const props = withDefaults(defineProps<ColorPickerProps>(), {
  alpha: false,
  eyedropper: true,
  systemPicker: true,
  hideInput: false,
  swatchShape: 'square',
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

/**
 * HSV is the editing model and the source of truth while the picker is open;
 * the emitted string is derived from it.
 *
 * Deriving the handles from the emitted colour instead would make them jump:
 * black has no hue and no saturation, so dragging to the bottom of the square
 * and back up again would come back at red, having thrown away the hue you were
 * working on. Keeping H, S and V here means only the parts a colour genuinely
 * determines are ever overwritten.
 */
const hue = ref(0)
const sat = ref(0)
const val = ref(0)
const opacity = ref(1)

/** What is in the text field, which may be mid-typing and unparseable. */
const text = ref('')
const activeFormat = ref<ColorFormat>('hex')
const hasEyeDropper = ref(false)
const systemInput = ref<HTMLInputElement>()

/** The last value we emitted, so our own echo does not reset the handles. */
let lastEmitted: string | null = null

const offeredFormats = computed(() =>
  COLOR_FORMATS.filter(
    (f) => !props.formats?.length || props.formats.includes(f.value)
  )
)

const showFormats = computed(
  () => !props.format && !props.hideInput && offeredFormats.value.length > 1
)

const current = computed<Rgba>(() => ({
  ...hsvToRgb(hue.value, sat.value, val.value),
  a: props.alpha ? opacity.value : 1
}))

const currentCss = computed(() => formatColor(current.value, 'rgb'))

/** The pure hue at full saturation and brightness, for the square's backdrop. */
const hueCss = computed(() =>
  formatColor({ ...hsvToRgb(hue.value, 1, 1), a: 1 }, 'rgb')
)

/**
 * The square's state in words. It describes the square and is announced as it
 * changes, which is the closest an honest two-dimensional control gets to the
 * running feedback `role="slider"` gives the two tracks.
 */
const descriptionId = useId()
const description = computed(
  () =>
    `Saturation ${Math.round(sat.value * 100)}%, ` +
    `brightness ${Math.round(val.value * 100)}%`
)

// --- reading a value in ---------------------------------------------------

function adopt(value: string | null | undefined) {
  const raw = value ?? ''
  const color = parseColor(raw)
  if (!color) {
    // Not something we can show on the square. Keep it visible in the field
    // rather than replacing it, so a value we simply do not understand
    // (`var(--octans-primary)`) survives being looked at.
    text.value = raw
    return
  }

  const [h, s, v] = rgbToHsv(color)
  // Only overwrite what this colour actually determines — see the note above.
  if (v > 0) {
    sat.value = s
    if (s > 0) hue.value = h
  }
  val.value = v
  opacity.value = color.a

  if (!props.format) {
    activeFormat.value = detectFormat(raw) ?? activeFormat.value
  }
  text.value = raw
}

watch(
  () => props.modelValue,
  (value) => {
    if (value === lastEmitted) return
    adopt(value)
  },
  { immediate: true }
)

watch(
  () => props.format,
  (format) => {
    if (format) activeFormat.value = format
  },
  { immediate: true }
)

// Turning alpha off must not leave a transparent value in place — the whole
// point of the flag is that the consumer cannot receive one.
watch(
  () => props.alpha,
  (allowed) => {
    if (!allowed && opacity.value < 1) {
      opacity.value = 1
      commit()
    }
  }
)

// --- writing a value out --------------------------------------------------

function commit() {
  const value = formatColor(current.value, activeFormat.value, props.alpha)
  text.value = value
  lastEmitted = value
  emit('update:modelValue', value)
}

function setFormat(format: ColorFormat) {
  activeFormat.value = format
  commit()
}

function onTextInput(value: string) {
  text.value = value
}

/** Commits the text field, if what is in it is a colour. */
function onTextChange(value: string) {
  const color = parseColor(value)
  if (!color) {
    // Put back what we know, rather than leaving a value that does not match
    // the handles above it.
    text.value = formatColor(current.value, activeFormat.value, props.alpha)
    return
  }
  if (!props.format)
    activeFormat.value = detectFormat(value) ?? activeFormat.value
  applyColor(color)
}

function applyColor(color: Rgba) {
  const [h, s, v] = rgbToHsv(color)
  if (v > 0) {
    sat.value = s
    if (s > 0) hue.value = h
  }
  val.value = v
  if (props.alpha) opacity.value = color.a
  commit()
}

function pickSwatch(value: string) {
  const color = parseColor(value)
  if (color) applyColor(color)
}

// --- pointer and keyboard handling ----------------------------------------

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

/**
 * Runs `onMove` for the whole drag, in fractions of the element's box.
 *
 * Pointer capture rather than window listeners: it keeps the events coming when
 * the pointer leaves the element — which it will, because people drag past the
 * edge to reach pure white — and the browser cleans up if the gesture is
 * cancelled.
 */
function drag(event: PointerEvent, onMove: (x: number, y: number) => void) {
  if (props.disabled) return
  const el = event.currentTarget as HTMLElement
  // Optional because pointer capture is not universal — jsdom has no such
  // method at all, and losing it costs only the drag-past-the-edge case.
  el.setPointerCapture?.(event.pointerId)

  const apply = (e: PointerEvent) => {
    const box = el.getBoundingClientRect()
    onMove(
      clamp01(box.width ? (e.clientX - box.left) / box.width : 0),
      clamp01(box.height ? (e.clientY - box.top) / box.height : 0)
    )
  }

  const stop = () => {
    el.removeEventListener('pointermove', apply)
    el.removeEventListener('pointerup', stop)
    el.removeEventListener('pointercancel', stop)
  }

  el.addEventListener('pointermove', apply)
  el.addEventListener('pointerup', stop)
  el.addEventListener('pointercancel', stop)
  apply(event)
}

function onAreaDrag(event: PointerEvent) {
  drag(event, (x, y) => {
    sat.value = x
    val.value = 1 - y
    commit()
  })
}

function onHueDrag(event: PointerEvent) {
  drag(event, (x) => {
    hue.value = x * 360
    commit()
  })
}

function onAlphaDrag(event: PointerEvent) {
  drag(event, (x) => {
    opacity.value = x
    commit()
  })
}

/** Arrow-key deltas, with the usual Shift-for-bigger convention. */
function stepOf(event: KeyboardEvent, small: number, big: number) {
  return event.shiftKey ? big : small
}

function onAreaKey(event: KeyboardEvent) {
  if (props.disabled) return
  const step = stepOf(event, 0.01, 0.1)
  switch (event.key) {
    case 'ArrowLeft':
      sat.value = clamp01(sat.value - step)
      break
    case 'ArrowRight':
      sat.value = clamp01(sat.value + step)
      break
    case 'ArrowUp':
      val.value = clamp01(val.value + step)
      break
    case 'ArrowDown':
      val.value = clamp01(val.value - step)
      break
    default:
      return
  }
  event.preventDefault()
  commit()
}

/** Shared arrow/Home/End handling for the two one-dimensional tracks. */
function trackKey(
  event: KeyboardEvent,
  value: number,
  max: number,
  set: (next: number) => void
) {
  if (props.disabled) return
  const step = stepOf(event, max / 100, max / 10)
  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowDown':
      set(Math.max(0, value - step))
      break
    case 'ArrowRight':
    case 'ArrowUp':
      set(Math.min(max, value + step))
      break
    case 'Home':
      set(0)
      break
    case 'End':
      set(max)
      break
    default:
      return
  }
  event.preventDefault()
  commit()
}

const onHueKey = (e: KeyboardEvent) =>
  trackKey(e, hue.value, 360, (n) => (hue.value = n))
const onAlphaKey = (e: KeyboardEvent) =>
  trackKey(e, opacity.value, 1, (n) => (opacity.value = n))

// --- eyedropper and the system dialog -------------------------------------

onMounted(() => {
  hasEyeDropper.value = typeof window !== 'undefined' && 'EyeDropper' in window
})

async function pickFromScreen() {
  interface EyeDropperResult {
    sRGBHex: string
  }
  const Ctor = (
    window as unknown as {
      EyeDropper?: new () => { open(): Promise<EyeDropperResult> }
    }
  ).EyeDropper
  if (!Ctor) return
  try {
    const { sRGBHex } = await new Ctor().open()
    const color = parseColor(sRGBHex)
    // The eyedropper reads pixels off a composited screen, so there is never
    // any transparency to take — keep whatever alpha was already set.
    if (color) applyColor({ ...color, a: opacity.value })
  } catch {
    // The only rejection is the user cancelling with Escape, which is not an
    // error and should leave the colour exactly as it was.
  }
}

function openSystemPicker() {
  systemInput.value?.click()
}

function onSystemInput(value: string) {
  const color = parseColor(value)
  // `input[type=color]` has no concept of alpha, so preserve ours.
  if (color) applyColor({ ...color, a: opacity.value })
}

defineExpose({ commit })
</script>

<template>
  <div :class="[$style.ColorPicker, disabled && $style.ColorPicker__disabled]">
    <div
      :class="$style.ColorPicker_area"
      :style="{ background: hueCss }"
      :tabindex="disabled ? -1 : 0"
      role="group"
      aria-label="Saturation and brightness. Use the arrow keys to adjust."
      :aria-describedby="descriptionId"
      :title="description"
      @pointerdown="onAreaDrag"
      @keydown="onAreaKey"
    >
      <div :class="$style.ColorPicker_areaSaturation" />
      <div :class="$style.ColorPicker_areaBrightness" />
      <span
        :class="$style.ColorPicker_areaHandle"
        :style="{
          left: `${sat * 100}%`,
          top: `${(1 - val) * 100}%`,
          background: currentCss
        }"
      />
    </div>

    <span
      :id="descriptionId"
      :class="$style.ColorPicker_srOnly"
      aria-live="polite"
    >
      {{ description }}
    </span>

    <div :class="$style.ColorPicker_tracks">
      <div :class="$style.ColorPicker_trackStack">
        <div
          :class="[$style.ColorPicker_track, $style.ColorPicker_track__hue]"
          role="slider"
          aria-label="Hue"
          :aria-valuemin="0"
          :aria-valuemax="360"
          :aria-valuenow="Math.round(hue)"
          :aria-valuetext="`${Math.round(hue)} degrees`"
          :aria-disabled="disabled"
          :tabindex="disabled ? -1 : 0"
          @pointerdown="onHueDrag"
          @keydown="onHueKey"
        >
          <span
            :class="$style.ColorPicker_trackHandle"
            :style="{ left: `${(hue / 360) * 100}%`, background: hueCss }"
          />
        </div>

        <div
          v-if="alpha"
          :class="[$style.ColorPicker_track, $style.ColorPicker_track__alpha]"
          role="slider"
          aria-label="Opacity"
          :aria-valuemin="0"
          :aria-valuemax="100"
          :aria-valuenow="Math.round(opacity * 100)"
          :aria-valuetext="`${Math.round(opacity * 100)} percent`"
          :aria-disabled="disabled"
          :tabindex="disabled ? -1 : 0"
          @pointerdown="onAlphaDrag"
          @keydown="onAlphaKey"
        >
          <span
            :class="$style.ColorPicker_alphaFill"
            :style="{
              backgroundImage: `linear-gradient(to right, transparent, ${formatColor(
                { ...current, a: 1 },
                'rgb'
              )})`
            }"
          />
          <span
            :class="$style.ColorPicker_trackHandle"
            :style="{ left: `${opacity * 100}%`, background: currentCss }"
          />
        </div>
      </div>

      <span
        :class="$style.ColorPicker_preview"
        :title="text"
        aria-hidden="true"
      >
        <span
          :class="$style.ColorPicker_previewFill"
          :style="{ background: currentCss }"
        />
      </span>
    </div>

    <div
      v-if="!hideInput"
      :class="$style.ColorPicker_row"
    >
      <input
        :class="$style.ColorPicker_input"
        :value="text"
        :disabled="disabled"
        spellcheck="false"
        autocomplete="off"
        aria-label="Colour value"
        @input="onTextInput(($event.target as HTMLInputElement).value)"
        @change="onTextChange(($event.target as HTMLInputElement).value)"
        @keydown.enter="onTextChange(($event.target as HTMLInputElement).value)"
      />

      <select
        v-if="showFormats"
        :class="$style.ColorPicker_format"
        :value="activeFormat"
        :disabled="disabled"
        aria-label="Colour format"
        :title="
          offeredFormats.find((f) => f.value === activeFormat)?.description
        "
        @change="
          setFormat(($event.target as HTMLSelectElement).value as ColorFormat)
        "
      >
        <option
          v-for="option in offeredFormats"
          :key="option.value"
          :value="option.value"
          :title="option.description"
        >
          {{ option.label }}
        </option>
      </select>

      <button
        v-if="eyedropper && hasEyeDropper"
        type="button"
        :class="$style.ColorPicker_button"
        :disabled="disabled"
        title="Pick a colour from the screen"
        aria-label="Pick a colour from the screen"
        @click="pickFromScreen"
      >
        <Icon icon="mdi:eyedropper-variant" />
      </button>

      <button
        v-if="systemPicker"
        type="button"
        :class="$style.ColorPicker_button"
        :disabled="disabled"
        title="Open the system colour picker"
        aria-label="Open the system colour picker"
        @click="openSystemPicker"
      >
        <Icon icon="mdi:palette-outline" />
      </button>

      <!--
        Offscreen rather than `display: none`: a hidden input cannot be opened
        by a script click in some browsers, but an unstyled offscreen one can.
      -->
      <input
        v-if="systemPicker"
        ref="systemInput"
        type="color"
        :class="$style.ColorPicker_systemInput"
        :value="formatColor(current, 'hex', false)"
        tabindex="-1"
        aria-hidden="true"
        @input="onSystemInput(($event.target as HTMLInputElement).value)"
      />
    </div>

    <div
      v-if="swatches?.length"
      :class="$style.ColorPicker_swatches"
    >
      <button
        v-for="swatch in swatches"
        :key="swatch"
        type="button"
        :class="[
          $style.ColorPicker_swatch,
          swatchShape === 'circle' && $style.ColorPicker_swatch__circle,
          parseColor(swatch) &&
            prefersDarkText(parseColor(swatch)!) &&
            $style.ColorPicker_swatch__light
        ]"
        :disabled="disabled"
        :title="swatch"
        :aria-label="swatch"
        @click="pickSwatch(swatch)"
      >
        <!--
          The colour goes on a child rather than on the button: a background
          image paints above a background colour, so a checkerboard on the same
          element would sit on top of the colour instead of behind it.
        -->
        <span
          :class="$style.ColorPicker_swatchFill"
          :style="{ background: swatch }"
        />
      </button>
    </div>
  </div>
</template>

<style lang="scss" module>
@import '../../styles/variables';

$handleSize: 14px;
$trackHeight: 12px;

// Shown behind anything that can be semi-transparent, so alpha reads as alpha
// rather than as a lighter colour.
@mixin checkerboard {
  background-image:
    linear-gradient(
      45deg,
      var(--octans-border-strong) 25%,
      transparent 25% 75%,
      var(--octans-border-strong) 75%
    ),
    linear-gradient(
      45deg,
      var(--octans-border-strong) 25%,
      transparent 25% 75%,
      var(--octans-border-strong) 75%
    );
  background-size: 10px 10px;
  background-position:
    0 0,
    5px 5px;
  background-color: var(--octans-surface);
}

@mixin handle {
  position: absolute;
  width: $handleSize;
  height: $handleSize;
  border-radius: 50%;
  // Two rings rather than one: a single-coloured ring disappears against
  // roughly half the colours it has to sit on top of.
  box-shadow:
    0 0 0 2px #fff,
    0 0 0 3px rgb(0 0 0 / 0.35);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.ColorPicker {
  display: flex;
  flex-direction: column;
  gap: $s2;
  width: 100%;
  min-width: 200px;
  font-family: var(--octans-font);
  color: var(--octans-text);
}

.ColorPicker__disabled {
  opacity: 0.5;
  pointer-events: none;
}

// --- the square -----------------------------------------------------------

.ColorPicker_area {
  position: relative;
  width: 100%;
  height: 140px;
  border-radius: var(--octans-radius-box);
  cursor: crosshair;
  touch-action: none;
  overflow: hidden;

  &:focus-visible {
    outline: 2px solid $focusColor;
    outline-offset: 2px;
  }
}

// White across, black down — the two overlays that turn a flat hue into an
// HSV square. Kept as separate elements so the hue underneath can be a plain
// background colour that the handle can also read.
.ColorPicker_areaSaturation,
.ColorPicker_areaBrightness {
  position: absolute;
  inset: 0;
}
.ColorPicker_areaSaturation {
  background: linear-gradient(to right, #fff, transparent);
}
.ColorPicker_areaBrightness {
  background: linear-gradient(to top, #000, transparent);
}

.ColorPicker_areaHandle {
  @include handle;
}

// --- the tracks -----------------------------------------------------------

.ColorPicker_tracks {
  display: flex;
  gap: $s2;
  align-items: center;
}

.ColorPicker_trackStack {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: $s2;
  min-width: 0;
}

.ColorPicker_track {
  position: relative;
  height: $trackHeight;
  border-radius: var(--octans-radius-full);
  cursor: pointer;
  touch-action: none;

  &:focus-visible {
    outline: 2px solid $focusColor;
    outline-offset: 2px;
  }
}

.ColorPicker_track__hue {
  background: linear-gradient(
    to right,
    #f00 0%,
    #ff0 17%,
    #0f0 33%,
    #0ff 50%,
    #00f 67%,
    #f0f 83%,
    #f00 100%
  );
}

.ColorPicker_track__alpha {
  @include checkerboard;
}

.ColorPicker_alphaFill {
  position: absolute;
  inset: 0;
  border-radius: inherit;
}

.ColorPicker_trackHandle {
  @include handle;
  top: 50%;
}

.ColorPicker_preview {
  @include checkerboard;
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  border: 1px solid var(--octans-border-strong);
  border-radius: var(--octans-radius-field);
  overflow: hidden;
}

.ColorPicker_previewFill {
  display: block;
  width: 100%;
  height: 100%;
}

// --- the row --------------------------------------------------------------

.ColorPicker_row {
  display: flex;
  gap: $s1;
  align-items: stretch;
}

.ColorPicker_input,
.ColorPicker_format,
.ColorPicker_button {
  min-height: 28px;
  padding: 2px 6px;
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
}

.ColorPicker_input {
  flex: 1;
  min-width: 0;
  font-family: var(--octans-font-mono);
}

.ColorPicker_format {
  flex: 0 0 auto;
  cursor: pointer;
}

.ColorPicker_button {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 28px;
  padding: 0;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--octans-surface-hover);
  }
}

// Kept in the layout but off screen — see the note in the template.
.ColorPicker_systemInput {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

// --- swatches -------------------------------------------------------------

.ColorPicker_swatches {
  display: flex;
  flex-wrap: wrap;
  gap: $s1;
}

.ColorPicker_swatch {
  @include checkerboard;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 1px solid var(--octans-border-strong);
  border-radius: var(--octans-radius-field);
  cursor: pointer;
  overflow: hidden;

  &:focus-visible {
    outline: 2px solid $focusColor;
    outline-offset: 1px;
  }
  &:hover:not(:disabled) {
    transform: scale(1.1);
  }
}

.ColorPicker_swatchFill {
  display: block;
  width: 100%;
  height: 100%;
}

.ColorPicker_swatch__circle {
  border-radius: var(--octans-radius-full);
}

// A pale swatch needs a stronger edge or it vanishes into the surface.
.ColorPicker_swatch__light {
  border-color: var(--octans-text-subdued);
}

// Present for assistive technology, absent visually. `clip-path` alone would
// stop a screen reader announcing it in some engines, hence the belt-and-braces
// of a 1px box as well.
.ColorPicker_srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  overflow: hidden;
  white-space: nowrap;
  clip-path: inset(50%);
}
</style>
