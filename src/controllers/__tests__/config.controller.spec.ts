import {
  getConfigurations,
  updateConfigurations
} from '@controllers/config.controller'
import { RequestError } from '@exceptions/RequestError'
import {
  ConfigurationKeys,
  ConfigurationValueTypes
} from '@models/config.model'
import { parseConfigurationArray } from '@utils/config'
import { createMockContext, type MockContext } from '@utils/context'
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
      key: ConfigurationKeys.REGISTER_ENABLED,
      type: ConfigurationValueTypes.BOOLEAN,
      value: 'true'
    }
  ]

  const parsedMockConfig = parseConfigurationArray(mockConfig)

  describe('getConfigurations', () => {
    it('should return configurations', async () => {
      context.prisma.config.findMany.mockResolvedValue(mockConfig)
      await getConfigurations(req, res, next, context)
      expect(context.prisma.config.findMany).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(parsedMockConfig)
    })
  })

  describe('updateConfigurations', () => {
    it('should update configuration', async () => {
      context.prisma.config.update.mockResolvedValueOnce(mockConfig[0])
      req.body = {
        key: ConfigurationKeys.REGISTER_ENABLED,
        value: false
      }
      await updateConfigurations(req, res, next, context)
      expect(context.prisma.config.update).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(parsedMockConfig)
    })

    it('should throw a 400 if key is invalid', async () => {
      req.body = {
        key: 'INVALID_KEY',
        value: false
      }
      await updateConfigurations(req, res, next, context).catch(err => {
        expect(err).toBeInstanceOf(RequestError)
        expect(err.statusCode).toBe(400)
        expect(err.message).toBe('Invalid configuration key')
      })
    })
  })
})
