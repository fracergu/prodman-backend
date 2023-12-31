import { type User } from '@prisma/client'
import { createMockContext, type MockContext } from '@utils/context'
import { type NextFunction, type Request, type Response } from 'express'

import { requireAdminRole, requireSession } from '../auth.middleware'
import { RequestError } from '@exceptions/RequestError'

describe('requireAdminRole Middleware', () => {
  let context: MockContext
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
    context = createMockContext()
    req = mockRequest()
    res = mockResponse()
    next = mockNext()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('requireAdminRole', () => {
    it('should call next if user is admin', async () => {
      req.session = { user: 'valid-user-id' } as any
      context.prisma.user.findUnique.mockResolvedValue({
        role: 'admin'
      } as User)
      await requireAdminRole(req, res, context, next)
      expect(next).toHaveBeenCalled()
    })

    it('should return 440 if user is not authenticated', async () => {
      await requireAdminRole(req, res, context, next).catch(err => {
        expect(err).toBeInstanceOf(RequestError)
        expect(err.statusCode).toEqual(440)
        expect(err.message).toEqual('Login timeout')
      })
    })

    it('should return 403 if user role is not admin', async () => {
      req.session = { user: 'valid-user-id' } as any
      context.prisma.user.findUnique.mockResolvedValue({ role: 'user' } as User)
      await requireAdminRole(req, res, context, next)
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Forbidden'
      })
    })
  })

  describe('requireSession', () => {
    it('should call next if user is authenticated', async () => {
      req.session = { user: 'valid-user-id' } as any
      await requireSession(req, res, context, next)
      expect(next).toHaveBeenCalled()
    })

    it('should return 440 if user is not authenticated', async () => {
      await requireSession(req, res, context, next).catch(err => {
        expect(err).toBeInstanceOf(RequestError)
        expect(err.statusCode).toEqual(440)
        expect(err.message).toEqual('Login timeout')
      })
    })
  })
})
