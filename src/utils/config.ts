import {
  ConfigurationKeys,
  ConfigurationValueTypes
} from '@models/config.model'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface Configuration {
  key: ConfigurationKeys
  type: ConfigurationValueTypes
  value: string
}

const defaultConfigurations: Configuration[] = [
  {
    key: ConfigurationKeys.REGISTER_ENABLED,
    type: ConfigurationValueTypes.BOOLEAN,
    value: 'true'
  }
]

export const ConfigurationTypeMapping: {
  [key in ConfigurationKeys]: ConfigurationValueTypes
} = {
  [ConfigurationKeys.REGISTER_ENABLED]: ConfigurationValueTypes.BOOLEAN
}

export async function initializeDefaultConfigurations() {
  const existingConfigurations = await prisma.config.findMany()

  if (existingConfigurations.length === 0) {
    for (const config of defaultConfigurations) {
      await prisma.config.create({
        data: config
      })
    }
    console.log('Default configurations initialized.')
  }
}

function _parseBoolean(value: string): boolean {
  switch (value) {
    case 'true':
      return true
    case 'false':
      return false
    default:
      throw new Error('Invalid boolean value: ' + value)
  }
}

export function parseConfigurationValue(
  type: ConfigurationValueTypes,
  value: string
): string | number | boolean {
  if (!value) throw new Error('Invalid configuration value')
  switch (type) {
    case ConfigurationValueTypes.BOOLEAN:
      return _parseBoolean(value)
    case ConfigurationValueTypes.NUMBER:
      return parseInt(value)
    case ConfigurationValueTypes.STRING:
      return value
    default:
      throw new Error('Invalid configuration type')
  }
}

export function parseConfigurationArray(configurations: Configuration[]): {
  [key: string]: string | number | boolean
} {
  const parsedConfigurations: { [key: string]: string | number | boolean } = {}
  for (const config of configurations) {
    parsedConfigurations[config.key] = parseConfigurationValue(
      config.type,
      config.value
    )
  }
  return parsedConfigurations
}
