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
    return res
      .status(401)
      .json({ status: 'error', message: 'Not authenticated' })
  }

  const user = await ctx.prisma.user.findUnique({ where: { id: userId } })

  if (user == null || user.role !== 'admin') {
    return res.status(403).json({ status: 'error', message: 'Forbidden' })
  }

  next()
}
