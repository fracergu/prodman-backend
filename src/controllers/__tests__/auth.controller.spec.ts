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
      send: jest.fn().mockReturnThis(),
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
      } as any,
      headers: {}
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
    const base64Credentials = btoa(`${mockUser.email}:test`)

    it('should login a user and set session', async () => {
      req.headers.authorization = `Basic ${base64Credentials}`
      req.body = { rememberMe: true }
      context.prisma.user.findUnique.mockResolvedValueOnce(mockUser)
      await login(req, res, next, context)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(req.session.user).toEqual(mockUser.id)
    })

    describe('user is admin', () => {
      it('should set session cookie maxAge to 30 days if rememberMe is true', async () => {
        req.headers.authorization = `Basic ${base64Credentials}`
        req.body = { rememberMe: true }
        context.prisma.user.findUnique.mockResolvedValueOnce(mockUser)
        await login(req, res, next, context)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(req.session.cookie.maxAge).toEqual(1000 * 60 * 60 * 24 * 30)
        expect(req.session.user).toEqual(mockUser.id)
      })

      it('should set session cookie maxAge to 1 day if rememberMe is false', async () => {
        req.headers.authorization = `Basic ${base64Credentials}`
        req.body = { rememberMe: false }
        context.prisma.user.findUnique.mockResolvedValueOnce(mockUser)
        await login(req, res, next, context)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(req.session.cookie.maxAge).toEqual(1000 * 60 * 60 * 24)
        expect(req.session.user).toEqual(mockUser.id)
      })
    })

    describe('user is not admin', () => {
      const user: User = {
        ...mockUser,
        role: 'USER'
      }

      it('should set session cookie maxAge to 1 minute', async () => {
        req.headers.authorization = `Basic ${base64Credentials}`
        req.body = { rememberMe: true }
        context.prisma.user.findUnique.mockResolvedValueOnce(user)
        await login(req, res, next, context)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(req.session.cookie.maxAge).toEqual(1000 * 60)
        expect(req.session.user).toEqual(user.id)
      })
    })

    it('should return 401 if authorization header is missing', async () => {
      await login(req, res, next, context)
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Missing or invalid authorization header'
      })
    })

    it('should return 401 if authorization header is invalid', async () => {
      req.headers.authorization = `Basic ${btoa('invalid')}`
      await login(req, res, next, context)
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Missing or invalid authorization header'
      })
    })

    it('should return 401 if user is not found', async () => {
      req.headers.authorization = `Basic ${base64Credentials}`
      req.body = { rememberMe: true }
      context.prisma.user.findUnique.mockResolvedValueOnce(null)
      await login(req, res, next, context)
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid credentials'
      })
    })

    it('should return 401 if password is incorrect', async () => {
      const wrongBase64Credentials = btoa(`${mockUser.email}:wrongPassword`)
      req.headers.authorization = `Basic ${wrongBase64Credentials}`
      req.body = { rememberMe: true }
      context.prisma.user.findUnique.mockResolvedValueOnce(mockUser)
      await login(req, res, next, context)
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid credentials'
      })
    })
  })

  describe('register', () => {
    it('should create a new user', async () => {
      context.prisma.config.findUnique.mockResolvedValueOnce({
        key: 'registerEnabled',
        type: 'boolean',
        value: 'true'
      })
      context.prisma.user.findMany.mockResolvedValueOnce([])
      context.prisma.user.create.mockResolvedValueOnce(mockUser)
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

    it('should return 403 if register is disabled', async () => {
      context.prisma.config.findUnique.mockResolvedValueOnce({
        key: 'registerEnabled',
        type: 'boolean',
        value: 'false'
      })
      await register(req, res, next, context)
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Forbidden'
      })
    })
  })

  describe('logout', () => {
    it('should logout a user', async () => {
      req.session.user = mockUser.id
      jest.spyOn(req.session, 'destroy')
      jest.spyOn(res, 'clearCookie')
      jest.spyOn(res, 'status')
      await logout(req, res, next, context)
      expect(req.session.destroy).toHaveBeenCalled()
      expect(res.clearCookie).toHaveBeenCalledWith('sid')
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })
})
