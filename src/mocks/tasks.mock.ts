import { type SubTask, type SubTaskEvent, type Task } from '@prisma/client'

type JoinedTask = Omit<Task, 'userId'> & {
  User: { id: number; name: string; lastName: string | null }
  SubTasks: Array<SubTask & { SubTaskEvents: SubTaskEvent[] }>
}

export const mockTaskArray: JoinedTask[] = [
  {
    id: 1,
    createdAt: new Date('2023-08-10T12:55:59.310Z'),
    notes: 'Task 2 notes',
    status: 'pending',
    User: {
      id: 4,
      name: 'Worker 8',
      lastName: null
    },
    SubTasks: [
      {
        id: 2,
        quantity: 8,
        status: 'pending',
        notes: 'Subtask 2-4 notes',
        taskId: 1,
        productId: 16,
        SubTaskEvents: [
          {
            id: 1,
            subtaskId: 2,
            date: new Date('2023-08-10T12:55:59.310Z'),
            quantityCompleted: 4
          }
        ]
      },
      {
        id: 10,
        quantity: 3,
        status: 'pending',
        notes: 'Subtask 2-3 notes',
        taskId: 1,
        productId: 7,
        SubTaskEvents: []
      },
      {
        id: 15,
        quantity: 3,
        status: 'pending',
        notes: 'Subtask 2-2 notes',
        taskId: 1,
        productId: 35,
        SubTaskEvents: []
      },
      {
        id: 21,
        quantity: 10,
        status: 'pending',
        notes: 'Subtask 2-1 notes',
        taskId: 1,
        productId: 29,
        SubTaskEvents: []
      },
      {
        id: 25,
        quantity: 3,
        status: 'pending',
        notes: 'Subtask 2-0 notes',
        taskId: 1,
        productId: 46,
        SubTaskEvents: []
      }
    ]
  },
  {
    id: 2,
    createdAt: new Date('2023-08-10T12:55:59.310Z'),
    notes: 'Task 0 notes',
    status: 'pending',
    User: {
      id: 4,
      name: 'Worker 8',
      lastName: null
    },
    SubTasks: [
      {
        id: 3,
        quantity: 10,
        status: 'pending',
        notes: 'Subtask 0-4 notes',
        taskId: 2,
        productId: 21,
        SubTaskEvents: []
      },
      {
        id: 6,
        quantity: 7,
        status: 'pending',
        notes: 'Subtask 0-3 notes',
        taskId: 2,
        productId: 43,
        SubTaskEvents: []
      },
      {
        id: 11,
        quantity: 9,
        status: 'pending',
        notes: 'Subtask 0-2 notes',
        taskId: 2,
        productId: 10,
        SubTaskEvents: []
      },
      {
        id: 16,
        quantity: 3,
        status: 'pending',
        notes: 'Subtask 0-1 notes',
        taskId: 2,
        productId: 10,
        SubTaskEvents: []
      },
      {
        id: 20,
        quantity: 7,
        status: 'pending',
        notes: 'Subtask 0-0 notes',
        taskId: 2,
        productId: 49,
        SubTaskEvents: []
      }
    ]
  },
  {
    id: 3,
    createdAt: new Date('2023-08-10T12:55:59.310Z'),
    notes: 'Task 3 notes',
    status: 'pending',
    User: {
      id: 6,
      name: 'Worker 3',
      lastName: null
    },
    SubTasks: [
      {
        id: 4,
        quantity: 5,
        status: 'pending',
        notes: 'Subtask 3-4 notes',
        taskId: 3,
        productId: 10,
        SubTaskEvents: []
      },
      {
        id: 8,
        quantity: 1,
        status: 'pending',
        notes: 'Subtask 3-3 notes',
        taskId: 3,
        productId: 50,
        SubTaskEvents: []
      },
      {
        id: 12,
        quantity: 6,
        status: 'pending',
        notes: 'Subtask 3-2 notes',
        taskId: 3,
        productId: 23,
        SubTaskEvents: []
      },
      {
        id: 18,
        quantity: 10,
        status: 'pending',
        notes: 'Subtask 3-1 notes',
        taskId: 3,
        productId: 15,
        SubTaskEvents: []
      },
      {
        id: 24,
        quantity: 1,
        status: 'pending',
        notes: 'Subtask 3-0 notes',
        taskId: 3,
        productId: 50,
        SubTaskEvents: []
      }
    ]
  },
  {
    id: 4,
    createdAt: new Date('2023-08-10T12:55:59.310Z'),
    notes: 'Task 4 notes',
    status: 'pending',
    User: {
      id: 6,
      name: 'Worker 3',
      lastName: null
    },
    SubTasks: [
      {
        id: 1,
        quantity: 10,
        status: 'pending',
        notes: 'Subtask 4-4 notes',
        taskId: 4,
        productId: 5,
        SubTaskEvents: []
      },
      {
        id: 7,
        quantity: 1,
        status: 'pending',
        notes: 'Subtask 4-3 notes',
        taskId: 4,
        productId: 35,
        SubTaskEvents: []
      },
      {
        id: 13,
        quantity: 1,
        status: 'pending',
        notes: 'Subtask 4-2 notes',
        taskId: 4,
        productId: 50,
        SubTaskEvents: []
      },
      {
        id: 17,
        quantity: 5,
        status: 'pending',
        notes: 'Subtask 4-1 notes',
        taskId: 4,
        productId: 23,
        SubTaskEvents: []
      },
      {
        id: 22,
        quantity: 6,
        status: 'pending',
        notes: 'Subtask 4-0 notes',
        taskId: 4,
        productId: 16,
        SubTaskEvents: []
      }
    ]
  },
  {
    id: 5,
    createdAt: new Date('2023-08-10T12:55:59.310Z'),
    notes: 'Task 1 notes',
    status: 'pending',
    User: {
      id: 1,
      name: 'root',
      lastName: null
    },
    SubTasks: [
      {
        id: 5,
        quantity: 5,
        status: 'pending',
        notes: 'Subtask 1-4 notes',
        taskId: 5,
        productId: 38,
        SubTaskEvents: []
      },
      {
        id: 9,
        quantity: 4,
        status: 'pending',
        notes: 'Subtask 1-3 notes',
        taskId: 5,
        productId: 42,
        SubTaskEvents: []
      },
      {
        id: 14,
        quantity: 5,
        status: 'pending',
        notes: 'Subtask 1-2 notes',
        taskId: 5,
        productId: 28,
        SubTaskEvents: []
      },
      {
        id: 19,
        quantity: 2,
        status: 'pending',
        notes: 'Subtask 1-1 notes',
        taskId: 5,
        productId: 36,
        SubTaskEvents: []
      },
      {
        id: 23,
        quantity: 1,
        status: 'pending',
        notes: 'Subtask 1-0 notes',
        taskId: 5,
        productId: 32,
        SubTaskEvents: []
      }
    ]
  }
]

