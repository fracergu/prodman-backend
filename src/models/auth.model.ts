export interface LoginRequest {
  rememberMe: boolean
}

export interface RegisterRequest {
  name: string
  lastName?: string
  username: string
  password: string
}
