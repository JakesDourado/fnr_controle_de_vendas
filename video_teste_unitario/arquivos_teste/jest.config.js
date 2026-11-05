module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: { '^.+\\.ts$': '@swc/jest' },
  collectCoverageFrom: ['src/utils/**/*.ts'],
}
