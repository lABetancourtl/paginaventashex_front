import { useEffect, useId, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, ImageOff, PackageSearch, Plus, Search } from 'lucide-react'
import AdminDialog, { AdminDialogBody, AdminDialogFooter } from './AdminDialog'
import StatusBadge from './StatusBadge'
import { useAdminProducts } from '../../features/catalog/hooks/useAdminProducts'
import type { Product } from '../../features/catalog/types'
import { cloudinaryUrl } from '../../utils/cloudinary'
import { formatCOP } from '../../utils/formatters'
import { adminIconButtonClass, adminInputClass, adminPrimaryButtonClass, adminSecondaryButtonClass } from '../adminStyles'

interface HomeProductPickerDialogProps {
  open: boolean
  selectedIds: number[]
  max: number
  onAdd: (product: Product) => void
  onClose: () => void
}

// Buscador de productos para llenar un estante (24 por página)
function HomeProductPickerDialog({ open, selectedIds, max, onAdd, onClose }: HomeProductPickerDialogProps) {
  const searchId = useId()
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Espera a que deje de escribir para buscar
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(query.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [query])

  const { data, isPending, isFetching, error } = useAdminProducts({ search: search || undefined, page }, open)
  const isFull = selectedIds.length >= max

  let content
  if (isPending) {
    content = (
      <ul aria-label="Buscando productos" className="divide-y divide-admin-line">
        {Array.from({ length: 5 }, (_, index) => (
          <li key={index} className="flex animate-pulse items-center gap-3 py-3">
            <div className="size-12 rounded-lg bg-admin-bg" />
            <div className="h-3 w-48 rounded-full bg-admin-bg" />
          </li>
        ))}
      </ul>
    )
  } else if (error) {
    content = (
      <p role="alert" className="py-8 text-center text-sm text-danger">
        {error.message}
      </p>
    )
  } else if (data.items.length === 0) {
    content = (
      <div className="flex flex-col items-center py-10 text-center text-sm text-ink-muted">
        <PackageSearch size={24} strokeWidth={1.5} aria-hidden="true" className="mb-2" />
        {search ? `Ningún producto coincide con “${search}”.` : 'Todavía no hay productos.'}
      </div>
    )
  } else {
    content = (
      <ul className={`divide-y divide-admin-line ${isFetching ? 'opacity-60' : ''}`}>
        {data.items.map((product) => {
          const isSelected = selectedIds.includes(product.id)
          return (
            <li key={product.id} className="flex items-center gap-3 py-2.5">
              <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-admin-line bg-admin-bg">
                {product.catalogMainUrl ? (
                  <img
                    src={cloudinaryUrl(product.catalogMainUrl, 120)}
                    alt=""
                    loading="lazy"
                    className="size-full object-contain mix-blend-multiply"
                  />
                ) : (
                  <ImageOff size={16} strokeWidth={1.5} aria-hidden="true" className="text-ink-muted/60" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{product.name}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
                  <span className="tabular-nums">{formatCOP(product.finalPrice)}</span>
                  {!product.isActive && <StatusBadge tone="neutral">Inactivo</StatusBadge>}
                  {product.inStock === false && <StatusBadge tone="danger">Agotado</StatusBadge>}
                  {!product.catalogMainUrl && <StatusBadge tone="warning">Sin imagen</StatusBadge>}
                </div>
              </div>
              {isSelected ? (
                <span className="inline-flex shrink-0 items-center gap-1 px-2 text-xs font-medium text-green-700">
                  <Check size={14} strokeWidth={2} aria-hidden="true" />
                  En el estante
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onAdd(product)}
                  disabled={isFull}
                  title={isFull ? `El estante ya tiene ${max} productos` : undefined}
                  className={`${adminSecondaryButtonClass} shrink-0 px-2.5 py-1.5 text-xs`}
                >
                  <Plus size={14} strokeWidth={2} aria-hidden="true" />
                  Agregar
                </button>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <AdminDialog
      open={open}
      onClose={onClose}
      title="Agregar productos"
      description={`${selectedIds.length} de ${max} en el estante.${isFull ? ' Quita uno para agregar otro.' : ''}`}
      icon={PackageSearch}
      size="lg"
    >
      <AdminDialogBody>
        <div className="relative">
          <label htmlFor={searchId} className="sr-only">
            Buscar productos
          </label>
          <Search
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre"
            autoFocus
            className={`${adminInputClass} h-10 py-0 pl-9`}
          />
        </div>
        {content}
      </AdminDialogBody>

      <AdminDialogFooter
        start={
          data && data.totalPages > 1 ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1 || isFetching}
                aria-label="Página anterior"
                className={adminIconButtonClass}
              >
                <ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" />
              </button>
              <span className="tabular-nums">
                Página {data.page} de {data.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.totalPages || isFetching}
                aria-label="Página siguiente"
                className={adminIconButtonClass}
              >
                <ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>
          ) : undefined
        }
      >
        <button type="button" onClick={onClose} className={adminPrimaryButtonClass}>
          Listo
        </button>
      </AdminDialogFooter>
    </AdminDialog>
  )
}

export default HomeProductPickerDialog
