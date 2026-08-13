<script lang="ts">
import { Formatter } from '@/components/Formatter'
import { Icon } from '@/components/Icon'
import { defineComponent, type PropType } from 'vue'
import { type FileInputFileItemType } from './utils'

export default defineComponent({
  components: {
    Formatter,
    Icon
  },
  props: {
    items: {
      type: Array as PropType<FileInputFileItemType[]>,
      required: true
    },
    readonly: {
      type: Boolean,
      default: false
    }
  }
})
</script>

<template>
  <div :class="$style.ItemList">
    <div
      v-for="(item, index) in items"
      :key="index"
      :class="[$style.Item, readonly && $style.readonly]"
    >
      <Icon
        :class="$style.Item_icon"
        :icon="item.icon"
      />
      <div :class="$style.Item_info">
        <div :class="$style.Item_name">{{ item.name }}</div>
        <div :class="$style.Item_size">
          <Formatter
            type="filesize"
            :value="item.size"
          />
          •
          <Formatter
            type="dateAgo"
            :value="item.lastModified"
          />
        </div>
        <div
          v-if="item.error"
          :class="$style.Item_error"
        >
          {{ item.error }}
        </div>
      </div>
      <Icon
        v-if="!readonly"
        :class="$style.Item_close"
        icon="mdi:close-circle"
        @click="$emit('remove', index)"
      />
    </div>
  </div>
  <!-- .ItemList -->
</template>

<style lang="scss" module>
@import '../../styles/variables';

$itemBgColor: var(--octans-surface-sunken);

.ItemList {
  border-radius: var(--octans-radius-field);
  overflow: hidden;
}

.Item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: $itemBgColor;
  border-radius: var(--octans-radius-field);

  & + & {
    margin-top: 5px;
  }

  &:hover:not(.readonly) {
    background: color-mix(in srgb, #{$itemBgColor} 94%, black);
  }
}
.Item_icon {
  color: var(--octans-text-link);
  align-self: baseline;
  margin-right: 14px;
  font-size: 32px;
}
.Item_info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.Item_name {
  color: var(--octans-text);
  font-weight: bold;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.Item_size {
  margin-top: 2px;
  color: $textSubduedColor;
  font-size: 90%;
}
.Item_error {
  margin-top: 4px;
  color: $textNegativeColor;
  font-weight: bold;
  font-size: 90%;
}
.Item_close {
  margin-right: 2px;
  font-size: 18px;
  opacity: 0.5;

  &:hover {
    opacity: 1;
    cursor: pointer;
  }
}
</style>
