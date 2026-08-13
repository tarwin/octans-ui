<script lang="ts" setup>
import { Button } from '@/components/Button'
import { type PageActionsProps } from './types'

withDefaults(defineProps<PageActionsProps>(), {
  secondaryActions: () => []
})
</script>

<template>
  <div :class="['UIElement', $style.PageActions]">
    <Button
      v-for="(action, index) in secondaryActions"
      :key="index"
      :type="action.type"
      :class="$style.Action"
      :disabled="action.disabled"
      :icon="action.icon"
      :url="action.url"
      :external="action.external"
      @click="() => action.onAction?.()"
    >
      {{ action.label }}
    </Button>
    <Button
      v-if="primaryAction"
      :type="primaryAction.type || 'primary'"
      :class="$style.PrimaryAction"
      :disabled="primaryAction.disabled"
      :icon="primaryAction.icon"
      :url="primaryAction.url"
      :external="primaryAction.external"
      @click="() => primaryAction?.onAction?.()"
    >
      {{ primaryAction.label }}
    </Button>
  </div>
</template>

<style lang="scss" module>
.PageActions {
  display: flex;
  border-top: 1px solid var(--octans-border);
  margin-top: 20px;
  padding: 20px 0;
}

.Action + .Action {
  margin-left: 10px;
}

.PrimaryAction {
  margin-left: auto;
}
</style>
