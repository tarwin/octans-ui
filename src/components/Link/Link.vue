<script lang="ts" setup>
import { Icon } from '@/components/Icon'

export interface LinkProps {
  url: string
  external?: boolean
}

withDefaults(defineProps<LinkProps>(), {
  external: false
})
</script>

<template>
  <a
    :class="['UIElement', $style.Link]"
    :href="url"
    :target="external ? '_blank' : undefined"
  >
    <slot></slot>
    <Icon
      v-if="external"
      :class="$style.Icon"
      icon="mdi:open-in-new"
    />
  </a>
</template>

<style lang="scss" module>
@import '../../styles/variables';

.Link {
  color: $linkColor;
  text-decoration: none;

  &:hover {
    color: $linkHoverColor;
    text-decoration: underline;
    cursor: pointer;
  }
}
.Icon {
  margin-left: 6px;
}
</style>
