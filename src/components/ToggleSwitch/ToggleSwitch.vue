<script lang="ts" setup>
import { Icon } from '@/components/Icon'
import { computed, useAttrs, type StyleValue } from 'vue'
import type { ToggleSwitchProps } from './types'

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

/**
 * Attributes are split rather than inherited wholesale: `class` and `style`
 * stay on the root (that's where a consumer's layout rules expect to land),
 * while everything else — `aria-label`, `aria-labelledby`, `id`, `title`,
 * `data-ui-tooltip` — goes to the button, which is the element a screen
 * reader actually announces.
 */
defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

const rootClass = computed(() => attrs.class as string | undefined)
const rootStyle = computed(() => attrs.style as StyleValue | undefined)

const controlAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})

const props = withDefaults(defineProps<ToggleSwitchProps>(), {
  trueValue: true,
  falseValue: false,
  checked: false,
  disabled: false,
  color: undefined,
  colorOn: undefined,
  colorOff: undefined,
  size: 'medium',
  // On by default: a tick / cross reads faster than knob position alone, and
  // it is the more accessible starting point. `:icons="false"` opts out.
  icons: true,
  iconOn: undefined,
  iconOff: undefined,
  iconColor: undefined,
  iconColorOn: undefined,
  iconColorOff: undefined
})

const isChecked = computed(() => {
  return props.modelValue === props.trueValue || props.checked
})

// width/height/knob (px) per size. The knob padding and travel distance are
// derived from these so everything scales proportionally.
const SIZES = {
  small: { width: 42, height: 24, knob: 18 },
  medium: { width: 60, height: 34, knob: 26 },
  large: { width: 78, height: 44, knob: 34 }
} as const

/** Fraction of the knob the icon fills, leaving a ring of white around it. */
const ICON_SCALE = 0.62

const dimensions = computed(() => SIZES[props.size] ?? SIZES.medium)

const sizeVars = computed(() => {
  const { width, height, knob } = dimensions.value
  const pad = (height - knob) / 2
  return {
    '--ts-width': `${width}px`,
    '--ts-height': `${height}px`,
    '--ts-knob': `${knob}px`,
    '--ts-pad': `${pad}px`,
    '--ts-travel': `${width - height}px`
  }
})

const DEFAULT_ICON_ON = 'mdi:check'
const DEFAULT_ICON_OFF = 'mdi:close'

const DEFAULT_COLOR_ON = 'var(--octans-primary)'
const DEFAULT_COLOR_OFF = 'var(--octans-border-input)'

const colorOn = computed(() => props.colorOn ?? props.color ?? DEFAULT_COLOR_ON)
const colorOff = computed(() => props.colorOff ?? DEFAULT_COLOR_OFF)

const trackColor = computed(() =>
  isChecked.value ? colorOn.value : colorOff.value
)

// Rendered as the `handle` slot's fallback, so anything passed to that slot
// wins over these — slot content is the more specific instruction.
const icon = computed(() => {
  if (!props.icons) return null
  return isChecked.value
    ? (props.iconOn ?? DEFAULT_ICON_ON)
    : (props.iconOff ?? DEFAULT_ICON_OFF)
})

const iconSize = computed(
  () => `${Math.round(dimensions.value.knob * ICON_SCALE)}px`
)

/**
 * The knob is light in both states, so the icon has to carry the colour, and
 * by default it mirrors its own track — which ties the two together.
 *
 * The exception is the default off track: it's a pale grey that would leave
 * the icon barely visible on the knob. That case falls back to a token that
 * deliberately does NOT follow the theme, for the same reason — see the note
 * beside `--octans-toggle-knob` in tokens.scss.
 */
const resolvedIconColor = computed(() => {
  if (isChecked.value) {
    return props.iconColorOn ?? props.iconColor ?? colorOn.value
  }
  return (
    props.iconColorOff ??
    props.iconColor ??
    props.colorOff ??
    'var(--octans-toggle-knob-icon)'
  )
})

function toggle() {
  emit(
    'update:modelValue',
    isChecked.value ? props.falseValue : props.trueValue
  )
}
</script>

<template>
  <div
    :class="[
      'UIElement',
      $style.ToggleSwitch,
      disabled && $style.disabled,
      rootClass
    ]"
    :style="[sizeVars, rootStyle]"
  >
    <!--
      A real <button> rather than a styled <span>: it brings keyboard focus,
      Space / Enter activation and the disabled semantics for free, none of
      which are worth reimplementing. `role="switch"` swaps the announced role
      from "button" to "switch", and `aria-checked` carries the state.
    -->
    <button
      v-bind="controlAttrs"
      type="button"
      role="switch"
      :aria-checked="isChecked"
      :disabled="disabled"
      :class="[$style.slider, isChecked && $style.checked]"
      :style="{ backgroundColor: trackColor }"
      @click="toggle"
    >
      <!--
        The knob is decorative — the tick / cross restates what `aria-checked`
        already says, so hiding it stops the state being announced twice.
      -->
      <span
        :class="$style.handle"
        aria-hidden="true"
      >
        <slot
          name="handle"
          :checked="isChecked"
        >
          <Icon
            v-if="icon"
            :icon="icon"
            :size="iconSize"
            :style="{ color: resolvedIconColor }"
          />
        </slot>
      </span>
    </button>
  </div>
</template>

<style lang="scss" module>
@import '../../styles/variables';

// https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_switch
.ToggleSwitch {
  position: relative;
  display: flex;
  width: var(--ts-width, 60px);
  height: var(--ts-height, 34px);
  // The `disabled` attribute on the button already blocks pointer and keyboard
  // interaction; this is only the visual half.
  &.disabled {
    opacity: 0.5;
  }
}

.slider {
  border-radius: var(--ts-height, 34px);
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  // Overridden inline per state; this is the pre-hydration / no-style fallback.
  background-color: var(--octans-border-input);
  -webkit-transition: 0.4s;
  transition: 0.4s;

  // Undo the user-agent button styling — everything visual comes from here.
  appearance: none;
  -webkit-appearance: none;
  padding: 0;
  border: 0;
  font: inherit;
  color: inherit;

  &:disabled {
    cursor: $inputDisabledCursor;
  }

  // `:focus-visible` rather than `:focus` so a mouse click doesn't leave a ring
  // behind. Offset because the track sits flush against the root's edges.
  &:focus-visible {
    outline: 2px solid $focusColor;
    outline-offset: 2px;
  }
}

.handle {
  position: absolute;
  height: var(--ts-knob, 26px);
  border-radius: 50%;
  width: var(--ts-knob, 26px);
  left: var(--ts-pad, 4px);
  bottom: var(--ts-pad, 4px);
  background-color: var(--octans-toggle-knob);
  -webkit-transition: 0.4s;
  transition: 0.4s;

  // Centre any slotted handle content (e.g. an icon).
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}

.slider.checked .handle {
  -webkit-transform: translateX(var(--ts-travel, 26px));
  -ms-transform: translateX(var(--ts-travel, 26px));
  transform: translateX(var(--ts-travel, 26px));
}
</style>
