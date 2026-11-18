import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { useProductSearch } from '../hooks/useProductSearch'
import { categoryPath } from '../catalogNav'
import ProductCard from './ProductCard'

const MAX_PRODUCTS = 4

interface RelatedProductsProps {
  subcategorySlug: string // La subcategoría del producto (por ejemplo, Niños › Camisetas)
  categorySlug: string // Su categoría principal (Niños); puede ser la misma si no tiene subcategoría
  excludeId: number // El producto que se está viendo
}

// "Esto te puede gustar": primero otros productos de la misma subcategoría y,
// si no alcanzan para llenar la fila, se completa con otros de la categoría principal.
// Usa la misma búsqueda que la página de la categoría (comparten caché)
function RelatedProducts({ subcategorySlug, categorySlug, excludeId }: RelatedProductsProps) {
  const sameSub = useProductSearch({ categorySlug: subcategorySlug, page: 1 })

  const fromSub = (sameSub.data?.items ?? []).filter((product) => product.id !== excludeId)

  // La categoría principal solo se pide si hace falta completar
  const needsFill = sameSub.isSuccess && fromSub.length < MAX_PRODUCTS && subcategorySlug !== categorySlug
  const sameRoot = useProductSearch({ categorySlug, page: 1 }, needsFill)

  // Sin repetir: los de la subcategoría primero, luego los de la principal que no estén ya
  const seen = new Set([excludeId, ...fromSub.map((product) => product.id)])
  const fill = needsFill ? (sameRoot.data?.items ?? []).filter((product) => !seen.has(product.id)) : []
  const products = [...fromSub, ...fill].slice(0, MAX_PRODUCTS)

  const isPending = sameSub.isPending || (needsFill && sameRoot.isPending)

  // Sin resultados (o si falló la búsqueda), la sección no aparece
  if (sameSub.error || (!isPending && products.length === 0)) return null

  return (
    <section aria-labelledby="related-title" className="px-4 py-12 md:px-10 md:pt-18 md:pb-14">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 id="related-title" className="text-sm font-extrabold uppercase tracking-wider md:text-base">
          Esto te puede gustar
        </h2>
        <Link
          to={categoryPath(categorySlug)}
          className="group inline-flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wide underline-offset-4 hover:underline"
        >
          Ver todo
          <ArrowRight
            size={14}
            strokeWidth={2}
            aria-hidden="true"
            className="transition-transform motion-safe:group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      {isPending ? (
        // Esqueleto mientras llegan los productos
        <div
          aria-label="Cargando"
          aria-busy="true"
          className="grid animate-pulse grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-4"
        >
          {Array.from({ length: MAX_PRODUCTS }, (_, index) => (
            <div key={index}>
              <div className="aspect-square rounded-xl bg-ink/5" />
              <div className="mt-3 h-3 w-3/4 bg-ink/5" />
              <div className="mt-2 h-3 w-1/3 bg-ink/5" />
            </div>
          ))}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4 md:gap-x-4">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default RelatedProducts
