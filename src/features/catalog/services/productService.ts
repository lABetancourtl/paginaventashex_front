import { apiGet } from '../../../api/client'
import type { PagedResult } from '../../../types/api'
import type { Product, ProductSearchParams } from '../types'

export function searchProducts(params: ProductSearchParams): Promise<PagedResult<Product>> {
  return apiGet<PagedResult<Product>>('/products/search', {
    ...params,
    // Solo enviamos onSale cuando es true; si no, no filtramos por ofertas
    onSale: params.onSale ? true : undefined,
  })
}

export function getProductById(id: number): Promise<Product> {
  return apiGet<Product>(`/products/${id}`)
}