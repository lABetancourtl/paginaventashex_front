import { useState } from 'react'
import { primaryButtonClass } from '../../../components/formStyles'
import { findVariant, getColorOptions, getSizeOptions, isAvailable } from '../variants'
import type { ProductDetail } from '../types'
import { ColorPicker, SizePicker } from './VariantSelector'

const LOW_STOCK = 5

interface ProductPurchasePanelProps {
  product: ProductDetail
}

function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const { variants } = product
  const sizes = getSizeOptions(variants)
  const colors = getColorOptions(variants)

  // El color empieza en el primero con stock; la talla la elige el cliente
  const [colorId, setColorId] = useState<number | null>(() => {
    if (colors.length === 0) return null
    return colors.find((color) => isAvailable(variants, { colorId: color.id }))?.id ?? colors[0].id
  })
  const [sizeId, setSizeId] = useState<number | null>(null)

  const handleColorChange = (id: number) => {
    setColorId(id)
    // Si la talla elegida no existe en el nuevo color, se deselecciona
    if (sizeId !== null && !isAvailable(variants, { sizeId, colorId: id })) {
      setSizeId(null)
    }
  }

  // Estado derivado: la variante elegida (lo que necesitará el carrito)
  const selected = findVariant(variants, sizeId, colorId)

  // ─── Disponibilidad ───────────────────────────────────────
  let stockText = 'Disponible'
  let stockClass = 'text-ink-muted'

  if (!product.inStock || (selected && selected.stock <= 0)) {
    stockText = 'Agotado'
    stockClass = 'text-danger'
  } else if (selected && selected.stock <= LOW_STOCK) {
    stockText = `¡Últimas ${selected.stock} unidades!`
    stockClass = 'text-sale-ink'
  }

  // ─── Texto del botón según lo que falta ───────────────────
  let buttonLabel = 'Agregar a la bolsa'
  if (!product.inStock) buttonLabel = 'Agotado'
  else if (colors.length > 0 && colorId === null) buttonLabel = 'Selecciona un color'
  else if (sizes.length > 0 && sizeId === null) buttonLabel = 'Selecciona una talla'
  else if (selected && selected.stock <= 0) buttonLabel = 'Agotado'

  return (
    <div className="space-y-6">
      {colors.length > 0 && (
        <ColorPicker colors={colors} variants={variants} selectedId={colorId} onChange={handleColorChange} />
      )}

      {sizes.length > 0 && (
        <SizePicker
          sizes={sizes}
          variants={variants}
          colorId={colorId}
          selectedId={sizeId}
          onChange={setSizeId}
        />
      )}

      <div>
        <p role="status" className={`text-sm font-medium ${stockClass}`}>
          {stockText}
        </p>

        {/* PROVISIONAL: se activa cuando construyamos el carrito */}
        <button type="button" disabled className={`${primaryButtonClass} mt-3`}>
          {buttonLabel}
        </button>

        {selected && <p className="mt-3 text-xs text-ink-muted">Ref. {selected.sku}</p>}
      </div>
    </div>
  )
}

export default ProductPurchasePanel