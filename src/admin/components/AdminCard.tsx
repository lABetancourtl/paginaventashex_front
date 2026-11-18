import type { ReactNode } from 'react'

interface AdminCardProps {
  id?: string // Para enlazar a la tarjeta (ej: #variantes)
  title?: ReactNode
  description?: string
  actions?: ReactNode
  className?: string // Solo para ubicarla en la grilla (ej: lg:col-span-2)
  flush?: boolean // Sin relleno interno: para tablas que llegan al borde
  children: ReactNode
}

function AdminCard({ id, title, description, actions, className = '', flush = false, children }: AdminCardProps) {
  const hasHeader = title !== undefined || actions !== undefined

  return (
    <section
      id={id}
      className={`scroll-mt-24 rounded-2xl border border-admin-line bg-white shadow-[0_1px_2px_rgb(16_24_40/0.04)] ${className}`}
    >
      {hasHeader && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-admin-line px-5 py-4">
          <div className="min-w-0">
            {title !== undefined && <h2 className="text-[15px] font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-ink-muted">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={flush ? '' : 'p-5'}>{children}</div>
    </section>
  )
}

export default AdminCard
