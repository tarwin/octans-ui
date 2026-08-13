<script setup lang="ts">
import { computed } from 'vue'
import ActionList, {
  type ActionListItemType,
  type ActionListSectionType
} from './ActionList.vue'
import ActionListButton from './ActionListButton.vue'

export interface ActionListMenuProps {
  items?: ActionListItemType[]
  sections?: ActionListSectionType[]
  /**
   * Open sub-menus on hover instead of click. Propagates to nested levels.
   */
  autoOpen?: boolean
}

const props = withDefaults(defineProps<ActionListMenuProps>(), {
  items: () => []
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const finalSections = computed<ActionListSectionType[]>(() => {
  if (props.sections) {
    return props.sections
  }
  return [{ items: props.items }]
})

function handleClick(item: ActionListItemType) {
  if (item.onAction) {
    item.onAction()
  }
  // An action was clicked so close the whole menu chain
  emit('close')
}

function handleClose() {
  // A sub list wants to close the chain so pass it upwards
  emit('close')
}
</script>

<template>
  <div :class="['UIElement', $style.ActionListMenu]">
    <div
      v-for="(section, index) in finalSections"
      :key="index"
      :class="$style.ActionListMenuSection"
    >
      <div
        v-if="section.title"
        :class="$style.ActionListMenuSection_title"
      >
        {{ section.title }}
      </div>

      <template v-for="(item, index) in section.items">
        <div
          v-if="item.items || item.sections"
          :key="`items-${index}`"
        >
          <ActionList
            :items="item.items"
            :sections="item.sections"
            :auto-open="autoOpen"
            :hover-trigger="autoOpen"
            placement="right-start"
            @close="handleClose"
          >
            <ActionListButton
              :key="index"
              :icon="item.icon"
              :label="item.label"
              :disabled="item.disabled"
              :tooltip="item.tooltip"
              :tooltip-position="item.tooltipPosition"
              :helpText="item.helpText"
              dropdown
            />
          </ActionList>
        </div>

        <ActionListButton
          v-else
          :key="`button-${index}`"
          :icon="item.icon"
          :label="item.label"
          :disabled="item.disabled"
          :tooltip="item.tooltip"
          :tooltip-position="item.tooltipPosition"
          :helpText="item.helpText"
          :url="item.url"
          :external="item.external"
          @click="handleClick(item)"
        />
      </template>
    </div>
  </div>
</template>

<style lang="scss" module>
@import '../../styles/variables';

.ActionListMenu {
  display: inline-block;
  margin: 4px 0;
  padding: 8px 0;
  background: var(--octans-surface);
  border: 1px solid var(--octans-border);
  border-radius: var(--octans-radius-box);
  box-shadow: 0 2px 16px rgba(33, 43, 54, 0.08);
}

.ActionListMenuSection + .ActionListMenuSection {
  margin-top: 12px;
}

.ActionListMenuSection_title {
  padding: 2px 16px 12px;
  border-bottom: 1px solid var(--octans-border);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}
</style>
