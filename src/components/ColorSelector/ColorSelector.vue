<script lang="ts" setup>
/**
 * The colour field: a swatch you click to open a picker.
 *
 * This is to `ColorPicker` and `GradientPicker` what `DatePicker` is to
 * `Calendar` — the label, error and help text live here, and the surfaces stay
 * free of them so they can also be embedded elsewhere.
 *
 * `mode` decides what it holds. In `both` mode the value's TYPE says which it
 * currently is: a string is a colour, an object is a gradient. That is why
 * there is no separate "kind" prop to keep in sync — the value cannot disagree
 * with itself.
 */
import { computed, ref, useCssModule, watch } from 'vue'
import { Labelled } from '@/components/Labelled'
import { Popper } from '@/components/Popper'
import { Icon } from '@/components/Icon'
import { ColorPicker } from '@/components/ColorPicker'
import { GradientPicker } from '@/components/GradientPicker'
import { formatColor, parseColor } from '@/utils/color'
import {
  createGradient,
  gradientCss,
  GRADIENT_TYPES,
  INTERPOLATION_SPACES,
  isGradient,
  sampleGradient,
  type Gradient
} from '@/utils/gradient'
import type { ColorSelectorProps } from './types'

const props = withDefaults(defineProps<ColorSelectorProps>(), {
  mode: 'color',
  alpha: false,
  eyedropper: true,
  systemPicker: true,
  placement: 'bottom-start',
  trigger: 'button',
  fullWidth: false,
  swatchShape: 'square',
  swatchSize: 20,
  rememberSwatches: false,
  maxSwatches: undefined,
  showValue: true,
  placeholder: 'Choose a colour',
  clearable: false,
  hideShape: false,
  hideSpace: false,
  minStops: 2,
  maxStops: 8,
  pinStart: false,
  pinEnd: false,
  readonly: false,
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | Gradient): void
  /**
   * The palette, after a colour has been added to it. Only fired when
   * `rememberSwatches` is on — bind it with `v-model:swatches` to hold the list
   * outside the field.
   */
  (e: 'update:swatches', value: string[]): void
}>()

const $style = useCssModule()

const locked = computed(() => props.disabled || props.readonly)

const showsValue = computed(() => props.showValue && props.trigger === 'button')
const isEditable = computed(() => props.trigger === 'input')

const swatchStyleVars = computed(() => ({
  '--ColorSelector-swatchSize':
    typeof props.swatchSize === 'number'
      ? `${props.swatchSize}px`
      : props.swatchSize
}))

const isGradientValue = computed(() => isGradient(props.modelValue))
const colorValue = computed(() =>
  typeof props.modelValue === 'string' ? props.modelValue : ''
)
const hasValue = computed(() =>
  isGradientValue.value ? true : colorValue.value.trim().length > 0
)

/**
 * Which surface is showing.
 *
 * Derived from the value in `both` mode, but held separately so that switching
 * to gradient on an empty field sticks — there is nothing in the value yet to
 * derive it from.
 */
const showingGradient = ref(props.mode === 'gradient' || isGradientValue.value)

watch(
  () => props.modelValue,
  () => {
    if (props.mode === 'both') showingGradient.value = isGradientValue.value
  }
)
watch(
  () => props.mode,
  (mode) => {
    if (mode !== 'both') showingGradient.value = mode === 'gradient'
  }
)

/**
 * Whether the swatch can paint the current value.
 *
 * A token may hold something perfectly valid that is not a flat colour —
 * `var(--octans-primary)`, `color-mix()` — and painting the swatch with it would
 * resolve against the EDITOR's theme and show a colour that has nothing to do
 * with the value being edited. Better to say we cannot draw it.
 */
const isPaintable = computed(
  () => isGradientValue.value || parseColor(colorValue.value) !== null
)

const swatchStyle = computed(() => {
  if (isGradientValue.value) {
    // Left-to-right whatever the shape: a conic gradient in a 20px box is
    // unreadable, and the summary says what shape it is.
    const g = props.modelValue as Gradient
    return { backgroundImage: gradientCss({ ...g, type: 'linear', angle: 90 }) }
  }
  return { background: colorValue.value }
})

