import { errorHandler } from '../error.middleware'
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError
} from '@prisma/client/runtime/library'
import { RequestError } from '@exceptions/RequestError'
import { type NextFunction, type Request, type Response } from 'express'

describe('ErrorHandler', () => {
  let req: Request
  let res: Response
  let next: NextFunction

  const mockRequest = () => {
    return {} as Request
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

  describe('errorHandler', () => {
    it('shoud console.error the error if DEVELOPMENT is true', () => {
      console.error = jest.fn()
      const err = new Error('Test error')
      process.env.DEVELOPMENT = 'true'
      errorHandler(err, req, res, next)
      expect(console.error).toHaveBeenCalledWith(err)
    })

    it('should handle unique constraint error with target', () => {
      const err = new PrismaClientKnownRequestError(
        'Unique constraint failed on the fields',
        {
          code: 'P2002',
          clientVersion: '2.0.0',
          meta: { target: ['username'] }
        }
      )

      errorHandler(err, req, res, next)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Unique constraint failed for fields: username'
      })
    })

    it('should handle unique constraint error without target', () => {
      const err = new PrismaClientKnownRequestError(
        'Unique constraint failed on the fields',
        {
          code: 'P2002',
          clientVersion: '2.0.0',
          meta: { target: null }
        }
      )

      errorHandler(err, req, res, next)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Unique constraint failed'
      })
    })

    it('should handle foreign key constraint error with target', () => {
      const err = new PrismaClientKnownRequestError(
        'Foreign key constraint failed on the fields',
        {
          code: 'P2003',
          clientVersion: '2.0.0',
          meta: { target: ['username'] }
        }
      )

      errorHandler(err, req, res, next)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Foreign key constraint failed for fields: username'
      })
    })

    it('should handle foreign key constraint error without target', () => {
      const err = new PrismaClientKnownRequestError(
        'Foreign key constraint failed on the fields',
        {
          code: 'P2003',
          clientVersion: '2.0.0',
          meta: { target: null }
        }
      )

      errorHandler(err, req, res, next)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Foreign key constraint failed'
      })
    })

    it('should handle not found error', () => {
      const err = new PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '2.0.0'
      })

      errorHandler(err, req, res, next)
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Not found'
      })
    })

    it('should handle any other PrismaClientKnownRequestError', () => {
      const err = new PrismaClientKnownRequestError('Something went wrong', {
        code: 'P1000',
        clientVersion: '2.0.0'
      })

      errorHandler(err, req, res, next)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Something went wrong'
      })
    })

    it('should handle argument missing error', () => {
      const err = new PrismaClientValidationError(
        'Argument username is missing',
        {
          clientVersion: '2.0.0'
        }
      )

      errorHandler(err, req, res, next)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Argument username is missing'
      })
    })

    it('should handle a general error', () => {
      const err = new Error('Something went wrong')
      errorHandler(err, req, res, next)
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Something went wrong'
      })
    })

    it('should handle a RequestError', () => {
      const err = new RequestError(400, 'Request error')
      errorHandler(err, req, res, next)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Request error'
      })
    })
  })
})
