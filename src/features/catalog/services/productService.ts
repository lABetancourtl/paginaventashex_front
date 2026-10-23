import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '../../../api/client'
import type { PagedResult } from '../../../types/api'
import type {
  AdminProductSearchParams,
  CreateProductRequest,
  Product,
  ProductSearchParams,
  UpdateProductRequest,
} from '../types'

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

// ─── Panel admin ─────────────────────────────────────────────
export function searchAdminProducts(params: AdminProductSearchParams): Promise<PagedResult<Product>> {
  return apiGet<PagedResult<Product>>('/products/admin', params)
}

export async function activateProduct(id: number): Promise<void> {
  await apiPatch<boolean>(`/products/${id}/activate`)
}

export async function deactivateProduct(id: number): Promise<void> {
  await apiPatch<boolean>(`/products/${id}/deactivate`)
}

export function getAdminProduct(id: number): Promise<Product> {
  return apiGet<Product>(`/products/admin/${id}`)
}

// Retorna el id del producto creado
export function createProduct(request: CreateProductRequest): Promise<number> {
  return apiPost<number>('/products', request)
}

export async function updateProduct(id: number, request: UpdateProductRequest): Promise<void> {
  await apiPut<boolean>(`/products/${id}`, request)
}

export async function setProductDiscount(id: number, discountPercent: number): Promise<void> {
  await apiPut<unknown>(`/products/${id}/discount`, { discountPercent })
}

export async function removeProductDiscount(id: number): Promise<void> {
  await apiDelete<unknown>(`/products/${id}/discount`)
}