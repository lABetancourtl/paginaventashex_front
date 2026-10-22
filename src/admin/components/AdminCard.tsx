import type { ReactNode } from 'react'

interface AdminCardProps {
  title?: string
  actions?: ReactNode
  className?: string // Solo para ubicarla en la grilla (ej: lg:col-span-2)
  children: ReactNode
}

function AdminCard({ title, actions, className = '', children }: AdminCardProps) {
  return (
    <section className={`rounded-xl bg-card p-5 shadow-sm ring-1 ring-line/60 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-sm font-semibold">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}

export default AdminCard