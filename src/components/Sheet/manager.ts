import type { Ref } from 'vue'

/**
 * TODO: This used to be accomplished by passing around the
 * actual Vue component instance, but I thought this could make
 * more sense and maybe be simpler?
 *
 * The manager is deliberately axis-agnostic: `peek` and `offset` are distances
 * along whichever axis the sheet slides on, and each sheet turns its own offset
 * into a transform. That is what lets a top sheet and a right sheet share one
 * stack.
 */
export class SheetInstance {
  isActive: Ref<boolean>
  /** How much of this sheet stays visible when it is covered by another. */
  peek: number
  /** Distance this sheet is pushed toward the centre while in the background. */
  offset: Ref<number>
  index: Ref<number>

  constructor(opts: {
    isActive: Ref<boolean>
    peek: number
    offset: Ref<number>
    index: Ref<number>
  }) {
    this.isActive = opts.isActive
    this.peek = opts.peek
    this.offset = opts.offset
    this.index = opts.index
  }
}

export function createSheetManager() {
  const _window = window as any
  const stack: SheetInstance[] = (_window.uiSheetStack =
    _window.uiSheetStack || [])
  let overflowClass: string | null = null
  return {
    stack,
    add(vm: SheetInstance) {
      const index = stack.indexOf(vm)
      if (index > 0) {
        stack.splice(index, 1)
      }
      for (const other of stack) {
        other.isActive.value = false
      }

      let offset = 0
      let i = stack.length - 1
      while (i >= 0) {
        offset += stack[i].peek
        stack[i].offset.value = offset
        i--
      }

      stack.push(vm)
      this.handleOverflow()
    },
    beforeRemove(vm: SheetInstance) {
      const length = stack.length
      if (length > 1) {
        const index = stack.indexOf(vm)
        if (index === length - 1) {
          stack[length - 2].isActive.value = true
        }
      }

      let offset = 0
      let i = stack.length - 2
      while (i >= 0) {
        stack[i].offset.value = offset
        offset += stack[i].peek
        i--
      }
    },
    remove(vm: SheetInstance) {
      const index = stack.indexOf(vm)
      if (index >= 0) {
        stack.splice(index, 1)
      }
      if (stack.length) {
        stack[stack.length - 1].isActive.value = true
      }
      this.handleOverflow()
    },
    getNextZIndex() {
      let index = 1000
      for (const vm of stack) {
        index = Math.max(index, vm.index.value + 1)
      }
      return index
    },
    handleOverflow() {
      if (overflowClass) {
        document.body.classList.toggle(overflowClass, stack.length > 0)
      }
    },
    setOverflowClass(name: string) {
      overflowClass = name
    }
  }
}
