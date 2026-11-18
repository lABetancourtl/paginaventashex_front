import { ApiRequestError } from '../api/client'
import type { AdminCategoryNode } from '../features/catalog/types'
import type { HomeProductAdmin, HomeSectionAdmin } from '../features/home/types'

// ─── Límites que también valida el backend ───────────────────
export const MAX_BANNER_ITEMS = 4
export const MAX_SHELF_PRODUCTS = 4
export const MAX_SECTION_TITLE = 100

export const BANNER_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const BANNER_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
export const MAX_BANNER_IMAGE_MB = 10
export const MAX_BANNER_VIDEO_MB = 50

// Valida tipo y tamaño antes de subir; devuelve el problema o null
export function validateBannerFile(file: File): string | null {
  const isImage = BANNER_IMAGE_TYPES.includes(file.type)
  const isVideo = BANNER_VIDEO_TYPES.includes(file.type)
  if (!isImage && !isVideo) {
    return 'Formato no permitido. Usa JPG, PNG, WebP, GIF, MP4, WebM o MOV.'
  }
  if (file.size === 0) return 'El archivo está vacío.'
  const maxMb = isImage ? MAX_BANNER_IMAGE_MB : MAX_BANNER_VIDEO_MB
  if (file.size > maxMb * 1024 * 1024) {
    return `${isImage ? 'Las imágenes' : 'Los videos'} pueden pesar hasta ${maxMb} MB.`
  }
  return null
}

// Mensaje para el admin según el error de la subida
export function uploadErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.code === 'HOME_ITEM_UPLOAD_FAILED') return 'No se pudo subir, intenta de nuevo.'
    if (error.code === 'HOME_ITEM_LIMIT') return `El banner ya tiene ${MAX_BANNER_ITEMS} medios.`
    return error.message
  }
  return 'No se pudo subir, intenta de nuevo.'
}

// ─── Textos de una sección ───────────────────────────────────
export function sectionTypeLabel(section: Pick<HomeSectionAdmin, 'type'>): string {
  return section.type === 'Banner' ? 'Banner' : 'Estante de productos'
}

export function sectionDisplayName(section: HomeSectionAdmin): string {
  if (section.type === 'Banner') return 'Banner'
  return section.title ?? 'Estante sin título'
}

export function sectionContentCount(section: HomeSectionAdmin): number {
  return section.type === 'Banner' ? section.itemCount : section.productCount
}

export function sectionContentLabel(section: HomeSectionAdmin): string {
  const count = sectionContentCount(section)
  if (section.type === 'Banner') {
    return `${count} de ${MAX_BANNER_ITEMS} ${count === 1 ? 'medio' : 'medios'}`
  }
  return `${count} de ${MAX_SHELF_PRODUCTS} ${count === 1 ? 'producto' : 'productos'}`
}

export const sectionPath = (id: number) => `/admin/inicio/${id}`

// ─── Categorías de los enlaces ───────────────────────────────
// ¿La categoría elegida está activa (y su principal también)?
export function isCategoryUsable(tree: AdminCategoryNode[] | undefined, categoryId: number | null): boolean {
  if (categoryId === null || !tree) return true
  for (const root of tree) {
    if (root.id === categoryId) return root.isActive
    const child = root.children.find((c) => c.id === categoryId)
    if (child) return root.isActive && child.isActive
  }
  return false
}

// ─── Productos del estante ───────────────────────────────────
// Un producto del estante mientras se edita. isVisible es null en los recién
// agregados: el backend lo calcula al guardar (depende de sus categorías)
export interface ShelfProduct {
  productId: number
  name: string
  price: number
  finalPrice: number
  discountPercent: number | null
  catalogMainUrl: string | null
  inStock: boolean
  isActive: boolean
  isVisible: boolean | null
}

export const toShelfProduct = (product: HomeProductAdmin): ShelfProduct => ({ ...product })
