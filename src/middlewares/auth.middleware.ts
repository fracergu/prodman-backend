import { Context } from '@utils/context'
import { type NextFunction, type Request, type Response } from 'express'

export const requireAdminRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
  ctx: Context
) => {
  const userId = req.session?.user

  if (!userId) {
    return res
      .status(401)
      .json({ status: 'error', message: 'Not authenticated' })
  }

  const user = await ctx.prisma.user.findUnique({ where: { id: userId } })

  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ status: 'error', message: 'Forbidden' })
  }

  next()
}
