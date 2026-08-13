import { type VNode, type Slot, Fragment, Comment, Text } from 'vue'

import isEqual from 'lodash-es/isEqual'
import orderBy from 'lodash-es/orderBy'
import memoize from 'lodash-es/memoize'
import xor from 'lodash-es/xor'

export { isEqual, orderBy, memoize }

export * from './deferredPromise'

export * from './date'
export * from './loader'

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// flatten slot children, recursively unwrapping Fragments (template tags,
// v-for) and dropping comments (v-if="false" placeholders) so callers don't
// render wrappers around nothing
export function flattenSlotChildren(children: VNode[]): VNode[] {
  const result: VNode[] = []
  for (const child of children) {
    if (child.type === Comment) {
      continue
    }
    if (child.type === Fragment && Array.isArray(child.children)) {
      result.push(...flattenSlotChildren(child.children as VNode[]))
    } else {
      result.push(child)
    }
  }
  return result
}

export function isEmptyValue(value: any) {
  return value === undefined || value === null || value === ''
}

export function nonEmptyChildren(vnodes: VNode[]): VNode[] {
  return vnodes ? vnodes.filter((node) => node.el?.text && node.el?.tag) : []
}

export function clamp(value: number, min: number, max: number) {
  if (value < min) return min
  if (value > max) return max
  return value
}

export function pad(value: number) {
  return value < 10 ? '0' + value : `${value}`
}

export function inputToNumber(value: any) {
  const num = parseFloat(value)
  return isNaN(num) ? value : num
}

export function scrollIntoViewIfNeeded(
  el?: HTMLElement & { scrollIntoViewIfNeeded?: () => void }
) {
  if (!el) return
  if (el.scrollIntoViewIfNeeded) {
    el.scrollIntoViewIfNeeded()
  } else if (el.scrollIntoView) {
    el.scrollIntoView({
      block: 'center',
      inline: 'nearest'
    })
  }
}

export function cloneDeep(value: any) {
  return JSON.parse(JSON.stringify(value))
}

export function escapeRegExp(string: string) {
  return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

export function createWildcardRegExp(string: string) {
  const pattern = '^' + escapeRegExp(string).replace(/\\\*/g, '.*') + '$'
  return new RegExp(pattern)
}

export function isEqualUnordered(array1: any[] | any, array2: any[] | any) {
  if (Array.isArray(array1) && Array.isArray(array2)) {
    return xor(array1, array2).length === 0
  }
  return isEqual(array1, array2)
}

export function isVNode(value: any): value is VNode {
  return (
    value &&
    typeof value === 'object' &&
    'isRootInsert' in value &&
    'isComment' in value
  )
}

/**
 * Check if a VNode has meaningful content (not just comments, whitespace, or empty fragments)
 */
export function vnodeHasContent(vnode: VNode): boolean {
  if (vnode.type === Comment) {
    return false
  }
  if (vnode.type === Text) {
    return (
      typeof vnode.children === 'string' && vnode.children.trim().length > 0
    )
  }
  if (vnode.type === Fragment) {
    return (
      Array.isArray(vnode.children) &&
      vnode.children.some((child) => vnodeHasContent(child as VNode))
    )
  }
  // For component or element nodes, check if they have children content
  if (Array.isArray(vnode.children)) {
    return vnode.children.some((child) => vnodeHasContent(child as VNode))
  }
  // Regular element or component - has content
  return true
}

/**
 * Check if a slot has meaningful content (not just comments, empty templates, or whitespace)
 */
export function hasSlotContent(
  slot: Slot | undefined,
  props?: Record<string, unknown>
): boolean {
  if (!slot) return false
  const vnodes = slot(props)
  return vnodes.some(vnodeHasContent)
}
