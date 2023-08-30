import { type SubtaskEvent } from '@prisma/client'
import { type Context } from '@utils/context'
import { type Request, type Response } from 'express'

export const getActiveWorkers = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  const activeWorkers = await ctx.prisma.user.findMany({
    where: {
      role: 'user',
      active: true
    },
    select: {
      id: true,
      username: true,
      name: true,
      lastName: true
    }
  })
  res.status(200).json(activeWorkers)
}

export const getTask = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  const userId = req.session?.user

  const configEntry = await ctx.prisma.appConfig.findUnique({
    where: {
      key: 'workerGetNextSubtask'
    }
  })

  if (configEntry == null) {
    res
      .status(400)
      .json({ error: "Config key 'workerGetNextSubtask' not found." })
    return
  }

  const workerGetNextSubtask = configEntry.value === 'true'

  let subtaskCondition = {}

  if (workerGetNextSubtask) {
    subtaskCondition = {
      take: 1,
      orderBy: {
        order: 'asc'
      },
      where: {
        status: 'pending'
      }
    }
  } else {
    subtaskCondition = {
      orderBy: {
        order: 'asc'
      },
      where: {
        status: 'pending'
      }
    }
  }

  const querySelect = {
    id: true,
    notes: true,
    createdAt: true,
    updatedAt: true,
    status: true,
    userId: true,
    subtasks: {
      ...subtaskCondition,
      select: {
        id: true,
        quantity: true,
        order: true,
        status: true,
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

  const task = await ctx.prisma.task.findFirst({
    where: {
      userId,
      status: 'pending',
      subtasks: {
        some: {
          status: 'pending'
        }
      }
    },
    select: querySelect
  })

  res.status(200).json(task)
}

function _getSubtaskEventsTotal(subtaskEvents: SubtaskEvent[]): number {
  if (subtaskEvents == null) {
    return 0
  }
  return subtaskEvents.reduce((sum, event) => sum + event.quantityCompleted, 0)
}

export const completeSubtask = async (
  req: Request,
  res: Response,
  ctx: Context
): Promise<void> => {
  const userId = req.session?.user

  if (userId == null) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const { quantityCompleted } = req.body as { quantityCompleted: number }
  const subtaskId = parseInt(req.params.subtaskId)

  const subtask = await ctx.prisma.subtask.findUnique({
    where: { id: subtaskId },
    include: {
      subtaskEvents: true,
      task: true,
      product: {
        include: {
          productComponents: {
            select: {
              quantity: true,
              childId: true
            }
          }
        }
      }
    }
  })

  if (subtask === null) {
    res.status(404).json({ error: 'Subtask not found.' })
    return
  }

  const subtaskEventsTotal = _getSubtaskEventsTotal(subtask.subtaskEvents)
  const totalCompleted = subtaskEventsTotal + quantityCompleted

  await ctx.prisma.subtaskEvent.create({
    data: {
      quantityCompleted,
      subtaskId
    }
  })

  await ctx.prisma.stockMovement.create({
    data: {
      quantity: quantityCompleted,
      reason: 'Subtask completion',
      userId,
      productId: subtask.productId
    }
  })

  for (const component of subtask.product.productComponents) {
    await ctx.prisma.stockMovement.create({
      data: {
        quantity: -1 * component.quantity * quantityCompleted,
        reason: 'Used in subtask completion',
        userId,
        productId: component.childId
      }
    })
  }

  if (totalCompleted >= subtask.quantity) {
    await ctx.prisma.subtask.update({
      where: { id: subtaskId },
      data: { status: 'completed' }
    })

    const allSubtasks = await ctx.prisma.subtask.findMany({
      where: { taskId: subtask.task.id }
    })

    if (allSubtasks.every(st => st.status === 'completed')) {
      await ctx.prisma.task.update({
        where: { id: subtask.task.id },
        data: { status: 'completed' }
      })
    }
  }

  res.status(200).json({ success: true })
}
