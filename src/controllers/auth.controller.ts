import { type LoginBody, type RegisterBody } from '@models/auth.model'
import { type Context } from '@utils/context'
import { checkRequiredFields } from '@utils/validationUtils'
import bcrypt from 'bcrypt'
import { type NextFunction, type Request, type Response } from 'express'

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
  ctx: Context
): Promise<void> => {
  try {
    checkRequiredFields(['email', 'password'], req.body)
    const { email, password, rememberMe } = req.body as LoginBody
    const user = await ctx.prisma.user.findUnique({ where: { email } })
    if (user !== null && bcrypt.compareSync(password, user.password)) {
      if (rememberMe) {
        req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30 // 30 days
      }
      req.session.user = user
      res.status(200)
    } else {
      res.status(401).json({ status: 'error', message: 'Invalid credentials' })
    }
  } catch (e) {
    next(e)
  }
}

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
  ctx: Context
): Promise<void> => {
  try {
    const users = await ctx.prisma.user.findMany()
    if (users.length > 0) {
      res.status(403).json({
        status: 'error',
        message: 'Forbidden'
      })
      return
    }

    checkRequiredFields(['name', 'email', 'password'], req.body)
    const { name, email, lastName, password } = req.body as RegisterBody
    const hashedPassword = bcrypt.hashSync(password, 8)
    const user = await ctx.prisma.user.create({
      data: {
        name,
        lastName,
        email,
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    req.session.user = user
    res.status(201)
  } catch (e) {
    next(e)
  }
}

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
  ctx: Context
): Promise<void> => {
  try {
    req.session.destroy(() => {
      res.clearCookie('sid')
      res.status(200)
    })
  } catch (e) {
    next(e)
  }
}