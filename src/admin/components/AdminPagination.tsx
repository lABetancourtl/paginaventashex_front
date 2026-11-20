import { Link } from 'react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getPageItems } from '../../components/Pagination'

interface AdminPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageItemCount: number // Cuántos elementos trae la página actual
  noun: [string, string] // Singular y plural, ej: ['producto', 'productos']
  getPageHref: (page: number) => string
}

const navButtonClass = [
  'inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-[#dcdbd6] bg-white px-3 text-[13px] font-medium text-admin-ink',
  'transition-colors hover:bg-admin-bg',
].join(' ')

const disabledNavClass =
  'inline-flex h-[34px] cursor-not-allowed items-center gap-1.5 rounded-lg border border-[#dcdbd6] bg-white px-3 text-[13px] font-medium opacity-40'

const pageClass = [
  'flex size-[34px] items-center justify-center rounded-lg text-[13px] font-medium tabular-nums text-[#6b6a65] transition-colors',
  'hover:bg-admin-hover hover:text-admin-ink',
  'aria-[current=page]:bg-admin-ink aria-[current=page]:text-white',
].join(' ')

// El backend no envía el tamaño de página: se deduce de los totales
function getRange(currentPage: number, totalPages: number, totalItems: number, count: number) {
  if (count === 0) return { from: 0, to: 0 }
  const pageSize =
    totalPages <= 1 ? count : currentPage < totalPages ? count : Math.round((totalItems - count) / (totalPages - 1))
  const from = (currentPage - 1) * pageSize + 1
  return { from, to: from + count - 1 }
}

// Pie de tabla: "Mostrando 1–10 de 40 productos" con Anterior y Siguiente
function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  pageItemCount,
  noun,
  getPageHref,
}: AdminPaginationProps) {
  const { from, to } = getRange(currentPage, totalPages, totalItems, pageItemCount)
  const isFirst = currentPage <= 1
  const isLast = currentPage >= totalPages

  return (
    <div className="flex flex-col gap-3 border-t border-admin-row-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-[13px] text-[#8b8a84]">
        Mostrando{' '}
        <span className="font-medium tabular-nums text-admin-ink">
          {from}–{to}
        </span>{' '}
        de <span className="font-medium tabular-nums text-admin-ink">{totalItems}</span>{' '}
        {totalItems === 1 ? noun[0] : noun[1]}
      </p>

      {totalPages > 1 && (
        <nav aria-label="Paginación" className="flex items-center gap-2">
          {isFirst ? (
            <span aria-hidden="true" className={disabledNavClass}>
              <ChevronLeft size={16} strokeWidth={1.75} />
              Anterior
            </span>
          ) : (
            <Link to={getPageHref(currentPage - 1)} className={navButtonClass}>
              <ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" />
              Anterior
            </Link>
          )}

          <ul className="hidden items-center gap-1 md:flex">
            {getPageItems(currentPage, totalPages).map((item) =>
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
                <li key={item} aria-hidden="true" className="px-1 text-sm text-ink-muted">
                  …
                </li>
              ),
            )}
          </ul>

          {isLast ? (
            <span aria-hidden="true" className={disabledNavClass}>
              Siguiente
              <ChevronRight size={16} strokeWidth={1.75} />
            </span>
          ) : (
            <Link to={getPageHref(currentPage + 1)} className={navButtonClass}>
              Siguiente
              <ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" />
            </Link>
          )}
        </nav>
      )}
    </div>
  )
}

export default AdminPagination