const gradientSummary = computed(() => {
  const g = props.modelValue as Gradient
  const type = GRADIENT_TYPES.find((t) => t.value === g.type)?.label ?? g.type
  const space =
    INTERPOLATION_SPACES.find((s) => s.value === g.space)?.label ?? g.space
  const count = g.stops.length
  const shape =
    props.hideShape || g.type === 'radial' ? type : `${type} ${g.angle}°`
  return `${shape} · ${count} stop${count === 1 ? '' : 's'} · ${space}`
})

const valueText = computed(() =>
  isGradientValue.value ? gradientSummary.value : colorValue.value
)

/** What opening the picker is called, for the trigger's accessible name. */
const openLabel = computed(() =>
  hasValue.value
    ? `${isGradientValue.value ? 'Gradient' : 'Colour'}: ${valueText.value}`
    : (props.placeholder as string)
)

/**
 * Shared by both triggers, which draw the same swatch inside different
 * elements — a computed rather than the list written twice, so the two cannot
 * drift apart.
 */
const swatchClasses = computed(() => [
  $style.ColorSelector_swatch,
  props.swatchShape === 'circle' && $style.ColorSelector_swatch__circle,
  props.error &&
    props.trigger === 'swatch' &&
    $style.ColorSelector_swatch__hasError,
  // A circle stays a circle: widening it for a gradient would draw an ellipse,
  // and a gradient reading well matters less than the shape that was asked for.
  isGradientValue.value &&
    props.swatchShape !== 'circle' &&
    $style.ColorSelector_swatch__wide
])

/** The gradient to edit, invented from the colour if there isn't one yet. */
const gradientValue = computed<Gradient>(() => {
  if (isGradientValue.value) return props.modelValue as Gradient
  const color = parseColor(colorValue.value)
  const hex = color ? formatColor(color, 'hex', props.alpha) : '#ffffff'
  // Both stops take the colour that was already there, so switching to a
  // gradient changes nothing you can see. Any other choice would invent a
  // second colour you did not ask for, and you would have to undo it before
  // you could start.
  return createGradient({
    stops: [
      { color: hex, position: 0 },
      { color: hex, position: 100 }
    ]
  })
})

function setColor(value: string) {
  emit('update:modelValue', value)
}

function setGradient(value: Gradient) {
  emit('update:modelValue', value)
}

function showColor() {
  showingGradient.value = false
  if (!isGradientValue.value) return
  // Collapsing a gradient has to pick one colour out of it. The first stop is
  // the predictable answer — sampling the middle would hand back a colour that
  // is not written anywhere in the gradient you were just looking at.
  const g = props.modelValue as Gradient
  const first = sampleGradient(g, 0)
  emit('update:modelValue', first ? formatColor(first, 'hex', props.alpha) : '')
}

function showGradient() {
  showingGradient.value = true
  if (!isGradientValue.value) emit('update:modelValue', gradientValue.value)
}

function clear() {
  if (locked.value) return
  emit('update:modelValue', '')
}

// --- typing the value -----------------------------------------------------

/**
 * What is in the text field, which is NOT the model while it is being typed.
 * `#ff` is a half-written colour, not a colour, and pushing every keystroke
 * through the model would either reject it or paint the swatch with rubbish.
 */
const draft = ref(colorValue.value)
const editing = ref(false)

watch(colorValue, (value) => {
  if (!editing.value) draft.value = value
})

function commitDraft() {
  if (locked.value) return
  const value = draft.value.trim()
  if (value === colorValue.value) return
  // Emitted whether or not it parses. A colour this field cannot paint is
  // still a legitimate value here — `var(--brand)` is the case the swatch's
  // "cannot draw this" mark already exists for — so refusing to accept one
  // typed in would contradict the rest of the component.
  emit('update:modelValue', value)
}

function onInputBlur() {
  editing.value = false
  // Back to whatever the model ended up holding: the value just committed if
  // the parent took it, or the old one if it did not.
  draft.value = colorValue.value
}

// --- remembering picked colours -------------------------------------------

/**
 * What the field held when the popover opened, so closing can tell whether
 * anything was actually chosen. Opening a picker and closing it again should
 * not add the colour that was already there.
 */
let openedWith: string | Gradient | null | undefined

/**
 * Two spellings of the same colour must not both end up in the palette, so
 * comparison happens on a normalised form while the palette keeps the string
 * that was actually picked. Anything unparseable compares as itself — a token
 * like `var(--brand)` is not a colour we can normalise, and two different
 * tokens are two different entries.
 */
