import type * as Api from './api/types'

export interface ModalProps {
  visible: boolean
  title?: string
  /**
   * Options for the primary action button.
   */
  primaryAction?: Api.ModalActionType
  /**
   * An array of options for the secondary actions.
   */
  secondaryActions?: Api.ModalActionType[]
  /**
   * An array of options for the tertiary actions. These will show on the left side of the footer.
   */
  tertiaryActions?: Api.ModalActionType[]
  /**
   * Shows a spinner over the whole modal dialog and prevents closing.
   */
  loading?: boolean
  /**
   * Does not render header section
   */
  noHeader?: boolean
  /**
   * Style to add to the dialog element, e.g. to set a width, height
   */
  dialogStyle?: Record<string, any>
  /**
   * Styles for the pre-body slot.
   */
  preBodyStyle?: Record<string, any>
  /**
   * Styles for the body slot.
   */
  bodyStyle?: Record<string, any>
  /**
   * Workaround to allow modal body overflow to be visible.
   * Used to prevent popper items that do not use teleport within the modal from being clipped.
   */
  overflowVisible?: boolean
  /**
   * Invoked when the modal's "X" button is clicked or ESC is pressed. The "X"
   * button and the ESC handler are only rendered when this is defined.
   * NOTE: `@close` compiles down to this same prop, which is why there is no
   * matching entry in the component's `defineEmits` — see Modal.vue.
   */
  onClose?(): void
}
