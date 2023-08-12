import { RequestError } from '@exceptions/RequestError'
import {
  type UserCreationRequest,
  type UserCredentialsRequest,
  type UserUpdateRequest
} from '@models/users.model'
import { type Context } from '@utils/context'
import { getIntegerParam, isValidString } from '@utils/validation'
import bcrypt from 'bcrypt'
import { type Request, type Response } from 'express'

const userSelector = {
  id: true,
  name: true,
  lastName: true,
  username: true,
  role: true,
  createdAt: true,
  active: true,
  updatedAt: true,
  password: false
}

export const getUsers = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  const limit = getIntegerParam(req.query.limit as string, 10)
  const page = getIntegerParam(req.query.page as string, 1)
  const search = req.query.search as string
  const role = req.query.role as string
  const inactive = req.query.inactive as string

  const whereCriteria: any = {}

  if (isValidString(search)) {
    whereCriteria.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } }
    ]
  }
  if (isValidString(role)) {
    whereCriteria.role = role
  }

  if (isValidString(inactive)) {
    whereCriteria.active = !(inactive === 'true')
  }

  const [count, users] = await ctx.prisma.$transaction([
    ctx.prisma.user.count({ where: whereCriteria }),
    ctx.prisma.user.findMany({
      take: limit + 1,
      skip: (page - 1) * limit,
      where: whereCriteria,
      select: userSelector
    })
  ])

  const hasNextPage = users.length > limit
  if (hasNextPage) {
    users.pop()
  }

  res.status(200).json({
    data: users,
    total: count,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  })
}

export const getUser = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  const { id } = req.params
  const user = await ctx.prisma.user.findUnique({
    where: { id: parseInt(id) },
    select: userSelector
  })

  if (user == null) {
    throw new RequestError(404, 'Not found')
  }

  res.status(200).json(user)
}

export const createUser = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  const { name, username, lastName, password, role } =
    req.body as UserCreationRequest
  const hashedPassword = bcrypt.hashSync(password, 8)

  const user = await ctx.prisma.user.create({
    data: {
      name,
      lastName,
      username,
      password: hashedPassword,
      role
    },
    select: userSelector
  })

  res.status(201).json(user)
}

export const updateUser = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  const { id } = req.params
  const { name, lastName, role, active } = req.body as UserUpdateRequest

  const user = await ctx.prisma.user.update({
    where: { id: parseInt(id) },
    data: {
      name,
      lastName,
      role,
      active
    },
    select: userSelector
  })

  res.status(200).json(user)
}

export const updateUserCredentials = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  const { id } = req.params
  const { currentPassword, password, username } =
    req.body as UserCredentialsRequest

  const updateData: {
    password?: string
    username?: string
  } = {}

  const findUser = await ctx.prisma.user.findUnique({
    where: { id: parseInt(id) },
    select: { password: true }
  })

  if (findUser == null) {
    throw new RequestError(404, 'Not found')
  }

  const isPasswordValid = bcrypt.compareSync(currentPassword, findUser.password)

  if (!isPasswordValid) {
    throw new RequestError(401, 'Invalid password')
  }

  if (!isValidString(password) && !isValidString(username)) {
    throw new RequestError(400, 'Username or password must be provided')
  }

  if (isValidString(username)) {
    updateData.username = username
  }

  if (isValidString(password)) {
    updateData.password = bcrypt.hashSync(password, 8)
  }

  const user = await ctx.prisma.user.update({
    where: { id: parseInt(id) },
    data: updateData,
    select: userSelector
  })

  res.status(200).json(user)
}
