import type { LucideIcon } from 'lucide-react'

export interface AdminTab<T extends string> {
  value: T
  label: string
  icon?: LucideIcon
  count?: number // Se muestra como pastilla al lado del texto
}

interface AdminTabsProps<T extends string> {
  label: string // Nombre del grupo para lectores de pantalla
  tabs: AdminTab<T>[]
  value: T
  onChange: (value: T) => void
}

// Selector segmentado (ej: Todos · Activos · Inactivos)
function AdminTabs<T extends string>({ label, tabs, value, onChange }: AdminTabsProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-lg border border-admin-line bg-white p-0.5 [scrollbar-width:none]"
    >
      {tabs.map(({ value: tabValue, label: tabLabel, icon: Icon, count }) => {
        const isActive = tabValue === value
        return (
          <button
            key={tabValue}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(tabValue)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
              isActive
                ? 'bg-admin-accent/10 text-admin-accent ring-1 ring-admin-accent/25'
                : 'text-ink-muted hover:bg-admin-bg hover:text-ink'
            }`}
          >
            {Icon && <Icon size={14} strokeWidth={1.75} aria-hidden="true" />}
            {tabLabel}
            {count !== undefined && (
              <span
                className={`min-w-5 rounded-full px-1.5 text-center text-[11px] font-semibold tabular-nums ${
                  isActive ? 'bg-admin-accent/15 text-admin-accent' : 'bg-admin-bg text-ink-muted'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default AdminTabs
