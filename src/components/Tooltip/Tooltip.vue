<script lang="ts" setup>
import type { PopperPlacementType } from '@/components/Popper'
import { getRadixPopperPlacement } from '@/utils/radix'
import { hasTooltipProviderKey } from '@/components/UiProvider/UiProvider.vue'
import {
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger
} from 'reka-ui'
import { computed, inject, type SetupContext } from 'vue'

export interface TooltipProps {
  placement?: PopperPlacementType
  content?: string
}

// Renders its children and nothing else. Vue's own Fragment can't stand in
// here — `<component :is>` passes children as a slots object, which Fragment
// doesn't understand, and the subtree renders empty.
const Passthrough = (_: unknown, { slots }: SetupContext) => slots.default?.()

const props = defineProps<TooltipProps>()

// radix's TooltipRoot throws without a provider above it. UiProvider is the
// right place for one — it groups every tooltip in the app under a shared open
// delay — but a Tooltip shouldn't hard-crash just because the host app didn't
// mount one, so fall back to providing our own.
const wrapper = inject(hasTooltipProviderKey, false)
  ? Passthrough
  : TooltipProvider

const placementInfo = computed(() => {
  return getRadixPopperPlacement(props.placement || '')
})
</script>

<template>
  <!-- Maybe could just use Popper for this instead? -->
  <component :is="wrapper">
    <TooltipRoot :delayDuration="100">
      <TooltipPortal>
        <TooltipContent
          asChild
          :side="placementInfo.side"
          :align="placementInfo.align"
        >
          <div :class="['UIElement', $style.Tooltip]">
            <slot name="content">
              {{ content }}
            </slot>
          </div>
        </TooltipContent>
      </TooltipPortal>
      <TooltipTrigger as="span">
        <slot></slot>
      </TooltipTrigger>
    </TooltipRoot>
  </component>
</template>

<style lang="scss" module>
// Matches the CSS-only tooltip in styles/global.tooltip.scss — both draw the
// same thing, so both read the same tokens.
.Tooltip {
  max-width: 300px;
  padding: 8px;
  background: var(--octans-surface-tooltip);
  border-radius: var(--octans-radius-box);
  box-shadow: var(--octans-shadow-md);
  color: var(--octans-text-on-tooltip);
}
</style>
