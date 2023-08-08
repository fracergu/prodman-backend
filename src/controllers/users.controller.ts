import {
  type UserCreationRequest,
  type UserCredentialsRequest,
  type UserResponse,
  type UserUpdateRequest
} from '@models/users.model'
import { type Context } from '@utils/context'
import {
  checkRequiredFields,
  getIntegerParam,
  isValidString
} from '@utils/validation'
import bcrypt from 'bcrypt'
import { type NextFunction, type Request, type Response } from 'express'

const userSelector = {
  id: true,
  name: true,
  lastName: true,
  email: true,
  role: true,
  createdAt: true,
  active: true,
  updatedAt: true,
  password: false
}

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
  ctx: Context
): Promise<void> => {
  const limit = getIntegerParam(req.query.limit as string, 10)
  const page = getIntegerParam(req.query.page as string, 1)
  const search = req.query.search as string
  const role = req.query.role as string

  const whereCriteria: any = {}
  if (isValidString(search)) {
    whereCriteria.name = { contains: search }
  }
  if (isValidString(role)) {
    whereCriteria.role = role
  }

  try {
    const users: UserResponse[] = await ctx.prisma.user.findMany({
      take: limit + 1,
      skip: (page - 1) * limit,
      where: whereCriteria,
      select: userSelector
    })

    if (users.length === 0) {
      res.status(404).json({ status: 'error', message: 'Not found' })
      return
    }

    const hasNextPage = users.length > limit
    if (hasNextPage) {
      users.pop()
    }

    res.status(200).json({
      data: users,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null
    })
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Something went wrong' })
  }
}

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
  ctx: Context
): Promise<void> => {
  const { id } = req.params
  try {
    const user = await ctx.prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: userSelector
    })
    if (user != null) {
      res.status(200).json(user)
    } else {
      res.status(404).json({ status: 'error', message: 'Not found' })
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Something went wrong' })
  }
}

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
  ctx: Context
): Promise<void> => {
  checkRequiredFields(['name', 'email', 'password'], req.body)
  const { name, email, lastName, password, role } =
    req.body as UserCreationRequest
  const hashedPassword = bcrypt.hashSync(password, 8)

  try {
    const user = await ctx.prisma.user.create({
      data: {
        name,
        lastName,
        email,
        password: hashedPassword,
        role
      },
      select: userSelector
    })
    res.status(201).json(user)
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error ?? 'Something went wrong'
    })
  }
}

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
  ctx: Context
): Promise<void> => {
  const { id } = req.params
  const { name, lastName, role, active } = req.body as UserUpdateRequest

  try {
    const user = await ctx.prisma.user
      .update({
        where: { id: parseInt(id) },
        data: {
          name,
          lastName,
          role,
          active
        },
        select: userSelector
      })
      .catch(error => {
        if (error.code === 'P2025') {
          res.status(404).json({ status: 'error', message: 'Not found' })
        }
      })

    if (user != null) {
      res.status(200).json(user)
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: 'error', message: error ?? 'Something went wrong' })
  }
}

export const updateUserCredentials = async (
  req: Request,
  res: Response,
  next: NextFunction,
  ctx: Context
): Promise<void> => {
  const { id } = req.params
  const { password, email } = req.body as UserCredentialsRequest

  const updateData: {
    password?: string
    email?: string
  } = {}

  if (!isValidString(password) && !isValidString(email)) {
    res.status(400).json({
      status: 'error',
      message: 'Email or password must be provided'
    })
    return
  }

  if (isValidString(email)) {
    updateData.email = email
  }

  if (isValidString(password)) {
    updateData.password = bcrypt.hashSync(password, 8)
  }

  try {
    const user = await ctx.prisma.user
      .update({
        where: { id: parseInt(id) },
        data: updateData,
        select: userSelector
      })
      .catch(error => {
        if (error.code === 'P2025') {
          res.status(404).json({ status: 'error', message: 'Not found' })
        }
      })

    if (user != null) {
      res.status(200).json(user)
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: 'error', message: error ?? 'Something went wrong' })
  }
}
