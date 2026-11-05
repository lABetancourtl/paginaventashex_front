import { apiPatch, apiPost, apiPut } from '../../../api/client'
import type { VariantRequest } from '../types'

const variantsUrl = (productId: number) => `/products/${productId}/variants`

export function createVariant(productId: number, request: VariantRequest): Promise<number> {
  return apiPost<number>(variantsUrl(productId), request)
}

export async function updateVariant(productId: number, variantId: number, request: VariantRequest): Promise<void> {
  await apiPut<boolean>(`${variantsUrl(productId)}/${variantId}`, request)
}

export async function activateVariant(productId: number, variantId: number): Promise<void> {
  await apiPatch<boolean>(`${variantsUrl(productId)}/${variantId}/activate`)
}

export async function deactivateVariant(productId: number, variantId: number): Promise<void> {
  await apiPatch<boolean>(`${variantsUrl(productId)}/${variantId}/deactivate`)
}