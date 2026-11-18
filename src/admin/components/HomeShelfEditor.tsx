import { useState } from 'react'
import { ArrowDown, ArrowUp, EyeOff, ImageOff, PackagePlus, Plus, X } from 'lucide-react'
import HomeProductPickerDialog from './HomeProductPickerDialog'
import StatusBadge from './StatusBadge'
import type { Product } from '../../features/catalog/types'
import { cloudinaryUrl } from '../../utils/cloudinary'
import { formatCOP } from '../../utils/formatters'
import { MAX_SHELF_PRODUCTS } from '../homeSections'
import type { ShelfProduct } from '../homeSections'
import { adminIconButtonClass, adminPrimaryButtonClass, adminSmallButtonClass } from '../adminStyles'

const fromSearchResult = (product: Product): ShelfProduct => ({
  productId: product.id,
  name: product.name,
  price: product.price,
  finalPrice: product.finalPrice,
  discountPercent: product.discountPercent,
  catalogMainUrl: product.catalogMainUrl,
  inStock: product.inStock ?? true,
  isActive: product.isActive,
  // Si está desactivado ya sabemos que no se verá; si no, se sabrá al guardar
  isVisible: product.isActive ? null : false,
})

// Los cambios quedan en borrador: "Guardar" y "Descartar" están en la barra de la página
interface HomeShelfEditorProps {
  products: ShelfProduct[]
  onChange: (products: ShelfProduct[]) => void
  isSaving: boolean
}

function HomeShelfEditor({ products, onChange, isSaving }: HomeShelfEditorProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const isFull = products.length >= MAX_SHELF_PRODUCTS

  const move = (index: number, direction: -1 | 1) => {
    const next = [...products]
    const target = index + direction
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  const removeAt = (index: number) => onChange(products.filter((_, i) => i !== index))

  const add = (product: Product) => {
    if (isFull || products.some((p) => p.productId === product.id)) return
    onChange([...products, fromSearchResult(product)])
  }

  return (
    <div className="space-y-3">
      {products.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-ink/20 px-4 py-8 text-center">
          <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-admin-bg text-ink-muted">
            <PackagePlus size={20} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <p className="text-sm font-medium">El estante no tiene productos</p>
          <p className="mt-1 text-xs text-ink-muted">Elige hasta {MAX_SHELF_PRODUCTS}. Mientras esté vacío, la tienda no lo muestra.</p>
          <button type="button" onClick={() => setIsPickerOpen(true)} className={`${adminPrimaryButtonClass} mt-4`}>
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
            Agregar productos
          </button>
        </div>
      ) : (
        <ol className="divide-y divide-admin-line overflow-hidden rounded-lg border border-admin-line">
          {products.map((product, index) => {
            const hidden = product.isVisible === false
            return (
              <li key={product.productId} className="flex items-center gap-2.5 bg-white px-2.5 py-2">
                <span className="w-4 shrink-0 text-center text-xs font-semibold tabular-nums text-ink-muted">
                  {index + 1}
                </span>
                <span
                  className={`flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[5px] border border-admin-line bg-admin-bg ${
                    hidden ? 'opacity-50' : ''
                  }`}
                >
                  {product.catalogMainUrl ? (
                    <img
                      src={cloudinaryUrl(product.catalogMainUrl, 160)}
                      alt=""
                      loading="lazy"
                      className="size-full object-contain mix-blend-multiply"
                    />
                  ) : (
                    <ImageOff size={18} strokeWidth={1.5} aria-hidden="true" className="text-ink-muted/60" />
                  )}
                </span>
                <div className={`min-w-0 flex-1 ${hidden ? 'opacity-60' : ''}`}>
                  <p className="truncate text-[13px] font-medium text-ink">{product.name}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
                    <span className="font-mono text-[11.5px] tabular-nums">
                      {product.discountPercent ? (
                        <>
                          <span className="line-through">{formatCOP(product.price)}</span>{' '}
                          {formatCOP(product.finalPrice)}
                        </>
                      ) : (
                        formatCOP(product.finalPrice)
                      )}
                    </span>
                    {hidden && (
                      <span title={product.isActive ? 'Su categoría está desactivada' : 'El producto está desactivado'}>
                        <StatusBadge tone="warning">No se ve en la tienda</StatusBadge>
                      </span>
                    )}
                    {!product.inStock && <StatusBadge tone="danger">Agotado</StatusBadge>}
                    {!product.catalogMainUrl && <StatusBadge tone="warning">Sin imagen</StatusBadge>}
                  </div>
                </div>
                <div className="-mr-1 flex shrink-0 items-center">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={isSaving}
                    aria-label={`Subir ${product.name}`}
                    title="Subir"
                    className={`${adminIconButtonClass} size-7 ${index === 0 ? 'invisible' : ''}`}
                  >
                    <ArrowUp size={15} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={isSaving}
                    aria-label={`Bajar ${product.name}`}
                    title="Bajar"
                    className={`${adminIconButtonClass} size-7 ${index === products.length - 1 ? 'invisible' : ''}`}
                  >
                    <ArrowDown size={15} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAt(index)}
                    disabled={isSaving}
                    aria-label={`Quitar ${product.name} del estante`}
                    title="Quitar del estante"
                    className={`${adminIconButtonClass} size-7`}
                  >
                    <X size={15} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                </div>
              </li>
            )
          })}
        </ol>
      )}

      {products.some((p) => p.isVisible === false) && (
        <p className="flex items-start gap-1.5 text-xs text-amber-700">
          <EyeOff size={14} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0" />
          Los productos atenuados no aparecen en la tienda hasta que se activen (el producto, su subcategoría y su
          categoría principal).
        </p>
      )}

      {products.length > 0 && (
        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          disabled={isFull || isSaving}
          className={`${adminSmallButtonClass} w-full border-dashed`}
        >
          <Plus size={14} strokeWidth={2} aria-hidden="true" />
          {isFull ? `Estante lleno (${MAX_SHELF_PRODUCTS} de ${MAX_SHELF_PRODUCTS})` : 'Agregar productos'}
        </button>
      )}

      <HomeProductPickerDialog
        open={isPickerOpen}
        selectedIds={products.map((p) => p.productId)}
        max={MAX_SHELF_PRODUCTS}
        onAdd={add}
        onClose={() => setIsPickerOpen(false)}
      />
    </div>
  )
}

export default HomeShelfEditor
