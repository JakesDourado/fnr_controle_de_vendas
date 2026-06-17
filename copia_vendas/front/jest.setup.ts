import '@testing-library/jest-dom'

// Mock de react-chartjs-2 para evitar erros de Canvas/Chart.js nos testes
jest.mock('react-chartjs-2', () => ({
  Bar: () => null,
  Line: () => null,
  Pie: () => null,
  Doughnut: () => null,
}))

// Mock do módulo chart.js/auto para não disparar inicializações que dependem do browser completo
jest.mock('chart.js/auto', () => ({}))

// Mock global do serviço Axios 'api'
jest.mock('./src/services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  },
}))