function swatchKey(value: string) {
  const color = parseColor(value)
  return color ? formatColor(color, 'hex', true) : value.trim().toLowerCase()
}

function onPopoverToggle(visible: boolean) {
  if (visible) {
    openedWith = props.modelValue
    return
  }
  rememberCurrent()
}

function rememberCurrent() {
  if (!props.rememberSwatches) return
  // Nothing was picked — the popover was opened and closed again.
  if (props.modelValue === openedWith) return
  const value = colorValue.value
  if (isGradientValue.value || !value || parseColor(value) === null) return

  const key = swatchKey(value)
  const rest = (props.swatches ?? []).filter(
    (swatch) => swatchKey(swatch) !== key
  )
  const next = [value, ...rest]
  emit(
    'update:swatches',
    props.maxSwatches === undefined
      ? next
      : next.slice(0, Math.max(1, props.maxSwatches))
  )
}
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
      :class="[$style.ColorSelector, fullWidth && $style.ColorSelector__full]"
      :style="swatchStyleVars"
    >
      <Popper
        :placement="placement"
        :disabled="locked"
        :auto-trigger-toggle="!isEditable"
        auto-hide
        @update:visible="onPopoverToggle"
      >
        <!--
          `toggle` is only used by the editable trigger, which drives the
          popover itself — see `autoTriggerToggle` below.
        -->
        <template #trigger="{ toggle }">
          <!--
            The editable trigger is a DIV, not a button: an `<input>` cannot
            live inside a `<button>`, and the whole point here is that the value
            can be typed. The swatch becomes its own button and opens the
            picker; clicking the text does what clicking text should, which is
            put a caret in it.
          -->
          <div
            v-if="isEditable"
            :class="[
              $style.ColorSelector_trigger,
              $style.ColorSelector_trigger__editable,
              error && $style.ColorSelector_trigger__hasError,
              locked && $style.ColorSelector_trigger__locked
            ]"
          >
            <button
              type="button"
              :class="$style.ColorSelector_swatchButton"
              :disabled="locked"
              :aria-label="openLabel"
              @click="toggle()"
            >
              <span
                :class="swatchClasses"
                aria-hidden="true"
              >
                <span
                  v-if="isPaintable"
                  :class="$style.ColorSelector_swatchFill"
                  :style="swatchStyle"
                />
                <Icon
                  v-else-if="hasValue"
                  :class="$style.ColorSelector_swatchUnknown"
                  icon="mdi:help"
                />
              </span>
            </button>

            <input
              :class="$style.ColorSelector_input"
              type="text"
              spellcheck="false"
              autocomplete="off"
              :value="isGradientValue ? gradientSummary : draft"
              :placeholder="placeholder"
              :disabled="disabled"
              :readonly="readonly || isGradientValue"
              :aria-label="
                typeof label === 'string' && label ? label : 'Colour'
              "
              @focus="editing = true"
              @input="draft = ($event.target as HTMLInputElement).value"
              @change="commitDraft"
              @blur="onInputBlur"
              @keydown.enter.prevent="
                ($event.target as HTMLInputElement).blur()
              "
            />
          </div>

          <button
            v-else
            type="button"
            :class="[
              $style.ColorSelector_trigger,
              trigger === 'swatch' && $style.ColorSelector_trigger__bare,
              error &&
                trigger === 'button' &&
                $style.ColorSelector_trigger__hasError
            ]"
            :disabled="locked"
            :aria-label="openLabel"
          >
            <span
              :class="swatchClasses"
              aria-hidden="true"
            >
              <span
                v-if="isPaintable"
                :class="$style.ColorSelector_swatchFill"
                :style="swatchStyle"
              />
              <!--
                A value we cannot paint gets a mark rather than an empty box, so
                "no colour set" and "a colour we cannot draw" do not look alike.
              -->
              <Icon
                v-else-if="hasValue"
                :class="$style.ColorSelector_swatchUnknown"
                icon="mdi:help"
              />
            </span>

            <span
              v-if="showsValue"
              :class="[
                $style.ColorSelector_value,
                isGradientValue && $style.ColorSelector_value__summary,
                !hasValue && $style.ColorSelector_value__empty
              ]"
            >
              {{ hasValue ? valueText : placeholder }}
            </span>
          </button>
        </template>

        <template #default>
          <div
            :class="[
              $style.ColorSelector_popper,
              showingGradient && $style.ColorSelector_popper__gradient
            ]"
          >
            <div
              v-if="mode === 'both'"
              :class="$style.ColorSelector_tabs"
              role="tablist"
            >
              <button
                type="button"
                role="tab"
                :aria-selected="!showingGradient"
                :class="[
                  $style.ColorSelector_tab,
                  !showingGradient && $style.ColorSelector_tab__active
                ]"
                @click="showColor"
              >
                Solid
              </button>
              <button
                type="button"
                role="tab"
                :aria-selected="showingGradient"
                :class="[
                  $style.ColorSelector_tab,
                  showingGradient && $style.ColorSelector_tab__active
                ]"
                @click="showGradient"
              >
                Gradient
              </button>
            </div>

            <!--
              `inline-color` because this picker is already inside a popover,
              and a stop's colour swatch would open a third floating layer on
              top of it. That nests correctly — reka-ui only sends outside
              clicks to the topmost layer, so this panel survives — but the
              stop picker lands offset from a swatch a few pixels wide, which
              is a poor thing to have to aim at. Edited in place instead.
            -->
            <GradientPicker
              v-if="showingGradient"
              :model-value="gradientValue"
              :alpha="alpha"
              :types="types"
              :hide-shape="hideShape"
              :hide-space="hideSpace"
              :min-stops="minStops"
              :max-stops="maxStops"
              :pin-start="pinStart"
              :pin-end="pinEnd"
              :swatches="swatches"
              :swatch-shape="swatchShape"
              :disabled="locked"
              inline-color
              @update:model-value="setGradient"
            />
            <ColorPicker
              v-else
              :model-value="colorValue"
              :alpha="alpha"
              :format="format"
              :formats="formats"
              :swatches="swatches"
              :swatch-shape="swatchShape"
              :eyedropper="eyedropper"
              :system-picker="systemPicker"
              :hide-input="hideInput"
              :disabled="locked"
              @update:model-value="setColor"
            />
          </div>
        </template>
      </Popper>

      <button
        v-if="clearable && hasValue"
        type="button"
        :class="$style.ColorSelector_clear"
        :disabled="locked"
        title="Clear the value"
        aria-label="Clear the value"
        @click="clear"
      >
        <Icon icon="mdi:close" />
      </button>
    </div>
  </Labelled>
