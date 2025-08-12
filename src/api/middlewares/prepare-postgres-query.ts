export function preparePostgresQuery(
  query: string,
  params: Record<string, unknown>
): { query: string; values: unknown[] } {
  const paramNames = query.match(/:\w+/g) || []
  const uniqueParams = [...new Set(paramNames.map((p) => p.slice(1)))]
  const values = uniqueParams.map((name) => params[name])
  let transformedQuery = query

  uniqueParams.forEach((name, index) => {
    const regex = new RegExp(`:${name}\\b`, 'g')
    transformedQuery = transformedQuery.replace(regex, `$${index + 1}`)
  })

  return { query: transformedQuery, values }
}
