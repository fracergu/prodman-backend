import {
  getConfigurations,
  updateConfigurations
} from '@controllers/config.controller'
import { MockContext, createMockContext } from '@utils/context'
import { type NextFunction, type Request, type Response } from 'express'

describe('ConfigController', () => {
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

  const mockConfig = [
    {
      key: 'configKey1',
      value: 'configValue1'
    },
    {
      key: 'configKey2',
      value: 'configValue2'
    }
  ]

  describe('getConfigurations', () => {
    it('should return configurations', async () => {
      context.prisma.config.findMany.mockResolvedValue(mockConfig)
      await getConfigurations(req, res, next, context)
      expect(context.prisma.config.findMany).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockConfig)
    })

    it('should return error if something went wrong', async () => {
      context.prisma.config.findMany.mockRejectedValueOnce(new Error())
      await getConfigurations(req, res, next, context)
      expect(context.prisma.config.findMany).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Something went wrong'
      })
    })
  })

  describe('updateConfigurations', () => {
    it('should update configuration', async () => {
      context.prisma.config.update.mockResolvedValueOnce(mockConfig[0])
      req.body = {
        key: mockConfig[0].key,
        value: mockConfig[0].value
      }
      await updateConfigurations(req, res, next, context)
      expect(context.prisma.config.update).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockConfig[0])
    })

    it('should return error if something went wrong', async () => {
      req.body = {
        key: mockConfig[0].key,
        value: mockConfig[0].value
      }
      context.prisma.config.update.mockRejectedValueOnce(new Error())
      await updateConfigurations(req, res, next, context)
      expect(context.prisma.config.update).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Something went wrong'
      })
    })
  })
})
