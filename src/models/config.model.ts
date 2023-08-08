export interface ConfigRequest {
  key: string
  value: string
}

export enum ConfigurationKeys {
  REGISTER_ENABLED = 'registerEnabled'
}

export enum ConfigurationValueTypes {
  BOOLEAN = 'boolean',
  STRING = 'string',
  NUMBER = 'number'
}

export interface DatabaseConfig {
  key: ConfigurationKeys
  type: ConfigurationValueTypes
  value: string
}
