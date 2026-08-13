<script lang="ts">
import { type ActionListItemType } from '@/components/ActionList'
import { Button } from '@/components/Button'
import { Icon } from '@/components/Icon'
import { alertModal, confirmModal } from '@/components/Modal'
import type {
  SelectOptionType,
  SelectOptionGroupType
} from '@/components/Select'
import { Sheet } from '@/components/Sheet'
import { Tag } from '@/components/Tag'
import { TextField } from '@/components/TextField'
import { defineComponent, h, type PropType } from 'vue'
import FilterActions from './FilterActions.vue'
import FilterItem from './FilterItem.vue'

export interface FilterType {
  type: string
  key: string
  label: string
  placeholder: string
  required: boolean
  modelFormat?: string
  endOfDay?: boolean
  options?: SelectOptionType[]
  optionGroups?: SelectOptionGroupType[]
  multiple?: boolean
}

export interface FiltersShortcutType {
  label: string
  items: ActionListItemType[]
}

import { cloneDeep, isEqual } from '@/utils'
import debounce, { type DebouncedFunc } from '@/utils/debounce'
import { format } from '@/utils/format'
import { isEmptyFilterValue } from './utils'

import { $t } from '@/utils/translate'

export default defineComponent({
  name: 'Filters',
  emits: ['update:appliedFilters', 'update:query'],
  // setup() {
  //   return {
  //     translate
  //   }
  // },
  components: {
    Button,
    FilterActions,
    FilterItem,
    Icon,
    Tag,
    TextField,
    Sheet
  },
  props: {
    /**
     * An array of filter objects. Each must have a unique `key` which corresponds
     * to those used in `appliedFilters`.
     *
     * ```js
     * interface Filter {
     *   key: string // A unique key
     *   label: string
     *   type: 'datetime' | 'date' | 'month' | 'year' | 'text' | 'select' | 'boolean'
     *   placeholder?: string
     *   options?: object[] // Options for `select`
     *   optionGroups?: object[] // Option groups for `select`
     *   multiple?: boolean // For `select`
     * }
     * ```
     */
    filters: {
      type: Array as () => FilterType[],
      default: () => []
    },
    /**
     * The data representing applied filters. Each filter value is assigned
     * to the `key` provided in the filter array definition.
     *
     * Use as `v-model:appliedFilters`.
     *
     * For example, if you defined two filters with keys "startDate" and "endDate" you
     * would represent their current values using the following object:
     *
     * ```js
     * {
     *   startDate: null,
     *   endDate: null
     * }
     * ```
     */
    appliedFilters: {
      type: Object as () => Record<string, any>,
      default: () => ({})
    },
    /**
     * An optional array of shortcut filters which are added to the left
     * of the query input.
     *
     * Each shortcut is represented as an ActionList.
     *
     * ```js
     * interface Shortcut {
     *   label: string
     *   // See `ActionListItem` for more items options
     *   items: Array<{
     *     label: string
     *     onAction(): void
     *   }>
     * }
     * ```
     */
    shortcuts: {
      type: Array as () => FiltersShortcutType[]
    },
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * The value to use in the query text field.
     *
     * Set this to `false` to disable querying.
     */
    query: {
      type: null as unknown as PropType<string | null | false>
    },
    /**
     * The delay between emitting updated query values in milliseconds.
     */
    queryDelay: {
      type: Number,
      default: 0
    },
    mode: {
      type: String as PropType<'single' | 'multi'>,
      default: 'multi'
    }
  },
  data() {
    return {
      showSheet: false,
      isOpen: false,
      editFilters: {} as Record<string, any>,
      localQuery: null as string | null | boolean,

      updateQueryDebounced: null as DebouncedFunc<
        (value: string) => void
      > | null
    }
  },
  computed: {
    mergedFilters() {
      return this.filters.map((d) => {
        return {
          ...d,
          value: this.appliedFilters[d.key]
        }
      })
    },
    appliedTags() {
      if (this.mode === 'single' && this.filters.length === 1) {
        const f = this.filters[0]
        const val = this.appliedFilters[f.key]

        if (!val) {
          return []
        }

        return (f.multiple ? val : [val])
          .filter((v: any) => !isEmptyFilterValue(v))
          .map((v: any) => {
            const opt = (f.options || []).find((o) => o.value === v)
            return {
              key: v,
              parentKey: f.key,
              label: (opt && opt.label) || v
            }
          })
      }
      return this.mergedFilters
        .filter((f) => !isEmptyFilterValue(f.value))
        .map((f) => {
          return {
            key: f.key,
            label: getFilterLabel(f, f.value, this.$t),
            required: !!f.required
          }
        })
    },
    hasChanged() {
      return !isEqual(this.editFilters, this.appliedFilters)
    },
    commitErrors() {
      const errors = []
      for (const filter of this.filters) {
        const value = this.editFilters[filter.key]
        if (filter.required && isEmptyFilterValue(value)) {
          errors.push(`Filter ${filter.label} is required.`)
        }
      }
      return errors
    }
  },
  created() {
    this.$watch(
      'query',
      (query) => {
        this.localQuery = query
      },
      { immediate: true }
    )
    this.$watch(
      'queryDelay',
      (delay) => {
        this.updateQueryDebounced = debounce((value: string) => {
          /**
           * Emitted after the user stops editing the query input after
           * `queryDelay` milliseconds.
           *
           * @event update:query
           * @type {string}
           */
          this.$emit('update:query', value)
        }, delay)
      },
      { immediate: true }
    )
    this.$watch(
      'appliedFilters',
      (appliedFilters) => {
        if (!appliedFilters) return
        this.editFilters = cloneDeep(appliedFilters)
      },
      { immediate: true }
    )
  },
  methods: {
    $t,
    onUpdateFilterItemValue(key: string, val: any) {
      this.editFilters[key] = val
    },
    open() {
      this.showSheet = true
      this.editFilters = cloneDeep(this.appliedFilters)
    },
    commit() {
      this.emitAppliedFilters(this.editFilters)
      this.showSheet = false
    },
    cancel() {
      if (this.hasChanged) {
        confirmModal({
          title: this.$t('ui.filters.unsavedTitle'),
          content: h('div', [this.$t('ui.filters.unsavedMessage')]),
          primaryActionLabel: this.$t('ui.filters.unsavedDiscard'),
          primaryActionType: 'destructive',
          secondaryActionLabel: this.$t('ui.filters.unsavedKeep'),
          onConfirm: () => {
            this.showSheet = false
          }
        })
      } else {
        this.showSheet = false
      }
    },
    removeValue(parentKey: string, val: any) {
      const filter = this.filters.find((f) => f.key === parentKey)
      if (!filter) return
      const map = cloneDeep(this.appliedFilters) as Record<string, any>
      map[parentKey] = filter.multiple
        ? map[parentKey].filter((v: any) => v !== val)
        : null
      this.emitAppliedFilters(map)
    },
    removeFilter(key: string) {
      const filter = this.filters.find((f) => f.key === key)
      if (!filter) return
      if (filter.required) {
        this.showRequiredMessage(filter)
        return
      }
      const map = cloneDeep(this.appliedFilters) as typeof this.appliedFilters
      map[key] = null
      this.editFilters[key] = null
      this.emitAppliedFilters(map)
    },
    emitAppliedFilters(filters: Record<string, any>) {
      /**
       * Emitted when the user applies new filters.
       *
       * @type {object} The filter data.
       */
      this.$emit('update:appliedFilters', filters)
    },
    getFilterByKey(key: string) {
      return this.filters.find((f) => f.key === key)
    },
    showRequiredMessage(filter: FilterType) {
      alertModal({
        title: this.$t('ui.filters.required'),
        content: `Filter "${filter.label}" is required.`
      })
    },
    updateQuery(value: string) {
      this.localQuery = value
      this.updateQueryDebounced?.(value)
    }
  }
})

