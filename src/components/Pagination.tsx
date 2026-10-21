import { Link } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type PageItem = number | 'ellipsis-start' | 'ellipsis-end'

// Qué números mostrar: 1 … 4 5 6 … 10
// Siempre la primera, la última, la actual y sus vecinas
export function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const items: PageItem[] = [1]
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  if (start > 2) items.push('ellipsis-start')
  for (let page = start; page <= end; page++) {
    items.push(page)
  }
  if (end < totalPages - 1) items.push('ellipsis-end')

  items.push(totalPages)
  return items
}

const pageClass = [
  'flex size-10 items-center justify-center border-b-2 border-transparent text-sm font-semibold',
  'hover:border-line',
  'aria-[current=page]:border-ink',
].join(' ')

const arrowClass = 'flex size-10 items-center justify-center'

interface PaginationProps {
  currentPage: number
  totalPages: number
  getPageHref: (page: number) => string
}

function Pagination({ currentPage, totalPages, getPageHref }: PaginationProps) {
  if (totalPages <= 1) return null

  const items = getPageItems(currentPage, totalPages)
  const isFirst = currentPage <= 1
  const isLast = currentPage >= totalPages

  return (
    <nav aria-label="Paginación" className="mt-12 flex justify-center">
      <ul className="flex items-center gap-1">
        <li>
          {isFirst ? (
            <span className={`${arrowClass} opacity-30`} aria-hidden="true">
              <ChevronLeft size={20} strokeWidth={1.5} />
            </span>
          ) : (
            <Link to={getPageHref(currentPage - 1)} aria-label="Página anterior" className={arrowClass}>
              <ChevronLeft size={20} strokeWidth={1.5} aria-hidden="true" />
            </Link>
          )}
        </li>

        {items.map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              <Link
                to={getPageHref(item)}
                aria-label={`Página ${item}`}
                aria-current={item === currentPage ? 'page' : undefined}
                className={pageClass}
              >
                {item}
              </Link>
            </li>
          ) : (
            <li key={item} aria-hidden="true" className="px-1 text-sm">
              …
            </li>
          ),
        )}

        <li>
          {isLast ? (
            <span className={`${arrowClass} opacity-30`} aria-hidden="true">
              <ChevronRight size={20} strokeWidth={1.5} />
            </span>
          ) : (
            <Link to={getPageHref(currentPage + 1)} aria-label="Página siguiente" className={arrowClass}>
              <ChevronRight size={20} strokeWidth={1.5} aria-hidden="true" />
            </Link>
          )}
        </li>
      </ul>
    </nav>
  )
}

export default Pagination