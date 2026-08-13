<script lang="ts" setup>
import Modal from '../Modal.vue'
import type { ConfirmModalProps, ModalEmits } from './types'
import { RenderNode, useBaseModal } from './Base'
import { $t } from '@/utils/translate'

const props = defineProps<ConfirmModalProps>()

const emit = defineEmits<ModalEmits>()
const { handleAction, handleLeave } = useBaseModal(emit)

function confirm() {
  props.opts.onConfirm?.()
  handleAction(true)
}
function cancel() {
  props.opts.onCancel?.()
  handleAction(false)
}
</script>

<template>
  <Modal
    :title="opts.title"
    :primaryAction="{
      label: opts.primaryActionLabel || $t('ui.modal.confirm'),
      type: opts.primaryActionType || 'primary',
      onAction: confirm
    }"
    :secondaryActions="[
      {
        label: opts.secondaryActionLabel || $t('ui.modal.cancel'),
        onAction: cancel
      }
    ]"
    :visible="visible"
    @close="cancel"
    @afterLeave="handleLeave"
  >
    <render-node :node="opts.content" />
  </Modal>
</template>
