export interface LoginRequest {
  rememberMe: boolean
}

export interface RegisterRequest {
  name: string
  lastName?: string
  email: string
  password: string
}
