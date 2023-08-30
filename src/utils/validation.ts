export const getIntegerParam = (
  value: string | undefined,
  defaultValue: number
): number => {
  if (value === undefined) {
    return defaultValue
  }

  const parsedValue = parseInt(value)
  if (isNaN(parsedValue)) {
    return defaultValue
  }

  return parsedValue
}

export const isValidString = (value: any): boolean => {
  return (
    value !== undefined &&
    typeof value === 'string' &&
    value !== '' &&
    value !== null
  )
}
