import { RequestError } from '@exceptions/RequestError'
import { type SubTask, type SubTaskEvent } from '@prisma/client'
import { type Context } from '@utils/context'
import { getIntegerParam, isValidString } from '@utils/validation'
import { type Request, type Response } from 'express'

const select = {
  id: true,
  createdAt: true,
  notes: true,
  status: true,
  userId: false,
  User: {
    select: { id: true, name: true, lastName: true }
  },
  SubTasks: {
    include: {
      SubTaskEvents: true
    }
  }
}

export const getTasks = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  const limit = getIntegerParam(req.query.limit as string, 10)
  const page = getIntegerParam(req.query.page as string, 1)
  const userId = req.query.userId as string
  const status = req.query.status as string
  const startDate = req.query.startDate as string

  const whereCriteria: any = {}
  if (isValidString(userId)) {
    whereCriteria.userId = parseInt(userId)
  }
  if (isValidString(status)) {
    whereCriteria.status = status
  }
  if (isValidString(startDate)) {
    whereCriteria.createdAt = { gte: new Date(startDate) }
  }

  const tasks = await ctx.prisma.task.findMany({
    take: limit + 1,
    skip: (page - 1) * limit,
    where: whereCriteria,
    select
  })

  if (tasks.length === 0) {
    throw new RequestError(404, 'Not found')
  }

  const hasNextPage = tasks.length > limit
  if (hasNextPage) {
    tasks.pop()
  }

  const transformedTasks = tasks.map(task => ({
    ...task,
    percentageCompleted: calculatePercentage(task.SubTasks),
    subtasks: task.SubTasks.length,
    SubTasks: undefined
  }))

  res.status(200).json({
    data: transformedTasks,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  })
}

type SubtaskWithEvents = SubTask & { SubTaskEvents: SubTaskEvent[] }

function calculatePercentage(subTasks: SubtaskWithEvents[]): number {
  const totalQuantity = subTasks.reduce<number>(
    (sum, st) => sum + st.quantity,
    0
  )
  const completedQuantity = subTasks.reduce<number>(
    (sum, st) =>
      sum +
      st.SubTaskEvents.reduce<number>(
        (eSum, event) => eSum + event.quantityCompleted,
        0
      ),
    0
  )

  const roundedValue =
    Math.round((completedQuantity / totalQuantity) * 10000) / 100

  return totalQuantity > 0 ? roundedValue : 0
}

export const getTask = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  const taskId = req.params.id

  const task = await ctx.prisma.task.findUnique({
    where: { id: parseInt(taskId) },
    select
  })
  if (task === null) {
    throw new RequestError(404, 'Not found')
  }

  const tranformedTask = {
    ...task,
    percentageCompleted: calculatePercentage(task.SubTasks)
  }
  res.status(200).json(tranformedTask)
}
export const createTask = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  const { notes, userId, status, subTasks } = req.body

  if (
    userId === undefined ||
    subTasks === undefined ||
    !Array.isArray(subTasks)
  ) {
    throw new RequestError(400, 'Missing required fields')
  }

  const newTaskData = {
    notes,
    status,
    User: {
      connect: { id: userId }
    },
    SubTasks: {
      create: subTasks.map(subTask => ({
        quantity: subTask.quantity,
        notes: subTask.notes,
        status: subTask.status,
        Product: {
          connect: { id: subTask.productId }
        }
      }))
    }
  }

  const task = await ctx.prisma.task.create({
    data: newTaskData,
    select
  })

  const tranformedTask = {
    ...task,
    percentageCompleted: calculatePercentage(task.SubTasks)
  }

  res.status(201).json(tranformedTask)
}

export const updateTask = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  if (req.params.id === undefined) {
    throw new RequestError(400, 'Task ID is required')
  }

  const taskId = parseInt(req.params.id)
  const { notes, userId, status, subTasks } = req.body

  if (status !== undefined) {
    await ctx.prisma.subTask.updateMany({
      where: { taskId },
      data: { status }
    })
  }

  if (subTasks !== undefined && Array.isArray(subTasks)) {
    await ctx.prisma.subTask.deleteMany({ where: { taskId } })
  }

  const updatedTaskData = {
    notes,
    status,
    User: {
      connect: { id: userId }
    },
    SubTasks:
      subTasks !== undefined
        ? {
            create: subTasks.map((subTask: SubTask) => ({
              quantity: subTask.quantity,
              notes: subTask.notes,
              status,
              Product: { connect: { id: subTask.productId } }
            }))
          }
        : undefined
  }

  const task = await ctx.prisma.task.update({
    where: { id: taskId },
    data: updatedTaskData,
    select
  })

  const transformedTask = {
    ...task,
    percentageCompleted: calculatePercentage(task.SubTasks)
  }

  res.status(200).json(transformedTask)
}

export const deleteTask = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  if (req.params.id === undefined) {
    throw new RequestError(400, 'Task ID is required')
  }

  const taskId = req.params.id

  await ctx.prisma.subTaskEvent.deleteMany({
    where: { subtaskId: { in: [parseInt(taskId)] } }
  })
  await ctx.prisma.subTask.deleteMany({
    where: { taskId: parseInt(taskId) }
  })

  await ctx.prisma.task.delete({
    where: { id: parseInt(taskId) }
  })
  res.status(204).send()
}
