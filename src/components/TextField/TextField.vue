<script lang="ts" setup>
import { Labelled } from '@/components/Labelled'
import { PreventAutoComplete } from '@/components/PreventAutoComplete'
import { inputToNumber } from '@/utils'
import { Mask, MaskInput, type MaskaDetail } from 'maska'
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch
} from 'vue'
import type { TextFieldProps } from './types'

const props = withDefaults(defineProps<TextFieldProps>(), {
  type: 'text',
  emptyValue: ''
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null, event?: Event): void
  (e: 'keydown', event: KeyboardEvent): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'click', event: MouseEvent): void
}>()

const height = ref<number>(0)
const input = ref<HTMLElement>()
const ghost = ref<HTMLElement>()
const LINE_HEIGHT = 24

// --- Input masking (single-line only) -------------------------------------
// maska owns the live value + caret of the underlying input and reports
// changes via its `onMaska` callback, so when a mask is active we emit from
// there (see `onMaska`) and let `onInput` bail out. `maskInput` is only
// instantiated while a `mask` is set and `multiline` is off.
let maskInput: MaskInput | undefined
// Standalone `Mask` used purely to render the masked display value when
// `unmask` is on (the input must stay masked while `modelValue` is raw).
const mask = shallowRef<Mask | null>(null)

const hasMask = computed(() => Boolean(props.mask) && !props.multiline)

const maskOptions = () => ({
  mask: props.mask,
  tokens: props.maskTokens,
  eager: props.maskEager,
  reversed: props.maskReversed
})

function teardownMask() {
  maskInput?.destroy()
  maskInput = undefined
  mask.value = null
}

function setupMask() {
  teardownMask()
  if (!hasMask.value) return
  const el = input.value as HTMLInputElement | undefined
  if (!el) return
  mask.value = new Mask(maskOptions())
  maskInput = new MaskInput(el, {
    ...maskOptions(),
    onMaska: onMaska
  })
}

function onMaska(detail: MaskaDetail) {
  const value = props.unmask ? detail.unmasked : detail.masked
  emit('update:modelValue', value === '' ? props.emptyValue : value)
}

// The value bound to the input. With `unmask` the model holds the raw value,
// so we render the masked form instead. Otherwise the model is already what
// should be displayed.
const displayValue = computed(() => {
  if (hasMask.value && props.unmask && mask.value) {
    return mask.value.masked(props.modelValue ?? '')
  }
  return props.modelValue
})

onMounted(setupMask)
onBeforeUnmount(teardownMask)
watch(
  () => [
    props.mask,
    props.multiline,
    props.unmask,
    props.maskTokens,
    props.maskEager,
    props.maskReversed
  ],
  setupMask
)

function onInput(event: KeyboardEvent) {
  // When a mask is active, maska has already transformed the value and
  // `onMaska` handles the emit — including for maska's synthetic input events.
  if (maskInput) return
  let value = (event.target as HTMLInputElement)?.value
  if (props.type === 'number') {
    value = inputToNumber(value)
  }
  /**
   * Triggered when the value of the underlying input element changes.
   *
   * @event input
   * @property {string | number} value If `type` is "number" the value will
   * be coerced to a number.
   * @property {KeyboardEvent} event
   */
  if (value === '') {
    emit('update:modelValue', props.emptyValue, event)
  } else {
    emit('update:modelValue', value, event)
  }
  if (props.multiline) {
    updateHeight()
  }
}

function onKeydown(event: KeyboardEvent) {
  /**
   * Bound directly to the underlying input element.
   */
  emit('keydown', event)
}

function updateHeight() {
  // `$nextTick` didn't work in all situations. I think this might occur when
  // the component is nested in more complex layouts which contain conditional
  // rendering. `setTimeout` seems to work consistently.
  setTimeout(() => {
    const el = ghost.value
    if (el) {
      if (props.multiline) {
        // Checks the multiline prop value, and always defaults to 2 rows unless specified
        const multilineVal =
          typeof props.multiline !== 'boolean'
            ? parseInt(props.multiline.toString())
            : 2
        height.value = Math.max(
          LINE_HEIGHT * multilineVal + 10,
          el.clientHeight
        )
      } else {
        height.value = Math.max(LINE_HEIGHT + 1, el.clientHeight)
      }
    }
  }, 0)
}

function focus() {
  input.value?.focus?.()
}

function onFocus(event: FocusEvent) {
  emit('focus', event)
}
function onBlur(event: FocusEvent) {
  emit('blur', event)
}
function onClick(event: MouseEvent) {
  emit('click', event)
}

defineExpose({ focus })

watch(
  () => props.multiline,
  (multiline: (typeof props)['multiline']) => {
    height.value = multiline ? LINE_HEIGHT + 1 : 0
  },
  { immediate: true }
)

watch(
  () => props.modelValue,
  () => {
    updateHeight()
  },
  { immediate: true }
)
</script>

