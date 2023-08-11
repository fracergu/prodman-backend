import {
  createUser,
  getUser,
  getUsers,
  updateUser,
  updateUserCredentials
} from '@controllers/users.controller'
import { RequestError } from '@exceptions/RequestError'
import {
  type UserCreationRequest,
  type UserCredentialsRequest,
  type UserResponse,
  type UserUpdateRequest
} from '@models/users.model'
import { type User } from '@prisma/client'
import { createMockContext, type MockContext } from '@utils/context'
import { type NextFunction, type Request, type Response } from 'express'
import bcrypt from 'bcrypt'

describe('UsersController', () => {
  let context: MockContext
  let req: Request
  let res: Response

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

  beforeEach(() => {
    context = createMockContext()
    req = mockRequest()
    res = mockResponse()
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
      const mockUsersArray: UserResponse[] = Array.from(
        { length: 3 },
        (_, i) => ({
          id: i + 1,
          name: 'User' + (i + 1),
          lastName: null,
          email: 'user' + (i + 1) + '@example.com',
          role: 'user',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      )

      req = mockRequest({ limit: '1', page: '2' })
      context.prisma.user.findMany.mockResolvedValue(mockUsersArray as User[])
      await getUsers(req, res, context)
      expect(context.prisma.user.findMany).toHaveBeenCalledWith({
        take: 2,
        skip: 1,
        where: {},
        select: userSelector
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        data: mockUsersArray,
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
      await getUsers(req, res, context)
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
      await getUsers(req, res, context)
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

    it('should throw a 404 if no users are found', async () => {
      context.prisma.user.findMany.mockResolvedValue([])
      await getUsers(req, res, context).catch(err => {
        expect(err).toBeInstanceOf(RequestError)
        expect(err.message).toBe('Not found')
      })
    })

    it('should pass any other error to the error handler', async () => {
      context.prisma.user.findMany.mockRejectedValueOnce(new Error('error'))
      await getUsers(req, res, context).catch(err => {
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toBe('error')
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
      await getUser(req, res, context)
      expect(context.prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: userSelector
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockUser)
    })

    it('should throw a 404 if user is not found', async () => {
      req = { params: { id: '2' } } as any
      context.prisma.user.findUnique.mockResolvedValue(null)
      await getUser(req, res, context).catch(err => {
        expect(err).toBeInstanceOf(RequestError)
        expect(err.message).toBe('Not found')
      })
    })

    it('should pass any other error to the error handler', async () => {
      req = { params: { id: '2' } } as any
      context.prisma.user.findUnique.mockRejectedValueOnce(new Error('error'))
      await getUser(req, res, context).catch(err => {
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toBe('error')
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
      await createUser(req, res, context)
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
      await updateUser(req, res, context)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(updatedUser)
    })

    it('should pass any other error to the error handler', async () => {
      const updateRequest: UserUpdateRequest = {
        name: 'Updated',
        lastName: 'Name',
        role: 'admin',
        active: true
      }
      req = { params: { id: '1' } } as any
      req.body = updateRequest
      context.prisma.user.update.mockRejectedValueOnce(new Error('error'))
      await updateUser(req, res, context).catch(err => {
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toBe('error')
      })
    })
  })

  describe('updateUserCredentials', () => {
    it('should update user email and password', async () => {
      const credentialsRequest: UserCredentialsRequest = {
        currentPassword: 'password',
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

      context.prisma.user.findUnique.mockResolvedValueOnce({
        password: bcrypt.hashSync('password', 8)
      } as User)

      context.prisma.user.update.mockResolvedValueOnce(updatedUser as User)
      await updateUserCredentials(req, res, context)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(updatedUser)
    })

    it('should throw a 404 if user is not found', async () => {
      const credentialsRequest: UserCredentialsRequest = {
        currentPassword: 'password',
        email: 'test@test.com',
        password: 'newpassword'
      }
      req = { params: { id: '1' }, body: credentialsRequest } as any
      context.prisma.user.findUnique.mockResolvedValueOnce(null)
      await updateUserCredentials(req, res, context).catch(err => {
        expect(err).toBeInstanceOf(RequestError)
        expect(err.message).toBe('Not found')
      })
    })

    it('should throw a 401 if current password is invalid', async () => {
      const credentialsRequest: UserCredentialsRequest = {
        currentPassword: 'password',
        email: 'test@test.com',
        password: 'newpassword'
      }
      req = { params: { id: '1' }, body: credentialsRequest } as any
      context.prisma.user.findUnique.mockResolvedValueOnce({
        password: bcrypt.hashSync('invalidpassword', 8)
      } as User)
      await updateUserCredentials(req, res, context).catch(err => {
        expect(err).toBeInstanceOf(RequestError)
        expect(err.message).toBe('Invalid password')
      })
    })

    it('should throw a 400 if neither email nor password is provided', async () => {
      req = {
        params: { id: '1' },
        body: { currentPassword: 'password' }
      } as any
      context.prisma.user.findUnique.mockResolvedValueOnce({
        password: bcrypt.hashSync('password', 8)
      } as User)
      await updateUserCredentials(req, res, context).catch(err => {
        expect(err).toBeInstanceOf(RequestError)
        expect(err.message).toBe('Email or password must be provided')
      })
    })

    it('should pass any other error to the error handler', async () => {
      const credentialsRequest: UserCredentialsRequest = {
        currentPassword: 'password',
        password: 'newpassword',
        email: 'test@test.com'
      }
      req = { params: { id: '1' }, body: credentialsRequest } as any
      context.prisma.user.findUnique.mockResolvedValueOnce({
        password: bcrypt.hashSync('password', 8)
      } as User)
      context.prisma.user.update.mockRejectedValueOnce(new Error('error'))
      await updateUserCredentials(req, res, context).catch(err => {
        expect(err).toBeInstanceOf(Error)
        expect(err.message).toBe('error')
      })
    })
  })
})
