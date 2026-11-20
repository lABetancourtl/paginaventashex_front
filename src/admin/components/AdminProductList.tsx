import { Link, useNavigate } from 'react-router'
import type { MouseEvent } from 'react'
import { AlertTriangle, ImageOff } from 'lucide-react'
import { cloudinaryUrl } from '../../utils/cloudinary'
import { formatCOP } from '../../utils/formatters'
import type { Product } from '../../features/catalog/types'
import AdminSwitch from './AdminSwitch'

const LOW_STOCK = 5

// Columnas de la tabla: producto · categoría · precio · stock · visible · editar
const gridCols = 'md:grid-cols-[minmax(0,1fr)_160px_112px_96px_56px_72px] lg:grid-cols-[minmax(0,1fr)_200px_120px_112px_64px_80px]'

const editButtonClass =
  'inline-flex items-center justify-center rounded-lg border border-[#dcdbd6] bg-white font-medium text-admin-ink transition-colors hover:border-[#cbcac4] hover:bg-admin-bg'

// ─── Piezas compartidas por la tabla y las tarjetas ─────────
function ProductThumb({ product, size = 'md' }: { product: Product; size?: 'md' | 'lg' }) {
  const box = size === 'lg' ? 'size-14 rounded-[10px]' : 'size-10 rounded-lg'

  if (!product.catalogMainUrl) {
    return (
      <span
        title="Sin imagen"
        className={`flex ${box} shrink-0 items-center justify-center border-[1.5px] border-dashed border-[#d0cfc9] bg-white text-[#8b8a84]`}
      >
        <ImageOff size={16} strokeWidth={1.5} aria-hidden="true" />
        <span className="sr-only">Sin imagen</span>
      </span>
    )
  }

  return (
    <div
      className={`flex ${box} shrink-0 items-center justify-center overflow-hidden bg-admin-active ${
        product.isActive ? '' : 'opacity-50 grayscale'
      }`}
    >
      <img
        src={cloudinaryUrl(product.catalogMainUrl, 128)}
        alt=""
        loading="lazy"
        className="size-full object-contain mix-blend-multiply"
      />
    </div>
  )
}

function PriceText({ product, inline = false }: { product: Product; inline?: boolean }) {
  const hasDiscount = product.discountPercent !== null && product.discountPercent > 0
  return (
    <>
      <span className="font-medium tabular-nums text-admin-ink">{formatCOP(product.finalPrice)}</span>
      {hasDiscount && (
        <span className={`${inline ? 'ml-1.5 inline' : 'block'} text-[11px] tabular-nums text-[#8b8a84]`}>
          <span className="line-through">
            <span className="sr-only">Antes </span>
            {formatCOP(product.price)}
          </span>{' '}
          <span className="font-semibold text-[#1f7a45]">-{product.discountPercent}%</span>
        </span>
      )}
    </>
  )
}

// Unidades con su aviso: agotado o stock bajo
function getStock(product: Product) {
  const stock = product.totalStock ?? 0
  if (stock <= 0) return { stock, note: 'Agotado', ink: 'text-[#b42318]' }
  if (stock <= LOW_STOCK) return { stock, note: 'Stock bajo', ink: 'text-[#8a5a00]' }
  return { stock, note: '', ink: 'text-admin-ink' }
}

function StockCell({ product, inline = false }: { product: Product; inline?: boolean }) {
  const { stock, note, ink } = getStock(product)
  return (
    <span className={`flex ${inline ? 'items-baseline gap-2' : 'flex-col gap-0.5'}`}>
      <span className={`font-semibold tabular-nums ${ink}`}>
        {stock} <span className="sr-only">unidades</span>
      </span>
      {note && <span className={`text-[11px] font-medium ${ink}`}>{note}</span>}
    </span>
  )
}

// Activo pero sin unidades: el cliente lo ve y no puede comprarlo
function ActiveWithoutStock({ product }: { product: Product }) {
  if (!product.isActive || (product.totalStock ?? 0) > 0) return null
  const text = 'Se ve en la tienda pero no tiene unidades'
  return (
    <span title={text} className="inline-flex shrink-0 text-[#e3a008]">
      <AlertTriangle size={14} strokeWidth={2} aria-hidden="true" />
      <span className="sr-only">{text}</span>
    </span>
  )
}

function VisibleSwitch({ product, isUpdating, onToggle }: { product: Product; isUpdating: boolean; onToggle: () => void }) {
  return (
    <AdminSwitch
      size="sm"
      tone="ink"
      checked={product.isActive}
      disabled={isUpdating}
      label={product.isActive ? `Ocultar ${product.name} de la tienda` : `Mostrar ${product.name} en la tienda`}
      onChange={onToggle}
    />
  )
}

