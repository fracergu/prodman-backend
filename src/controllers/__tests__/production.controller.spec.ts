import {
  getProductionReport,
  getSubtaskEvents
} from '@controllers/production.controller'
import { productionDataArrayMock } from '@mocks/production.mock'
import { SubtaskEvent } from '@prisma/client'
import { createMockContext, type MockContext } from '@utils/context'
import { type Request, type Response } from 'express'

describe('SubtaskEventController', () => {
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

  describe('getSubtaskEvents', () => {
    it('should return subtask events with default pagination', async () => {
      req = mockRequest({ limit: '5', page: '2' })
      context.prisma.$transaction.mockResolvedValue([
        10,
        [
          productionDataArrayMock[5],
          productionDataArrayMock[6],
          productionDataArrayMock[7],
          productionDataArrayMock[8],
          productionDataArrayMock[9],
          productionDataArrayMock[10]
        ]
      ])

      await getSubtaskEvents(req, res, context)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        data: productionDataArrayMock.slice(5, 10),
        total: 10,
        nextPage: 3,
        prevPage: 1
      })
    })

    it('should return subtask events with user filter', async () => {
      req = mockRequest({ userId: '1' })
      context.prisma.$transaction.mockResolvedValue([
        productionDataArrayMock.length,
        productionDataArrayMock
      ])

      await getSubtaskEvents(req, res, context)
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should return subtask events with date filter', async () => {
      req = mockRequest({ startDate: '2023-01-01', endDate: '2023-01-31' })
      context.prisma.$transaction.mockResolvedValue([
        productionDataArrayMock.length,
        productionDataArrayMock
      ])

      await getSubtaskEvents(req, res, context)
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })

  describe('getProductionReport', () => {
    it('should return production report with all fields populated', async () => {
      req = mockRequest({
        userId: '1',
        startDate: '2023-01-01',
        endDate: '2023-01-31',
        productId: '1'
      })
      context.prisma.subtaskEvent.findMany.mockResolvedValue(
        productionDataArrayMock as any
      )

      await getProductionReport(req, res, context)

      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should return production report filtered by userId', async () => {
      req = mockRequest({ userId: '1' })
      context.prisma.subtaskEvent.findMany.mockResolvedValue(
        productionDataArrayMock as any
      )

      await getProductionReport(req, res, context)

      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should return production report filtered by date range', async () => {
      req = mockRequest({ startDate: '2023-01-01', endDate: '2023-01-31' })
      context.prisma.subtaskEvent.findMany.mockResolvedValue(
        productionDataArrayMock as any
      )

      await getProductionReport(req, res, context)

      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should return production report filtered by productId', async () => {
      req = mockRequest({ productId: '1' })
      context.prisma.subtaskEvent.findMany.mockResolvedValue(
        productionDataArrayMock as any
      )

      await getProductionReport(req, res, context)

      expect(res.status).toHaveBeenCalledWith(200)
    })
  })
})
