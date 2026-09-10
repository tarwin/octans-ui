<script lang="ts">
import { Icon } from '@/components/Icon'
import { Labelled } from '@/components/Labelled'
import { Spinner } from '@/components/Spinner'
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'NavField',
  inheritAttrs: false,
  components: {
    Icon,
    Labelled,
    Spinner
  },
  props: {
    label: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    error: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    /**
     * Additional help text to display.
     */
    helpText: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    /**
     * Renders help text as raw HTML. Use with caution.
     */
    helpTextHtml: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    /**
     * Renders a help icon next to the label which links to an external page.
     */
    helpLink: {
      type: [String, Boolean] as PropType<string | false | null>
    },
    placeholder: {
      type: String
    },
    title: {
      type: String as () => string | null
    },
    description: {
      type: String as () => string | null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    canFocus() {
      return !this.disabled
    }
  }
})
</script>

<template>
  <Labelled
    :label="label"
    :error="error"
    :help-text="helpText"
    :help-text-html="helpTextHtml"
    :help-link="helpLink"
  >
    <!--
      Forwarded rather than left to the props alone: a label often needs a
      control beside it, and help text is often rich copy. Both are guarded,
      because `Labelled` prefers a slot that merely EXISTS over the matching
      prop — forwarding unconditionally would blank out `label` and
      `help-text` for every caller that uses them as props.
    -->
    <template
      v-if="$slots.label"
      #label="labelProps"
    >
      <slot
        name="label"
        v-bind="labelProps"
      ></slot>
    </template>
    <template
      v-if="$slots.helpText"
      #helpText
    >
      <slot name="helpText"></slot>
    </template>
    <div
      :class="[
        'UIElement',
        $style.NavField,
        (disabled || loading) && $style.disabled,
        readonly && $style.readonly,
        !title && $style.noTitle
      ]"
      v-bind="$attrs"
      :tabindex="canFocus ? 0 : -1"
      @keydown.space="$emit('click')"
    >
      <slot name="content">
        <div :class="$style.content">
          <div
            v-if="placeholder && !title"
            :class="$style.placeholder"
          >
            {{ placeholder }}
          </div>
          <div :class="$style.title">{{ title }}</div>
          <div :class="$style.description">{{ description }}</div>
        </div>
      </slot>
      <Spinner
        v-if="loading"
        size="small"
      />
      <Icon
        v-if="!loading && !readonly"
        :class="$style.icon"
        icon="mdi:chevron-right"
      />
    </div>
  </Labelled>
</template>

<style lang="scss" module>
@import '../../styles/variables';

.NavField {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid var(--octans-border-input);
  border-radius: var(--octans-radius-field);
  background: linear-gradient(
    to bottom,
    var(--octans-surface),
    var(--octans-surface-sunken)
  );
  box-shadow:
    0 0 0 1px transparent,
    0 1px 0 0 rgba(22, 29, 37, 0.05);
  font-size: 14px;
  line-height: 1.5;
  cursor: default;

  &:focus {
    outline: none;

    &:not(.disabled) {
      border-color: $focusColor;
      box-shadow: 0 0 0 1px $focusColor;
    }
  }

  &.readonly {
    // border: none;
    background: var(--octans-surface);
  }

  &.disabled,
  &.readonly {
    box-shadow: none;
    cursor: $inputDisabledCursor;
  }
}
.content {
  flex: 1;
  min-width: 0;
  padding-right: 10px;

  .disabled & {
    opacity: 0.4;
  }

  .noTitle & {
    color: var(--octans-text-subdued);
  }
}
.title {
  font-size: 13px;
  font-weight: 500;
}
.description {
  // Was a hard-coded translucent black, which is invisible on a dark surface.
  color: var(--octans-text-subdued);
  font-size: 12px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.icon {
  flex: 0 0 8px;

  .disabled & {
    opacity: 0.2;
  }
}
</style>
