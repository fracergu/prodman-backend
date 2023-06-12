import { type HttpException } from '@exceptions/HttpException'
import { RequiredFieldsError } from '@exceptions/RequiredFieldsError'
import { type NextFunction, type Request, type Response } from 'express'

export const errorHandler = (
  err: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof RequiredFieldsError) {
    res.status(err.status).json({
      status: 'error',
      message: err.message,
      fields: err.fields
    })
  } else {
    res.status(err.status ?? 500).json({
      status: 'error',
      message: err.message ?? 'Internal server error'
    })
  }
}
