import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import ProductCard from '../../catalog/components/ProductCard'
import { categoryPath } from '../../catalog/catalogNav'
import type { HomeProductCard } from '../types'

interface HomeShelfProps {
  title: string | null
  viewAllSlug: string | null
  viewAllName: string | null
  products: HomeProductCard[]
}

// Estante: título arriba a la izquierda, "Ver todo" a la derecha y hasta 4 tarjetas
function HomeShelf({ title, viewAllSlug, viewAllName, products }: HomeShelfProps) {
  const hasHeader = title !== null || viewAllSlug !== null

  return (
    <section className="px-4 md:px-10" aria-label={title ?? undefined}>
      {hasHeader && (
        <div className="mb-4 flex items-end justify-between gap-4">
          {title ? (
            <h2 className="text-sm font-extrabold uppercase tracking-wider md:text-base">{title}</h2>
          ) : (
            <span />
          )}
          {viewAllSlug && (
            <Link
              to={categoryPath(viewAllSlug)}
              className="group inline-flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wide underline-offset-4 hover:underline"
            >
              Ver todo
              {viewAllName && <span className="sr-only"> de {viewAllName}</span>}
              <ArrowRight
                size={14}
                strokeWidth={2}
                aria-hidden="true"
                className="transition-transform motion-safe:group-hover:translate-x-0.5"
              />
            </Link>
          )}
        </div>
      )}

      {/* Siempre 4 columnas en computador: con menos tarjetas, quedan a la izquierda */}
      <ul className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-4">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default HomeShelf
