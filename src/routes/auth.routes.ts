import { login, logout, register } from '@controllers/auth.controller'
import { PrismaClient } from '@prisma/client'
import { type Context } from '@utils/context'
import express from 'express'

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

router.post('/login', withContext(login))
router.post('/register', withContext(register))
router.delete('/logout', withContext(logout))

export default router
