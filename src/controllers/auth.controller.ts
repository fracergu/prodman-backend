import { RequestError } from '@exceptions/RequestError'
import { type RegisterRequest } from '@models/auth.model'
import { ConfigurationKey } from '@models/config.model'
import { type Context } from '@utils/context'
import bcrypt from 'bcrypt'
import { type Request, type Response } from 'express'

const ONE_DAY_MS = 1000 * 60 * 60 * 24

export const login = async (
  req: Request,
  res: Response,
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
  const [username, password] = credentials.split(':')

  if (username === undefined || password === undefined) {
    throw new RequestError(400, 'Missing or invalid authorization header')
  }

  const user = await ctx.prisma.user.findUnique({ where: { username } })

  if (user !== null && bcrypt.compareSync(password, user.password)) {
    if (user.role === 'admin') {
      req.session.cookie.maxAge = rememberMe ? ONE_DAY_MS * 30 : ONE_DAY_MS
    } else if (user.role === 'user') {
      const configEntry = await ctx.prisma.appConfig.findUnique({
        where: {
          key: 'workerAutoTimeout'
        }
      })
      if (configEntry == null) {
        throw new RequestError(400, "Config key 'workerAutoTimeout' not found.")
      }
      const workerSessionTimeout = parseInt(configEntry.value)

      req.session.cookie.maxAge =
        workerSessionTimeout === 0 ? ONE_DAY_MS : workerSessionTimeout * 1000
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
  ctx: Context
): Promise<void> => {
  const config = await ctx.prisma.appConfig.findUnique({
    where: {
      key: ConfigurationKey.REGISTER_ENABLED
    }
  })

  if (config == null || config.value === 'false') {
    throw new RequestError(403, 'Forbidden')
  }

  const { name, username, lastName, password } = req.body as RegisterRequest
  const hashedPassword = bcrypt.hashSync(password, 8)

  await ctx.prisma.user.create({
    data: {
      name,
      lastName,
      username,
      password: hashedPassword,
      role: 'admin'
    }
  })

  res.status(201).send()
}

export const logout = async (req: Request, res: Response): Promise<void> => {
  req.session.destroy(() => {
    res.clearCookie('sid')
    res.status(200).send()
  })
}

export const session = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  // Invalid session will be checked by the middleware
  res.status(200).send()
}
