import { apiDelete, apiPatch, apiPostForm } from '../../../api/client'

export type MediaKind = 'image' | 'video'

export function uploadProductMedia(
  productId: number,
  kind: MediaKind,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<unknown> {
  const formData = new FormData()
  formData.append('file', file) // El nombre del campo que espera el backend

  const path = kind === 'image' ? 'images' : 'video'
  return apiPostForm<unknown>(`/products/${productId}/media/${path}`, formData, {
    timeout: kind === 'video' ? 5 * 60 * 1000 : 60 * 1000,
    onProgress,
  })
}

export async function deleteProductMedia(productId: number, mediaId: number): Promise<void> {
  await apiDelete<unknown>(`/products/${productId}/media/${mediaId}`)
}

export async function reorderProductMedia(
  productId: number,
  mediaId: number,
  newDisplayOrder: number,
): Promise<void> {
  await apiPatch<unknown>(`/products/${productId}/media/reorder`, { mediaId, newDisplayOrder })
}