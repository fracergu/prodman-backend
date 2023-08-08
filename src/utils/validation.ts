import { RequiredFieldsError } from '@exceptions/RequiredFieldsError'

export const checkRequiredFields = (fields: string[], body: any) => {
  const missingFields = fields.filter(field => body[field] === undefined)
  if (missingFields.length > 0) {
    throw new RequiredFieldsError(missingFields)
  }
}

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

export const isValidString = (value: string | undefined): boolean => {
  return value !== undefined && value !== '' && value !== null
}
