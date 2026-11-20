import { useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { CloudOff, Package, Plus, RotateCw } from 'lucide-react'
import { SITE_NAME } from '../../config/site'
import { useAdminCategoryTree } from '../../features/catalog/hooks/useAdminCategoryTree'
import { useAdminProducts } from '../../features/catalog/hooks/useAdminProducts'
import { useSetProductStatus } from '../../features/catalog/hooks/useProductMutations'
import type { AdminCategoryNode, Product } from '../../features/catalog/types'
import AdminPageHeader from '../components/AdminPageHeader'
import AdminConfirmDialog from '../components/AdminConfirmDialog'
import AdminPagination from '../components/AdminPagination'
import AdminProductFilters from '../components/AdminProductFilters'
import type { StatusFilter } from '../components/AdminProductFilters'
import AdminProductList, { AdminProductListSkeleton } from '../components/AdminProductList'
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

const primaryButtonClass =
  'inline-flex h-[38px] items-center justify-center gap-2 whitespace-nowrap rounded-[9px] bg-admin-accent pl-3.5 pr-4 text-sm font-medium text-white transition-colors hover:bg-admin-accent-hover'

const outlineButtonClass =
  'inline-flex h-[34px] items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#dcdbd6] bg-white px-3.5 text-[13px] font-medium text-admin-ink transition-colors hover:bg-admin-bg'

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
      <div role="alert" className="flex flex-col items-center gap-2 px-6 pb-[60px] pt-14 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-[#fdecea] text-[#b42318]">
          <CloudOff size={20} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <p className="mt-1 text-[15px] font-semibold">No pudimos cargar los productos</p>
        <p className="max-w-[340px] text-sm text-[#6b6a65]">{products.error.message}</p>
        <button type="button" onClick={() => products.refetch()} className={`${outlineButtonClass} mt-2`}>
          <RotateCw size={14} strokeWidth={1.75} aria-hidden="true" />
          Reintentar
        </button>
      </div>
    )
  } else if (products.data.items.length === 0) {
    content = hasFilters ? (
      <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
        <p className="text-[15px] font-semibold">Ningún producto coincide</p>
        <p className="text-sm text-[#6b6a65]">Prueba con otra palabra o quita los filtros.</p>
        <button type="button" onClick={clearFilters} className={`${outlineButtonClass} mt-1.5`}>
          Limpiar filtros
        </button>
      </div>
    ) : (
      <div className="flex flex-col items-center gap-2 px-6 pb-[68px] pt-16 text-center">
        <span className="flex size-[52px] items-center justify-center rounded-[14px] bg-admin-hover text-[#4a4945]">
          <Package size={24} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <p className="mt-1.5 text-base font-semibold">Todavía no hay productos</p>
        <p className="max-w-[380px] text-sm text-[#6b6a65]">Crea el primero para empezar a vender.</p>
        <Link to="/admin/productos/nuevo" className={`${primaryButtonClass} mt-2.5`}>
          <Plus size={14} strokeWidth={2} aria-hidden="true" />
          Nuevo producto
        </Link>
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
            <Link to="/admin/productos/nuevo" className={primaryButtonClass}>
              <Plus size={16} strokeWidth={2} aria-hidden="true" />
              Nuevo producto
            </Link>
          }
        />

      <div className="flex flex-col gap-4">
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

        <section className="overflow-hidden rounded-[14px] border border-admin-line bg-white">{content}</section>
      </div>

      <AdminConfirmDialog
        isOpen={toDeactivate !== null}
        title={`¿Ocultar "${toDeactivate?.name ?? ''}"?`}
        message="Dejará de verse en la tienda. Podrás mostrarlo de nuevo cuando quieras."
        confirmLabel="Ocultar"
        loadingLabel="Ocultando..."
        isLoading={setStatus.isPending}
        error={setStatus.error?.message ?? null}
        onConfirm={confirmDeactivate}
        onCancel={() => setToDeactivate(null)}
      />
    </>
  )
}

export default AdminProductsPage
