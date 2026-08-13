import { nextTick, type Component } from 'vue'
import Modal from './Modal.vue'
import ModalHost from './ModalHost.vue'
import AlertModal from './api/AlertModal.vue'
import ConfirmModal from './api/ConfirmModal.vue'
import GenericModal from './api/GenericModal.vue'
import PromptModal from './api/PromptModal.vue'
import { ensureHost } from './host'
import { modals } from './manager'
import type * as Api from './api/types'

function createApi<T extends Api.ModalOptions, Default = unknown>(
  component: Component
) {
  return function <Result = Default>(opts: T): Promise<Result | undefined> {
    return new Promise<Result | undefined>((resolve) => {
      ensureHost()
      const entry = modals.add(component, opts, resolve)
      // Added hidden, then shown, so the enter transition has a state to start
      // from.
      nextTick(() => modals.show(entry.id))
    })
  }
}

export const genericModal = createApi<Api.GenericModalOptions>(GenericModal)
export const alertModal = createApi<Api.AlertModalOptions>(AlertModal)
export const confirmModal = createApi<Api.ConfirmModalOptions, boolean>(
  ConfirmModal
)
export const promptModal = createApi<Api.PromptModalOptions, string>(
  PromptModal
)

export { Modal, ModalHost }
export type { ModalProps } from './types'
// The four `Api.*ModalProps`, `BaseProps` and `ModalEmits` stay internal —
// they describe the api components in `./api`, which are rendered by the host
// rather than exported, so a consumer can never hold one.
export type {
  ModalOptions,
  ModalActionType,
  AlertModalOptions,
  ConfirmModalOptions,
  GenericModalOptions,
  PromptModalOptions
} from './api/types'
