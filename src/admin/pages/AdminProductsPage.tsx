import { useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { Plus } from 'lucide-react'
import ConfirmDialog from '../../components/ConfirmDialog'
import Pagination from '../../components/Pagination'
import { SITE_NAME } from '../../config/site'
import { useAdminCategoryTree } from '../../features/catalog/hooks/useAdminCategoryTree'
import { useAdminProducts } from '../../features/catalog/hooks/useAdminProducts'
import { useSetProductStatus } from '../../features/catalog/hooks/useProductMutations'
import type { AdminCategoryNode, Product } from '../../features/catalog/types'
import AdminPageHeader from '../components/AdminPageHeader'
import AdminCard from '../components/AdminCard'
import AdminProductFilters from '../components/AdminProductFilters'
import type { StatusFilter } from '../components/AdminProductFilters'
import AdminProductList from '../components/AdminProductList'
import { adminPrimaryButtonClass } from '../adminStyles'

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

  const products = useAdminProducts(
    {
      search: search || undefined,
      categoryIds,
      isActive: status === 'todos' ? undefined : status === 'activos',
      page,
    },
    canSearch,
  )

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
  const [toDeactivate, setToDeactivate] = useState<Product | null>(null)

  const handleToggleStatus = (product: Product) => {
    if (product.isActive) {
      setStatus.reset()
      setToDeactivate(product)
    } else {
      setStatus.mutate({ id: product.id, active: true })
    }
  }

  const confirmDeactivate = () => {
    if (!toDeactivate) return
    setStatus.mutate(
      { id: toDeactivate.id, active: false },
      { onSuccess: () => setToDeactivate(null) },
    )
  }

  const isUpdating = (id: number) => setStatus.isPending && setStatus.variables?.id === id

  // ─── Contenido según el estado ────────────────────────────
  const hasFilters = search !== '' || categoryId !== null || status !== 'todos'

  let content
  if (products.isPending) {
    content = <p className="text-sm text-ink-muted">Cargando productos...</p>
  } else if (products.error) {
    content = <p className="text-sm text-danger">{products.error.message}</p>
  } else if (products.data.items.length === 0) {
    content = (
      <p className="py-8 text-center text-sm text-ink-muted">
        {hasFilters ? 'Ningún producto coincide con los filtros.' : 'Todavía no hay productos.'}
      </p>
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
        <Pagination
          currentPage={products.data.page}
          totalPages={products.data.totalPages}
          getPageHref={getPageHref}
        />
      </>
    )
  }

  const totalItems = products.data?.totalItems

  return (
    <>
      <title>{`Productos | Admin ${SITE_NAME}`}</title>

      <AdminPageHeader
        title="Productos"
        description={
          totalItems !== undefined
            ? `${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}${hasFilters ? ' con estos filtros' : ''}`
            : undefined
        }
        actions={
          <Link to="/admin/productos/nuevo" className={adminPrimaryButtonClass}>
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
            Nuevo producto
          </Link>
        }
      />

      {setStatus.error && !toDeactivate && (
        <p role="alert" className="mb-4 text-sm text-danger">
          {setStatus.error.message}
        </p>
      )}

      <AdminCard>
        <div className="mb-5">
          <AdminProductFilters
            search={search}
            categoryId={categoryId}
            status={status}
            categories={categories.data ?? []}
            onSearchChange={(value) => updateParams({ q: value }, true)}
            onCategoryChange={(id) => updateParams({ categoria: id === null ? null : String(id) })}
            onStatusChange={(value) => updateParams({ estado: value === 'todos' ? null : value })}
            onClear={() => updateParams({ q: null, categoria: null, estado: null })}
          />
        </div>
        {content}
      </AdminCard>

      <ConfirmDialog
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