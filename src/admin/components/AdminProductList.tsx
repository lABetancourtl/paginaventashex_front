import { Link, useNavigate } from 'react-router'
import type { MouseEvent } from 'react'
import { AlertTriangle, ImageOff, Pencil } from 'lucide-react'
import { cloudinaryUrl } from '../../utils/cloudinary'
import { formatCOP } from '../../utils/formatters'
import type { Product } from '../../features/catalog/types'
import AdminSwitch from './AdminSwitch'
import StockText from './StockText'
import AdminActionMenu from './AdminActionMenu'
import type { ActionMenuItem } from './AdminActionMenu'
import { adminTdClass, adminThClass } from '../adminStyles'

// ─── Piezas compartidas por la tabla y las tarjetas ─────────
function ProductThumb({ product, size = 'md' }: { product: Product; size?: 'md' | 'lg' }) {
  const box = size === 'lg' ? 'size-16' : 'size-12'
  return (
    <div
      className={`flex ${box} shrink-0 items-center justify-center overflow-hidden rounded-xl border border-admin-line bg-admin-bg ${
        product.isActive ? '' : 'opacity-50 grayscale'
      }`}
    >
      {product.catalogMainUrl ? (
        <img
          src={cloudinaryUrl(product.catalogMainUrl, 128)}
          alt=""
          loading="lazy"
          className="size-full object-contain mix-blend-multiply"
        />
      ) : (
        <ImageOff size={18} strokeWidth={1.25} aria-hidden="true" className="text-ink-muted/50" />
      )}
    </div>
  )
}

function PriceCell({ product }: { product: Product }) {
  const hasDiscount = product.discountPercent !== null && product.discountPercent > 0
  return (
    <div className="text-sm tabular-nums">
      <p className="flex items-center gap-1.5 font-medium text-ink">
        {formatCOP(product.finalPrice)}
        {hasDiscount && (
          <span className="rounded border border-green-200 bg-green-50 px-1 text-[10px] font-semibold text-green-700">
            -{product.discountPercent}%
          </span>
        )}
      </p>
      {hasDiscount && (
        <p className="text-xs text-ink-muted line-through">
          <span className="sr-only">Antes </span>
          {formatCOP(product.price)}
        </p>
      )}
    </div>
  )
}

function CategoryChip({ name }: { name: string }) {
  return (
    <span className="inline-flex max-w-full items-center truncate rounded-md bg-admin-bg px-2 py-0.5 text-xs font-medium text-ink-muted">
      {name}
    </span>
  )
}

// Problemas que el admin debería resolver
function getIssues(product: Product): string[] {
  const issues: string[] = []
  if (!product.catalogMainUrl) issues.push('Sin imágenes')
  if (product.isActive && (product.totalStock ?? 0) <= 0) issues.push('Activo pero sin unidades')
  return issues
}

function IssuesIcon({ product }: { product: Product }) {
  const issues = getIssues(product)
  if (issues.length === 0) return null
  const text = issues.join(' · ')
  return (
    <span title={text} className="inline-flex shrink-0 text-amber-500">
      <AlertTriangle size={14} strokeWidth={2} aria-hidden="true" />
      <span className="sr-only">{text}</span>
    </span>
  )
}

// Interruptor + texto: cambia el estado sin abrir el producto
function StatusToggle({ product, isUpdating, onToggle }: { product: Product; isUpdating: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-2.5">
      <AdminSwitch
        size="sm"
        checked={product.isActive}
        disabled={isUpdating}
        label={product.isActive ? `Desactivar ${product.name}` : `Activar ${product.name}`}
        onChange={onToggle}
      />
      <span className={`text-xs font-medium ${product.isActive ? 'text-green-700' : 'text-ink-muted'}`}>
        {isUpdating ? 'Guardando…' : product.isActive ? 'Activo' : 'Inactivo'}
      </span>
    </div>
  )
}

// Activar y desactivar se hace con el interruptor de la columna Estado
function getActions(editTo: string): ActionMenuItem[] {
  return [{ label: 'Editar producto', icon: Pencil, to: editTo }]
}

