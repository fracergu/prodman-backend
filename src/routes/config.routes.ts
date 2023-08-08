import {
  getConfigurations,
  updateConfigurations
} from '@controllers/config.controller'
import { PrismaClient } from '@prisma/client'
import { type Context } from '@utils/context'
import express from 'express'
import { requireAdminRole } from 'src/middlewares/auth.middleware'

const context: Context = {
  prisma: new PrismaClient()
}

const withContext = (fn: any) => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    fn(req, res, next, context).catch(next)
  }
}

const router = express.Router()

router.use(withContext(requireAdminRole))

router.get('/', withContext(getConfigurations))
router.put('/', withContext(updateConfigurations))

export default router
