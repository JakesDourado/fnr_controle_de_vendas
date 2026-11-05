module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: { '^.+\\.ts$': '@swc/jest' },
  setupFiles: ['<rootDir>/src/testes/setup.ts'],
}