// ─── Filas de carga ─────────────────────────────────────────
export function AdminProductListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <ul aria-label="Cargando productos" className="divide-y divide-admin-line">
      {Array.from({ length: rows }, (_, index) => (
        <li key={index} className="flex animate-pulse items-center gap-4 px-5 py-4">
          <div className="size-12 rounded-xl bg-admin-bg" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded-full bg-admin-bg" />
            <div className="h-2.5 w-1/5 rounded-full bg-admin-bg" />
          </div>
          <div className="hidden h-3 w-20 rounded-full bg-admin-bg md:block" />
          <div className="hidden h-5 w-16 rounded-full bg-admin-bg md:block" />
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

  // Clic en cualquier parte de la fila: abre el producto, salvo en enlaces, botones o el menú de acciones
  const handleRowClick = (e: MouseEvent<HTMLTableRowElement>, editTo: string) => {
    const target = e.target as HTMLElement
    if (target.closest('a, button, [data-row-action]')) return
    if (window.getSelection()?.toString()) return // Está seleccionando texto
    navigate(editTo)
  }

  return (
    <>
      {/* Computador: tabla. Toda la fila abre el producto */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full table-fixed">
          <colgroup>
            <col />
            <col className="w-[16%]" />
            <col className="w-[15%]" />
            <col className="w-[11%]" />
            <col className="w-[13%]" />
            <col className="w-16" />
          </colgroup>
          <thead className="border-b border-admin-line bg-admin-bg/40">
            <tr>
              <th scope="col" className={`${adminThClass} pl-5`}>Producto</th>
              <th scope="col" className={adminThClass}>Categoría</th>
              <th scope="col" className={adminThClass}>Precio</th>
              <th scope="col" className={adminThClass}>Stock</th>
              <th scope="col" className={adminThClass}>Estado</th>
              <th scope="col" className={`${adminThClass} pr-5 text-right`}>
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-line">
            {products.map((product) => {
              const editTo = getEditHref(product.id)
              return (
                <tr
                  key={product.id}
                  onClick={(e) => handleRowClick(e, editTo)}
                  className="group cursor-pointer transition-colors hover:bg-admin-accent/[0.03]"
                >
                  <td className={`${adminTdClass} pl-5`}>
                    <div className="flex items-center gap-3.5">
                      <ProductThumb product={product} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={editTo}
                            className={`truncate text-sm font-medium group-hover:text-admin-accent ${
                              product.isActive ? 'text-ink' : 'text-ink-muted'
                            }`}
                          >
                            {product.name}
                          </Link>
                          <IssuesIcon product={product} />
                        </div>
                        <p className="text-xs tabular-nums text-ink-muted">ID #{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className={adminTdClass}>
                    <CategoryChip name={product.categoryName} />
                  </td>
                  <td className={adminTdClass}>
                    <PriceCell product={product} />
                  </td>
                  <td className={`${adminTdClass} text-sm`}>
                    <StockText stock={product.totalStock ?? 0} />
                  </td>
                  <td className={adminTdClass} data-row-action>
                    <StatusToggle
                      product={product}
                      isUpdating={isUpdating(product.id)}
                      onToggle={() => onToggleStatus(product)}
                    />
                  </td>
                  <td className={`${adminTdClass} pr-5 text-right`} data-row-action>
                    <AdminActionMenu
                      label={`Acciones de ${product.name}`}
                      items={getActions(editTo)}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Celular: tarjetas */}
      <ul className="divide-y divide-admin-line md:hidden">
        {products.map((product) => {
          const editTo = getEditHref(product.id)
          return (
            <li key={product.id} className="flex gap-3 px-4 py-4">
              <ProductThumb product={product} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-1.5">
                  <Link
                    to={editTo}
                    className={`break-words text-sm font-medium ${product.isActive ? 'text-ink' : 'text-ink-muted'}`}
                  >
                    {product.name}
                  </Link>
                  <IssuesIcon product={product} />
                  <div className="-mr-1 -mt-1 ml-auto">
                    <AdminActionMenu
                      label={`Acciones de ${product.name}`}
                      items={getActions(editTo)}
                    />
                  </div>
                </div>
                <div className="mt-1">
                  <CategoryChip name={product.categoryName} />
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <PriceCell product={product} />
                  <div className="flex items-center gap-3 text-xs">
                    <StockText stock={product.totalStock ?? 0} />
                    <StatusToggle
                      product={product}
                      isUpdating={isUpdating(product.id)}
                      onToggle={() => onToggleStatus(product)}
                    />
                  </div>
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
