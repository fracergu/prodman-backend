module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@exceptions/(.*)$': '<rootDir>/src/exceptions/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1'
  },
  clearMocks: true,
  collectCoverage: true,
  coverageReporters: ['text', 'html'],
  collectCoverageFrom: ['src/controllers/**/*.ts', 'src/middlewares/**/*.ts']
}
