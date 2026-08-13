<script lang="ts" setup>
import { Pagination } from '@/components/Pagination'
import { SkeletonDisplayText } from '@/components/SkeletonDisplayText'
import { format } from '@/utils/format'
import { computed } from 'vue'

const emit = defineEmits(['updateOffset', 'updateLimit'])

type DataTableFooterProps = {
  offset: number
  limit: number
  total: number
  summary?: string
  maxPages: number
  pageSizes?: number[] | false
  loading: boolean
}

const props = withDefaults(defineProps<DataTableFooterProps>(), {
  summary: 'Showing {range} of {total}',
  maxPages: 10,
  loading: false
})

const summaryText = computed(() => {
  const offset = props.offset || 0
  const limit = props.limit || 50
  const total = props.total || 0

  const start = total ? Math.min(offset, total) + 1 : 0
  const end = Math.min(start + limit - 1, total)
  const f = (val: any) => format(`${val}`, 'integer')
  const range = start === end ? f(start) : `${f(start)} — ${f(end)}`
  return (
    props.summary?.replace('{range}', range).replace('{total}', f(total)) || ''
  )
})

const updateOffset = (offset: number) => {
  emit('updateOffset', offset)
}
</script>

<template>
  <div :class="$style.DataTableFooter">
    <template v-if="loading">
      <SkeletonDisplayText
        size="tiny"
        style="min-width: 200px"
      />
      <SkeletonDisplayText
        size="tiny"
        style="min-width: 150px"
      />
    </template>
    <template v-else>
      <div>{{ summaryText }}</div>
      <Pagination
        :offset="offset"
        :limit="limit"
        :total="total"
        :max-pages="maxPages"
        :page-sizes="pageSizes"
        @change="updateOffset"
        @updateLimit="(val: number) => $emit('updateLimit', val)"
      />
    </template>
  </div>
</template>

<style lang="scss" module>
.DataTableFooter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--octans-surface-app);
  border-radius: 0 0 var(--octans-radius-box) var(--octans-radius-box);
  color: var(--octans-text-subdued);
}
</style>
