import { RequiredFieldsError } from '@exceptions/RequiredFieldsError'
import { checkRequiredFields } from '@utils/validation'

describe('validationUtils', () => {
  describe('checkRequiredFields', () => {
    it('should throw an error if a required field is missing', () => {
      const body = {
        email: 'test@test.com',
        password: 'test'
      }
      expect(() => {
        checkRequiredFields(['name', 'lastName', 'email', 'password'], body)
      }).toThrowError(new RequiredFieldsError(['name', 'lastName']))
    })

    it('should not throw an error if all required fields are present', () => {
      const body = {
        name: 'test',
        lastName: 'test',
        email: 'test@test.com',
        password: 'test'
      }
      expect(() => {
        checkRequiredFields(['name', 'lastName', 'email', 'password'], body)
      }).not.toThrowError()
    })
  })
})
