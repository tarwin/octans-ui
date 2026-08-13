export type ToastPosition = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'

export type ToastTone = 'success' | 'warning' | 'error' | 'info'

export interface ToastActionType {
  label: string
  onAction?(): void
}

export interface ToastItemType {
  title: string
  content?: string
  progress?: number
  icon?: string
  loading?: boolean
  actions?: ToastActionType[]
  /** Corner or edge of the viewport the toast stacks at. Defaults to the
   * manager's `position` (out of the box `'se'`, the bottom right). */
  position?: ToastPosition
  /** Sets a default icon and accent color for common toast flavors. */
  tone?: ToastTone
  /** Dark toast on a light UI (the default). Pass `false` for a white toast.
   * Defaults to the manager's `contrasting`. */
  contrasting?: boolean
}

export interface ToastProps {
  item: ToastItemType
  contrasting?: boolean
}

export interface ToastManagerItemType extends ToastItemType {
  _id: number
  duration: number
  remove(): void
}

export interface ToastManagerConfig {
  /** Default stack position for toasts that don't set their own. */
  position?: ToastPosition
  /** Distance in pixels between each stack and the viewport edges it anchors
   * to, in addition to the toasts' built-in 16px margin. A number applies to
   * both axes. */
  offset?: number | { x?: number; y?: number }
  /** Default theme for toasts that don't set their own `contrasting`. */
  contrasting?: boolean
}
