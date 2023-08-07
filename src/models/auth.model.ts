export interface LoginBody {
  rememberMe: boolean
}

export interface RegisterBody {
  name: string
  lastName?: string
  email: string
  password: string
}
