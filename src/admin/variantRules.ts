import type { AdminProductVariant, SizeGroup } from '../features/catalog/types'

// required: hay que elegirlo · optional: se puede dejar vacío · hidden: no se ofrece
export type AttributeMode = 'required' | 'optional' | 'hidden'

export interface VariantRules {
  sizeMode: AttributeMode       // Al agregar una variante
  colorMode: AttributeMode
  lockedGroup: SizeGroup | null // Grupo de tallas que ya usa el producto
  canAdd: boolean
  canEditAttributes: boolean    // Solo si es la única variante, contando las desactivadas
  isSimple: boolean             // Una sola variante, sin talla ni color
}

export function getVariantRules(variants: AdminProductVariant[]): VariantRules {
  const canEditAttributes = variants.length === 1
  const isSimple =
    variants.length === 1 && variants[0].sizeId === null && variants[0].colorId === null

  const active = variants.filter((variant) => variant.isActive)

  // Sin variantes activas, no hay atributos que respetar
  if (active.length === 0) {
    return {
      sizeMode: 'optional',
      colorMode: 'optional',
      lockedGroup: null,
      canAdd: true,
      canEditAttributes,
      isSimple,
    }
  }

  const usesSize = active.some((variant) => variant.sizeId !== null)
  const usesColor = active.some((variant) => variant.colorId !== null)

  return {
    sizeMode: usesSize ? 'required' : 'hidden',
    colorMode: usesColor ? 'required' : 'hidden',
    lockedGroup: active.find((variant) => variant.sizeGroup !== null)?.sizeGroup ?? null,
    // Sin talla ni color, otra variante repetiría la misma combinación
    canAdd: usesSize || usesColor,
    canEditAttributes,
    isSimple,
  }
}