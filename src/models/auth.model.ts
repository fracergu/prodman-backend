export interface LoginBody {
  email: string
  password: string
  rememberMe: boolean
}

export interface RegisterBody {
  name: string
  lastName?: string
  email: string
  password: string
}
