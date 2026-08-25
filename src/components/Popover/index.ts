export { default as Popover } from './Popover.vue'
export * from './types'

import PopoverComponent from './Popover.vue'
import type { PopoverPlacementType, PopoverProps } from './types'

/**
 * @deprecated Renamed to `Popover`.
 *
 * The component was never built on popper.js — it wraps reka-ui's Popover
 * primitives — so the name pointed at a library the library does not use, and
 * away from the thing every design system calls this. The alias keeps existing
 * imports working and will be removed in a future major.
 */
export const Popper = PopoverComponent

/** @deprecated Renamed to `PopoverProps`. */
export type PopperProps = PopoverProps

/** @deprecated Renamed to `PopoverPlacementType`. */
export type PopperPlacementType = PopoverPlacementType
