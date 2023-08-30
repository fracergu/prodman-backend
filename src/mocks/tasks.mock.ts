import { type Subtask, type SubtaskEvent, type Task } from '@prisma/client'

type JoinedTask = Omit<Task, 'userId'> & {
  user: { id: number; name: string; lastName: string | null }
  subtasks: Array<Omit<Subtask, 'taskId'> & { subtaskEvents: SubtaskEvent[] }>
}

export const mockTaskArray: JoinedTask[] = [
  {
    id: 1,
    createdAt: new Date('2023-08-10T12:55:59.310Z'),
    updatedAt: new Date('2023-08-10T12:55:59.310Z'),
    notes: 'Task 2 notes',
    status: 'pending',
    user: {
      id: 4,
      name: 'Worker 8',
      lastName: null
    },
    subtasks: [
      {
        id: 2,
        order: 0,
        quantity: 8,
        status: 'pending',
        productId: 16,
        subtaskEvents: [
          {
            id: 1,
            subtaskId: 2,
            timestamp: new Date('2023-08-10T12:55:59.310Z'),
            quantityCompleted: 4
          }
        ]
      },
      {
        id: 10,
        order: 1,
        quantity: 3,
        status: 'pending',
        productId: 7,
        subtaskEvents: []
      },
      {
        id: 15,
        order: 2,
        quantity: 3,
        status: 'pending',
        productId: 35,
        subtaskEvents: []
      },
      {
        id: 21,
        order: 3,
        quantity: 10,
        status: 'pending',
        productId: 29,
        subtaskEvents: []
      },
      {
        id: 25,
        order: 4,
        quantity: 3,
        status: 'pending',
        productId: 46,
        subtaskEvents: []
      }
    ]
  },
  {
    id: 2,
    createdAt: new Date('2023-08-10T12:55:59.310Z'),
    updatedAt: new Date('2023-08-10T12:55:59.310Z'),
    notes: 'Task 0 notes',
    status: 'pending',
    user: {
      id: 4,
      name: 'Worker 8',
      lastName: null
    },
    subtasks: [
      {
        id: 3,
        order: 0,
        quantity: 10,
        status: 'pending',
        productId: 21,
        subtaskEvents: []
      },
      {
        id: 6,
        order: 1,
        quantity: 7,
        status: 'pending',
        productId: 43,
        subtaskEvents: []
      },
      {
        id: 11,
        order: 2,
        quantity: 9,
        status: 'pending',
        productId: 10,
        subtaskEvents: []
      },
      {
        id: 16,
        order: 3,
        quantity: 3,
        status: 'pending',
        productId: 10,
        subtaskEvents: []
      },
      {
        id: 20,
        order: 4,
        quantity: 7,
        status: 'pending',
        productId: 49,
        subtaskEvents: []
      }
    ]
  },
  {
    id: 3,
    createdAt: new Date('2023-08-10T12:55:59.310Z'),
    updatedAt: new Date('2023-08-10T12:55:59.310Z'),
    notes: 'Task 3 notes',
    status: 'pending',
    user: {
      id: 6,
      name: 'Worker 3',
      lastName: null
    },
    subtasks: [
      {
        id: 4,
        order: 0,
        quantity: 5,
        status: 'pending',
        productId: 10,
        subtaskEvents: []
      },
      {
        id: 8,
        order: 1,
        quantity: 1,
        status: 'pending',
        productId: 50,
        subtaskEvents: []
      },
      {
        id: 12,
        order: 2,
        quantity: 6,
        status: 'pending',
        productId: 23,
        subtaskEvents: []
      },
      {
        id: 18,
        order: 3,
        quantity: 10,
        status: 'pending',
        productId: 15,
        subtaskEvents: []
      },
      {
        id: 24,
        order: 4,
        quantity: 1,
        status: 'pending',
        productId: 50,
        subtaskEvents: []
      }
    ]
  },
  {
    id: 4,
    createdAt: new Date('2023-08-10T12:55:59.310Z'),
    updatedAt: new Date('2023-08-10T12:55:59.310Z'),
    notes: 'Task 4 notes',
    status: 'pending',
    user: {
      id: 6,
      name: 'Worker 3',
      lastName: null
    },
    subtasks: [
      {
        id: 1,
        order: 0,
        quantity: 10,
        status: 'pending',
        productId: 5,
        subtaskEvents: []
      },
      {
        id: 7,
        order: 1,
        quantity: 1,
        status: 'pending',
        productId: 35,
        subtaskEvents: []
      },
      {
        id: 13,
        order: 2,
        quantity: 1,
        status: 'pending',
        productId: 50,
        subtaskEvents: []
      },
      {
        id: 17,
        order: 3,
        quantity: 5,
        status: 'pending',
        productId: 23,
        subtaskEvents: []
      },
      {
        id: 22,
        order: 4,
        quantity: 6,
        status: 'pending',
        productId: 16,
        subtaskEvents: []
      }
    ]
  },
  {
    id: 5,
    createdAt: new Date('2023-08-10T12:55:59.310Z'),
    updatedAt: new Date('2023-08-10T12:55:59.310Z'),
    notes: 'Task 1 notes',
    status: 'pending',
    user: {
      id: 1,
      name: 'root',
      lastName: null
    },
    subtasks: [
      {
        id: 5,
        order: 0,
        quantity: 5,
        status: 'pending',
        productId: 38,
        subtaskEvents: []
      },
      {
        id: 9,
        order: 1,
        quantity: 4,
        status: 'pending',
        productId: 42,
        subtaskEvents: []
      },
      {
        id: 14,
        order: 2,
        quantity: 5,
        status: 'pending',
        productId: 28,
        subtaskEvents: []
      },
      {
        id: 19,
        order: 3,
        quantity: 2,
        status: 'pending',
        productId: 36,
        subtaskEvents: []
      },
      {
        id: 23,
        order: 4,
        quantity: 1,
        status: 'pending',
        productId: 32,
        subtaskEvents: []
      }
    ]
  }
]

