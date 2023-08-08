import { PrismaClient } from '@prisma/client'
import type express from 'express'
import { type DeepMockProxy, mockDeep } from 'jest-mock-extended'

export interface Context {
  prisma: PrismaClient
}

export interface MockContext {
  prisma: DeepMockProxy<PrismaClient>
}

export const createMockContext = (): MockContext => {
  return {
    prisma: mockDeep<PrismaClient>()
  }
}

const context: Context = {
  prisma: new PrismaClient()
}

export const withContext = (fn: any) => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    fn(req, res, next, context).catch(next)
  }
}
