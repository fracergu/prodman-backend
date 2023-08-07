import { errorHandler } from '../error.middleware'
import { HttpException } from '@exceptions/HttpException'
import { RequiredFieldsError } from '@exceptions/RequiredFieldsError'
import { type NextFunction, type Request, type Response } from 'express'

describe('errorHandler Middleware', () => {
  let req: Request
  let res: Response
  let next: NextFunction

  const mockRequest = (data: Partial<Request> = {}) => {
    return data as Request
  }

  const mockResponse = () => {
    const res: Partial<Response> = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    }
    return res as Response
  }

  const mockNext = () => {
    return jest.fn() as NextFunction
  }

  beforeEach(() => {
    req = mockRequest()
    res = mockResponse()
    next = mockNext()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should handle RequiredFieldsError', () => {
    const err = new RequiredFieldsError(['field1'])
    errorHandler(err, req, res, next)
    expect(res.status).toHaveBeenCalledWith(err.status)
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: err.message,
      fields: err.fields
    })
  })

  it('should handle generic HttpException', () => {
    const err = new HttpException(400, 'Bad request')
    errorHandler(err, req, res, next)
    expect(res.status).toHaveBeenCalledWith(err.status)
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: err.message
    })
  })

  it('should handle unknown errors without message', () => {
    const err = new Error()
    errorHandler(err as HttpException, req, res, next)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Internal server error'
    })
  })

  it('should handle unknown errors with message', () => {
    const err = new Error('Unknown error 123')
    errorHandler(err as HttpException, req, res, next)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Unknown error 123'
    })
  })
})
