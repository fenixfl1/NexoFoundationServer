import { format } from 'util'
import {
  CONDITION_FIELD_VALUE_ERROR_MESSAGE,
  INVALID_ARRAY_VALUE_FOR_OPERATOR,
  INVALID_DATA_TYPE_FOR_CONDITION,
  INVALIDA_DATA_TYPE_ERROR_MESSAGE,
  UNSUPPORTED_OPERATOR_ERROR_MESSAGE,
} from '../constants/messages'
import { sanitizeValue } from './sanitize-value'
import { to_date, translate } from './query-utils'
import { detectSQLInjection } from './detect-sql-injection'
import { isValidDate } from './is-valid-date'
import { QueryValidationError } from '@src/errors/http.error'
import { AdvancedCondition } from '@src/types/api.types'

const buildSQLCondition = (
  field: string,
  operator: string,
  placeholder: string
): string => ` AND ${translate(field)} ${operator} ${placeholder}`

interface QueryBuilderReturn {
  whereClause: string
  values: unknown[]
}

export function whereClauseBuilder(
  conditions: AdvancedCondition<Record<string, unknown>>[]
): QueryBuilderReturn {
  const allowedOperators = [
    '!=',
    '<',
    '<=',
    '<>',
    '=',
    '>',
    '>=',
    'BETWEEN',
    'IN',
    'IS NULL',
    'LIKE',
    'NOT IN',
  ]

  let whereClause = 'WHERE 1 = 1'
  const values: unknown[] = []
  let paramIndex = 1

  const quoteIdentifier = (identifier: string): string => {
    return `"${identifier.replace(/"/g, '')}"`
  }

  const quoteField = (field: string | string[]): string => {
    if (Array.isArray(field)) {
      return field
        .map((f) => `COALESCE(${translate(quoteIdentifier(f))}, '')`)
        .join(" || ' ' || ")
    }
    return translate(quoteIdentifier(field))
  }

  conditions.forEach((condition) => {
    const { operator, value } = condition

    const fieldExpr = quoteField(condition.field)

    const suspicious = detectSQLInjection(value)
    if (suspicious?.length) {
      throw new QueryValidationError(suspicious)
    }

    if (
      !condition.field ||
      !operator ||
      (value === undefined && value === null && typeof value !== 'boolean')
    ) {
      throw new QueryValidationError(CONDITION_FIELD_VALUE_ERROR_MESSAGE)
    }

    if (!allowedOperators.includes(operator)) {
      throw new QueryValidationError(
        format(
          UNSUPPORTED_OPERATOR_ERROR_MESSAGE,
          operator,
          allowedOperators.join(', ')
        )
      )
    }

    switch (operator) {
      case '!=':
      case '<>':
      case '<':
      case '<=':
      case '=':
      case '>=':
      case '>': {
        if (
          typeof value !== 'string' &&
          typeof value !== 'number' &&
          !isValidDate(value)
        ) {
          throw new QueryValidationError(
            format(
              INVALIDA_DATA_TYPE_ERROR_MESSAGE,
              typeof value,
              operator,
              'string, number, or date'
            )
          )
        }

        const isDate = isValidDate(sanitizeValue(value))
        const placeholder = isDate
          ? to_date(`$${paramIndex}`, 'DATE')
          : `$${paramIndex}`

        const field = isDate
          ? `DATE_TRUNC('day', "${condition.field}")`
          : fieldExpr

        whereClause += ` AND ${field} ${operator} ${placeholder}`
        values.push(
          sanitizeValue(typeof value === 'string' ? value.toUpperCase() : value)
        )
        paramIndex++
        break
      }

      case 'IS NULL': {
        if (typeof value !== 'boolean') {
          throw new QueryValidationError(
            format(
              INVALIDA_DATA_TYPE_ERROR_MESSAGE,
              typeof value,
              operator,
              'boolean'
            )
          )
        }

        whereClause += value
          ? ` AND ${fieldExpr} IS NULL`
          : ` AND ${fieldExpr} IS NOT NULL`
        break
      }

      case 'IN':
      case 'NOT IN': {
        if (!Array.isArray(value)) {
          throw new QueryValidationError(
            format(INVALID_ARRAY_VALUE_FOR_OPERATOR, operator)
          )
        }

        const placeholders = value.map(() => `$${paramIndex++}`)
        whereClause += ` AND ${fieldExpr} ${operator} (${placeholders.join(
          ', '
        )})`

        placeholders.forEach((_, i) => {
          values.push(
            sanitizeValue(
              typeof value[i] === 'string' ? value[i].toUpperCase() : value[i]
            )
          )
        })
        break
      }

      case 'BETWEEN': {
        if (!Array.isArray(value) || value.length !== 2) {
          throw new QueryValidationError(
            'Expected an array of two values for BETWEEN'
          )
        }

        const [start, end] = value.map((v) => sanitizeValue(v))
        const isDate = isValidDate(start) && isValidDate(end)

        const fromExpr = isDate
          ? to_date(`$${paramIndex}`, 'DATE')
          : `$${paramIndex}`
        values.push(typeof start === 'string' ? start.toUpperCase() : start)
        paramIndex++

        const toExpr = isDate
          ? to_date(`$${paramIndex}`, 'DATE')
          : `$${paramIndex}`
        values.push(typeof end === 'string' ? end.toUpperCase() : end)
        paramIndex++

        const field = isDate
          ? ` DATE_TRUNC('day', "${condition.field}")`
          : fieldExpr

        whereClause += ` AND ${field} BETWEEN ${fromExpr} AND ${toExpr}`
        break
      }

      case 'LIKE': {
        if (
          (typeof value !== 'string' && typeof value !== 'number') ||
          isValidDate(value)
        ) {
          throw new QueryValidationError(
            format(
              INVALIDA_DATA_TYPE_ERROR_MESSAGE,
              typeof value,
              operator,
              'string or number'
            )
          )
        }

        const searchValue = `%${sanitizeValue(
          `${value}`.replace(/%/g, ' ').trim()
        )}%`
        whereClause += ` AND ${fieldExpr} LIKE $${paramIndex}`
        values.push(searchValue?.toUpperCase())
        paramIndex++
        break
      }

      default:
        throw new QueryValidationError(
          format(
            UNSUPPORTED_OPERATOR_ERROR_MESSAGE,
            operator,
            allowedOperators.join(', ')
          )
        )
    }
  })

  return { whereClause, values }
}
