import { PrismaClient } from '@prisma/client'

const defaultConfigurations = [{ key: 'registerEnabled', value: 'true' }]

const prisma = new PrismaClient()

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
