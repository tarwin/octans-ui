<script lang="ts" setup>
import { computed } from 'vue'
import Modal from '../Modal.vue'
import type { GenericModalProps, ModalEmits, ModalActionType } from './types'
import { RenderNode, useBaseModal } from './Base'

const props = defineProps<GenericModalProps>()

const emit = defineEmits<ModalEmits>()
const { handleAction, handleLeave } = useBaseModal(emit)

const primaryAction = computed(() => {
  return props.opts.primaryAction && wrapAction(props.opts.primaryAction)
})
const secondaryActions = computed(() => {
  return (props.opts.secondaryActions || []).map(wrapAction)
})

function wrapAction(action: ModalActionType) {
  return {
    ...action,
    onAction: () => {
      if (action.onAction) {
        action.onAction()
      }
      handleAction(action.id)
    }
  }
}
</script>

<template>
  <Modal
    :title="opts.title"
    :primaryAction="primaryAction"
    :secondaryActions="secondaryActions"
    :visible="visible"
    @close="() => handleAction()"
    @afterLeave="handleLeave"
  >
    <render-node :node="opts.content" />
  </Modal>
</template>
