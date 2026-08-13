<script lang="ts" setup>
import {
  saveBar,
  useSaveBar,
  type SaveBarStateType
} from '@/components/SaveBar'
import { onBeforeUnmount, onMounted, watch } from 'vue'

/**
 * Renderless bridge to the global save bar, from before `useSaveBar()`
 * existed.
 *
 * @deprecated Use the `useSaveBar()` composable instead — same events as
 * callbacks, plus direct access to the state, without a component in the
 * template.
 */
const props = defineProps<{
  /**
   * Mirrors this value into the global state. Left unset, mounting the
   * controller shows the bar (`changed`) and unmounting hides it — which is
   * what `v-if="dirty"` usage relies on.
   */
  state?: SaveBarStateType
}>()

const emit = defineEmits<{
  (e: 'update:state', state: SaveBarStateType): void
  (e: 'save'): void
  (e: 'discard'): void
  (e: 'update', v: boolean): void
}>()

useSaveBar({
  onSave: () => {
    emit('save')
    emit('update', true)
  },
  onDiscard: () => {
    emit('discard')
    emit('update', false)
  }
})

watch(
  () => saveBar.state,
  (value) => emit('update:state', value)
)

if (props.state === undefined) {
  onMounted(() => saveBar.setState('changed'))
  onBeforeUnmount(() => saveBar.setState('unchanged'))
} else {
  watch(
    () => props.state,
    (value) => {
      if (value) saveBar.setState(value)
    },
    { immediate: true }
  )
}
</script>

<template>
  <slot></slot>
</template>
