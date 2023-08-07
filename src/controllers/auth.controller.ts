import { LoginBody, type RegisterBody } from '@models/auth.model'
import { type Context } from '@utils/context'
import { checkRequiredFields } from '@utils/validation'
import bcrypt from 'bcrypt'
import { type NextFunction, type Request, type Response } from 'express'

const ONE_DAY_MS = 1000 * 60 * 60 * 24

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
  ctx: Context
): Promise<void> => {
  const authHeader = req.headers.authorization
  const { rememberMe } = (req.body as LoginBody) || false

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.status(401).json({
      status: 'error',
      message: 'Missing or invalid authorization header'
    })
    return
  }

  const base64Credentials = authHeader.split(' ')[1]
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
  const [email, password] = credentials.split(':')

  if (!email || !password) {
    res.status(401).json({
      status: 'error',
      message: 'Missing or invalid authorization header'
    })
    return
  }

  ctx.prisma.user
    .findUnique({ where: { email } })
    .then(user => {
      if (user !== null && bcrypt.compareSync(password, user.password)) {
        if (user.role === 'ADMIN') {
          req.session.cookie.maxAge = rememberMe ? ONE_DAY_MS * 30 : ONE_DAY_MS
        } else if (user.role === 'USER') {
          req.session.cookie.maxAge = 1000 * 60
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

  if (user) {
    res.status(201).send()
  } else {
    res.status(500).json({ status: 'error', message: 'Something went wrong' })
  }
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
