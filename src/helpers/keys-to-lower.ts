export function convertKeysToLowercase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToLowercase)
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const lowerKey = key.toLowerCase()
      acc[lowerKey] = convertKeysToLowercase(obj[key])
      return acc
    }, {} as any)
  }

  return obj
}
