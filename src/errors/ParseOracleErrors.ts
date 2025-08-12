interface OracleErrorInfo {
  code: string
  message: string
  type:
    | 'ValidationError'
    | 'ConstraintError'
    | 'SyntaxError'
    | 'NotFoundError'
    | 'Unknown'
}

export function parseOracleError(error: unknown): OracleErrorInfo | null {
  if (typeof error !== 'object' || !error || !('message' in error)) return null

  const message = (error as any).message as string
  const match = message.match(/ORA-(\d{5}):\s?(.*)/)

  if (!match) return null

  const [, code, description] = match

  let type: OracleErrorInfo['type'] = 'Unknown'

  switch (code) {
    case '00001': // unique constraint
    case '02291': // integrity constraint - parent key not found
    case '02292': // integrity constraint - child record found
      type = 'ConstraintError'
      break

    case '01400': // cannot insert NULL
    case '01438': // value larger than specified precision
      type = 'ValidationError'
      break

    case '00904': // invalid identifier
    case '00932': // inconsistent datatypes
    case '00933': // SQL command not properly ended
    case '01722': // invalid number
    case '00936': // missing expression
      type = 'SyntaxError'
      break

    case '01403': // no data found
      type = 'NotFoundError'
      break

    default:
      type = 'Unknown'
  }

  return {
    code: `ORA-${code}`,
    message: description.trim(),
    type,
  }
}
