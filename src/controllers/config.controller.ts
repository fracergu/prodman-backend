import { type NextFunction, type Request, type Response } from 'express'
import { Context } from 'vm'

export const getConfigurations = async (
  req: Request,
  res: Response,
  next: NextFunction,
  ctx: Context
): Promise<void> => {
  const configurations = await ctx.prisma.config.findMany().catch(() => {
    res.status(500).json({ status: 'error', message: 'Something went wrong' })
  })
  res.status(200).json(configurations)
}

export const updateConfigurations = async (
  req: Request,
  res: Response,
  next: NextFunction,
  ctx: Context
): Promise<void> => {
  const { key, value } = req.body
  const configuration = await ctx.prisma.config
    .update({
      where: { key },
      data: { value }
    })
    .catch(() => {
      res.status(500).json({ status: 'error', message: 'Something went wrong' })
    })
  res.status(200).json(configuration)
}
