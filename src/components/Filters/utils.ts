import { isEmptyValue } from '../../utils'

export function isEmptyFilterValue(value: any) {
  if (Array.isArray(value)) {
    return !value.length
  }
  return isEmptyValue(value)
}
