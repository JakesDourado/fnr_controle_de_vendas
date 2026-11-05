export interface ItemPedido {
  quantidade: number
  valorUnit: number
}

// Calcula o valor de um item: quantidade x valor unitário
export function calcularValorItem(quantidade: number, valorUnit: number): number {
  if (quantidade <= 0) {
    throw new Error('Quantidade deve ser maior que zero')
  }
  if (valorUnit < 0) {
    throw new Error('Valor unitário não pode ser negativo')
  }
  return Number((quantidade * valorUnit).toFixed(2))
}

// Soma o valor de todos os itens do pedido
export function calcularTotalPedido(itens: ItemPedido[]): number {
  const total = itens.reduce(
    (soma, item) => soma + calcularValorItem(item.quantidade, item.valorUnit),
    0,
  )
  return Number(total.toFixed(2))
}
