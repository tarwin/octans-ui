<script lang="ts">
/**
 * Lets Tooltip tell whether it is already inside a provider. Without it every
 * Tooltip has to supply its own, which works but breaks radix's grouping —
 * moving between two tooltips no longer skips the open delay.
 */
export const hasTooltipProviderKey = Symbol('UiTooltipProvider')
</script>

<script lang="ts" setup>
import { TooltipProvider } from 'reka-ui'
import { provide } from 'vue'

provide(hasTooltipProviderKey, true)
</script>

<template>
  <TooltipProvider>
    <slot></slot>
  </TooltipProvider>
</template>
