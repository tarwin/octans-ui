<script lang="ts" setup>
import { onBeforeUnmount, useAttrs } from 'vue'
import { createEventListener, type EventHandler, type Listener } from './utils'

export interface EventDelegatorProps {
  target?: 'window' | 'document'
}

const props = withDefaults(defineProps<EventDelegatorProps>(), {
  target: 'window'
})

defineOptions({
  inheritAttrs: false
})

const attrs = useAttrs()

let _target: Window | Document = window
let listeners: Listener[] = []

function init() {
  if (props.target === 'document') {
    _target = document
  }
  for (const [name, handler] of Object.entries(attrs)) {
    // HACK: oh boy this is one big hack
    if (name.startsWith('on') && typeof handler === 'function') {
      // `attrs` is `unknown`-valued, so the check above only narrows as far as
      // `Function`. The cast is sound because nothing but the DOM calls these,
      // and it calls them with the event alone.
      const listener = createEventListener(
        name,
        _target,
        handler as EventHandler
      )
      listeners.push(listener)
    }
  }
}
init()

onBeforeUnmount(() => {
  listeners.forEach((listener) => {
    listener.remove?.()
  })
  listeners = []
})
</script>

<template>
  <slot></slot>
</template>
