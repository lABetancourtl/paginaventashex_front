import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'

export interface Breadcrumb {
  label: string
  to?: string
}

interface AdminPageHeaderProps {
  title: ReactNode
  description?: ReactNode
  breadcrumbs?: Breadcrumb[] // Ruta de migas arriba del título
  actions?: ReactNode // Botones a la derecha, ej: "Nuevo producto"
}

function AdminPageHeader({ title, description, breadcrumbs, actions }: AdminPageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Ruta" className="mb-2">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-ink-muted">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.label} className="flex items-center gap-1">
                {index > 0 && <ChevronRight size={12} strokeWidth={2} aria-hidden="true" />}
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-admin-accent">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="font-medium text-ink">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-semibold tracking-tight text-ink">{title}</h1>
          {description && <div className="mt-1 text-sm text-ink-muted">{description}</div>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  )
}

export default AdminPageHeader
