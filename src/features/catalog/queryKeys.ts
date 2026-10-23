import type { AdminProductSearchParams, ProductSearchParams } from './types'

export const categoryKeys = {
  all: ['categories'] as const,
  tree: ['categories', 'tree'] as const,
  adminTree: ['categories', 'admin', 'tree'] as const,
}

export const productKeys = {
  all: ['products'] as const,
  search: (params: ProductSearchParams) => ['products', 'search', params] as const,
  detail: (id: number) => ['products', 'detail', id] as const,
  admin: (params: AdminProductSearchParams) => ['products', 'admin', params] as const,
  adminDetail: (id: number) => ['products', 'admin-detail', id] as const,
}