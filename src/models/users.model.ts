export interface UserCreationRequest {
  name: string
  lastName?: string
  username: string
  password: string
  role: string
}

export interface UserResponse {
  id: number
  name: string
  lastName: string | null
  username: string
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
  username: string
  password: string
}
