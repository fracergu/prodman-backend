import { type ProductResponse } from './products.model'
import { type UserResponse } from './users.model'

export enum TaskStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface TaskRequest {
  notes?: string
  userId: number
  subtasks: SubtaskRequest[]
  status: TaskStatus
}

export interface SubtaskRequest {
  order: number
  productId: number
  quantity: number
  status: TaskStatus
}

export interface TaskResponse {
  id: number
  notes?: string
  status: TaskStatus
  user: UserTaskResponse
  subtasks: SubtaskResponse[]
}

export interface SubtaskResponse {
  id: number
  order: number
  quantity: number
  status: TaskStatus
  product: ProductSubtaskResponse
  events: SubtaskEvent[]
}

export interface SubtaskEvent {
  id: number
  date: Date
  quantityCompleted: number
}

export type UserTaskResponse = Pick<UserResponse, 'id' | 'name' | 'lastName'>

export type ProductSubtaskResponse = Pick<ProductResponse, 'id' | 'name'>
