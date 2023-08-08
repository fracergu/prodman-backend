export type UserCreationRequest = {
  name: string
  lastName?: string
  email: string
  password: string
  role: string
}

export type UserResponse = {
  id: number
  name: string
  lastName: string | null
  email: string
  role: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export type UserUpdateRequest = {
  name?: string
  lastName?: string
  role?: string
  active?: boolean
}

export type UserCredentialsRequest = {
  email: string
  password: string
}
