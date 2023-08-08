import { RequestError } from '@exceptions/RequestError'
import { type RegisterRequest } from '@models/auth.model'
import { ConfigurationKeys } from '@models/config.model'
import { type Context } from '@utils/context'
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
  let rememberMe = false
  if (req.body?.rememberMe !== undefined) {
    rememberMe = req.body.rememberMe
  }

  if (authHeader === undefined || !authHeader.startsWith('Basic ')) {
    throw new RequestError(400, 'Missing or invalid authorization header')
  }

  const base64Credentials = authHeader.split(' ')[1]
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
  const [email, password] = credentials.split(':')

  if (email === undefined || password === undefined) {
    throw new RequestError(400, 'Missing or invalid authorization header')
  }

  const user = await ctx.prisma.user.findUnique({ where: { email } })

  if (user !== null && bcrypt.compareSync(password, user.password)) {
    if (user.role === 'ADMIN') {
      req.session.cookie.maxAge = rememberMe ? ONE_DAY_MS * 30 : ONE_DAY_MS
    } else if (user.role === 'USER') {
      req.session.cookie.maxAge = 1000 * 60
    }
    req.session.user = user.id
    res.status(200).send()
  } else {
    throw new RequestError(401, 'Invalid credentials')
  }
}

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
  ctx: Context
): Promise<void> => {
  const config = await ctx.prisma.config.findUnique({
    where: {
      key: ConfigurationKeys.REGISTER_ENABLED
    }
  })

  if (config == null || config.value === 'false') {
    throw new RequestError(403, 'Forbidden')
  }

  const { name, email, lastName, password } = req.body as RegisterRequest
  const hashedPassword = bcrypt.hashSync(password, 8)

  await ctx.prisma.user.create({
    data: {
      name,
      lastName,
      email,
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  res.status(201).send()
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
