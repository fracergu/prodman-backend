import {
  getConfigurations,
  updateConfigurations
} from '@controllers/config.controller'
import { RequestError } from '@exceptions/RequestError'
import { ConfigurationKey, ConfigurationValueTypes } from '@models/config.model'
import { parseConfigurationArray } from '@utils/config'
import { createMockContext, type MockContext } from '@utils/context'
import { type Request, type Response } from 'express'

describe('ConfigController', () => {
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

  const mockConfig = [
    {
      key: ConfigurationKey.REGISTER_ENABLED,
      type: ConfigurationValueTypes.BOOLEAN,
      value: 'true'
    },
    {
      key: ConfigurationKey.WORKER_AUTO_TIMEOUT,
      type: ConfigurationValueTypes.NUMBER,
      value: '1000'
    }
  ]

  const parsedMockConfig = parseConfigurationArray(mockConfig)

  describe('getConfigurations', () => {
    it('should return configurations', async () => {
      context.prisma.appConfig.findMany.mockResolvedValue(mockConfig)
      await getConfigurations(req, res, context)
      expect(context.prisma.appConfig.findMany).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(parsedMockConfig)
    })
  })

  describe('updateConfigurations', () => {
    it('should update configuration', async () => {
      context.prisma.appConfig.update.mockResolvedValue(mockConfig as any)
      req.body = {
        registerEnabled: false,
        workerAutoTimeout: 1000
      }
      context.prisma.appConfig.findMany.mockResolvedValue(mockConfig)
      await updateConfigurations(req, res, context)
      expect(context.prisma.appConfig.update).toHaveBeenCalledWith({
        where: { key: ConfigurationKey.REGISTER_ENABLED },
        data: { value: 'false' }
      })
      expect(context.prisma.appConfig.update).toHaveBeenCalledWith({
        where: { key: ConfigurationKey.WORKER_AUTO_TIMEOUT },
        data: { value: '1000' }
      })
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(parsedMockConfig)
    })

    it('should throw error if configuration key is not found', async () => {
      context.prisma.appConfig.update.mockResolvedValueOnce(mockConfig as any)
      req.body = {
        registerEnabled: false,
        workerAutoTimeout: 1000,
        notFoundKey: 'value'
      }
      await expect(
        updateConfigurations(req, res, context)
      ).rejects.toThrowError(RequestError)
    })
  })
})
