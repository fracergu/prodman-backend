import { generateMockUsers } from '@mocks/usernames.mock'
import {
  type AppConfig,
  ConfigurationKey,
  ConfigurationValueTypes
} from '@models/config.model'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export interface Configuration {
  key: ConfigurationKey
  type: ConfigurationValueTypes
  value: string
}

const defaultConfigurations: Configuration[] = [
  {
    key: ConfigurationKey.REGISTER_ENABLED,
    type: ConfigurationValueTypes.BOOLEAN,
    value: 'true'
  },
  {
    key: ConfigurationKey.WORKER_AUTO_TIMEOUT,
    type: ConfigurationValueTypes.NUMBER,
    value: '60'
  },
  {
    key: ConfigurationKey.WORKER_GET_NEXT_SUBTASK,
    type: ConfigurationValueTypes.BOOLEAN,
    value: 'true'
  }
]

export const ConfigurationTypeMapping: {
  [key in ConfigurationKey]: ConfigurationValueTypes
} = {
  [ConfigurationKey.REGISTER_ENABLED]: ConfigurationValueTypes.BOOLEAN,
  [ConfigurationKey.WORKER_AUTO_TIMEOUT]: ConfigurationValueTypes.NUMBER,
  [ConfigurationKey.WORKER_GET_NEXT_SUBTASK]: ConfigurationValueTypes.BOOLEAN
}

export async function initializeDefaultConfigurations() {
  const existingConfigurations = await prisma.appConfig.findMany()

  if (existingConfigurations.length === 0) {
    for (const config of defaultConfigurations) {
      await prisma.appConfig.create({
        data: config
      })
    }
    console.log('Default configurations initialized.')
  }
}

export async function mockDevelopmentData() {
  const existingUsers = await prisma.user.findMany()

  if (existingUsers.length === 0) {
    await prisma.user.create({
      data: {
        name: 'root',
        username: 'root',
        password: await bcrypt.hash('root', 8),
        role: 'admin'
      }
    })

    const mockUsers = generateMockUsers(50)

    mockUsers.forEach(async user => {
      await prisma.user.create({
        data: {
          name: user.name,
          lastName: user.lastName,
          username: user.username,
          password: await bcrypt.hash('1234', 8),
          role: 'user'
        }
      })
    })

    const categories = await Promise.all(
      Array.from({ length: 5 }).map(async (_, i) => {
        return await prisma.category.create({
          data: {
            name: `category ${i}`,
            description: `category ${i} description`
          }
        })
      })
    )

    const productIds = await Promise.all(
      Array.from({ length: 50 }).map(async (_, i) => {
        const digits5reference = i.toString().padStart(5, '0')
        const hasCategory = Math.random() > 0.25

        const product = await prisma.product.create({
          data: {
            name: `Product ${i}`,
            description: `Product ${i} description`,
            price: Math.floor(Math.random() * 1000),
            reference: `REF-${digits5reference}`,
            productCategories: hasCategory
              ? {
                  create: {
                    category: {
                      connect: {
                        id: categories[
                          Math.floor(Math.random() * categories.length)
                        ].id
                      }
                    }
                  }
                }
              : undefined
          }
        })

        return product.id
      })
    )
    productIds.forEach(async (productId, i) => {
      const hasComponents = Math.random() > 0.25 && i > 5
      const howManyComponents = Math.floor(Math.random() * 3) + 1
      const addedComponents = new Set() // Para mantener registro de los componentes agregados

      if (hasComponents) {
        await prisma.product.update({
          where: { id: productId },
          data: {
            productComponents: {
              create: Array.from({ length: howManyComponents }).map(() => {
                let componentId
                do {
                  componentId = productIds[Math.floor(Math.random() * i)]
                } while (
                  componentId === productId ||
                  addedComponents.has(componentId)
                )

                addedComponents.add(componentId) // Agregar el componente al registro

                return {
                  child: {
                    connect: {
                      id: componentId
                    }
                  },
                  quantity: Math.floor(Math.random() * 10) + 1
                }
              })
            }
          }
        })
      }
    })

    Array.from({ length: 5 }).forEach(async (_, i) => {
      await prisma.task.create({
        data: {
          notes: `Task ${i} notes`,
          user: {
            connect: {
              id: Math.floor(Math.random() * 10) + 1
            }
          },
          subtasks: {
            create: Array.from({ length: 5 }).map((_, j) => ({
              status: 'pending',
              quantity: Math.floor(Math.random() * 10) + 1,
              order: j,
              product: {
                connect: {
                  id: productIds[Math.floor(Math.random() * productIds.length)]
                }
              }
            }))
          }
        }
      })
    })

    console.log('Development data initialized.')
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
  if (value === undefined) throw new Error('Invalid configuration value')
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

export function parseConfigurationArray(
  configurations: Configuration[]
): AppConfig {
  const parsedConfigurations: any = {}
  for (const config of configurations) {
    parsedConfigurations[config.key] = parseConfigurationValue(
      config.type,
      config.value
    )
  }
  return parsedConfigurations as AppConfig
}
