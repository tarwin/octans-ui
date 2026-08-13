import { inject, provide, type InjectionKey, type Ref } from 'vue'
import type { ToastManagerInstance } from './types'

export const ToastManagerKey = Symbol('toast-manager') as InjectionKey<
  Ref<ToastManagerInstance | undefined>
>

export function provideToastManager(
  instanceRef: Ref<ToastManagerInstance | undefined>
) {
  provide(ToastManagerKey, instanceRef)
}

export function injectToastManager(): ToastManagerInstance {
  const instRef = inject(ToastManagerKey)
  if (!instRef || !instRef.value) {
    throw new Error('Failed to inject Toast Manager component')
  }
  return instRef.value
}
