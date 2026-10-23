import { Link } from 'react-router'
import { ImageOff, Pencil } from 'lucide-react'
import ProductPrice from '../../features/catalog/components/ProductPrice'
import { cloudinaryUrl } from '../../utils/cloudinary'
import type { Product } from '../../features/catalog/types'
import StatusBadge from './StatusBadge'
import { adminSecondaryButtonClass } from '../adminStyles'

const LOW_STOCK = 5

// ─── Piezas compartidas por la tabla y las tarjetas ─────────
function ProductThumb({ product }: { product: Product }) {
  return (
    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-canvas">
      {product.catalogMainUrl ? (
        <img
          src={cloudinaryUrl(product.catalogMainUrl, 96)}
          alt=""
          loading="lazy"
          className="size-full object-contain"
        />
      ) : (
        <ImageOff size={18} strokeWidth={1.25} aria-hidden="true" className="text-ink-muted/60" />
      )}
    </div>
  )
}

function StockText({ stock }: { stock: number }) {
  if (stock <= 0) return <span className="font-medium text-danger">Agotado</span>
  if (stock <= LOW_STOCK) return <span className="font-medium text-amber-700">{stock} (bajo)</span>
  return <span>{stock}</span>
}

interface ProductActionsProps {
  product: Product
  editTo: string
  isUpdating: boolean
  onToggleStatus: () => void
}

function ProductActions({ product, editTo, isUpdating, onToggleStatus }: ProductActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link
        to={editTo}
        aria-label={`Editar ${product.name}`}
        title="Editar"
        className="rounded-md p-1.5 text-ink-muted hover:bg-canvas hover:text-ink"
      >
        <Pencil size={16} strokeWidth={1.5} aria-hidden="true" />
      </Link>
      <button
        type="button"
        onClick={onToggleStatus}
        disabled={isUpdating}
        className={`${adminSecondaryButtonClass} w-24`}
      >
        {isUpdating ? 'Guardando...' : product.isActive ? 'Desactivar' : 'Activar'}
      </button>
    </div>
  )
}

// ─── La lista ───────────────────────────────────────────────
interface AdminProductListProps {
  products: Product[]
  getEditHref: (id: number) => string
  isUpdating: (id: number) => boolean
  onToggleStatus: (product: Product) => void
}

function AdminProductList({ products, getEditHref, isUpdating, onToggleStatus }: AdminProductListProps) {
  return (
    <>
      {/* Computador: tabla */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th scope="col" className="py-3 pr-4 font-medium">Producto</th>
              <th scope="col" className="py-3 pr-4 font-medium">Categoría</th>
              <th scope="col" className="py-3 pr-4 font-medium">Precio</th>
              <th scope="col" className="py-3 pr-4 font-medium">Stock</th>
              <th scope="col" className="py-3 pr-4 font-medium">Estado</th>
              <th scope="col" className="py-3 text-right font-medium">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-line/60 last:border-b-0">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <ProductThumb product={product} />
                    <div className="min-w-0">
                      <p className="max-w-xs truncate font-medium">{product.name}</p>
                      <p className="text-xs text-ink-muted">{product.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4 text-ink-muted">{product.categoryName}</td>
                <td className="py-3 pr-4">
                  <ProductPrice
                    price={product.price}
                    finalPrice={product.finalPrice}
                    discountPercent={product.discountPercent}
                  />
                </td>
                <td className="py-3 pr-4">
                  <StockText stock={product.stock} />
                </td>
                <td className="py-3 pr-4">
                  <StatusBadge tone={product.isActive ? 'success' : 'neutral'}>
                    {product.isActive ? 'Activo' : 'Inactivo'}
                  </StatusBadge>
                </td>
                <td className="py-3">
                  <ProductActions
                    product={product}
                    editTo={getEditHref(product.id)}
                    isUpdating={isUpdating(product.id)}
                    onToggleStatus={() => onToggleStatus(product)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Celular: tarjetas */}
      <ul className="divide-y divide-line/60 md:hidden">
        {products.map((product) => (
          <li key={product.id} className="py-3">
            <div className="flex gap-3">
              <ProductThumb product={product} />
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-medium">{product.name}</p>
                <p className="text-xs text-ink-muted">
                  {product.sku} · {product.categoryName}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <ProductPrice
                    price={product.price}
                    finalPrice={product.finalPrice}
                    discountPercent={product.discountPercent}
                  />
                  <span className="text-xs text-ink-muted">
                    Stock: <StockText stock={product.stock} />
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <StatusBadge tone={product.isActive ? 'success' : 'neutral'}>
                {product.isActive ? 'Activo' : 'Inactivo'}
              </StatusBadge>
              <ProductActions
                product={product}
                editTo={getEditHref(product.id)}
                isUpdating={isUpdating(product.id)}
                onToggleStatus={() => onToggleStatus(product)}
              />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

export default AdminProductList