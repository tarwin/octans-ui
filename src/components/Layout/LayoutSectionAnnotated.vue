<script lang="ts" setup>
import { Heading } from '../Heading'

export interface LayoutSectionAnnotatedProps {
  /**
   * The title to show next to the section content.
   */
  title?: string
  /**
   * The description text to display below the title.
   */
  description?: string
  /**
   * Forces the layout to use the full width for the title and description,
   * rather than placing these to the left on larger screens.
   */
  fullWidth?: boolean
}

withDefaults(defineProps<LayoutSectionAnnotatedProps>(), {
  fullWidth: false
})
</script>

<template>
  <div
    :class="[
      'UIElement',
      'UILayoutSectionAnnotated',
      $style.LayoutSectionAnnotated,
      fullWidth && $style.fullWidth
    ]"
  >
    <div :class="$style.Info">
      <div :class="$style.Info_content">
        <Heading element="h2">{{ title }}</Heading>
        <div
          :class="$style.description"
          v-if="description || $slots.description"
        >
          <slot name="description">
            {{ description }}
          </slot>
        </div>
      </div>
      <div>
        <slot name="actions"></slot>
      </div>
    </div>
    <div :class="$style.content">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" module>
@import '../../styles/variables';

.LayoutSectionAnnotated {
  flex: 1 1 100%;
  display: flex;
  flex-wrap: wrap;

  &.fullWidth {
    display: block;
  }
}

.LayoutSectionAnnotated + .LayoutSectionAnnotated {
  margin-top: 2rem;
  padding-top: 20px;
  border-top: 1px solid var(--octans-border);
}

.Info {
  display: flex;
  padding-top: 20px;
  padding-bottom: 20px;
  flex: 1 1 240px;
}
.Info_content {
  flex: 1 1 240px;
  padding-right: 64px;
}

.description {
  margin-top: 16px;
  color: var(--octans-text-subdued);
  font-size: 14px;
  line-height: 20px;

  p {
    margin-top: 12px;
  }
  p:first-child {
    margin-top: 0;
  }
}

.content {
  flex: 2 1 $layoutAnnotationContentMinWidth;
  max-width: 100%;
  // Add minor padding so that the `overflow: hidden` styles used in this
  // component does not cut off drop shadows of Card components.
  // padding: 2px;
  // overflow: hidden;
}
</style>
