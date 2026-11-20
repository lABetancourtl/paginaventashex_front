import { useState } from 'react'
import { ArrowDown, ArrowUp, EyeOff, ImageOff, PackagePlus, Plus, X } from 'lucide-react'
import HomeProductPickerDialog from './HomeProductPickerDialog'
import type { Product } from '../../features/catalog/types'
import { cloudinaryUrl } from '../../utils/cloudinary'
import { formatCOP } from '../../utils/formatters'
import { MAX_SHELF_PRODUCTS } from '../homeSections'
import type { ShelfProduct } from '../homeSections'
import { adminSolidButtonClass } from '../adminStyles'

const rowButtonClass =
  'inline-flex size-8 items-center justify-center rounded-lg text-[#6b6a65] transition-colors hover:bg-admin-hover hover:text-admin-ink disabled:cursor-not-allowed disabled:opacity-40'

// Aviso corto bajo el nombre (en lugar de una pastilla)
function Note({ tone, children }: { tone: 'warning' | 'danger'; children: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${tone === 'danger' ? 'text-[#b42318]' : 'text-[#8a5a00]'}`}>
      <span aria-hidden="true" className={`size-1.5 rounded-full ${tone === 'danger' ? 'bg-[#d92d20]' : 'bg-[#e3a008]'}`} />
      {children}
    </span>
  )
}

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
        <div className="flex flex-col items-center gap-1.5 rounded-[10px] border-[1.5px] border-dashed border-[#d0cfc9] px-4 py-8 text-center">
          <span className="mb-1 flex size-11 items-center justify-center rounded-full bg-admin-hover text-[#4a4945]">
            <PackagePlus size={20} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <p className="text-sm font-semibold">El estante no tiene productos</p>
          <p className="text-xs text-[#6b6a65]">Elige hasta {MAX_SHELF_PRODUCTS}. Mientras esté vacío, la tienda no lo muestra.</p>
          <button type="button" onClick={() => setIsPickerOpen(true)} className={`${adminSolidButtonClass} mt-2.5`}>
            <Plus size={14} strokeWidth={2} aria-hidden="true" />
            Agregar productos
          </button>
        </div>
      ) : (
        <ol className="divide-y divide-admin-row-line overflow-hidden rounded-[10px] border border-admin-line">
          {products.map((product, index) => {
            const hidden = product.isVisible === false
            return (
              <li key={product.productId} className="flex items-center gap-2.5 bg-white px-2.5 py-2">
                <span className="w-5 shrink-0 font-mono text-xs tabular-nums text-[#9a9993]">
                  {index + 1}
                </span>
                <span
                  className={`flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-admin-active ${
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
                    <ImageOff size={16} strokeWidth={1.5} aria-hidden="true" className="text-[#a3a29c]" />
                  )}
                </span>
                <div className={`min-w-0 flex-1 ${hidden ? 'opacity-60' : ''}`}>
                  <p className="truncate text-[13px] font-medium text-admin-ink">{product.name}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#8b8a84]">
                    <span className="tabular-nums">
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
                        <Note tone="warning">No se ve en la tienda</Note>
                      </span>
                    )}
                    {!product.inStock && <Note tone="danger">Agotado</Note>}
                    {!product.catalogMainUrl && <Note tone="warning">Sin imagen</Note>}
                  </div>
                </div>
                <div className="-mr-1 flex shrink-0 items-center">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={isSaving}
                    aria-label={`Subir ${product.name}`}
                    title="Subir"
                    className={`${rowButtonClass} ${index === 0 ? 'invisible' : ''}`}
                  >
                    <ArrowUp size={15} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={isSaving}
                    aria-label={`Bajar ${product.name}`}
                    title="Bajar"
                    className={`${rowButtonClass} ${index === products.length - 1 ? 'invisible' : ''}`}
                  >
                    <ArrowDown size={15} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAt(index)}
                    disabled={isSaving}
                    aria-label={`Quitar ${product.name} del estante`}
                    title="Quitar del estante"
                    className={`${rowButtonClass} hover:bg-[#fdecea]! hover:text-[#b42318]!`}
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
        <p className="flex items-start gap-1.5 text-xs text-[#8a5a00]">
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
          className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-dashed border-[#d0cfc9] text-[13px] font-medium text-[#4a4945] transition-colors hover:border-admin-accent hover:text-admin-accent disabled:pointer-events-none disabled:opacity-50 md:h-9"
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
