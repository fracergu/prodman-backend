import {
  createUser,
  getUser,
  getUsers,
  updateUser,
  updateUserCredentials
} from '@controllers/users.controller'
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

router.get('/', withContext(getUsers))
router.get('/:id', withContext(getUser))
router.post('/', withContext(createUser))
router.put('/:id', withContext(updateUser))
router.put('/:id/credentials', withContext(updateUserCredentials))

export default router
