<script lang="ts" setup>
import { computed, provide } from 'vue'
import { MODAL_STACK, modals, type ModalEntry } from './manager'

/**
 * One entry in the stack. It exists to be a component boundary: the `<Modal>`
 * inside needs to know its own depth and needs somewhere to register its close
 * and focus handlers, and `provide` is per-component, so the host cannot do it
 * for all of them at once.
 */
const props = defineProps<{ entry: ModalEntry; depth: number }>()

// The entry belongs to the manager, not to this component, so every change to
// it goes back through the manager rather than through the prop.
provide(MODAL_STACK, {
  depth: computed(() => props.depth),
  register: (handlers: { requestClose: () => void; focus: () => void }) =>
    modals.register(props.entry.id, handlers)
})

function onAction(result?: string | boolean) {
  props.entry.opts.onAction?.(result as string | undefined)
  modals.settle(props.entry.id, result)
  modals.hide(props.entry.id)
}

function onAfterLeave() {
  // A backstop: a modal that leaves without an action still resolves, rather
  // than leaving its caller awaiting something that will never arrive.
  modals.settle(props.entry.id, undefined)
  modals.remove(props.entry.id)
}
</script>

<template>
  <component
    :is="entry.component"
    :opts="entry.opts"
    :visible="entry.visible"
    @action="onAction"
    @afterLeave="onAfterLeave"
  />
</template>