</template>

<style lang="scss" module>
@import '../../styles/variables';

.ColorSelector {
  display: flex;
  gap: $s1;
  align-items: center;
}

.ColorSelector__full {
  width: 100%;

  // The Popper wraps the trigger in a div of its own, so the width has to be
  // handed through that before it reaches the control. `:first-child` and not
  // `*`, because the clear button beside it must stay its own size.
  > :first-child {
    flex: 1 1 auto;
    min-width: 0;
  }

  .ColorSelector_trigger {
    width: 100%;
  }
}

.ColorSelector_trigger {
  display: flex;
  gap: $s2;
  align-items: center;
  min-height: $inputMinHeight;
  padding: 2px 8px;
  background: var(--octans-surface);
  color: var(--octans-text);
  border: 1px solid var(--octans-border-strong);
  border-radius: var(--octans-radius-field);
  font: inherit;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--octans-surface-hover);
  }
  &:focus-visible {
    outline: 2px solid $focusColor;
    outline-offset: 1px;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

// The colour and nothing else: no box to sit in, no room reserved around it.
// The swatch keeps its own border, so it still reads as a control rather than
// as a coloured rectangle painted on the page.
.ColorSelector_trigger__bare {
  min-height: 0;
  padding: 0;
  background: none;
  border: 0;
  border-radius: var(--octans-radius-full);

  &:hover:not(:disabled) {
    background: none;
  }
  // Hugs the swatch, and follows it round when the swatch is a circle.
  &:focus-visible {
    outline-offset: 2px;
  }
}

.ColorSelector_trigger__hasError {
  border-color: $errorColor;
}

// --- the editable trigger --------------------------------------------------

// A div wearing the trigger's clothes, because it contains an input. The focus
// ring moves to it from the input inside, so the control lights up as one thing
// rather than growing a second box within itself.
.ColorSelector_trigger__editable {
  padding-right: 0;
  cursor: text;

  // Matching the base rule's specificity on purpose: a text field does not
  // light up under the pointer the way a button does, and `:hover:not(:disabled)`
  // on the base would otherwise win.
  &:hover:not(:disabled) {
    background: var(--octans-surface);
  }
  &:focus-within {
    outline: 2px solid $focusColor;
    outline-offset: 1px;
  }
}

.ColorSelector_trigger__locked {
  background: var(--octans-surface-disabled);
  cursor: not-allowed;
}

// The swatch's own button, since the surrounding element can no longer be one.
.ColorSelector_swatchButton {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  padding: 0;
  background: none;
  border: 0;
  border-radius: var(--octans-radius-full);
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid $focusColor;
    outline-offset: 2px;
  }
  &:disabled {
    cursor: not-allowed;
  }
}

