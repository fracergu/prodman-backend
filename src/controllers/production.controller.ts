/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { type Context } from '@utils/context'
import { getIntegerParam, isValidString } from '@utils/validation'
import { type Request, type Response } from 'express'

const subtaskEventSelect = {
  id: true,
  timestamp: true,
  quantityCompleted: true,
  subtaskId: false,
  subtask: {
    select: {
      id: true,
      quantity: true,
      order: true,
      status: true,
      product: {
        select: {
          id: true,
          name: true,
          reference: true
        }
      },
      task: {
        select: {
          id: true,
          status: true,
          user: {
            select: {
              id: true,
              name: true,
              lastName: true
            }
          }
        }
      }
    }
  }
}

export const getSubtaskEvents = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  const limit = getIntegerParam(req.query.limit as string, 25)
  const page = getIntegerParam(req.query.page as string, 1)
  const userId = req.query.userId as string
  const startDate = req.query.startDate as string
  const endDate = req.query.endDate as string
  const productId = req.query.productId as string

  const whereCriteria: any = {}
  if (isValidString(userId)) {
    whereCriteria.subtask = { task: { userId: parseInt(userId) } }
  }
  if (isValidString(startDate)) {
    whereCriteria.timestamp = { gte: new Date(startDate) }
  }
  if (isValidString(endDate)) {
    whereCriteria.timestamp = { lte: new Date(endDate) }
  }
  if (isValidString(productId)) {
    whereCriteria.subtask = {
      ...whereCriteria.subtask,
      productId: parseInt(productId)
    }
  }

  const [count, subtaskEvents] = await ctx.prisma.$transaction([
    ctx.prisma.subtaskEvent.count({ where: whereCriteria }),
    ctx.prisma.subtaskEvent.findMany({
      take: limit + 1,
      skip: (page - 1) * limit,
      where: whereCriteria,
      select: subtaskEventSelect
    })
  ])

  const hasNextPage = subtaskEvents.length > limit
  if (hasNextPage) {
    subtaskEvents.pop()
  }

  res.status(200).json({
    data: subtaskEvents,
    total: count,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  })
}

export const getProductionReport = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  const userId = req.query.userId as string
  const startDate = req.query.startDate as string
  const endDate = req.query.endDate as string
  const productId = req.query.productId as string

  const whereCriteria: any = {}

  if (isValidString(userId)) {
    whereCriteria.subtask = { task: { userId: parseInt(userId) } }
  }

  if (isValidString(startDate) && isValidString(endDate)) {
    whereCriteria.timestamp = {
      gte: new Date(startDate),
      lte: new Date(endDate)
    }
  }

  if (isValidString(productId)) {
    whereCriteria.subtask = {
      ...whereCriteria.subtask,
      productId: parseInt(productId)
    }
  }

  const production = await ctx.prisma.subtaskEvent.findMany({
    where: whereCriteria,
    select: subtaskEventSelect
  })

  let totalProduced = 0
  const uniqueEmployees = new Set<number>()
  const productionByDay: Record<string, number> = {}
  const productionByEmployee: Record<string, number> = {}
  const productionByProduct: Record<string, number> = {}

  const employeesList: Record<
    string,
    { name: string; lastName: string | null }
  > = {}
  const productsList: Record<
    string,
    { name: string; reference: string | null }
  > = {}

  production.forEach(p => {
    const quantity = p.quantityCompleted || 0
    totalProduced += quantity
    uniqueEmployees.add(p.subtask.task.user.id)
    employeesList[p.subtask.task.user.id] = {
      name: p.subtask.task.user.name,
      lastName: p.subtask.task.user.lastName
    }
    productsList[p.subtask.product.id] = {
      name: p.subtask.product.name,
      reference: p.subtask.product.reference
    }

    const day = new Date(p.timestamp).toISOString().split('T')[0]
    productionByDay[day] = (productionByDay[day] || 0) + quantity

    const employeeId = p.subtask.task.user.id
    productionByEmployee[employeeId] =
      (productionByEmployee[employeeId] || 0) + quantity

    const productId = p.subtask.product.id
    productionByProduct[productId] =
      (productionByProduct[productId] || 0) + quantity
  })

  const totalEmployees = uniqueEmployees.size
  const avgProductionPerEmployee = totalProduced / (totalEmployees || 1)
  const employeeRanking = Object.entries(productionByEmployee).sort(
    ([, a], [, b]) => b - a
  )

  const highProductionDays = Object.entries(productionByDay).filter(
    ([, quantity]) => quantity > avgProductionPerEmployee
  )

  const reportData = {
    generalStats: {
      totalProduced,
      totalEmployees,
      avgProductionPerEmployee,
      highProductionDays,
      employeeRanking,
      employeesList,
      productsList
    },
    byDay: productionByDay,
    byEmployee: productionByEmployee,
    byProduct: productionByProduct
  }

  res.status(200).json(reportData)
}
