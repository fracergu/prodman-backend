import {
  createTask,
  deleteTask,
  getTasks,
  updateTask
} from '@controllers/tasks.controller'
import { RequestError } from '@exceptions/RequestError'
import {
  mockTaskArray,
  mockTaskIdividual,
  mockTaskParsedArray,
  mockTaskParsedIdividual
} from '@mocks/tasks.mock'
import { createMockContext, type MockContext } from '@utils/context'
import { type Request, type Response } from 'express'
describe('TaskContoller', () => {
  let context: MockContext
  let req: Request
  let res: Response

  const querySelect = {
    id: true,
    createdAt: true,
    updatedAt: true,
    notes: true,
    status: true,
    userId: false,
    user: {
      select: { id: true, name: true, lastName: true }
    },
    subtasks: {
      select: {
        id: true,
        order: true,
        quantity: true,
        status: true,
        productId: false,
        taskId: false,
        product: {
          select: {
            id: true,
            name: true
          }
        },
        subtaskEvents: true
      }
    }
  }

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

  describe('getTasks', () => {
    it('should return tasks with default pagination', async () => {
      req = mockRequest({ limit: '1', page: '2' })
      context.prisma.$transaction.mockResolvedValue([
        2,
        [mockTaskArray[1] as any, mockTaskArray[2] as any]
      ])
      await getTasks(req, res, context)
      expect(context.prisma.task.findMany).toHaveBeenCalledWith({
        take: 2,
        skip: 1,
        where: {},
        select: querySelect
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        data: [mockTaskParsedArray[1]],
        total: 2,
        nextPage: 3,
        prevPage: 1
      })
    })

    it('should return tasks with user filter', async () => {
      req = mockRequest({ userId: '1' })

      context.prisma.$transaction.mockResolvedValue([
        mockTaskArray.length,
        mockTaskArray as any
      ])

      await getTasks(req, res, context)
      expect(context.prisma.task.findMany).toHaveBeenCalledWith({
        take: 11,
        skip: 0,
        where: { userId: 1 },
        select: querySelect
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should return tasks with status filter', async () => {
      req = mockRequest({ status: 'completed' })
      context.prisma.$transaction.mockResolvedValue([
        mockTaskArray.length,
        mockTaskArray as any
      ])
      await getTasks(req, res, context)
      expect(context.prisma.task.findMany).toHaveBeenCalledWith({
        take: 11,
        skip: 0,
        where: { status: 'completed' },
        select: querySelect
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should return tasks with date filter', async () => {
      req = mockRequest({ startDate: '2023-01-01' })
      context.prisma.$transaction.mockResolvedValue([
        mockTaskArray.length,
        mockTaskArray as any
      ])
      await getTasks(req, res, context)
      expect(context.prisma.task.findMany).toHaveBeenCalledWith({
        take: 11,
        skip: 0,
        where: { createdAt: { gte: new Date('2023-01-01') } },
        select: querySelect
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })

  describe('createTask', () => {
    it('should create a task', async () => {
      req.body = {
        notes: 'test',
        userId: 1,
        subtasks: [
          {
            notes: 'test',
            userId: 1
          }
        ]
      }

      const mockRequest = { ...mockTaskIdividual }
      const mockResponse = {
        ...mockTaskParsedIdividual
      }

      context.prisma.task.create.mockResolvedValue(mockRequest as any)
      await createTask(req, res, context)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(mockResponse)
    })

    it('should throw a 400 if required fields are missing', async () => {
      req.body = {
        notes: 'test'
      }
      await createTask(req, res, context).catch(err => {
        expect(err).toEqual(new RequestError(400, 'Missing required fields'))
      })
    })
  })

  describe('updateTask', () => {
    it('should update a task by ID and status', async () => {
      req.params = { id: '1' }
      req.body = {
        status: 'completed'
      }
      context.prisma.subtask.updateMany.mockResolvedValue(
        mockTaskIdividual as any
      )
      context.prisma.task.update.mockResolvedValue(mockTaskIdividual as any)

      await updateTask(req, res, context)

      expect(context.prisma.subtask.updateMany).toHaveBeenCalledWith({
        where: { taskId: 1 },
        data: { status: 'completed' }
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        ...mockTaskParsedIdividual
      })
    })

    it('should update subTasks array and delete previous ones if needed', async () => {
      req.params = { id: '1' }
      req.body = {
        subtasks: [
          {
            quantity: 5,
            productId: 1
          }
        ]
      }
      context.prisma.subtask.deleteMany.mockResolvedValue({} as any)
      context.prisma.task.update.mockResolvedValue(mockTaskIdividual as any)

      await updateTask(req, res, context)

      expect(context.prisma.subtask.deleteMany).toHaveBeenCalledWith({
        where: { taskId: 1 }
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should update task notes and user connection', async () => {
      req.params = { id: '1' }
      req.body = {
        userId: 2
      }
      context.prisma.task.update.mockResolvedValue(mockTaskIdividual as any)

      await updateTask(req, res, context)

      expect(context.prisma.task.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          user: { connect: { id: 2 } }
        },
        select: querySelect
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should throw a 400 if no task ID is provided', async () => {
      req.params = {}
      await updateTask(req, res, context).catch(err => {
        expect(err).toEqual(new RequestError(400, 'Invalid task ID'))
      })
    })
  })

  describe('deleteTask', () => {
    it('should delete a task by ID', async () => {
      req.params = { id: '1' }
      context.prisma.task.findUnique.mockResolvedValue(mockTaskIdividual as any)
      context.prisma.subtask.deleteMany.mockResolvedValue({} as any)
      context.prisma.task.delete.mockResolvedValue({} as any)

      await deleteTask(req, res, context)

      expect(context.prisma.subtask.deleteMany).toHaveBeenCalledWith({
        where: { taskId: 1 }
      })
      expect(context.prisma.task.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      })
      expect(res.status).toHaveBeenCalledWith(204)
      expect(res.send).toHaveBeenCalled()
    })

    it('should throw a 400 if no task ID is provided', async () => {
      req.params = {}
      await deleteTask(req, res, context).catch(err => {
        expect(err).toEqual(new RequestError(400, 'Invalid task ID'))
      })
    })

    it('should throw a 404 if the task is not found', async () => {
      req.params = { id: '999' }
      context.prisma.task.findUnique.mockResolvedValue(null)
      await deleteTask(req, res, context).catch(err => {
        expect(err).toEqual(new RequestError(404, 'Task not found'))
      })
    })
  })
})
