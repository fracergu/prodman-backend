module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  collectCoverage: true,
  coverageReporters: ['text', 'html'],
  collectCoverageFrom: ['src/controllers/**/*.ts']
}
