export interface AppConfig {
  registerEnabled: boolean
  workerAutoTimeout: number
  workerGetNextSubtask: boolean
}

export enum ConfigurationKey {
  REGISTER_ENABLED = 'registerEnabled',
  WORKER_AUTO_TIMEOUT = 'workerAutoTimeout',
  WORKER_GET_NEXT_SUBTASK = 'workerGetNextSubtask'
}

export enum ConfigurationValueTypes {
  BOOLEAN = 'boolean',
  STRING = 'string',
  NUMBER = 'number'
}

export interface DatabaseConfig {
  key: ConfigurationKey
  type: ConfigurationValueTypes
  value: string
}
