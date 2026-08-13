<script lang="ts" setup>
import { Icon } from '@/components/Icon'

export interface FooterHelpProps {
  title?: string
}

defineProps<FooterHelpProps>()
</script>

<template>
  <div :class="['UIElement', $style.FooterHelp]">
    <Icon
      :class="$style.icon"
      icon="mdi:information"
    />
    <div :class="$style.content">
      <div
        v-if="title"
        :class="$style.title"
      >
        {{ title }}:
      </div>
      <slot />
    </div>
  </div>
</template>

<style lang="scss" module>
.FooterHelp {
  display: flex;
  margin: 16px;
}

.icon {
  margin-top: 2px;
  margin-right: 8px;
  color: var(--octans-text);
}

.content {
  line-height: 1.4;
  opacity: 0.7;
}

.title {
  display: inline;
  font-weight: bold;
}
</style>