.ColorSelector_input {
  flex: 1 1 auto;
  min-width: 0;
  padding: 0 8px 0 0;
  background: none;
  color: var(--octans-text);
  border: 0;
  font-family: var(--octans-font-mono);
  font-size: 12px;

  // The field already draws one around the whole control on `:focus-within`.
  &:focus {
    outline: none;
  }
  &::placeholder {
    color: var(--octans-text-subdued);
    font-family: var(--octans-font);
  }
  &:read-only {
    cursor: default;
  }
  &:disabled {
    color: var(--octans-text-disabled);
    cursor: not-allowed;
  }
}

.ColorSelector_swatch {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  // Sized from a property rather than a fixed 20px, because a bare swatch is
  // the whole control and 20px is a small thing to hit.
  width: var(--ColorSelector-swatchSize, 20px);
  height: var(--ColorSelector-swatchSize, 20px);
  border: 1px solid var(--octans-border-strong);
  border-radius: var(--octans-radius-field);
  overflow: hidden;
  // Checkerboard behind the fill, so a translucent value reads as translucent
  // rather than as a paler one.
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
  background-size: 8px 8px;
  background-position:
    0 0,
    4px 4px;
  background-color: var(--octans-surface);
}

.ColorSelector_swatch__circle {
  border-radius: var(--octans-radius-full);
}

// With no bordered control around it, a bare swatch has nothing else to carry
// the error. Doubling the border keeps the swatch its stated size.
.ColorSelector_swatch__hasError {
  border-color: $errorColor;
  box-shadow: 0 0 0 1px $errorColor;
}

// A gradient needs room to read as one; a square shows barely two stops.
// Proportional to the swatch, so raising `swatchSize` widens it to match.
.ColorSelector_swatch__wide {
  width: calc(var(--ColorSelector-swatchSize, 20px) * 2.6);
}

.ColorSelector_swatchFill {
  display: block;
  width: 100%;
  height: 100%;
}

.ColorSelector_swatchUnknown {
  color: var(--octans-text-subdued);
  font-size: 12px;
}

.ColorSelector_value {
  font-family: var(--octans-font-mono);
  font-size: 12px;
  white-space: nowrap;
}

.ColorSelector_value__summary,
.ColorSelector_value__empty {
  font-family: var(--octans-font);
}

.ColorSelector_value__empty {
  color: var(--octans-text-subdued);
}

.ColorSelector_popper {
  width: 236px;
  padding: $s3;
  background: var(--octans-surface);
  border: 1px solid var(--octans-border);
  border-radius: var(--octans-radius-box);
  box-shadow: var(--octans-shadow-md);
}

// The gradient surface has a bar and a toolbar that both want the width.
.ColorSelector_popper__gradient {
  width: 300px;
}

.ColorSelector_tabs {
  display: flex;
  gap: 2px;
  margin-bottom: $s2;
  padding: 2px;
  background: var(--octans-surface-sunken);
  border-radius: var(--octans-radius-field);
}

.ColorSelector_tab {
  flex: 1;
  padding: 3px 8px;
  background: none;
  color: var(--octans-text-subdued);
  border: 0;
  border-radius: var(--octans-radius-field);
  font: inherit;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    color: var(--octans-text);
  }
  &:focus-visible {
    outline: 2px solid $focusColor;
  }
}

.ColorSelector_tab__active {
  background: var(--octans-surface);
  color: var(--octans-text);
  box-shadow: var(--octans-shadow-sm);
}

.ColorSelector_clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  color: var(--octans-text-subdued);
  border: 0;
  border-radius: var(--octans-radius-field);
  cursor: pointer;

  &:hover:not(:disabled) {
    color: var(--octans-text);
    background: var(--octans-surface-hover);
  }
  &:focus-visible {
    outline: 2px solid $focusColor;
  }
}
</style>
