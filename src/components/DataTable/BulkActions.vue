<script lang="ts">
import { ActionList } from '@/components/ActionList'
import { Button, ButtonGroup } from '@/components/Button'
import { CheckboxControl } from '@/components/Checkbox'
import { defineComponent, type PropType } from 'vue'
import type { ActionType } from '../types'

export default defineComponent({
  emits: ['change'],
  components: {
    ActionList,
    Button,
    ButtonGroup,
    CheckboxControl
  },
  props: {
    actions: {
      type: Array as PropType<ActionType[]>
    },
    selectedItems: {
      type: Number,
      required: true
    },
    totalItems: {
      type: Number,
      required: true
    }
  },
  computed: {
    checked() {
      return this.selectedItems > 0 && this.totalItems === this.selectedItems
    },
    indeterminate() {
      return this.selectedItems > 0 && this.totalItems !== this.selectedItems
    }
  },
  methods: {
    onChange(event: any) {
      const selectAll = event.target.checked
      this.toggle(selectAll)
    },
    toggle(selectAll: any) {
      this.$emit('change', selectAll)
    }
  }
})
</script>

<style lang="scss" module>
.BulkActions {
  position: relative;
  top: 3px;
  // display: flex;
  // align-items: center;
  // min-height: 30px;
  white-space: nowrap;
}

.checkbox {
  position: absolute;
  // Should be higher than 1 because buttons inside a
  // button group get a zindex of 1 when they have focus.
  z-index: 2;
}

.selectedText {
  display: inline-block;
  padding-left: 26px;
  padding-right: 4px;
}

.wrapper {
  position: absolute;
  top: -7px;
  left: -7px;
}

.checkButton {
  padding-left: 6px;
  padding-right: 6px;
}
</style>

<template>
  <div :class="$style.BulkActions">
    <CheckboxControl
      :class="$style.checkbox"
      :checked="checked"
      :indeterminate="indeterminate"
      @change="onChange"
    />
    <div
      v-if="selectedItems > 0"
      :class="$style.wrapper"
    >
      <ButtonGroup
        :class="$style.buttonGroup"
        segmented
      >
        <Button
          :class="$style.checkButton"
          size="small"
          tabindex="-1"
          @click="toggle(false)"
        >
          <span :class="$style.selectedText">{{ selectedItems }} selected</span>
        </Button>
        <ActionList
          v-if="actions && actions.length"
          :items="actions"
        >
          <Button
            size="small"
            dropdown
          >
            Actions
          </Button>
        </ActionList>
      </ButtonGroup>
    </div>
  </div>
</template>
