import {
  createUser,
  getUser,
  getUsers,
  updateUser,
  updateUserCredentials
} from '@controllers/users.controller'
import {
  type UserCreationRequest,
  type UserCredentialsRequest,
  type UserResponse,
  type UserUpdateRequest
} from '@models/users.model'
import { type User } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { createMockContext, type MockContext } from '@utils/context'
import { type NextFunction, type Request, type Response } from 'express'

describe('UsersController', () => {
  let context: MockContext
  let req: Request
  let res: Response
  let next: NextFunction

  const mockRequest = (query: Partial<Request['query']> = {}) => {
    return { query } as any
  }

  const mockResponse = () => {
    const res: Partial<Response> = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
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

  const userSelector = {
    id: true,
    name: true,
    lastName: true,
    email: true,
    role: true,
    createdAt: true,
    active: true,
    updatedAt: true,
    password: false
  }

  describe('getUsers', () => {
    it('should return users with default pagination', async () => {
      const mockUsers: UserResponse[] = [
        {
          id: 1,
          name: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          role: 'user',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          name: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@example.com',
          role: 'user',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 3,
          name: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          role: 'admin',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      req = mockRequest({ limit: '1', page: '2' })
      context.prisma.user.findMany.mockResolvedValue(mockUsers as User[])
      await getUsers(req, res, next, context)
      expect(context.prisma.user.findMany).toHaveBeenCalledWith({
        take: 2,
        skip: 1,
        where: {},
        select: userSelector
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        data: mockUsers,
        nextPage: 3,
        prevPage: 1
      })
    })
    it('should return users by name search', async () => {
      const mockUsers: UserResponse[] = [
        {
          id: 2,
          name: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@example.com',
          role: 'user',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      req = mockRequest({ search: 'Jane' })
      context.prisma.user.findMany.mockResolvedValue(mockUsers as User[])
      await getUsers(req, res, next, context)
      expect(context.prisma.user.findMany).toHaveBeenCalledWith({
        take: 11,
        skip: 0,
        where: { name: { contains: 'Jane' } },
        select: userSelector
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        data: mockUsers,
        nextPage: null,
        prevPage: null
      })
    })

    it('should return users filtered by role', async () => {
      const mockUsers: UserResponse[] = [
        {
          id: 3,
          name: 'Admin',
          lastName: 'User',
          email: 'admin.user@example.com',
          role: 'admin',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
      req = mockRequest({ role: 'admin' })
      context.prisma.user.findMany.mockResolvedValue(mockUsers as User[])
      await getUsers(req, res, next, context)
      expect(context.prisma.user.findMany).toHaveBeenCalledWith({
        take: 11,
        skip: 0,
        where: { role: 'admin' },
        select: userSelector
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        data: mockUsers,
        nextPage: null,
        prevPage: null
      })
    })

    it('should return users with specified pagination', async () => {
      req = mockRequest({ limit: '5', page: '2' })
      await getUsers(req, res, next, context)
      expect(context.prisma.user.findMany).toHaveBeenCalledWith({
        take: 6,
        skip: 5,
        where: {},
        select: userSelector
      })
    })

    it('should return 404 if no users are found', async () => {
      context.prisma.user.findMany.mockResolvedValue([])
      await getUsers(req, res, next, context)
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Not found'
      })
    })
  })

  describe('getUser', () => {
    it('should return a user by ID', async () => {
      const mockUser: UserResponse = {
        id: 1,
        name: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'user',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      req = { params: { id: '1' } } as any
      context.prisma.user.findUnique.mockResolvedValue(mockUser as User)
      await getUser(req, res, next, context)
      expect(context.prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: userSelector
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockUser)
    })

    it('should return 404 if user is not found', async () => {
      req = { params: { id: '2' } } as any
      context.prisma.user.findUnique.mockResolvedValue(null)
      await getUser(req, res, next, context)
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Not found'
      })
    })
  })

  describe('createUser', () => {
    it('should create a user', async () => {
      const mockRequestData: UserCreationRequest = {
        name: 'Jane',
        email: 'jane.doe@example.com',
        password: 'password',
        role: 'user'
      }
      const mockUser: UserResponse = {
        ...mockRequestData,
        id: 3,
        lastName: null,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      req.body = mockRequestData
      context.prisma.user.create.mockResolvedValue(mockUser as User)
      await createUser(req, res, next, context)
      expect(context.prisma.user.create).toHaveBeenCalledWith({
        data: {
          ...mockRequestData,
          password: expect.any(String) // La contraseña debería estar hasheada
        },
        select: userSelector
      })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(mockUser)
    })
  })

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updateRequest: UserUpdateRequest = {
        name: 'Updated',
        lastName: 'Name',
        role: 'admin',
        active: true
      }
      const updatedUser: UserResponse = {
        id: 1,
        name: 'Updated',
        lastName: 'Name',
        email: 'john.doe@example.com',
        role: 'admin',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      req = { params: { id: '1' } } as any
      req.body = updateRequest
      context.prisma.user.update.mockResolvedValueOnce(updatedUser as User)
      await updateUser(req, res, next, context)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(updatedUser)
    })

    it('should return 404 if user is not found', async () => {
      req = { params: { id: '2' }, body: {} } as any
      context.prisma.user.update.mockRejectedValueOnce(
        new PrismaClientKnownRequestError('message', {
          code: 'P2025',
          clientVersion: '1'
        })
      )
      await updateUser(req, res, next, context)
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Not found'
      })
    })
  })

  describe('updateUserCredentials', () => {
    it('should update user email and password', async () => {
      const credentialsRequest: UserCredentialsRequest = {
        email: 'updated@example.com',
        password: 'newpassword'
      }
      const updatedUser: UserResponse = {
        id: 1,
        name: 'John',
        lastName: 'Doe',
        email: 'updated@example.com',
        role: 'user',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      req = { params: { id: '1' }, body: credentialsRequest } as any
      context.prisma.user.update.mockResolvedValue(updatedUser as User)
      await updateUserCredentials(req, res, next, context)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(updatedUser)
    })

    it('should return 400 if neither email nor password is provided', async () => {
      req = { params: { id: '1' }, body: {} } as any
      await updateUserCredentials(req, res, next, context)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Email or password must be provided'
      })
    })

    it('should return 404 if user is not found', async () => {
      req = {
        params: { id: '2' },
        body: {
          email: 'newemail@example.com'
        }
      } as any
      context.prisma.user.update.mockRejectedValueOnce(
        new PrismaClientKnownRequestError('message', {
          code: 'P2025',
          clientVersion: '1'
        })
      )
      await updateUserCredentials(req, res, next, context)
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Not found'
      })
    })
  })
})
