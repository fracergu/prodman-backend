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

export const isValidString = (value: string): boolean => {
  return value !== undefined && value !== '' && value !== null
}
