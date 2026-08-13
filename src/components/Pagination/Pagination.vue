<script lang="ts" setup>
import { Formatter } from '@/components/Formatter'
import { Icon } from '@/components/Icon'
import { computed } from 'vue'

// https://gist.github.com/kottenator/9d936eb3e4e3c3e02598#gistcomment-3003402
function getRange(start: number, end: number) {
  return Array(end - start + 1)
    .fill(null)
    .map((v, i) => i + start)
}

function pagination(current: number, length: number, delta: number = 4) {
  const range = {
    start: Math.round(current - delta / 2),
    end: Math.round(current + delta / 2)
  }
  if (range.start - 1 === 1 || range.end + 1 === length) {
    range.start += 1
    range.end += 1
  }
  let pages =
    current > delta
      ? getRange(
          Math.min(range.start, length - delta),
          Math.min(range.end, length)
        )
      : getRange(1, Math.min(length, delta + 1))
  const withDots = (value: number, pair: any[]) => {
    return pages.length + 1 !== length ? pair : [value]
  }
  if (pages[0] !== 1) {
    pages = withDots(1, [1, '...']).concat(pages)
  }
  if (pages[pages.length - 1] < length) {
    pages = pages.concat(withDots(length, ['...', length]))
  }
  return pages
}

const emit = defineEmits(['change', 'update-limit'])

type PaginationProps = {
  offset: number
  limit: number
  total: number
  maxPages?: number
  pageSizes?: number[] | false
}

const props = withDefaults(defineProps<PaginationProps>(), {
  offset: 0,
  limit: 25,
  total: 0,
  maxPages: 10,
  pageSizes: () => [5, 10, 25, 50, 100]
})

const numPages = computed(() => {
  return Math.ceil(props.total / props.limit)
})
const pageIndex = computed(() => {
  return props.offset / props.limit
})
const hasPrev = computed(() => {
  return pageIndex.value > 0
})
const hasNext = computed(() => {
  return pageIndex.value < numPages.value - 1
})
const pages = computed(() => {
  if (props.maxPages > 0 && props.total > 0) {
    return pagination(pageIndex.value + 1, numPages.value, props.maxPages - 2)
  }
  return []
})

const setPageIndex = (index: number) => {
  emit('change', index * props.limit)
}
const changePageSize = (event: Event) => {
  const size = parseInt((event.target as HTMLInputElement).value, 10)
  emit('update-limit', size)
}
</script>

<template>
  <div :class="$style.Pagination">
    <button
      :class="$style.Button"
      :disabled="!hasPrev"
      @click="setPageIndex(pageIndex - 1)"
    >
      <Icon icon="mdi:chevron-left" />
    </button>
    <template v-for="(page, index) in pages">
      <button
        v-if="typeof page === 'number'"
        :key="index + '_'"
        :class="[$style.Button, page - 1 === pageIndex && $style.selected]"
        @click="setPageIndex(page - 1)"
      >
        <Formatter
          :value="page"
          type="integer"
        />
      </button>
      <div
        v-else
        :key="index"
        :class="$style.Ellipsis"
      >
        ...
      </div>
    </template>
    <button
      :class="$style.Button"
      :disabled="!hasNext"
      @click="setPageIndex(pageIndex + 1)"
    >
      <Icon icon="mdi:chevron-right" />
    </button>
    <div
      v-if="pageSizes"
      :class="$style.PageSize"
    >
      <select
        :value="limit"
        :class="$style.PageSize_select"
        @change="changePageSize"
      >
        <option
          v-for="size in pageSizes"
          :key="size"
          :value="size"
        >
          {{ size }}
        </option>
      </select>
      <Icon
        :class="$style.PageSize_icon"
        icon="mdi:menu-down"
      />
    </div>
  </div>
</template>

<style lang="scss" module>
.Pagination {
  display: flex;
  align-items: center;
}

.Button,
.Ellipsis {
  min-width: 30px;
  min-height: 30px;
  padding: 0 5px;
  background: transparent;
  border: 0;
  border-radius: var(--octans-radius-field);
  font-size: 14px;

  &:disabled {
    // color: $buttonDisabledTextColor;
    color: rgba(0, 0, 0, 0.247);
  }
}

.Button {
  &:hover:not([disabled]) {
    background: var(--octans-surface-hover);
    cursor: pointer;
  }

  &:focus {
    outline: 0;
    box-shadow: inset 0 0 0 2px var(--octans-text-disabled);
  }

  &.selected,
  &.selected:hover {
    // background: $focusColor;
    background: var(--octans-primary);
    color: var(--octans-surface);
  }
  &.selected:focus {
    box-shadow: inset 0 0 0 2px
      color-mix(in srgb, var(--octans-primary) 85%, black);
  }
}

.Ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
}

.PageSize {
  min-height: 30px;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--octans-border);
}
.PageSize_select {
  // Form controls inherit neither background nor colour, so these must be
  // explicit or the control keeps the user agent's light default in dark mode.
  background: transparent;
  color: var(--octans-text);

  &::placeholder {
    color: var(--octans-text-subdued);
  }
  appearance: none;
  width: 50px;
  min-height: 30px;
  margin-right: -15px;
  padding: 0 5px;
  border: none;
  background: transparent;
  font-size: 14px;
  text-align: center;
  cursor: pointer;

  &:hover {
    background: var(--octans-surface-hover);
  }
  &:focus {
    outline: 0;
    box-shadow: inset 0 0 0 2px var(--octans-text-disabled);
  }
}
.PageSize_icon {
  pointer-events: none;
}
</style>
