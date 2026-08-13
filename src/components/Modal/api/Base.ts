import { defineComponent, h } from 'vue'
import type { ModalEmits } from './types'

export const RenderNode = defineComponent({
  props: ['node'],
  setup(props, { attrs }) {
    return () => h('div', attrs, [props.node])
  }
})

export function useBaseModal(emit: ModalEmits) {
  function handleAction(result?: string | boolean) {
    emit('action', result)
  }
  function handleLeave() {
    emit('afterLeave')
  }
  return {
    // emit,
    handleAction,
    handleLeave
  }
}