const translations = {
  is: 'ui.filters.is',
  isOneOf: 'ui.filters.isOneOf'
} as any

function getFilterLabel(
  filter: FilterType,
  value: any,
  $t: (key: string, args?: Record<string, any>) => string
) {
  const parts = getFilterTagParts(filter, value)
  if (!parts) {
    return ''
  }
  return parts
    .map((part) => {
      if (part.type === 'operator') {
        return $t(translations[part.value])
      }
      return part.value
    })
    .join(' ')
}

function getFilterTagParts(filter: FilterType, value: any) {
  if (isEmptyFilterValue(value)) {
    return null
  }
  const { label, type } = filter
  if (type === 'select') {
    if (filter.multiple) {
      return [
        { type: 'label', value: label },
        { type: 'operator', value: 'isOneOf' },
        {
          type: 'value',
          value: value
            .map((val: any) => {
              const option = filter.options?.find((d) => d.value === val)
              return (option && option.label) || '—'
            })
            .join(', ')
        }
      ]
    }
    const option = filter.options?.find((d) => d.value === value)
    return [
      { type: 'label', value: label },
      { type: 'operator', value: 'is' },
      {
        type: 'value',
        value: (option && option.label) || '—'
      }
    ]
  }
  if (type === 'date') {
    return [
      { type: 'label', value: label },
      { type: 'operator', value: 'is' },
      {
        type: 'value',
        value: format(value, 'dateNumeral')
      }
    ]
  }
  return [
    { type: 'label', value: label },
    { type: 'operator', value: 'is' },
    { type: 'value', value: value }
  ]
}
</script>