type SubtaskParsed = Omit<Subtask, 'taskId'> & {
  subtaskEvents: SubtaskEvent[]
}

type TaskParsed = Omit<Task, 'userId'> & {
  user: { id: number; name: string; lastName: string | null }
  percentageCompleted: number
  subtasks: SubtaskParsed[]
}

export const mockTaskParsedArray: TaskParsed[] = [
  {
    id: 1,
    createdAt: new Date('2023-08-10T12:55:59.310Z'),
    updatedAt: new Date('2023-08-10T12:55:59.310Z'),
    notes: 'Task 2 notes',
    status: 'pending',
    user: {
      id: 4,
      name: 'Worker 8',
      lastName: null
    },
    percentageCompleted: 14.81,
    subtasks: [
      {
        id: 2,
        order: 0,
        quantity: 8,
        status: 'pending',
        productId: 16,
        subtaskEvents: [
          {
            id: 1,
            subtaskId: 2,
            timestamp: new Date('2023-08-10T12:55:59.310Z'),
            quantityCompleted: 4
          }
        ]
      },
      {
        id: 10,
        order: 1,
        quantity: 3,
        status: 'pending',
        productId: 7,
        subtaskEvents: []
      },
      {
        id: 15,
        order: 2,
        quantity: 3,
        status: 'pending',
        productId: 35,
        subtaskEvents: []
      },
      {
        id: 21,
        order: 3,
        quantity: 10,
        status: 'pending',
        productId: 29,
        subtaskEvents: []
      },
      {
        id: 25,
        order: 4,
        quantity: 3,
        status: 'pending',
        productId: 46,
        subtaskEvents: []
      }
    ]
  },
  {
    id: 2,
    createdAt: new Date('2023-08-10T12:55:59.310Z'),
    updatedAt: new Date('2023-08-10T12:55:59.310Z'),
    notes: 'Task 0 notes',
    status: 'pending',
    user: {
      id: 4,
      name: 'Worker 8',
      lastName: null
    },
    percentageCompleted: 0,
    subtasks: [
      {
        id: 3,
        order: 0,
        quantity: 10,
        status: 'pending',
        productId: 21,
        subtaskEvents: []
      },
      {
        id: 6,
        order: 1,
        quantity: 7,
        status: 'pending',
        productId: 43,
        subtaskEvents: []
      },
      {
        id: 11,
        order: 2,
        quantity: 9,
        status: 'pending',
        productId: 10,
        subtaskEvents: []
      },
      {
        id: 16,
        order: 3,
        quantity: 3,
        status: 'pending',
        productId: 10,
        subtaskEvents: []
      },
      {
        id: 20,
        order: 4,
        quantity: 7,
        status: 'pending',
        productId: 49,
        subtaskEvents: []
      }
    ]
  },
  {
    id: 3,
    createdAt: new Date('2023-08-10T12:55:59.310Z'),
    updatedAt: new Date('2023-08-10T12:55:59.310Z'),
    notes: 'Task 3 notes',
    status: 'pending',
    user: {
      id: 6,
      name: 'Worker 3',
      lastName: null
    },
    percentageCompleted: 0,
    subtasks: [
      {
        id: 4,
        order: 0,
        quantity: 5,
        status: 'pending',
        productId: 10,
        subtaskEvents: []
      },
      {
        id: 8,
        order: 1,
        quantity: 1,
        status: 'pending',
        productId: 50,
        subtaskEvents: []
      },
      {
        id: 12,
        order: 2,
        quantity: 6,
        status: 'pending',
        productId: 23,
        subtaskEvents: []
      },
      {
        id: 18,
        order: 3,
        quantity: 10,
        status: 'pending',
        productId: 15,
        subtaskEvents: []
      },
      {
        id: 24,
        order: 4,
        quantity: 1,
        status: 'pending',
        productId: 50,
        subtaskEvents: []
      }
    ]
  },
  {
    id: 4,
    createdAt: new Date('2023-08-10T12:55:59.310Z'),
    updatedAt: new Date('2023-08-10T12:55:59.310Z'),
    notes: 'Task 4 notes',
    status: 'pending',
    user: {
      id: 6,
      name: 'Worker 3',
      lastName: null
    },
    percentageCompleted: 0,
    subtasks: [
      {
        id: 1,
        order: 0,
        quantity: 10,
        status: 'pending',
        productId: 5,
        subtaskEvents: []
      },
      {
        id: 7,
        order: 1,
        quantity: 1,
        status: 'pending',
        productId: 35,
        subtaskEvents: []
      },
      {
        id: 13,
        order: 2,
        quantity: 1,
        status: 'pending',
        productId: 50,
        subtaskEvents: []
      },
      {
        id: 17,
        order: 3,
        quantity: 5,
        status: 'pending',
        productId: 23,
        subtaskEvents: []
      },
      {
        id: 22,
        order: 4,
        quantity: 6,
        status: 'pending',
        productId: 16,
        subtaskEvents: []
      }
    ]
  },
  {
    id: 5,
    createdAt: new Date('2023-08-10T12:55:59.310Z'),
    updatedAt: new Date('2023-08-10T12:55:59.310Z'),
    notes: 'Task 1 notes',
    status: 'pending',
    user: {
      id: 1,
      name: 'root',
      lastName: null
    },
    percentageCompleted: 0,
    subtasks: [
      {
        id: 5,
        order: 0,
        quantity: 5,
        status: 'pending',
        productId: 38,
        subtaskEvents: []
      },
      {
        id: 9,
        order: 1,
        quantity: 4,
        status: 'pending',
        productId: 42,
        subtaskEvents: []
      },
      {
        id: 14,
        order: 2,
        quantity: 5,
        status: 'pending',
        productId: 28,
        subtaskEvents: []
      },
      {
        id: 19,
        order: 3,
        quantity: 2,
        status: 'pending',
        productId: 36,
        subtaskEvents: []
      },
      {
        id: 23,
        order: 4,
        quantity: 1,
        status: 'pending',
        productId: 32,
        subtaskEvents: []
      }
    ]
  }
]

