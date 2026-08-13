<script lang="ts" setup>
import { TextField } from '@/components/TextField'
import { computed, ref } from 'vue'
import Modal from '../Modal.vue'
import type { PromptModalProps, ModalEmits } from './types'
import { RenderNode, useBaseModal } from './Base'
import { $t } from '@/utils/translate'

const props = defineProps<PromptModalProps>()

const emit = defineEmits<ModalEmits>()
const { handleAction, handleLeave } = useBaseModal(emit)

const inputValue = ref(props.opts.inputValue || '')
const invalidValueText = ref(
  props.opts.invalidValueText || $t('ui.modal.invalidValue')
)
const multiline = ref(!!props.opts.multiline)
const input = ref<HTMLElement>()

const validatorResult = computed(() => {
  return props.opts.inputValidator
    ? props.opts.inputValidator(inputValue.value)
    : true
})

const error = computed(() => {
  if (!inputValue.value) {
    // Don't error when input is empty
    return ''
  }
  const result = validatorResult.value
  if (result === false) {
    return invalidValueText.value
  }
  if (typeof result === 'string') {
    return result
  }
  return ''
})

const canSubmit = computed(() => {
  return inputValue.value && !error.value
})

function submit(e?: KeyboardEvent, enterPressed?: boolean) {
  // multiline needs to support submit
  // can press command or control + enter to submit
  if (multiline.value && enterPressed && !(e?.metaKey || e?.ctrlKey)) {
    return
  }
  if (!error.value) {
    if (props.opts.onSubmit) {
      props.opts.onSubmit(inputValue.value)
    }
    handleAction(inputValue.value)
  }
}
function cancel() {
  if (props.opts.onCancel) {
    props.opts.onCancel()
  }
  handleAction()
}
function handleEnter() {
  input.value?.focus?.()
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    submit(e, true)
  } else if (e.key === 'Escape') {
    cancel()
  }
}
</script>

<template>
  <Modal
    :title="opts.title"
    :primaryAction="{
      label: opts.primaryActionLabel || $t('ui.modal.submit'),
      type: 'primary',
      disabled: !canSubmit,
      onAction: submit
    }"
    :secondaryActions="[
      {
        label: opts.secondaryActionLabel || $t('ui.modal.cancel'),
        onAction: cancel
      }
    ]"
    :visible="visible"
    @close="cancel"
    @afterEnter="handleEnter"
    @afterLeave="handleLeave"
  >
    <render-node
      :node="opts.content"
      style="margin-bottom: 8px"
    />
    <TextField
      ref="input"
      v-model="inputValue"
      :helpText="opts.inputHelpText"
      :error="error"
      :placeholder="opts.inputPlaceholder"
      @keydown="onKeydown"
      :multiline="multiline"
    />
  </Modal>
</template>
