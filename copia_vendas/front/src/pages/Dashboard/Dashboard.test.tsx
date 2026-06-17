import React from 'react'
import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import Dashboard from './Dashboard'
import api from '../../services/api'

// Força o mock local do módulo api
jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}))

const mockApi = api as jest.Mocked<typeof api>

describe('Dashboard Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Teste 1: Renders loading state initially
  it('should render the loading state initially', () => {
    // Retorna uma promessa que não se resolve imediatamente
    mockApi.get.mockReturnValue(new Promise(() => {}))

    render(<Dashboard />)

    expect(screen.getByText('Carregando...')).toBeInTheDocument()
  })

  // Teste 2: Renders cards with correct counts (Fluxo Feliz)
  it('should render total counts for Clientes, Fornecedores, and Produtos after data loads', async () => {
    const mockClientes = [
      { id: 1, nome: 'Cliente A' },
      { id: 2, nome: 'Cliente B' },
    ]
    const mockFornecedores = [
      { id: 1, razaoSocial: 'Fornecedor X' },
      { id: 2, razaoSocial: 'Fornecedor Y' },
      { id: 3, razaoSocial: 'Fornecedor Z' },
    ]
    const mockProdutos = [
      { id: 1, tipo: 'Produto 1' },
      { id: 2, tipo: 'Produto 2' },
      { id: 3, tipo: 'Produto 3' },
      { id: 4, tipo: 'Produto 4' },
    ]
    const mockPedidos = [
      { id: 1, clienteId: 1, dtPedido: '2026-06-15T10:00:00.000Z' },
    ]

    mockApi.get.mockImplementation((url) => {
      if (url === '/clientes') return Promise.resolve({ data: mockClientes })
      if (url === '/fornecedores') return Promise.resolve({ data: mockFornecedores })
      if (url === '/produtos') return Promise.resolve({ data: mockProdutos })
      if (url === '/pedidos') return Promise.resolve({ data: mockPedidos })
      return Promise.reject(new Error('Unknown URL'))
    })

    render(<Dashboard />)

    // Aguarda o sumiço do loading
    await waitForElementToBeRemoved(() => screen.queryByText('Carregando...'))

    // Valida o título do Dashboard
    expect(screen.getByRole('heading', { name: 'Dashboard', level: 2 })).toBeInTheDocument()

    // Valida os valores renderizados nos cards de estatísticas
    expect(screen.getByText('2')).toBeInTheDocument() // Clientes
    expect(screen.getByText('3')).toBeInTheDocument() // Fornecedores
    expect(screen.getByText('4')).toBeInTheDocument() // Produtos

    expect(screen.getByText('Clientes')).toBeInTheDocument()
    expect(screen.getByText('Fornecedores')).toBeInTheDocument()
    expect(screen.getByText('Produtos')).toBeInTheDocument()
  })

  // Teste 3: Renders charts with data (Fluxo Feliz)
  it('should calculate and display chart components without "Sem dados" when records exist', async () => {
    const mockClientes = [{ id: 1, nome: 'Cliente A' }]
    const mockFornecedores = []
    const mockProdutos = []
    const mockPedidos = [
      { id: 1, clienteId: 1, dtPedido: '2026-06-15T10:00:00.000Z' },
      { id: 2, clienteId: 1, dtPedido: '2026-06-17T12:00:00.000Z' },
    ]

    mockApi.get.mockImplementation((url) => {
      if (url === '/clientes') return Promise.resolve({ data: mockClientes })
      if (url === '/fornecedores') return Promise.resolve({ data: mockFornecedores })
      if (url === '/produtos') return Promise.resolve({ data: mockProdutos })
      if (url === '/pedidos') return Promise.resolve({ data: mockPedidos })
      return Promise.reject(new Error('Unknown URL'))
    })

    render(<Dashboard />)

    await waitForElementToBeRemoved(() => screen.queryByText('Carregando...'))

    // Verifica se os cabeçalhos dos gráficos aparecem
    expect(screen.getByRole('heading', { name: 'Pedidos por Cliente', level: 3 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Pedidos por Mês', level: 3 })).toBeInTheDocument()

    // Como há dados, o texto fallback "Sem dados" não deve estar na tela
    expect(screen.queryByText('Sem dados')).not.toBeInTheDocument()
  })

  // Teste 4: Handles empty state gracefully (Fluxo Feliz - Casos Vazios)
  it('should render zeroes and empty fallbacks when API returns empty lists', async () => {
    mockApi.get.mockImplementation((url) => {
      if (url === '/clientes') return Promise.resolve({ data: [] })
      if (url === '/fornecedores') return Promise.resolve({ data: [] })
      if (url === '/produtos') return Promise.resolve({ data: [] })
      if (url === '/pedidos') return Promise.resolve({ data: [] })
      return Promise.reject(new Error('Unknown URL'))
    })

    render(<Dashboard />)

    await waitForElementToBeRemoved(() => screen.queryByText('Carregando...'))

    // Todos os cards devem mostrar "0"
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThanOrEqual(3)

    // Deve exibir o fallback de "Sem dados" para ambos os gráficos
    const semDados = screen.getAllByText('Sem dados')
    expect(semDados.length).toBe(2)
  })
})
