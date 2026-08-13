<script lang="ts">
import { Button } from '@/components/Button'
import { DatePicker, isDatePickerType } from '@/components/DatePicker'
import { type FilterType } from './Filters.vue'
import { Select } from '@/components/Select'
import { TextField } from '@/components/TextField'
import { defineComponent } from 'vue'
import { isEmptyFilterValue } from './utils'

import { $t } from '@/utils/translate'

export default defineComponent({
  name: 'FilterItem',
  emits: ['update:modelValue'],
  components: {
    Button,
    DatePicker,
    TextField,
    Select
  },
  props: {
    filter: {
      type: Object as () => FilterType,
      required: true
    },
    modelValue: {
      type: null
    }
  },
  computed: {
    hasEmptyValue() {
      return isEmptyFilterValue(this.modelValue)
    },
    error() {
      if (this.filter.required && this.hasEmptyValue) {
        return this.$t('ui.filters.requiredError')
      }
      return null
    }
  },
  methods: {
    $t,
    isDatePickerType,
    updateValue(val: any) {
      this.$emit('update:modelValue', val)
    }
  }
})
</script>

<template>
  <div :class="$style.FilterItem">
    <TextField
      v-if="filter.type === 'text'"
      :label="filter.label"
      :placeholder="filter.placeholder"
      :error="error"
      :modelValue="modelValue"
      @update:modelValue="updateValue($event)"
    />
    <DatePicker
      v-if="isDatePickerType(filter.type)"
      :type="filter.type"
      :label="filter.label"
      :placeholder="filter.placeholder"
      :error="error"
      :model-format="filter.modelFormat || 'YYYY-MM-DD'"
      :modelValue="modelValue"
      :end-of-day="filter.endOfDay"
      @update:modelValue="updateValue($event)"
    />
    <Select
      v-if="filter.type === 'select'"
      :label="filter.label"
      :placeholder="filter.placeholder"
      :error="error"
      :options="filter.options"
      :option-groups="filter.optionGroups"
      :multiple="filter.multiple"
      :tags="filter.multiple"
      :modelValue="modelValue"
      @change="updateValue($event)"
    />
    <Select
      v-if="filter.type === 'boolean'"
      :label="filter.label"
      :placeholder="filter.placeholder"
      :error="error"
      :options="[
        { label: 'True', value: true },
        { label: 'False', value: false }
      ]"
      :modelValue="modelValue"
      @change="updateValue($event)"
    />
    <div
      v-if="filter.required"
      :class="$style.FilterItem_required"
    >
      {{ $t('ui.filters.required') }}
    </div>
    <Button
      v-else
      type="link"
      @click="$emit('update:modelValue', null)"
      :disabled="hasEmptyValue"
    >
      {{ $t('ui.filters.clear') }}
    </Button>
  </div>
</template>

<style lang="scss" module>
.FilterItem {
  padding: 16px;
  padding-bottom: 20px;
}

.FilterItem + .FilterItem {
  border-top: 1px solid var(--octans-border);
}

.FilterItem_required {
  margin-top: 4px;
  color: var(--octans-text-subdued);
}
</style>
