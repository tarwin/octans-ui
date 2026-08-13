<script lang="ts" setup>
import Modal from '../Modal.vue'
import type { AlertModalProps, ModalEmits } from './types'
import { RenderNode, useBaseModal } from './Base'
import { $t } from '@/utils/translate'

defineProps<AlertModalProps>()

const emit = defineEmits<ModalEmits>()
const { handleAction, handleLeave } = useBaseModal(emit)
</script>

<template>
  <Modal
    :title="opts.title"
    :primaryAction="{
      label: opts.primaryActionLabel || $t('ui.modal.close'),
      type: opts.primaryActionType || 'primary',
      onAction: () => handleAction()
    }"
    :visible="visible"
    @close="handleAction"
    @afterLeave="handleLeave"
  >
    <render-node :node="opts.content" />
  </Modal>
</template>
