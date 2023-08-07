import { RequiredFieldsError } from '@exceptions/RequiredFieldsError'

export const checkRequiredFields = (fields: string[], body: any) => {
  const missingFields = fields.filter(field => body[field] === undefined)
  if (missingFields.length > 0) {
    throw new RequiredFieldsError(missingFields)
  }
}
