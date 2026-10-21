import type { ProductSearchParams } from './types'

export const categoryKeys = {
  all: ['categories'] as const,
  tree: ['categories', 'tree'] as const,
}

export const productKeys = {
  all: ['products'] as const,
  // Cada combinación de filtros es una entrada distinta en la caché
  search: (params: ProductSearchParams) => ['products', 'search', params] as const,
}