type TaskParsed = Omit<Task, 'userId'> & {
  User: { id: number; name: string; lastName: string | null }
  percentageCompleted: number
  subtasks: number
  SubTasks: undefined
}

export const mockTaskParsedArray: TaskParsed[] = [
  {
    id: 1,
    createdAt: new Date('2023-08-10T12:55:59.310Z'),
    notes: 'Task 2 notes',
    status: 'pending',
    User: {
      id: 4,
      name: 'Worker 8',
      lastName: null
    },
    percentageCompleted: 14.81,
    subtasks: 5,
    SubTasks: undefined
  },
  {
    id: 2,
    createdAt: new Date('2023-08-10T12:55:59.310Z'),
    notes: 'Task 0 notes',
    status: 'pending',
    User: {
      id: 4,
      name: 'Worker 8',
      lastName: null
    },
    percentageCompleted: 0,
    subtasks: 5,
    SubTasks: undefined
  },
  {
    id: 3,
    createdAt: new Date('2023-08-10T12:55:59.310Z'),
    notes: 'Task 3 notes',
    status: 'pending',
    User: {
      id: 6,
      name: 'Worker 3',
      lastName: null
    },
    percentageCompleted: 0,
    subtasks: 5,
    SubTasks: undefined
  },
  {
    id: 4,
    createdAt: new Date('2023-08-10T12:55:59.310Z'),
    notes: 'Task 4 notes',
    status: 'pending',
    User: {
      id: 6,
      name: 'Worker 3',
      lastName: null
    },
    percentageCompleted: 0,
    subtasks: 5,
    SubTasks: undefined
  },
  {
    id: 5,
    createdAt: new Date('2023-08-10T12:55:59.310Z'),
    notes: 'Task 1 notes',
    status: 'pending',
    User: {
      id: 1,
      name: 'root',
      lastName: null
    },
    percentageCompleted: 0,
    subtasks: 5,
    SubTasks: undefined
  }
]

export const mockTaskIdividual = mockTaskArray[0]
export const mockTaskParsedIdividual = {
  id: 1,
  createdAt: new Date('2023-08-10T12:55:59.310Z'),
  notes: 'Task 2 notes',
  status: 'pending',
  User: {
    id: 4,
    name: 'Worker 8',
    lastName: null
  },
  percentageCompleted: 14.81,
  SubTasks: [
    {
      id: 2,
      quantity: 8,
      status: 'pending',
      notes: 'Subtask 2-4 notes',
      taskId: 1,
      productId: 16,
      SubTaskEvents: [
        {
          id: 1,
          subtaskId: 2,
          date: new Date('2023-08-10T12:55:59.310Z'),
          quantityCompleted: 4
        }
      ]
    },
    {
      id: 10,
      quantity: 3,
      status: 'pending',
      notes: 'Subtask 2-3 notes',
      taskId: 1,
      productId: 7,
      SubTaskEvents: []
    },
    {
      id: 15,
      quantity: 3,
      status: 'pending',
      notes: 'Subtask 2-2 notes',
      taskId: 1,
      productId: 35,
      SubTaskEvents: []
    },
    {
      id: 21,
      quantity: 10,
      status: 'pending',
      notes: 'Subtask 2-1 notes',
      taskId: 1,
      productId: 29,
      SubTaskEvents: []
    },
    {
      id: 25,
      quantity: 3,
      status: 'pending',
      notes: 'Subtask 2-0 notes',
      taskId: 1,
      productId: 46,
      SubTaskEvents: []
    }
  ]
}
