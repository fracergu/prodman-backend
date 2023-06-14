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
  checkRequiredFields(['email', 'password'], req.body)
  const { email, password, rememberMe } = req.body as LoginBody
  ctx.prisma.user
    .findUnique({ where: { email } })
    .then(user => {
      if (user !== null && bcrypt.compareSync(password, user.password)) {
        if (rememberMe) {
          req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30 // 30 days
        }
        req.session.user = user.id
        res.status(200).send()
      } else {
        res
          .status(401)
          .json({ status: 'error', message: 'Invalid credentials' })
      }
    })
    .catch(() => {
      res.status(500).json({ status: 'error', message: 'Something went wrong' })
    })
}

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
  ctx: Context
): Promise<void> => {
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
  ctx.prisma.user
    .create({
      data: {
        name,
        lastName,
        email,
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    .then(() => {
      res.status(201).send()
    })
    .catch(() => {
      res.status(500).json({ status: 'error', message: 'Something went wrong' })
    })
}

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
  ctx: Context
): Promise<void> => {
  req.session.destroy(() => {
    res.clearCookie('sid')
    res.status(200).send()
  })
}
