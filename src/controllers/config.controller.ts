import { RequestError } from '@exceptions/RequestError'
import {
  type ConfigRequest,
  type ConfigurationKeys,
  type DatabaseConfig
} from '@models/config.model'
import {
  ConfigurationTypeMapping,
  parseConfigurationArray,
  parseConfigurationValue
} from '@utils/config'
import { type Context } from '@utils/context'
import { type NextFunction, type Request, type Response } from 'express'

export const getConfigurations = async (
  req: Request,
  res: Response,
  next: NextFunction,
  ctx: Context
): Promise<void> => {
  const config = (await ctx.prisma.config.findMany()) as DatabaseConfig[]
  res.status(200).json(parseConfigurationArray(config))
}

export const updateConfigurations = async (
  req: Request,
  res: Response,
  next: NextFunction,
  ctx: Context
): Promise<void> => {
  const { key, value } = req.body as ConfigRequest
  const expectedType = ConfigurationTypeMapping[key as ConfigurationKeys]

  if (expectedType === undefined) {
    throw new RequestError(400, 'Invalid configuration key')
  }

  const parsedValue = parseConfigurationValue(expectedType, value.toString())

  const config = (await ctx.prisma.config.update({
    where: { key },
    data: { value: parsedValue.toString() }
  })) as DatabaseConfig

  res.status(200).json(parseConfigurationArray([config]))
}
