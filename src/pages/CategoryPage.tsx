import { Link, useLocation, useParams, useSearchParams } from 'react-router'
import Pagination from '../components/Pagination'
import ProductCard from '../features/catalog/components/ProductCard'
import { useCategoryTree } from '../features/catalog/hooks/useCategoryTree'
import { useIsSaleView } from '../features/catalog/hooks/useIsSaleView'
import { useProductSearch } from '../features/catalog/hooks/useProductSearch'
import { findCategoryContext } from '../features/catalog/categoryTree'

// La página de la URL, o 1 si no existe o no es válida
function parsePage(value: string | null): number {
  const page = Number(value ?? '1')
  return Number.isInteger(page) && page >= 1 ? page : 1
}

function CategoryPage() {
  const { slug } = useParams()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const isSaleView = useIsSaleView()
  const page = parsePage(searchParams.get('page'))

  // Las dos consultas salen en paralelo
  const tree = useCategoryTree()
  const products = useProductSearch(
    { categorySlug: slug, onSale: isSaleView, page },
    Boolean(slug),
  )

  // Arma la URL de otra página conservando los demás filtros (ej: ?sale=1)
  const getPageHref = (targetPage: number) => {
    const next = new URLSearchParams(searchParams)
    if (targetPage === 1) next.delete('page')
    else next.set('page', String(targetPage))
    const query = next.toString()
    return query ? `${pathname}?${query}` : pathname
  }

  if (tree.isPending) {
    return <p className="text-ink-muted">Cargando...</p>
  }

  if (tree.error) {
    return <p className="text-danger">{tree.error.message}</p>
  }

  const context = findCategoryContext(tree.data, slug)

  if (!context) {
    return (
      <section className="py-10 text-center">
        <h2 className="text-lg font-extrabold uppercase tracking-wide">Categoría no encontrada</h2>
        <Link to="/" className="mt-4 inline-block text-sm underline underline-offset-4">
          Volver al inicio
        </Link>
      </section>
    )
  }

  const { root, current } = context
  const isRoot = root.id === current.id

  // ─── Contenido según el estado de los productos ───────────
  let content
  if (products.isPending) {
    content = <p className="text-ink-muted">Cargando productos...</p>
  } else if (products.error) {
    content = <p className="text-danger">{products.error.message}</p>
  } else if (products.data.items.length === 0) {
    content = (
      <p className="py-10 text-center text-ink-muted">
        {isSaleView
          ? 'Por ahora no hay ofertas en esta categoría.'
          : 'Todavía no hay productos en esta categoría.'}
      </p>
    )
  } else {
    content = (
      <>
        <ul
          aria-busy={products.isPlaceholderData}
          className={`grid grid-cols-2 gap-x-1 gap-y-6 transition-opacity md:grid-cols-4 md:gap-x-1.5 ${
            products.isPlaceholderData ? 'opacity-50' : ''
          }`}
        >
          {products.data.items.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>

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
    <section className="px-1 pb-12 md:px-2">
      <div className="mb-6 px-2 md:px-4">
        <p className="text-xs uppercase tracking-wide text-ink-muted">
          {isSaleView ? (
            <span className="font-bold text-sale-ink">Sale en {root.name}</span>
          ) : isRoot ? (
            'Ropa para bebé'
          ) : (
            root.name
          )}
        </p>
        <h2 className="mt-1 text-lg font-extrabold uppercase tracking-wide">{current.name}</h2>
        {totalItems !== undefined && (
          <p className="mt-1 text-xs text-ink-muted">
            {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
          </p>
        )}
      </div>

      {content}
    </section>
  )
}

export default CategoryPage