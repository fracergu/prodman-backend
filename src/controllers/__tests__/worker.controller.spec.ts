import { createMockContext, type MockContext } from '@utils/context'
import { type Request, type Response } from 'express'
import {
  completeSubtask,
  getActiveWorkers,
  getTask
} from '../worker.controller'
import { mockTaskIdividual } from '@mocks/tasks.mock'
import { mock } from 'node:test'
import { Subtask } from '@prisma/client'

describe('TaskController', () => {
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
      send: jest.fn().mockReturnThis()
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

  describe('getTask', () => {
    const singleSubtaskQuery = {
      select: {
        createdAt: true,
        id: true,
        notes: true,
        status: true,
        subtasks: {
          orderBy: {
            order: 'asc'
          },
          select: {
            id: true,
            order: true,
            product: {
              select: {
                id: true,
                name: true
              }
            },
            quantity: true,
            status: true,
            subtaskEvents: true
          },
          take: 1,
          where: {
            status: 'pending'
          }
        },
        updatedAt: true,
        userId: true
      },
      where: {
        status: 'pending',
        subtasks: {
          some: {
            status: 'pending'
          }
        },
        userId: undefined
      }
    }

    const allSubtasksQuery = {
      select: {
        createdAt: true,
        id: true,
        notes: true,
        status: true,
        subtasks: {
          orderBy: {
            order: 'asc'
          },
          select: {
            id: true,
            order: true,
            product: {
              select: {
                id: true,
                name: true
              }
            },
            quantity: true,
            status: true,
            subtaskEvents: true
          },
          where: {
            status: 'pending'
          }
        },
        updatedAt: true,
        userId: true
      },
      where: {
        status: 'pending',
        subtasks: {
          some: {
            status: 'pending'
          }
        },
        userId: undefined
      }
    }

    it('should return 400 if config key is not found', async () => {
      context.prisma.appConfig.findUnique.mockResolvedValueOnce(null)

      await getTask(req, res, context)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: "Config key 'workerGetNextSubtask' not found."
      })
    })

    it('should return task with single pending subtask if workerGetNextSubtask is true', async () => {
      context.prisma.appConfig.findUnique.mockResolvedValueOnce({
        key: 'workerGetNextSubtask',
        type: 'boolean',
        value: 'true'
      })
      await getTask(req, res, context)
      expect(context.prisma.task.findFirst).toHaveBeenCalledWith(
        singleSubtaskQuery
      )
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should return task with all pending subtasks if workerGetNextSubtask is false', async () => {
      context.prisma.appConfig.findUnique.mockResolvedValueOnce({
        key: 'workerGetNextSubtask',
        type: 'boolean',
        value: 'false'
      })
      await getTask(req, res, context)
      expect(context.prisma.task.findFirst).toHaveBeenCalledWith(
        allSubtasksQuery
      )
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })

  describe('getActiveWorkers', () => {
    it('should return 200', async () => {
      await getActiveWorkers(req, res, context)
      expect(context.prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          role: 'user',
          active: true
        },
        select: {
          id: true,
          username: true,
          name: true,
          lastName: true
        }
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })

  describe('completeSubtask', () => {
    const subtaskMock = {
      id: 20,
      quantity: 5,
      order: 1,
      status: 'pending',
      taskId: 3,
      productId: 9,
      subtaskEvents: [],
      task: {
        id: 3,
        createdAt: '2023-08-28T13:48:51.195Z',
        updatedAt: '2023-08-28T13:48:51.195Z',
        notes: 'Task 3 notes',
        status: 'pending',
        userId: 8
      },
      product: {
        id: 9,
        name: 'Product 6',
        description: 'Product 6 description',
        price: 549,
        image: null,
        reference: 'REF-00006',
        createdAt: '2023-08-28T13:48:51.142Z',
        updatedAt: '2023-08-28T13:48:51.142Z',
        active: true,
        productComponents: [{ quantity: 1, childId: 1 }]
      }
    }

    it('should return 404 if subtask is not found', async () => {
      req.session = { user: 8 } as any
      req.params = { subtaskId: 'invalid-subtask-id' } as any
      req.body = {
        quantityCompleted: 1
      }
      context.prisma.subtask.findUnique.mockResolvedValueOnce(null)
      await completeSubtask(req, res, context)
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Subtask not found.'
      })
    })

    it('should update partially a subtask', async () => {
      req.session = { user: 8 } as any
      req.params = { subtaskId: '20' } as any
      req.body = {
        quantityCompleted: 1
      }

      context.prisma.subtask.findUnique.mockResolvedValueOnce(subtaskMock)
      await completeSubtask(req, res, context)
      // Should create subtaskEvent
      expect(context.prisma.subtaskEvent.create).toHaveBeenCalledWith({
        data: {
          quantityCompleted: 1,
          subtaskId: 20
        }
      })
      // Should update stock for main product
      expect(context.prisma.stockMovement.create).toHaveBeenCalledWith({
        data: {
          quantity: 1,
          reason: 'Subtask completion',
          userId: 8,
          productId: 9
        }
      })
      // Should update stock for product component
      expect(context.prisma.stockMovement.create).toHaveBeenCalledWith({
        data: {
          quantity: -1,
          reason: 'Used in subtask completion',
          userId: 8,
          productId: 1
        }
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should update completely a subtask', async () => {
      req.session = { user: 8 } as any
      req.params = { subtaskId: '20' } as any
      req.body = {
        quantityCompleted: 5
      }

      context.prisma.subtask.findUnique.mockResolvedValueOnce(subtaskMock)
      context.prisma.subtask.findMany.mockResolvedValueOnce([
        {
          ...subtaskMock,
          id: 21,
          quantity: 5,
          order: 2,
          status: 'pending'
        },
        {
          ...subtaskMock,
          status: 'completed'
        }
      ])

      await completeSubtask(req, res, context)
      expect(context.prisma.subtaskEvent.create).toHaveBeenCalledWith({
        data: {
          quantityCompleted: 5,
          subtaskId: 20
        }
      })
      expect(context.prisma.stockMovement.create).toHaveBeenCalledWith({
        data: {
          quantity: 5,
          reason: 'Subtask completion',
          userId: 8,
          productId: 9
        }
      })
      expect(context.prisma.stockMovement.create).toHaveBeenCalledWith({
        data: {
          quantity: -5,
          reason: 'Used in subtask completion',
          userId: 8,
          productId: 1
        }
      })

      expect(context.prisma.subtask.update).toHaveBeenCalledWith({
        where: {
          id: 20
        },
        data: {
          status: 'completed'
        }
      })

      expect(res.status).toHaveBeenCalledWith(200)
    })
    it('should update completely a task', async () => {
      req.session = { user: 8 } as any
      req.params = { subtaskId: '20' } as any
      req.body = {
        quantityCompleted: 5
      }

      context.prisma.subtask.findUnique.mockResolvedValueOnce(subtaskMock)
      context.prisma.subtask.findMany.mockResolvedValueOnce([
        {
          ...subtaskMock,
          id: 21,
          quantity: 5,
          order: 2,
          status: 'completed'
        },
        {
          ...subtaskMock,
          status: 'completed'
        }
      ])

      await completeSubtask(req, res, context)
      expect(context.prisma.subtaskEvent.create).toHaveBeenCalledWith({
        data: {
          quantityCompleted: 5,
          subtaskId: 20
        }
      })
      expect(context.prisma.stockMovement.create).toHaveBeenCalledWith({
        data: {
          quantity: 5,
          reason: 'Subtask completion',
          userId: 8,
          productId: 9
        }
      })
      expect(context.prisma.stockMovement.create).toHaveBeenCalledWith({
        data: {
          quantity: -5,
          reason: 'Used in subtask completion',
          userId: 8,
          productId: 1
        }
      })

      expect(context.prisma.subtask.update).toHaveBeenCalledWith({
        where: {
          id: 20
        },
        data: {
          status: 'completed'
        }
      })

      expect(context.prisma.task.update).toHaveBeenCalledWith({
        where: {
          id: 3
        },
        data: {
          status: 'completed'
        }
      })

      expect(res.status).toHaveBeenCalledWith(200)
    })
  })
})
