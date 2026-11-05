import type { ProductVariant } from './types'

export interface SizeOption {
  id: number
  name: string
}

export interface ColorOption {
  id: number
  name: string
  hex: string | null
}

// Tallas únicas, en el orden en que vienen (el orden natural del backend)
export function getSizeOptions(variants: ProductVariant[]): SizeOption[] {
  const seen = new Set<number>()
  const options: SizeOption[] = []

  for (const variant of variants) {
    if (variant.sizeId !== null && !seen.has(variant.sizeId)) {
      seen.add(variant.sizeId)
      options.push({ id: variant.sizeId, name: variant.sizeName ?? '' })
    }
  }
  return options
}

// Colores únicos, en el orden en que vienen
export function getColorOptions(variants: ProductVariant[]): ColorOption[] {
  const seen = new Set<number>()
  const options: ColorOption[] = []

  for (const variant of variants) {
    if (variant.colorId !== null && !seen.has(variant.colorId)) {
      seen.add(variant.colorId)
      options.push({ id: variant.colorId, name: variant.colorName ?? '', hex: variant.colorHexCode })
    }
  }
  return options
}

interface Selection {
  sizeId?: number | null
  colorId?: number | null
}

// ¿Hay stock para esta combinación? Un valor nulo significa "cualquiera"
export function isAvailable(variants: ProductVariant[], { sizeId = null, colorId = null }: Selection): boolean {
  return variants.some(
    (variant) =>
      variant.stock > 0 &&
      (sizeId === null || variant.sizeId === sizeId) &&
      (colorId === null || variant.colorId === colorId),
  )
}

// La variante que corresponde a lo elegido (null si falta elegir algo)
export function findVariant(
  variants: ProductVariant[],
  sizeId: number | null,
  colorId: number | null,
): ProductVariant | null {
  const hasSizes = variants.some((variant) => variant.sizeId !== null)
  const hasColors = variants.some((variant) => variant.colorId !== null)

  // Sin tallas ni colores: una sola variante, elegida automáticamente
  if (!hasSizes && !hasColors) return variants[0] ?? null

  if (hasSizes && sizeId === null) return null
  if (hasColors && colorId === null) return null

  return (
    variants.find(
      (variant) =>
        (!hasSizes || variant.sizeId === sizeId) && (!hasColors || variant.colorId === colorId),
    ) ?? null
  )
}