// ─── Filas de carga ─────────────────────────────────────────
export function AdminProductListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <ul aria-label="Cargando productos">
      {Array.from({ length: rows }, (_, index) => (
        <li key={index} className="flex animate-pulse items-center gap-3.5 border-t border-admin-row-line px-4 py-3.5 first:border-t-0 md:px-5">
          <div className="size-10 shrink-0 rounded-lg bg-admin-active" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-3 w-1/2 rounded-md bg-admin-active" />
            <div className="h-2.5 w-[28%] rounded-md bg-[#f3f2ee]" />
          </div>
          <div className="h-[30px] w-[90px] rounded-lg bg-[#f3f2ee]" />
        </li>
      ))}
    </ul>
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
  const navigate = useNavigate()

  // Clic en cualquier parte de la fila: abre el producto, salvo en enlaces o botones
  const handleRowClick = (e: MouseEvent<HTMLElement>, editTo: string) => {
    const target = e.target as HTMLElement
    if (target.closest('a, button')) return
    if (window.getSelection()?.toString()) return // Está seleccionando texto
    navigate(editTo)
  }

  return (
    <>
      {/* Computador: tabla en grilla. Toda la fila abre el producto */}
      <div role="table" aria-label="Productos" className="hidden md:block">
        <div role="rowgroup">
          <div
            role="row"
            className={`grid ${gridCols} items-center gap-4 px-5 py-2.5 text-xs font-medium text-[#8b8a84]`}
          >
            <span role="columnheader">Producto</span>
            <span role="columnheader">Categoría</span>
            <span role="columnheader" className="text-right">Precio</span>
            <span role="columnheader">Stock</span>
            <span role="columnheader">Visible</span>
            <span role="columnheader">
              <span className="sr-only">Acciones</span>
            </span>
          </div>
        </div>

        <div role="rowgroup">
          {products.map((product) => {
            const editTo = getEditHref(product.id)
            return (
              <div
                key={product.id}
                role="row"
                onClick={(e) => handleRowClick(e, editTo)}
                className={`group grid ${gridCols} cursor-pointer items-center gap-4 border-t border-admin-row-line px-5 py-2.5 transition-colors hover:bg-[#fbfbfa]`}
              >
                <div role="cell" className="flex min-w-0 items-center gap-3">
                  <ProductThumb product={product} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={editTo}
                        className={`truncate text-sm font-medium hover:underline ${
                          product.isActive ? 'text-admin-ink' : 'text-[#8b8a84]'
                        }`}
                      >
                        {product.name}
                      </Link>
                      <ActiveWithoutStock product={product} />
                    </div>
                    <p className="font-mono text-[11px] text-[#9a9993]">ID {product.id}</p>
                  </div>
                </div>
                <div role="cell" className="truncate text-[13px] text-[#6b6a65]">
                  {product.categoryName}
                </div>
                <div role="cell" className="text-right text-sm">
                  <PriceText product={product} />
                </div>
                <div role="cell" className="text-sm">
                  <StockCell product={product} />
                </div>
                <div role="cell" className="flex items-center">
                  <VisibleSwitch
                    product={product}
                    isUpdating={isUpdating(product.id)}
                    onToggle={() => onToggleStatus(product)}
                  />
                </div>
                <div role="cell" className="flex justify-end">
                  <Link to={editTo} aria-label={`Editar ${product.name}`} className={`${editButtonClass} h-[34px] px-3 text-[13px]`}>
                    Editar
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Celular: tarjetas con controles de 44px */}
      <ul className="md:hidden">
        {products.map((product) => {
          const editTo = getEditHref(product.id)
          return (
            <li key={product.id} className="flex gap-3 border-t border-admin-row-line px-4 py-3.5 first:border-t-0">
              <ProductThumb product={product} size="lg" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div>
                  <div className="flex items-start gap-1.5">
                    <Link
                      to={editTo}
                      className={`break-words text-sm font-medium ${product.isActive ? 'text-admin-ink' : 'text-[#8b8a84]'}`}
                    >
                      {product.name}
                    </Link>
                    <ActiveWithoutStock product={product} />
                  </div>
                  <div className="text-[13px] text-[#8b8a84]">
                    <PriceText product={product} inline /> · {product.categoryName}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <StockCell product={product} inline />
                  <div className="flex-1" />
                  <div className="flex size-11 items-center justify-center">
                    <VisibleSwitch
                      product={product}
                      isUpdating={isUpdating(product.id)}
                      onToggle={() => onToggleStatus(product)}
                    />
                  </div>
                  <Link to={editTo} aria-label={`Editar ${product.name}`} className={`${editButtonClass} h-11 rounded-[10px] px-3.5 text-sm`}>
                    Editar
                  </Link>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}

export default AdminProductList
