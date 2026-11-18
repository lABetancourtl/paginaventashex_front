import { useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { PackageSearch, Plus, Search, Tag, X } from 'lucide-react'
import { SITE_NAME } from '../../config/site'
import { useAdminCategoryTree } from '../../features/catalog/hooks/useAdminCategoryTree'
import { useAdminProducts } from '../../features/catalog/hooks/useAdminProducts'
import { useSetProductStatus } from '../../features/catalog/hooks/useProductMutations'
import type { AdminCategoryNode, Product } from '../../features/catalog/types'
import AdminPageHeader from '../components/AdminPageHeader'
import AdminCard from '../components/AdminCard'
import AdminConfirmDialog from '../components/AdminConfirmDialog'
import AdminPagination from '../components/AdminPagination'
import AdminProductFilters from '../components/AdminProductFilters'
import type { StatusFilter } from '../components/AdminProductFilters'
import AdminProductList, { AdminProductListSkeleton } from '../components/AdminProductList'
import { adminPrimaryButtonClass, adminSecondaryButtonClass } from '../adminStyles'
import { useAdminToast } from '../toast/toastContext'

function parsePage(value: string | null): number {
  const page = Number(value ?? '1')
  return Number.isInteger(page) && page >= 1 ? page : 1
}

function parseStatus(value: string | null): StatusFilter {
  return value === 'activos' || value === 'inactivos' ? value : 'todos'
}

// Una principal incluye a sus subcategorías; una subcategoría, solo a ella
function getCategoryIds(tree: AdminCategoryNode[], id: number): number[] {
  for (const root of tree) {
    if (root.id === id) return [root.id, ...root.children.map((child) => child.id)]
    if (root.children.some((child) => child.id === id)) return [id]
  }
  return [id]
}

// Nombre para mostrar de una categoría (ej: "Niño › Bodys")
function getCategoryLabel(tree: AdminCategoryNode[], id: number): string | null {
  for (const root of tree) {
    if (root.id === id) return `${root.name} (todas)`
    const child = root.children.find((c) => c.id === id)
    if (child) return `${root.name} › ${child.name}`
  }
  return null
}

// Pastilla de un filtro aplicado, con su "×" para quitarlo
function FilterChip({ icon: Icon, label, onRemove }: { icon: typeof Tag; label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-admin-accent/25 bg-admin-accent/5 py-0.5 pl-2.5 pr-1 text-xs font-medium text-admin-accent">
      <Icon size={12} strokeWidth={2} aria-hidden="true" className="shrink-0" />
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Quitar filtro: ${label}`}
        className="flex size-5 shrink-0 items-center justify-center rounded-full hover:bg-admin-accent/15"
      >
        <X size={12} strokeWidth={2} aria-hidden="true" />
      </button>
    </span>
  )
}

function AdminProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { pathname } = useLocation()

  // ─── Filtros leídos de la URL ─────────────────────────────
  const search = searchParams.get('q') ?? ''
  const categoryParam = Number(searchParams.get('categoria'))
  const categoryId = Number.isInteger(categoryParam) && categoryParam > 0 ? categoryParam : null
  const status = parseStatus(searchParams.get('estado'))
  const page = parsePage(searchParams.get('page'))

  const categories = useAdminCategoryTree()

  // Si hay filtro de categoría, esperamos el árbol para saber qué ids enviar
  const categoryIds =
    categoryId !== null && categories.data ? getCategoryIds(categories.data, categoryId) : undefined
  const canSearch = categoryId === null || categories.data !== undefined

  const baseFilters = { search: search || undefined, categoryIds }
  const products = useAdminProducts(
    { ...baseFilters, isActive: status === 'todos' ? undefined : status === 'activos', page },
    canSearch,
  )

  // Contadores de las pestañas (con la misma búsqueda y categoría)
  const activeCount = useAdminProducts({ ...baseFilters, isActive: true, page: 1 }, canSearch)
  const inactiveCount = useAdminProducts({ ...baseFilters, isActive: false, page: 1 }, canSearch)
  const counts =
    activeCount.data && inactiveCount.data
      ? {
          activos: activeCount.data.totalItems,
          inactivos: inactiveCount.data.totalItems,
          todos: activeCount.data.totalItems + inactiveCount.data.totalItems,
        }
      : undefined

  // ─── Cambiar filtros: siempre vuelve a la página 1 ────────
  const updateParams = (changes: Record<string, string | null>, replace = false) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(changes)) {
          if (value === null || value === '') next.delete(key)
          else next.set(key, value)
        }
        next.delete('page')
        return next
      },
      { replace },
    )
  }

  const getPageHref = (targetPage: number) => {
    const next = new URLSearchParams(searchParams)
    if (targetPage === 1) next.delete('page')
    else next.set('page', String(targetPage))
    const query = next.toString()
    return query ? `${pathname}?${query}` : pathname
  }

  // ─── Activar y desactivar ─────────────────────────────────
  const setStatus = useSetProductStatus()
  const toast = useAdminToast()
  const [toDeactivate, setToDeactivate] = useState<Product | null>(null)

  const activate = (product: Product) => {
    setStatus.mutate(
      { id: product.id, active: true },
      {
        onSuccess: () => toast({ message: `"${product.name}" ya se ve en la tienda.` }),
        onError: (error) => toast({ tone: 'error', message: error.message }),
      },
    )
  }

  const handleToggleStatus = (product: Product) => {
    if (product.isActive) {
      setStatus.reset()
      setToDeactivate(product)
    } else {
      activate(product)
    }
  }

  const confirmDeactivate = () => {
    if (!toDeactivate) return
    const product = toDeactivate
    setStatus.mutate(
      { id: product.id, active: false },
      {
        onSuccess: () => {
          setToDeactivate(null)
          toast({
            message: `"${product.name}" se ocultó de la tienda.`,
            action: { label: 'Deshacer', onClick: () => activate({ ...product, isActive: false }) },
          })
        },
      },
    )
  }

  const isUpdating = (id: number) => setStatus.isPending && setStatus.variables?.id === id

  const clearFilters = () => updateParams({ q: null, categoria: null, estado: null })

  // ─── Contenido según el estado ────────────────────────────
  const hasFilters = search !== '' || categoryId !== null || status !== 'todos'

  let content
  if (products.isPending) {
    content = <AdminProductListSkeleton />
  } else if (products.error) {
    content = (
      <p role="alert" className="px-5 py-10 text-center text-sm text-danger">
        {products.error.message}
      </p>
    )
  } else if (products.data.items.length === 0) {
    content = (
      <div className="flex flex-col items-center px-5 py-14 text-center">
        <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-admin-bg text-ink-muted">
          <PackageSearch size={22} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <p className="text-sm font-medium">
          {hasFilters ? 'Ningún producto coincide con los filtros' : 'Todavía no hay productos'}
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          {hasFilters ? 'Prueba con otra búsqueda o quita los filtros.' : 'Crea el primero para empezar a vender.'}
        </p>
        <div className="mt-5">
          {hasFilters ? (
            <button type="button" onClick={clearFilters} className={adminSecondaryButtonClass}>
              Quitar filtros
            </button>
          ) : (
            <Link to="/admin/productos/nuevo" className={adminPrimaryButtonClass}>
              <Plus size={16} strokeWidth={2} aria-hidden="true" />
              Nuevo producto
            </Link>
          )}
        </div>
      </div>
    )
  } else {
    content = (
      <>
        <div
          aria-busy={products.isPlaceholderData}
          className={`transition-opacity ${products.isPlaceholderData ? 'opacity-50' : ''}`}
        >
          <AdminProductList
            products={products.data.items}
            getEditHref={(id) => `/admin/productos/${id}`}
            isUpdating={isUpdating}
            onToggleStatus={handleToggleStatus}
          />
        </div>
        <AdminPagination
          currentPage={products.data.page}
          totalPages={products.data.totalPages}
          totalItems={products.data.totalItems}
          pageItemCount={products.data.items.length}
          noun={['producto', 'productos']}
          getPageHref={getPageHref}
        />
      </>
    )
  }

  const totalItems = products.data?.totalItems
  const categoryLabel =
    categoryId !== null && categories.data ? getCategoryLabel(categories.data, categoryId) : null

  return (
    <>
      <title>{`Productos | Admin ${SITE_NAME}`}</title>

      <AdminPageHeader
        title="Productos"
        description={
          totalItems !== undefined
            ? `${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}${hasFilters ? ' con estos filtros' : ' en el catálogo'}`
            : 'Crea, edita y organiza los productos del catálogo.'
        }
        actions={
          // Secundario a propósito: crear no es la tarea principal de esta página
          <Link to="/admin/productos/nuevo" className={adminSecondaryButtonClass}>
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
            Nuevo producto
          </Link>
        }
      />

      <AdminCard flush>
        <div className="border-b border-admin-line px-4 py-4 sm:px-5">
          <AdminProductFilters
            search={search}
            categoryId={categoryId}
            status={status}
            categories={categories.data ?? []}
            counts={counts}
            onSearchChange={(value) => updateParams({ q: value }, true)}
            onCategoryChange={(id) => updateParams({ categoria: id === null ? null : String(id) })}
            onStatusChange={(value) => updateParams({ estado: value === 'todos' ? null : value })}
          />

          {/* Filtros aplicados (el estado ya se ve en las pestañas) */}
          {(search !== '' || categoryLabel !== null) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-ink-muted">Filtrando por:</span>
              {search !== '' && (
                <FilterChip icon={Search} label={`"${search}"`} onRemove={() => updateParams({ q: null }, true)} />
              )}
              {categoryLabel !== null && (
                <FilterChip icon={Tag} label={categoryLabel} onRemove={() => updateParams({ categoria: null })} />
              )}
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-ink-muted underline-offset-2 hover:text-ink hover:underline"
              >
                Quitar todos
              </button>
            </div>
          )}
        </div>
        {content}
      </AdminCard>

      <AdminConfirmDialog
        isOpen={toDeactivate !== null}
        title={`¿Desactivar "${toDeactivate?.name ?? ''}"?`}
        message="Dejará de verse en la tienda. Podrás activarlo de nuevo cuando quieras."
        confirmLabel="Desactivar"
        loadingLabel="Desactivando..."
        isLoading={setStatus.isPending}
        error={setStatus.error?.message ?? null}
        onConfirm={confirmDeactivate}
        onCancel={() => setToDeactivate(null)}
      />
    </>
  )
}

export default AdminProductsPage
