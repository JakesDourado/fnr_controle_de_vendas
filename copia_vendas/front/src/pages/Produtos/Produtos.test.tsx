import React from 'react'
import { render, screen, waitFor, waitForElementToBeRemoved, fireEvent } from '@testing-library/react'
import Produtos from './Produtos'
import api from '../../services/api'

// Força o mock local do módulo api
jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
  },
}))

const mockApi = api as jest.Mocked<typeof api>

describe('Produtos Component Tests', () => {
  const mockProdutos = [
    {
      id: 10,
      tipo: 'Mouse Gamer',
      quantidade: 50,
      valorUnit: 10,
      valorTotal: 500,
      unidadeMedida: 'UN',
      categoria: { id: 1, nome: 'Informática' },
      ativo: true,
    },
  ]

  const mockCategorias = [
    { id: 1, nome: 'Informática' },
    { id: 2, nome: 'Móveis' },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock padrão do GET de listagem de produtos e categorias
    mockApi.get.mockImplementation((url) => {
      if (url.startsWith('/produtos')) {
        return Promise.resolve({ data: mockProdutos })
      }
      if (url === '/categorias') {
        return Promise.resolve({ data: mockCategorias })
      }
      return Promise.reject(new Error('Unknown URL'))
    })
  })

  // Função utilitária para obter elementos de input a partir de seu label
  const getInputByLabel = (labelText: string) => {
    const label = screen.getAllByText(labelText).find(el => el.tagName.toLowerCase() === 'label')
    if (!label) throw new Error(`Label com o texto "${labelText}" não foi encontrado.`)
    return label.nextElementSibling as HTMLInputElement | HTMLSelectElement
  }

  // Teste 5: Renders list of products (Fluxo Feliz)
  it('should render the list of products with correct table headers and row values', async () => {
    render(<Produtos />)

    expect(screen.getByText('Carregando...')).toBeInTheDocument()

    await waitForElementToBeRemoved(() => screen.queryByText('Carregando...'))

    // Valida cabeçalhos da tabela
    expect(screen.getByText('Tipo')).toBeInTheDocument()
    expect(screen.getByText('Valor Unit.')).toBeInTheDocument()
    expect(screen.getByText('Ações')).toBeInTheDocument()

    // Valida valores do produto renderizado na linha da tabela
    expect(screen.getByText('Mouse Gamer')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('R$ 10.00')).toBeInTheDocument()
    expect(screen.getByText('R$ 500.00')).toBeInTheDocument()
    expect(screen.getByText('UN')).toBeInTheDocument()
    expect(screen.getByText('Informática')).toBeInTheDocument()

    // Valida botões de ação
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Inativar' })).toBeInTheDocument()
  })

  // Teste 6: Opens "Novo Produto" modal and handles close (Fluxo Feliz)
  it('should open the "Novo Produto" modal and close it when Cancelar is clicked', async () => {
    render(<Produtos />)
    await waitForElementToBeRemoved(() => screen.queryByText('Carregando...'))

    // Clica em Novo Produto
    fireEvent.click(screen.getByRole('button', { name: '+ Novo Produto' }))

    // Confirma que o modal abriu com título correto
    expect(screen.getByRole('heading', { name: 'Novo Produto', level: 3 })).toBeInTheDocument()

    // Clica em Cancelar
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    // Confirma que o modal sumiu
    expect(screen.queryByRole('heading', { name: 'Novo Produto', level: 3 })).not.toBeInTheDocument()
  })

  // Teste 7: Creates new product successfully (Fluxo Feliz)
  it('should save a new product and refetch list when all required fields are filled correctly', async () => {
    mockApi.post.mockResolvedValue({ data: { id: 11 } })

    render(<Produtos />)
    await waitForElementToBeRemoved(() => screen.queryByText('Carregando...'))

    // Abre o modal
    fireEvent.click(screen.getByRole('button', { name: '+ Novo Produto' }))

    // Preenche os inputs
    fireEvent.change(getInputByLabel('Tipo *'), { target: { value: 'Teclado Mecânico' } })
    fireEvent.change(getInputByLabel('Quantidade *'), { target: { value: '20' } })
    fireEvent.change(getInputByLabel('Valor Unit. *'), { target: { value: '150.50' } })
    fireEvent.change(getInputByLabel('Valor Total *'), { target: { value: '3010.00' } })
    fireEvent.change(getInputByLabel('Unidade Medida'), { target: { value: 'UN' } })
    fireEvent.change(getInputByLabel('Categoria'), { target: { value: '1' } }) // Categoria de Informática (ID 1)

    // Clica em Salvar
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/produtos', {
        tipo: 'Teclado Mecânico',
        quantidade: 20,
        valorUnit: 150.5,
        valorTotal: 3010,
        unidadeMedida: 'UN',
        categoriaId: 1,
      })
    })

    // Modal deve sumir
    expect(screen.queryByRole('heading', { name: 'Novo Produto', level: 3 })).not.toBeInTheDocument()
  })

  // Teste 8: Shows API error on product creation failure (Fluxo Triste)
  it('should display the error message from the API when saving a product fails', async () => {
    // Simula erro retornado do backend
    mockApi.post.mockRejectedValue({
      response: {
        data: {
          detail: 'O campo "Tipo" já existe no sistema.',
        },
      },
    })

    render(<Produtos />)
    await waitForElementToBeRemoved(() => screen.queryByText('Carregando...'))

    // Abre modal
    fireEvent.click(screen.getByRole('button', { name: '+ Novo Produto' }))

    // Preenche Tipo Duplicado
    fireEvent.change(getInputByLabel('Tipo *'), { target: { value: 'Mouse Gamer' } })

    // Clica em Salvar
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    // Confirma que a mensagem de erro da API foi renderizada na tela
    expect(await screen.findByText('O campo "Tipo" já existe no sistema.')).toBeInTheDocument()

    // O modal deve permanecer aberto
    expect(screen.getByRole('heading', { name: 'Novo Produto', level: 3 })).toBeInTheDocument()
  })

  // Teste 9: Edits product successfully (Fluxo Feliz)
  it('should load product data, edit values and send a PUT request on save', async () => {
    mockApi.put.mockResolvedValue({ data: { ...mockProdutos[0], tipo: 'Mouse Gamer Pro' } })

    render(<Produtos />)
    await waitForElementToBeRemoved(() => screen.queryByText('Carregando...'))

    // Clica no botão Editar da primeira linha
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }))

    // Confirma que o modal de edição abriu com os dados carregados
    expect(screen.getByRole('heading', { name: 'Editar Produto', level: 3 })).toBeInTheDocument()
    expect((getInputByLabel('Tipo *') as HTMLInputElement).value).toBe('Mouse Gamer')

    // Altera o nome/tipo
    fireEvent.change(getInputByLabel('Tipo *'), { target: { value: 'Mouse Gamer Pro' } })

    // Clica em Salvar
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => {
      expect(mockApi.put).toHaveBeenCalledWith('/produtos/10', {
        tipo: 'Mouse Gamer Pro',
        quantidade: 50,
        valorUnit: 10,
        valorTotal: 500,
        unidadeMedida: 'UN',
        categoriaId: 1,
      })
    })

    // Modal deve sumir
    expect(screen.queryByRole('heading', { name: 'Editar Produto', level: 3 })).not.toBeInTheDocument()
  })

  // Teste 10: Inactivates product (Fluxo Feliz)
  it('should call the inactivate API patch when the Inativar button is clicked', async () => {
    mockApi.patch.mockResolvedValue({})

    render(<Produtos />)
    await waitForElementToBeRemoved(() => screen.queryByText('Carregando...'))

    // Clica em Inativar
    fireEvent.click(screen.getByRole('button', { name: 'Inativar' }))

    await waitFor(() => {
      expect(mockApi.patch).toHaveBeenCalledWith('/produtos/10/inativar')
    })
  })
})
