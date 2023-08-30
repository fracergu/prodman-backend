import { RequestError } from '@exceptions/RequestError'
import { type Context } from '@utils/context'
import { type NextFunction, type Request, type Response } from 'express'

export const requireAdminRole = async (
  req: Request,
  res: Response,
  ctx: Context,
  next: NextFunction
) => {
  const userId = req.session?.user

  if (userId == null) {
    throw new RequestError(440, 'Login timeout')
  }

  const user = await ctx.prisma.user.findUnique({ where: { id: userId } })

  if (user == null || user.role !== 'admin') {
    return res.status(403).json({ status: 'error', message: 'Forbidden' })
  }

  next()
}

export const requireSession = async (
  req: Request,
  res: Response,
  ctx: Context,
  next: NextFunction
) => {
  const userId = req.session?.user

  if (userId == null) {
    throw new RequestError(440, 'Login timeout')
  }

  next()
}
