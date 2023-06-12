import { HttpException } from './HttpException'

export class RequiredFieldsError extends HttpException {
  fields: string[]
  constructor(fields: string[]) {
    super(400, 'Missing required fields')
    this.fields = fields
  }
}
