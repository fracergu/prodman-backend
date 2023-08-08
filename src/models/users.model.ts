export interface UserCreationRequest {
  name: string
  lastName?: string
  email: string
  password: string
  role: string
}

export interface UserResponse {
  id: number
  name: string
  lastName: string | null
  email: string
  role: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserUpdateRequest {
  name?: string
  lastName?: string
  role?: string
  active?: boolean
}

export interface UserCredentialsRequest {
  currentPassword: string
  email: string
  password: string
}
