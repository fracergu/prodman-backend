import { RequestError } from '@exceptions/RequestError'
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError
} from '@prisma/client/runtime/library'
import { type NextFunction, type Request, type Response } from 'express'

type ErrorTypes =
  | PrismaClientKnownRequestError
  | PrismaClientValidationError
  | RequestError
  | Error

function _handleP2002Error(err: PrismaClientKnownRequestError, res: Response) {
  if (err.meta?.target == null)
    return res
      .status(400)
      .json({ status: 'error', message: 'Unique constraint failed' })
  const fields = (err.meta.target as string[]).join(', ')
  return res.status(400).json({
    status: 'error',
    message: `Unique constraint failed for fields: ${fields}`
  })
}

export const errorHandler = (
  err: ErrorTypes,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2025':
        return res.status(404).json({ status: 'error', message: 'Not found' })
      case 'P2002':
        return _handleP2002Error(err, res)
      default:
        return res.status(400).json({ status: 'error', message: err.message })
    }
  }

  if (err instanceof PrismaClientValidationError) {
    const errorMessage = err.message
    const match = errorMessage.match(/Argument .+ is missing/)
    const responseMessage = match != null ? match[0] : 'An error occurred'
    return res.status(400).json({ status: 'error', message: responseMessage })
  }

  if (err instanceof RequestError) {
    return res
      .status(err.statusCode)
      .json({ status: 'error', message: err.message })
  }

  return res
    .status(500)
    .json({ status: 'error', message: 'Something went wrong' })
}
