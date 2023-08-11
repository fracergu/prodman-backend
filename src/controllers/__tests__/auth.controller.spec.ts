import { type User } from '@prisma/client'
import { createMockContext, type MockContext } from '@utils/context'
import bcrypt from 'bcrypt'
import { type NextFunction, type Request, type Response } from 'express'

import { login, logout, register } from '../auth.controller'
import { RequestError } from '@exceptions/RequestError'

describe('AuthController', () => {
  let context: MockContext
  let req: Request
  let res: Response

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
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const mockUser: User = {
    id: 1,
    name: 'test',
    lastName: 'test',
    username: 'test1',
    role: 'admin',
    password: bcrypt.hashSync('test', 8),
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  describe('login', () => {
    const base64Credentials = btoa(`${mockUser.username}:test`)

    it('should login a user and set session', async () => {
      req.headers.authorization = `Basic ${base64Credentials}`
      req.body = { rememberMe: true }
      context.prisma.user.findUnique.mockResolvedValueOnce(mockUser)
      await login(req, res, context)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(req.session.user).toEqual(mockUser.id)
    })

    describe('user is admin', () => {
      it('should set session cookie maxAge to 30 days if rememberMe is true', async () => {
        req.headers.authorization = `Basic ${base64Credentials}`
        req.body = { rememberMe: true }
        context.prisma.user.findUnique.mockResolvedValueOnce(mockUser)
        await login(req, res, context)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(req.session.cookie.maxAge).toEqual(1000 * 60 * 60 * 24 * 30)
        expect(req.session.user).toEqual(mockUser.id)
      })

      it('should set session cookie maxAge to 1 day if rememberMe is false', async () => {
        req.headers.authorization = `Basic ${base64Credentials}`
        req.body = { rememberMe: false }
        context.prisma.user.findUnique.mockResolvedValueOnce(mockUser)
        await login(req, res, context)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(req.session.cookie.maxAge).toEqual(1000 * 60 * 60 * 24)
        expect(req.session.user).toEqual(mockUser.id)
      })
    })

    describe('user is not admin', () => {
      const user: User = {
        ...mockUser,
        role: 'user'
      }

      it('should set session cookie maxAge to 1 minute', async () => {
        req.headers.authorization = `Basic ${base64Credentials}`
        req.body = { rememberMe: true }
        context.prisma.user.findUnique.mockResolvedValueOnce(user)
        await login(req, res, context)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(req.session.cookie.maxAge).toEqual(1000 * 60)
        expect(req.session.user).toEqual(user.id)
      })
    })

    it('should throw a 400 if authorization header is missing', async () => {
      await login(req, res, context).catch(err => {
        expect(err).toBeInstanceOf(RequestError)
        expect(err.statusCode).toEqual(400)
        expect(err.message).toEqual('Missing or invalid authorization header')
      })
    })

    it('should throw a 400 if authorization header is invalid', async () => {
      req.headers.authorization = `Basic ${btoa('invalid')}`
      await login(req, res, context).catch(err => {
        expect(err).toBeInstanceOf(RequestError)
        expect(err.statusCode).toEqual(400)
        expect(err.message).toEqual('Missing or invalid authorization header')
      })
    })

    it('should throw a 401 if user is not found', async () => {
      req.headers.authorization = `Basic ${base64Credentials}`
      req.body = { rememberMe: true }
      context.prisma.user.findUnique.mockResolvedValueOnce(null)
      await login(req, res, context).catch(err => {
        expect(err).toBeInstanceOf(RequestError)
        expect(err.statusCode).toEqual(401)
        expect(err.message).toEqual('Invalid credentials')
      })
    })

    it('should throw a 401 if password is incorrect', async () => {
      const wrongBase64Credentials = btoa(`${mockUser.username}:wrongPassword`)
      req.headers.authorization = `Basic ${wrongBase64Credentials}`
      req.body = { rememberMe: true }
      context.prisma.user.findUnique.mockResolvedValueOnce(mockUser)
      await login(req, res, context).catch(err => {
        expect(err).toBeInstanceOf(RequestError)
        expect(err.statusCode).toEqual(401)
        expect(err.message).toEqual('Invalid credentials')
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
        username: 'test1',
        password: 'test'
      }

      await register(req, res, context)

      expect(context.prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'test',
          lastName: 'test',
          username: 'test1',
          password: expect.any(String),
          role: 'admin'
        }
      })

      expect(res.status).toHaveBeenCalledWith(201)
    })

    it('should throw a 403 if register is disabled', async () => {
      context.prisma.config.findUnique.mockResolvedValueOnce({
        key: 'registerEnabled',
        type: 'boolean',
        value: 'false'
      })
      await register(req, res, context).catch(err => {
        expect(err).toBeInstanceOf(RequestError)
        expect(err.statusCode).toEqual(403)
        expect(err.message).toEqual('Forbidden')
      })
    })
  })

  describe('logout', () => {
    it('should logout a user', async () => {
      req.session.user = mockUser.id
      jest.spyOn(req.session, 'destroy')
      jest.spyOn(res, 'clearCookie')
      jest.spyOn(res, 'status')
      await logout(req, res)
      expect(req.session.destroy).toHaveBeenCalled()
      expect(res.clearCookie).toHaveBeenCalledWith('sid')
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })
})
