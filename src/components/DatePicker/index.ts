import type { DatePickerProps } from './types'

export { default as DatePicker } from './DatePicker.vue'
export type { DatePickerProps } from './types'

export function isDatePickerType(
  type?: string
): type is DatePickerProps['type'] {
  return (
    type === 'datetime' ||
    type === 'date' ||
    type === 'month' ||
    type === 'year'
  )
}
