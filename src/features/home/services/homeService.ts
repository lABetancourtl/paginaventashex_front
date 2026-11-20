import { apiDelete, apiGet, apiPatch, apiPost, apiPostForm, apiPut, apiPutForm } from '../../../api/client'
import type {
  CreateHomeSectionRequest,
  HomeItemAdmin,
  HomePage,
  HomeProductAdmin,
  HomeSectionAdmin,
  UpdateHomeSectionRequest,
} from '../types'

// ─── Tienda ──────────────────────────────────────────────────
export function getHomePage(): Promise<HomePage> {
  return apiGet<HomePage>('/home')
}

// ─── Secciones ───────────────────────────────────────────────
const sectionsUrl = '/home/sections'

export function getHomeSections(): Promise<HomeSectionAdmin[]> {
  return apiGet<HomeSectionAdmin[]>(sectionsUrl)
}

// Retorna el id de la sección creada (nace inactiva y al final)
export function createHomeSection(request: CreateHomeSectionRequest): Promise<number> {
  return apiPost<number>(sectionsUrl, request)
}

export async function updateHomeSection(id: number, request: UpdateHomeSectionRequest): Promise<void> {
  await apiPut<unknown>(`${sectionsUrl}/${id}`, request)
}

export async function activateHomeSection(id: number): Promise<void> {
  await apiPatch<unknown>(`${sectionsUrl}/${id}/activate`)
}

export async function deactivateHomeSection(id: number): Promise<void> {
  await apiPatch<unknown>(`${sectionsUrl}/${id}/deactivate`)
}

export async function reorderHomeSection(id: number, newDisplayOrder: number): Promise<void> {
  await apiPatch<unknown>(`${sectionsUrl}/${id}/reorder`, { newDisplayOrder })
}

export async function deleteHomeSection(id: number): Promise<void> {
  await apiDelete<unknown>(`${sectionsUrl}/${id}`)
}

// ─── Medios de un banner ─────────────────────────────────────
const itemsUrl = (sectionId: number) => `${sectionsUrl}/${sectionId}/items`

export function getHomeItems(sectionId: number): Promise<HomeItemAdmin[]> {
  return apiGet<HomeItemAdmin[]>(itemsUrl(sectionId))
}

export function uploadHomeItem(
  sectionId: number,
  file: File,
  categoryId: number | null,
  onProgress?: (percent: number) => void,
): Promise<HomeItemAdmin> {
  // Sin Content-Type a mano: el navegador agrega el boundary
  const formData = new FormData()
  formData.append('file', file)
  if (categoryId !== null) formData.append('categoryId', String(categoryId))

  const isVideo = file.type.startsWith('video/')
  return apiPostForm<HomeItemAdmin>(itemsUrl(sectionId), formData, {
    timeout: isVideo ? 5 * 60 * 1000 : 60 * 1000,
    onProgress,
  })
}

// Reemplaza el enlace: con null, el medio deja de ser un enlace
export async function updateHomeItemLink(
  sectionId: number,
  itemId: number,
  categoryId: number | null,
): Promise<void> {
  await apiPut<unknown>(`${itemsUrl(sectionId)}/${itemId}`, { categoryId })
}

export async function reorderHomeItem(sectionId: number, itemId: number, newDisplayOrder: number): Promise<void> {
  await apiPatch<unknown>(`${itemsUrl(sectionId)}/${itemId}/reorder`, { newDisplayOrder })
}

export async function deleteHomeItem(sectionId: number, itemId: number): Promise<void> {
  await apiDelete<unknown>(`${itemsUrl(sectionId)}/${itemId}`)
}

// Versión para celular (4:5) de un medio. Solo se permite con un banner de un único medio
export function setHomeItemMobile(
  sectionId: number,
  itemId: number,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<HomeItemAdmin> {
  const formData = new FormData()
  formData.append('file', file)
  return apiPutForm<HomeItemAdmin>(`${itemsUrl(sectionId)}/${itemId}/mobile`, formData, { onProgress })
}

export async function removeHomeItemMobile(sectionId: number, itemId: number): Promise<void> {
  await apiDelete<unknown>(`${itemsUrl(sectionId)}/${itemId}/mobile`)
}

// ─── Productos de un estante ─────────────────────────────────
const productsUrl = (sectionId: number) => `${sectionsUrl}/${sectionId}/products`

export function getHomeProducts(sectionId: number): Promise<HomeProductAdmin[]> {
  return apiGet<HomeProductAdmin[]>(productsUrl(sectionId))
}

// La lista completa y en orden: reemplaza la anterior
export async function setHomeProducts(sectionId: number, productIds: number[]): Promise<void> {
  await apiPut<unknown>(productsUrl(sectionId), { productIds })
}
