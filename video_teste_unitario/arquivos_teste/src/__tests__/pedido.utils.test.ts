import { calcularValorItem, calcularTotalPedido } from '../utils/pedido.utils'

describe('calcularValorItem', () => {
  test('deve multiplicar quantidade pelo valor unitário', () => {
    // Arrange
    const quantidade = 3
    const valorUnit = 10.5
    // Act
    const resultado = calcularValorItem(quantidade, valorUnit)
    // Assert
    expect(resultado).toBe(31.5)
  })

  test('deve recusar quantidade igual a zero', () => {
    expect(() => calcularValorItem(0, 10)).toThrow('Quantidade deve ser maior que zero')
  })

  test('deve recusar valor unitário negativo', () => {
    expect(() => calcularValorItem(2, -5)).toThrow('Valor unitário não pode ser negativo')
  })
})

describe('calcularTotalPedido', () => {
  test('deve somar o valor de todos os itens', () => {
    const itens = [
      { quantidade: 2, valorUnit: 50 },
      { quantidade: 1, valorUnit: 19.9 },
    ]
    expect(calcularTotalPedido(itens)).toBe(119.9)
  })

  test('deve retornar zero quando o pedido não tem itens', () => {
    expect(calcularTotalPedido([])).toBe(0)
  })
})