<template>
  <Labelled
    :label="label"
    :error="error"
    :help-text="helpText"
    :help-text-html="helpTextHtml"
    :help-link="helpLink"
  >
    <PreventAutoComplete :enabled="autocomplete === 'off'">
      <div
        :class="[
          'UIElement',
          $style.TextField,
          error && $style.TextField__hasError,
          align && $style['TextField__align_' + align],
          multiline && $style.TextField__multiline,
          disabled && $style.isDisabled,
          (prefix || $slots.prefix) && $style.TextField__hasPrefix,
          (suffix || $slots.suffix) && $style.TextField__hasSuffix,
          $slots.left && $style.TextField__hasLeft,
          $slots.right && $style.TextField__hasRight
        ]"
      >
        <div
          v-if="$slots.left"
          :class="$style.TextField_left"
        >
          <!-- @slot Injects content outside the input to the left. -->
          <slot name="left"></slot>
        </div>
        <div :class="[$style.TextField_control]">
          <div
            v-if="prefix || $slots.prefix"
            :class="$style.TextField_prefix"
          >
            <!-- @slot Injects content within the input to the left. -->
            <slot name="prefix">{{ prefix }}</slot>
          </div>
          <component
            :is="multiline ? 'textarea' : 'input'"
            :class="$style.TextField_input"
            :type="multiline ? null : type"
            :value.prop="displayValue"
            :placeholder="placeholder"
            :disabled="disabled"
            :readonly="readonly"
            :min="min"
            :max="max"
            :step="step"
            :maxlength="maxLength"
            :style="[
              inputStyle,
              {
                height: height ? height + 'px' : null,
                fontFamily: monospace ? 'monospace' : 'inherit'
              }
            ]"
            :autocomplete="autocomplete"
            ref="input"
            @input="onInput"
            @keydown="onKeydown"
            @click="onClick"
            @focus="onFocus"
            @blur="onBlur"
          />
          <div
            v-if="suffix || $slots.suffix"
            :class="$style.TextField_suffix"
          >
            <!-- @slot Injects content within the input to the right. -->
            <slot name="suffix">{{ suffix }}</slot>
          </div>
          <div
            v-if="multiline"
            :class="[$style.TextField_input, $style.TextField_ghost]"
            :style="[
              inputStyle,
              { fontFamily: monospace ? 'monospace' : 'inherit' }
            ]"
            ref="ghost"
            aria-hidden="true"
          >
            {{ modelValue + '\n' }}
          </div>
        </div>
        <div
          v-if="$slots.right"
          :class="$style.TextField_right"
        >
          <!-- @slot Injects content outside the input to the right. -->
          <slot name="right"></slot>
        </div>
      </div>
    </PreventAutoComplete>
  </Labelled>
</template>

<style lang="scss" module>
@import '../../styles/variables';

$shadowInner: none;
$shadowBorderFocus: 0 0 0 1px $focusColor;
$shadowBorderError: 0 0 0 1px $errorColor;
$fontSize: 14px;
$inputHeight: 34px;
$addonOuterMargin: 12px;
$addonInnerMargin: 8px;

.TextField {
  display: flex;
}

.TextField_control {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-height: $inputHeight;

  background: var(--octans-surface);
  border-radius: var(--octans-radius-field);
  border: 1px solid $inputBorderColor;
  box-shadow: $shadowInner;
  font-size: $fontSize;

  &:focus-within {
    z-index: 1;
    border-color: $focusColor;
    box-shadow: $shadowInner, $shadowBorderFocus;
  }

  .TextField__hasLeft & {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  .TextField__hasRight & {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .TextField__hasError & {
    background: $errorBgColor;
    border-color: $errorColor;

    .TextField_input {
      background: $errorBgColor;
    }

    &:focus-within {
      box-shadow: $shadowInner, $shadowBorderError;
    }
  }

  .isDisabled & {
    background: $inputDisabledBgColor;
  }
}

.TextField_input {
  display: block;
  width: 100%;
  min-height: $inputHeight;
  padding: 5px 12px;
  border: 0;
  box-shadow: $shadowInner;
  border-radius: var(--octans-radius-field);
  font-size: $fontSize;
  // Form controls inherit neither colour nor background, so without these the
  // input keeps the user agent's white-on-black and stays light in dark mode.
  background: transparent;
  color: var(--octans-text);

  &::placeholder {
    color: var(--octans-text-subdued);
  }

  .TextField__multiline & {
    max-height: 200px;
    overflow: auto;
    resize: none;
    line-height: 24px;
  }

  .TextField__align_right & {
    text-align: right;
  }

  .TextField__hasPrefix & {
    padding-left: 0;
  }

  .TextField__hasSuffix & {
    padding-right: 0;
  }

  &:focus {
    outline: none;
  }

  &:disabled {
    background: $inputDisabledBgColor;
    cursor: $inputDisabledCursor;
  }
  &:read-only {
    background: $inputReadonlyBgColor;
    box-shadow: none;
    cursor: $inputReadonlyCursor;
  }

  @media (max-width: 640px) {
    // Use 16px as minimum font size for smaller mobile devices to prevent iOS
    // Safari from zooming the viewport.
    font-size: 16px;
  }
}

.TextField_ghost {
  position: absolute;
  z-index: -10;
  visibility: hidden;
  user-select: none;
  white-space: pre-line;
  word-break: break-word;
  outline: 1px solid red;
}

.TextField_prefix,
.TextField_suffix {
  color: var(--octans-text-subdued);
}
.TextField_prefix {
  margin-left: $addonOuterMargin;
  margin-right: $addonInnerMargin;
}
.TextField_suffix {
  margin-left: $addonInnerMargin;
  margin-right: $addonOuterMargin;
}

.TextField_left {
  margin-right: -1px;
  * {
    border-top-right-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
  }
}
.TextField_right {
  margin-left: -1px;
  * {
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
  }
}
</style>