export const mockTaskIdividual = mockTaskArray[0]
export const mockTaskParsedIdividual: TaskParsed = {
  id: 1,
  createdAt: new Date('2023-08-10T12:55:59.310Z'),
  updatedAt: new Date('2023-08-10T12:55:59.310Z'),
  notes: 'Task 2 notes',
  status: 'pending',
  user: {
    id: 4,
    name: 'Worker 8',
    lastName: null
  },
  percentageCompleted: 14.81,
  subtasks: [
    {
      id: 2,
      order: 0,
      quantity: 8,
      status: 'pending',
      productId: 16,
      subtaskEvents: [
        {
          id: 1,
          subtaskId: 2,
          timestamp: new Date('2023-08-10T12:55:59.310Z'),
          quantityCompleted: 4
        }
      ]
    },
    {
      id: 10,
      order: 1,
      quantity: 3,
      status: 'pending',
      productId: 7,
      subtaskEvents: []
    },
    {
      id: 15,
      order: 2,
      quantity: 3,
      status: 'pending',
      productId: 35,
      subtaskEvents: []
    },
    {
      id: 21,
      order: 3,
      quantity: 10,
      status: 'pending',
      productId: 29,
      subtaskEvents: []
    },
    {
      id: 25,
      order: 4,
      quantity: 3,
      status: 'pending',
      productId: 46,
      subtaskEvents: []
    }
  ]
}
