<script lang="ts" setup>
import { computed, useCssModule, useSlots } from 'vue'
import { format, isNumericType } from '@/utils/format'
import type { ResourceListProps, ResourceListColumnType } from './types'
import ResourceItem from './ResourceItem.vue'

const props = withDefaults(defineProps<ResourceListProps>(), {
  columns: () => [],
  items: () => []
})

const $style = useCssModule()
const slots = useSlots()

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${props.columns.length}, 1fr)`
}))

function getColumnClass(col: ResourceListColumnType) {
  // Every numeric format right-aligns, not just `currency` — an `integer` or
  // `percent` column reads as badly left-aligned as a money one does.
  if (isNumericType(col.format || '')) {
    return $style.ResourceList_cell__numeric
  }
  return ''
}

function formatCell(col: ResourceListColumnType, row: Record<string, any>) {
  // This used to return the raw value, so a column declaring `format:
  // 'currency'` was right-aligned and otherwise untouched — the number
  // rendered bare. Called even with no format, as DataTable does, so that
  // empty cells still get the em dash placeholder rather than nothing.
  return format(row[col.key], col.format || '')
}
</script>

<template>
  <div :class="['UIElement', $style.ResourceList]">
    <div
      :class="$style.ResourceList_header"
      :style="gridStyle"
    >
      <div
        v-for="col in columns"
        :key="col.key"
        :class="[$style.ResourceList_headerCell, getColumnClass(col)]"
      >
        {{ col.label }}
      </div>
    </div>
    <template v-if="slots.item">
      <template
        v-for="item in items"
        :key="item.id"
      >
        <slot
          name="item"
          :item="item"
        />
      </template>
    </template>
    <template v-else>
      <ResourceItem
        v-for="row in items"
        :key="row.id"
        :class="$style.ResourceList_row"
        :style="gridStyle"
      >
        <div
          v-for="col in columns"
          :key="col.key"
          :class="[$style.ResourceList_cell, getColumnClass(col)]"
        >
          {{ formatCell(col, row) }}
        </div>
      </ResourceItem>
    </template>
  </div>
</template>

<style lang="scss" module>
$cellPadding: 16px;

.ResourceList {
  // border: 1px solid red;
}

.ResourceList_header {
  display: flex;
  border-bottom: 1px solid var(--octans-border-strong);
}

.ResourceList_headerCell {
  padding: $cellPadding;
}

.ResourceList_row {
  padding: 0;
}

.ResourceList_cell {
  padding: 0 $cellPadding;
}

.ResourceList_cell__numeric {
  text-align: right;
}
</style>
