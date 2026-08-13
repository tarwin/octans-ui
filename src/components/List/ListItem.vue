<script lang="ts" setup>
import { Icon } from '@/components/Icon'
import styles from './List.module.scss'
import type { ListItemProps } from './types'

withDefaults(defineProps<ListItemProps>(), {
  listType: 'bullet'
})
</script>

<template>
  <li
    v-if="item"
    :class="styles.ListItem"
  >
    <div
      v-if="item.label"
      :class="styles.ListItem_label"
    >
      <Icon
        v-if="listType === 'error'"
        :class="styles.ListItem_icon"
        icon="mdi:alert-circle-outline"
      />
      {{ item.label }}
    </div>
    <div
      v-if="item.content"
      :class="styles.ListItem_content"
    >
      {{ item.content }}
    </div>
    <div
      v-if="item.idLabel"
      :class="styles.ListItem_idLabel"
    >
      {{ item.idLabel }}
    </div>
  </li>
  <li
    v-else
    :class="styles.ListItem"
  >
    <slot></slot>
  </li>
</template>
