<script lang="ts" setup>
export interface HeadingProps {
  element?: string
}
withDefaults(defineProps<HeadingProps>(), {
  element: 'h3'
})
</script>

<template>
  <component
    :is="element"
    :class="['UIElement', $style.Heading]"
  >
    <slot></slot>
  </component>
</template>

<style lang="scss" module>
.Heading {
  margin: 0;
  color: var(--octans-text);
  font-size: 17px;
  font-weight: 600;
  line-height: 24px;

  @media (min-width: 40em) {
    font-size: 16px;
  }
}
</style>
