import {
  createTask,
  deleteTask,
  getTask,
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
import { type NextFunction, type Request, type Response } from 'express'
describe('TaskContoller', () => {
  let context: MockContext
  let req: Request
  let res: Response

  const select = {
    id: true,
    createdAt: true,
    notes: true,
    status: true,
    userId: false,
    User: {
      select: { id: true, name: true, lastName: true }
    },
    SubTasks: {
      include: {
        SubTaskEvents: true
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
      context.prisma.task.findMany.mockResolvedValue([
        mockTaskArray[1] as any,
        mockTaskArray[2] as any
      ])
      await getTasks(req, res, context)
      expect(context.prisma.task.findMany).toHaveBeenCalledWith({
        take: 2,
        skip: 1,
        where: {},
        select
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        data: [mockTaskParsedArray[1]],
        nextPage: 3,
        prevPage: 1
      })
    })

    it('should return tasks with user filter', async () => {
      req = mockRequest({ userId: '1' })
      context.prisma.task.findMany.mockResolvedValue(mockTaskArray as any)
      await getTasks(req, res, context)
      expect(context.prisma.task.findMany).toHaveBeenCalledWith({
        take: 11,
        skip: 0,
        where: { userId: 1 },
        select
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should return tasks with status filter', async () => {
      req = mockRequest({ status: 'completed' })
      context.prisma.task.findMany.mockResolvedValue(mockTaskArray as any)
      await getTasks(req, res, context)
      expect(context.prisma.task.findMany).toHaveBeenCalledWith({
        take: 11,
        skip: 0,
        where: { status: 'completed' },
        select
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should return tasks with date filter', async () => {
      req = mockRequest({ startDate: '2023-01-01' })
      context.prisma.task.findMany.mockResolvedValue(mockTaskArray as any)
      await getTasks(req, res, context)
      expect(context.prisma.task.findMany).toHaveBeenCalledWith({
        take: 11,
        skip: 0,
        where: { createdAt: { gte: new Date('2023-01-01') } },
        select
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should throw a 404 if no tasks are found', async () => {
      req = mockRequest()
      context.prisma.task.findMany.mockResolvedValue([])
      await getTasks(req, res, context).catch(err => {
        expect(err).toEqual(new RequestError(404, 'Not found'))
      })
    })
  })

  describe('getTask', () => {
    it('should return a task by ID', async () => {
      req.params = { id: '1' }
      context.prisma.task.findUnique.mockResolvedValue(mockTaskIdividual as any)
      await getTask(req, res, context)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockTaskParsedIdividual)
    })

    it('should throw a 404 if the task is not found', async () => {
      req.params = { id: '1' }
      context.prisma.task.findUnique.mockResolvedValue(null)
      await getTask(req, res, context).catch(err => {
        expect(err).toEqual(new RequestError(404, 'Not found'))
      })
    })
  })

  describe('createTask', () => {
    it('should create a task', async () => {
      req.body = {
        notes: 'test',
        userId: 1,
        subTasks: [
          {
            notes: 'test',
            userId: 1
          }
        ]
      }

      const mockRequest = { ...mockTaskIdividual, subTasks: req.body.subTasks }
      const mockResponse = {
        ...mockTaskParsedIdividual,
        subTasks: req.body.subTasks
      }

      context.prisma.task.create.mockResolvedValue(mockRequest as any)
      await createTask(req, res, context)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(mockResponse)
    })

    it('should throw a 400 if required fields are missing', async () => {
      req.body = {
        notes: 'test',
        userId: 1
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
      context.prisma.subTask.updateMany.mockResolvedValue(
        mockTaskIdividual as any
      )
      context.prisma.task.update.mockResolvedValue(mockTaskIdividual as any)

      await updateTask(req, res, context)

      expect(context.prisma.subTask.updateMany).toHaveBeenCalledWith({
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
        subTasks: [
          {
            quantity: 5,
            notes: 'test',
            productId: 1
          }
        ]
      }
      context.prisma.subTask.deleteMany.mockResolvedValue({} as any)
      context.prisma.task.update.mockResolvedValue(mockTaskIdividual as any)

      await updateTask(req, res, context)

      expect(context.prisma.subTask.deleteMany).toHaveBeenCalledWith({
        where: { taskId: 1 }
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should update task notes and user connection', async () => {
      req.params = { id: '1' }
      req.body = {
        notes: 'new notes',
        userId: 2
      }
      context.prisma.task.update.mockResolvedValue(mockTaskIdividual as any)

      await updateTask(req, res, context)

      expect(context.prisma.task.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          notes: 'new notes',
          User: { connect: { id: 2 } }
        },
        select
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should throw a 400 if no task ID is provided', async () => {
      req.params = {}
      await updateTask(req, res, context).catch(err => {
        expect(err).toEqual(new RequestError(400, 'Task ID is required'))
      })
    })
  })

  describe('deleteTask', () => {
    it('should delete a task by ID', async () => {
      req.params = { id: '1' }
      context.prisma.task.findUnique.mockResolvedValue(mockTaskIdividual as any)
      context.prisma.subTask.deleteMany.mockResolvedValue({} as any)
      context.prisma.task.delete.mockResolvedValue({} as any)

      await deleteTask(req, res, context)

      expect(context.prisma.subTask.deleteMany).toHaveBeenCalledWith({
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
        expect(err).toEqual(new RequestError(400, 'Task ID is required'))
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
