import type { VNode } from 'vue'
import type { ActionType, ActionTypeType } from '../../types'

/**
 * Types for the imperative modal API — `alertModal()`, `confirmModal()`,
 * `promptModal()` and `genericModal()` — as opposed to `ModalProps`, which
 * describes the `<Modal>` component.
 *
 * These lived in a `namespace Api` inside `../types.ts`. The file is the
 * namespace now, and which spelling a caller uses depends on where it sits:
 *
 * - Outside this folder, `import type * as Api from './api/types'` and write
 *   `Api.AlertModalOptions`. The prefix is what tells them apart from
 *   `ModalProps`, which belongs to the `<Modal>` component rather than to any
 *   of this.
 * - Inside this folder, import the names directly — you are already here, and
 *   the `.vue` files have no choice: `defineProps<T>()` is resolved by
 *   `@vue/compiler-sfc` rather than by TypeScript, and it cannot follow a
 *   namespace-import alias. `defineProps<Api.AlertModalProps>()` compiles
 *   under `vue-tsc` and then fails at build time with "Unresolvable type
 *   reference".
 */

export interface BaseProps {
  visible: boolean
}

export interface GenericModalProps extends BaseProps {
  opts: GenericModalOptions
}
export interface ConfirmModalProps extends BaseProps {
  opts: ConfirmModalOptions
}
export interface AlertModalProps extends BaseProps {
  opts: AlertModalOptions
}
export interface PromptModalProps extends BaseProps {
  opts: PromptModalOptions
}
export interface ModalOptions {
  title?: string
  onAction?(value?: string): void
}

export interface AlertModalOptions extends ModalOptions {
  primaryActionLabel?: string
  primaryActionType?: ActionTypeType
  content?: string | VNode
}

export interface ConfirmModalOptions extends ModalOptions {
  primaryActionLabel?: string
  primaryActionType?: ActionTypeType
  secondaryActionLabel?: string
  content?: string | VNode
  onConfirm?(): void
  onCancel?(): void
}

export interface GenericModalOptions extends ModalOptions {
  content?: string | VNode
  primaryAction?: ModalActionType
  secondaryActions?: ModalActionType[]
}

export interface PromptModalOptions extends ModalOptions {
  content?: string | VNode
  /**
   * @default "Submit"
   */
  primaryActionLabel?: string
  /**
   * @default "Cancel"
   */
  secondaryActionLabel?: string
  /**
   * The default value of the input.
   */
  inputValue?: string
  /**
   * If set to `true` the input will be a textarea instead of a single line. Pressing enter will create a new line instead of submitting. If you press Command+Enter (MacOS) or Control+Enter (Windows) the prompt will submit.
   */
  multiline?: boolean
  /**
   * Help text below the input.
   */
  inputHelpText?: string
  /**
   * The placeholder text for the input.
   */
  inputPlaceholder?: string
  /**
   * Error message to show below input when `inputValidator` returns `false`
   * (to signify an error but without any specific error message).
   *
   * @default "Invalid value."
   */
  invalidValueText?: string
  /**
   * Return `true` if the input is valid.
   * Return `false` if invalid.
   * Return a string to use as invalid error message.
   *
   * @default Defaults to a function that prevents empty strings or input
   * that is pure whitespace.
   */
  inputValidator?(input: string): boolean | string
  onSubmit?(value: string): void
  onCancel?(): void
}

export interface ModalActionType extends ActionType {
  id?: string
}

export interface ModalEmits {
  (e: 'action', result?: string | boolean): void
  (e: 'afterLeave'): void
}