<template>
  <div :class="[$style.Filters, disabled && $style.Filters__disabled]">
    <div
      v-if="disabled"
      :class="$style.Filters_disabled"
    ></div>
    <TextField
      v-if="localQuery === null || typeof localQuery === 'string'"
      :modelValue="localQuery"
      @update:modelValue="updateQuery($event as string)"
      :placeholder="$t('ui.filters.queryPlaceholder')"
    >
      <template #prefix>
        <Icon icon="mdi:magnify" />
      </template>
      <template #right>
        <FilterActions
          :filters="filters"
          :shortcuts="shortcuts"
          :mode="mode"
          @open="open"
        />
      </template>
      <template #suffix>
        <div
          :class="$style.clearQuery"
          v-show="localQuery"
          @click="updateQuery('')"
        >
          <Icon icon="mdi:close-circle" />
        </div>
      </template>
    </TextField>
    <FilterActions
      v-else
      :filters="filters"
      :shortcuts="shortcuts"
      :mode="mode"
      @open="open"
    />
    <div
      v-if="appliedTags.length"
      :class="$style.Filter_tags"
    >
      <Tag
        v-for="tag in appliedTags"
        :key="tag.key"
        :required="tag.required"
        :tooltip="tag.required ? $t('ui.filters.requiredError') : null"
        @remove="
          mode === 'single'
            ? removeValue(tag.parentKey, tag.key)
            : removeFilter(tag.key)
        "
      >
        {{ tag.label }}
      </Tag>
    </div>
    <Sheet
      :title="$t('ui.filters.filters')"
      :container-class="$style.Filters_sheet"
      :visible="showSheet"
      :size="400"
      @close="cancel"
    >
      <template #actions>
        <Button
          type="primary"
          @click="commit"
          :disabled="!hasChanged || commitErrors.length > 0"
        >
          {{ $t('ui.filters.apply') }}
        </Button>
      </template>
      <FilterItem
        v-for="filter in filters"
        :key="filter.key"
        :filter="filter"
        :modelValue="editFilters[filter.key]"
        @update:modelValue="onUpdateFilterItemValue(filter.key, $event)"
      />
    </Sheet>
  </div>
  <!-- <pre>appliedFilters: {{ appliedFilters }}</pre>
  <pre>editFilters: {{ editFilters }}</pre> -->
</template>

<style lang="scss" module>
.Filters {
  position: relative;
  padding: 16px;
  border-bottom: 1px solid var(--octans-border);
}

.Filters_disabled {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 1;
  background: var(--octans-scrim);
}

.Filter_tags {
  // Fixes a 1 pixel offset when a tag with a tooltip is rendered next to one
  // without a tooltip.
  display: flex;
  flex-wrap: wrap;

  margin-top: 8px;
  gap: 8px;

  // > * {
  // }
}

.Filters_sheet {
  background: var(--octans-surface);
}

.Filters_filter {
  padding: 16px;
  padding-bottom: 20px;
}

.Filters_filter + .Filters_filter {
  border-top: 1px solid var(--octans-border);
}

.clearQuery {
  margin-right: -6px;
  padding: 0 3px;
  opacity: 0.8;
  &:hover {
    opacity: 1;
    cursor: pointer;
  }
}
</style>
