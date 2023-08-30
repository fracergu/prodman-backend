import { RequestError } from '@exceptions/RequestError'
import { type TaskRequest } from '@models/tasks.model'
import { type Subtask, type SubtaskEvent } from '@prisma/client'
import { type Context } from '@utils/context'
import { getIntegerParam, isValidString } from '@utils/validation'
import { type Request, type Response } from 'express'

const querySelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  notes: true,
  status: true,
  userId: false,
  user: {
    select: { id: true, name: true, lastName: true }
  },
  subtasks: {
    select: {
      id: true,
      order: true,
      quantity: true,
      status: true,
      productId: false,
      taskId: false,
      product: {
        select: {
          id: true,
          name: true
        }
      },
      subtaskEvents: true
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
  const fromDate = req.query.startDate as string

  const whereCriteria: any = {}
  if (isValidString(userId)) {
    whereCriteria.userId = parseInt(userId)
  }
  if (isValidString(status)) {
    whereCriteria.status = status
  }
  if (isValidString(fromDate)) {
    whereCriteria.createdAt = { gte: new Date(fromDate) }
  }

  const [count, tasks] = await ctx.prisma.$transaction([
    ctx.prisma.task.count({ where: whereCriteria }),
    ctx.prisma.task.findMany({
      take: limit + 1,
      skip: (page - 1) * limit,
      where: whereCriteria,
      select: querySelect
    })
  ])

  const hasNextPage = tasks.length > limit
  if (hasNextPage) {
    tasks.pop()
  }

  const transformedTasks = tasks.map(task => ({
    ...task,
    percentageCompleted: calculatePercentage(task.subtasks),
    subtasks: _orderSubtasks(task.subtasks)
  }))

  res.status(200).json({
    data: transformedTasks,
    total: count,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  })
}

// FIXME: This should be done by Prismas
function _orderSubtasks(subtasks: Subtask[]): Subtask[] {
  return subtasks.sort((a, b) => a.order - b.order)
}

type SelectedSubtask = Omit<Subtask, 'taskId'> & {
  subtaskEvents: Array<
    Omit<SubtaskEvent, 'subtaskId'> & {
      id: number
      timestamp: Date
      quantityCompleted: number
    }
  >
}

function calculatePercentage(subtasks: SelectedSubtask[]): number {
  const totalQuantity = subtasks.reduce<number>(
    (sum, st) => sum + st.quantity,
    0
  )
  const completedQuantity = subtasks.reduce<number>(
    (sum, st) =>
      sum +
      st.subtaskEvents.reduce<number>(
        (eSum, event) => eSum + event.quantityCompleted,
        0
      ),
    0
  )

  const roundedValue =
    Math.round((completedQuantity / totalQuantity) * 10000) / 100

  return totalQuantity > 0 ? roundedValue : 0
}

export const createTask = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  const taskRequest = req.body as TaskRequest

  const { notes, status, userId, subtasks } = taskRequest

  if (userId === undefined || subtasks === undefined) {
    throw new RequestError(400, 'Missing required fields')
  }

  const newTaskData = {
    notes,
    status: status !== undefined ? status : 'pending',
    user: {
      connect: { id: userId }
    },
    subtasks: {
      create: subtasks?.map((subtask, idx) => ({
        order: idx,
        quantity: subtask.quantity,
        status: subtask.status !== undefined ? subtask.status : 'pending',
        product: {
          connect: { id: subtask.productId }
        }
      }))
    }
  }

  const task = await ctx.prisma.task.create({
    data: newTaskData,
    select: querySelect
  })

  const tranformedTask = {
    ...task,
    percentageCompleted: calculatePercentage(task.subtasks),
    subtasks: _orderSubtasks(task.subtasks)
  }

  res.status(201).json(tranformedTask)
}

export const updateTask = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  if (req.params.id === undefined || isNaN(parseInt(req.params.id))) {
    throw new RequestError(400, 'Invalid task ID')
  }

  const taskId = parseInt(req.params.id)
  const { notes, userId, status, subtasks } = req.body as TaskRequest

  if (status !== undefined) {
    await ctx.prisma.subtask.updateMany({
      where: { taskId },
      data: { status }
    })
  }

  if (subtasks !== undefined && Array.isArray(subtasks)) {
    await ctx.prisma.subtask.deleteMany({ where: { taskId } })
  }

  const updatedTaskData = {
    notes,
    status,
    user: {
      connect: { id: userId }
    },
    subtasks:
      subtasks !== undefined
        ? {
            create: subtasks.map((subtask: any, idx: number) => ({
              order: idx,
              quantity: subtask.quantity,
              status,
              product: { connect: { id: subtask.productId } }
            }))
          }
        : undefined
  }

  const task = await ctx.prisma.task.update({
    where: { id: taskId },
    data: updatedTaskData,
    select: querySelect
  })

  const transformedTask = {
    ...task,
    percentageCompleted: calculatePercentage(task.subtasks),
    subtasks: _orderSubtasks(task.subtasks)
  }

  res.status(200).json(transformedTask)
}

export const deleteTask = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  if (req.params.id === undefined || isNaN(parseInt(req.params.id))) {
    throw new RequestError(400, 'Invalid task ID')
  }

  const taskId = req.params.id

  await ctx.prisma.subtaskEvent.deleteMany({
    where: { subtaskId: { in: [parseInt(taskId)] } }
  })
  await ctx.prisma.subtask.deleteMany({
    where: { taskId: parseInt(taskId) }
  })

  await ctx.prisma.task.delete({
    where: { id: parseInt(taskId) }
  })
  res.status(204).send()
}
