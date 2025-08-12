import { assert } from './assert'

/**
 * This function is used to validate is an given value is a valid date.
 * @param {unknown} value the value to validate
 * @return {boolean} return true or false if is a valid date or not
 */
export function isValidDate(value: unknown): boolean {
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

  assert<string>(value)

  if (!dateRegex.test(value as string)) {
    return false
  }

  const date = new Date(value as string)
  return value === date.toISOString().split('T')[0]
}
