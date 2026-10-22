import type { ProductSearchParams } from './types'

export const categoryKeys = {
  all: ['categories'] as const,
  tree: ['categories', 'tree'] as const,
}

export const productKeys = {
  all: ['products'] as const,
  search: (params: ProductSearchParams) => ['products', 'search', params] as const,
  detail: (id: number) => ['products', 'detail', id] as const,
}