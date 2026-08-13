<script lang="ts" setup>
export interface PreventAutoCompleteProps {
  /**
   * When disabled, the component renders the default slot content directly
   * without wrapping it in the form element.
   */
  enabled?: boolean
}

withDefaults(defineProps<PreventAutoCompleteProps>(), {
  enabled: true
})
</script>

<template>
  <slot v-if="!enabled"></slot>
  <form
    v-else
    autocomplete="off"
    onsubmit="return false"
  >
    <slot></slot>
  </form>
</template>
