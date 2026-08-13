<script lang="ts" setup>
import { Icon } from '@/components/Icon'
import type {
  NavigationPrimaryItemType,
  NavigationSectionProps
} from '../types'
import Item from './Item.vue'

withDefaults(defineProps<NavigationSectionProps>(), {
  theme: 'light',
  hasPrimaryIcons: false,
  min: false,
  highlight: false
})

const emit = defineEmits<{
  (e: 'click-item', item: NavigationPrimaryItemType, event: MouseEvent): void
}>()

function clickItem(item: NavigationPrimaryItemType, event: MouseEvent) {
  return emit('click-item', item, event)
}
</script>

<template>
  <div
    :class="[
      $style.Section,
      min && $style.Section_min,
      theme === 'dark' && $style.Section_Dark
    ]"
  >
    <!--
      Minimized, the icon alone stands in for the section — it is what keeps
      sections tellable-apart on the icon rail.
    -->
    <div
      v-if="(section.title && !min) || (section.icon && min)"
      :class="$style.Section_header"
    >
      <Icon
        v-if="section.icon"
        :icon="section.icon"
        :class="$style.Section_headerIcon"
      />
      <div
        v-if="!min"
        :class="$style.Section_title"
      >
        {{ section.title }}
      </div>
      <div
        v-if="section.action && !min"
        :class="$style.Section_action"
      >
        <Icon :icon="section.action.icon" />
      </div>
    </div>
    <Item
      v-for="item in section.items || []"
      :theme="theme"
      :key="item.id"
      :item="item"
      :location="location"
      :has-primary-icons="hasPrimaryIcons"
      :highlight="highlight"
      @click="clickItem"
      :min="min"
    />
  </div>
</template>

<style lang="scss" module>
.Section {
  // Add top margin when inside an AppFrame
  [data-app-frame] &:first-child {
    margin-top: 10px;
  }
  padding: 8px 0px;

  &.Section_Dark {
    .Section_title {
      color: var(--nav-textColor);
    }
  }

  .Section_header {
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 34px;
    margin-right: 8px;
    padding-left: 20px;
    background: var(--nav-bgColor);
    margin-bottom: 4px;

    .Section_title {
      flex: 1;
      color: var(--nav-textColor);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
  }

  .Section_headerIcon {
    flex: 0 0 auto;
    color: var(--nav-textColor);
    font-size: 20px;
  }

  .Section_action {
    padding: 8px 12px;
    border-radius: var(--octans-radius-field);
    color: var(--nav-textColor);

    &:hover {
      background: var(--octans-surface-hover);
      color: var(--octans-text);
      cursor: pointer;
    }
  }

  &.Section_min {
    .Section_header {
      justify-content: center;
      margin-right: 0;
      padding-left: 0;
    }
  }
}
</style>
