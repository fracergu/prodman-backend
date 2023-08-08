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
  ctx.prisma.config
    .findMany()
    .then((config: DatabaseConfig[]) => {
      const parsedResponse = parseConfigurationArray(config)
      res.status(200).json(parsedResponse)
    })
    .catch(() => {
      res.status(500).json({ status: 'error', message: 'Something went wrong' })
    })
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
    res
      .status(400)
      .json({ status: 'error', message: 'Invalid configuration key' })
    return
  }

  const parsedValue = parseConfigurationValue(expectedType, value.toString())

  ctx.prisma.config
    .update({
      where: { key },
      data: { value: parsedValue.toString() }
    })
    .then((configuration: DatabaseConfig) => {
      const parsedResponse = parseConfigurationArray([configuration])
      res.status(200).json(parsedResponse)
    })
    .catch(() => {
      res.status(500).json({ status: 'error', message: 'Something went wrong' })
    })
}
