import { RequestError } from '@exceptions/RequestError'
import {
  type AppConfig,
  type ConfigurationKey,
  type DatabaseConfig
} from '@models/config.model'
import {
  ConfigurationTypeMapping,
  parseConfigurationArray,
  parseConfigurationValue
} from '@utils/config'
import { type Context } from '@utils/context'
import { type Request, type Response } from 'express'

export const getConfigurations = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  const config = (await ctx.prisma.appConfig.findMany()) as DatabaseConfig[]
  res.status(200).json(parseConfigurationArray(config))
}

export const updateConfigurations = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  const config = req.body as AppConfig

  const parsedConfigurations: DatabaseConfig[] = []

  for (const key in config) {
    const value = config[key as ConfigurationKey]

    const expectedType = ConfigurationTypeMapping[key as ConfigurationKey]

    if (expectedType === undefined) {
      throw new RequestError(400, 'Invalid configuration key')
    }

    const parsedValue = parseConfigurationValue(expectedType, value.toString())

    parsedConfigurations.push({
      key: key as ConfigurationKey,
      type: expectedType,
      value: parsedValue.toString()
    })
  }

  await Promise.all(
    parsedConfigurations.map(
      async config =>
        await ctx.prisma.appConfig.update({
          where: {
            key: config.key
          },
          data: {
            value: config.value
          }
        })
    )
  )

  const updatedConfig =
    (await ctx.prisma.appConfig.findMany()) as DatabaseConfig[]

  res.status(200).json(parseConfigurationArray(updatedConfig))
}
