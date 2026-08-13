<script lang="ts" setup>
import { Icon } from '@/components/Icon'
import { nonEmptyChildren } from '@/utils'
import { h, useCssModule, useSlots } from 'vue'

const props = defineProps<{
  message?: string
}>()

const $style = useCssModule()
const slots = useSlots()

const render = () => {
  if (
    props.message ||
    (slots.default && nonEmptyChildren(slots.default()).length)
  ) {
    const content = [
      h(Icon, {
        icon: 'mdi:alert-circle',
        style: 'margin-right: 6px'
      })
    ]
    if (props.message) {
      // @ts-expect-error `content` is inferred from its literal initialiser
      content.push(props.message)
    } else {
      if (slots.default) {
        content.push(...slots.default())
      }
    }
    return h(
      'div',
      {
        class: ['UIElement', $style.InlineError]
      },
      [...content]
    )
  }
  return h('div')
}
</script>

<template>
  <!-- called inline so this renders in InlineError's own effect - see List.vue -->
  <component :is="render()" />
</template>

<style lang="scss" module>
.InlineError {
  margin-top: 4px;
  color: var(--octans-text-error);
  font-size: 14px;
  line-height: 20px;
}
</style>
