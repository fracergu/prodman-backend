import { RequiredFieldsError } from '@exceptions/RequiredFieldsError'
import { type User } from '@prisma/client'
import { createMockContext, type MockContext } from '@utils/context'
import bcrypt from 'bcrypt'
import { type NextFunction, type Request, type Response } from 'express'

import { login, logout, register } from '../auth.controller'

describe('AuthController', () => {
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
      status: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis()
    }
    return res as Response
  }

  const mockNext = () => {
    return jest.fn() as NextFunction
  }

  beforeEach(() => {
    context = createMockContext()
    req = mockRequest({
      session: {
        cookie: {},
        destroy: jest.fn(callback => callback())
      } as any
    })
    res = mockResponse()
    next = mockNext()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const mockUser: User = {
    id: 1,
    name: 'test',
    lastName: 'test',
    email: 'test@test.com',
    role: 'ADMIN',
    password: bcrypt.hashSync('test', 8)
  }

  describe('login', () => {
    it('should login a user and set session', async () => {
      req.body = {
        email: mockUser.email,
        password: 'test',
        rememberMe: true
      }
      context.prisma.user.findUnique.mockResolvedValueOnce(mockUser)
      await login(req, res, next, context)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(req.session.user).toEqual(mockUser)
    })

    it('should set session cookie maxAge to 30 days if rememberMe is true', async () => {
      req.body = {
        email: mockUser.email,
        password: 'test',
        rememberMe: true
      }
      context.prisma.user.findUnique.mockResolvedValueOnce(mockUser)
      await login(req, res, next, context)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(req.session.cookie.maxAge).toEqual(1000 * 60 * 60 * 24 * 30)
      expect(req.session.user).toEqual(mockUser)
    })

    it('should return 401 if user is not found', async () => {
      req.body = {
        email: mockUser.email,
        password: 'test',
        rememberMe: true
      }
      context.prisma.user.findUnique.mockResolvedValueOnce(null)
      await login(req, res, next, context)
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid credentials'
      })
    })

    it('should return 401 if password is incorrect', async () => {
      req.body = {
        email: mockUser.email,
        password: 'wrongPassword',
        rememberMe: true
      }
      context.prisma.user.findUnique.mockResolvedValueOnce(mockUser)
      await login(req, res, next, context)
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid credentials'
      })
    })

    it('should pass missing field error to next middleware', async () => {
      req.body = {
        password: 'test'
      }

      await login(req, res, next, context)
      expect(next).toHaveBeenCalledWith(expect.any(RequiredFieldsError))
    })
  })

  describe('register', () => {
    it('should return 403 if there is already a user in the database', async () => {
      context.prisma.user.findMany.mockResolvedValueOnce([mockUser])
      req.body = {
        name: 'test',
        lastName: 'test',
        email: 'test@test.com',
        password: 'test'
      }
      await register(req, res, next, context)
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Forbidden'
      })
    })

    it('should create a new user', async () => {
      context.prisma.user.findMany.mockResolvedValueOnce([])
      req.body = {
        name: 'test',
        lastName: 'test',
        email: 'test@test.com',
        password: 'test'
      }

      await register(req, res, next, context)

      expect(context.prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'test',
          lastName: 'test',
          email: 'test@test.com',
          password: expect.any(String),
          role: 'ADMIN'
        }
      })

      expect(res.status).toHaveBeenCalledWith(201)
    })

    it('should pass missing field error to next middleware', async () => {
      req.body = {
        name: 'test',
        lastName: 'test',
        password: 'test'
      }

      context.prisma.user.findMany.mockResolvedValueOnce([])

      await register(req, res, next, context)
      expect(next).toHaveBeenCalledWith(expect.any(RequiredFieldsError))
    })
  })

  describe('logout', () => {
    it('should logout a user', async () => {
      req.session.user = mockUser
      jest.spyOn(req.session, 'destroy')
      jest.spyOn(res, 'clearCookie')
      jest.spyOn(res, 'status')
      await logout(req, res, next, context)
      expect(req.session.destroy).toHaveBeenCalled()
      expect(res.clearCookie).toHaveBeenCalledWith('sid')
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should pass error to next middleware', async () => {
      req.session.user = mockUser
      jest.spyOn(req.session, 'destroy').mockImplementationOnce(() => {
        throw new Error()
      })
      await logout(req, res, next, context)
      expect(next).toHaveBeenCalledWith(expect.any(Error))
    })
  })
})
