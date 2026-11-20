import { NavLink } from 'react-router'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { SITE_NAME } from '../../config/site'
import { adminLinks } from '../adminLinks'

export function AdminBrand({ showName = true }: { showName?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-admin-ink text-sm font-semibold text-white"
      >
        {SITE_NAME.charAt(0)}
      </span>
      {showName && (
        <span className="whitespace-nowrap text-[15px] font-semibold tracking-tight text-admin-ink">{SITE_NAME}</span>
      )}
    </span>
  )
}

const itemClass =
  'group relative flex h-[38px] w-full items-center gap-3 rounded-lg px-2.5 text-sm transition-colors'

interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

// Menú lateral del computador: se despliega con nombres o se colapsa a solo íconos
function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose
  const toggleLabel = collapsed ? 'Expandir menú' : 'Colapsar menú'

  return (
    <aside
      className="sticky top-0 hidden h-dvh shrink-0 flex-col gap-0.5 overflow-hidden border-r border-admin-line bg-white px-2.5 py-3 transition-[width] duration-200 ease-out md:flex"
      style={{ width: 'var(--admin-sidebar-w)' }}
    >
      <NavLink
        to="/admin"
        end
        aria-label="Ir al dashboard"
        className={`mb-4 flex h-9 items-center px-1.5 ${collapsed ? 'justify-center' : ''}`}
      >
        <AdminBrand showName={!collapsed} />
      </NavLink>

      <nav aria-label="Administración" className="flex flex-col gap-0.5">
        {adminLinks.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `${itemClass} ${collapsed ? 'justify-center' : ''} ${
                isActive
                  ? 'bg-admin-active font-semibold text-admin-ink'
                  : 'text-[#5d5c57] hover:bg-admin-hover hover:text-admin-ink'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
            {collapsed ? (
              <span className="sr-only">{label}</span>
            ) : (
              <span className="flex-1 truncate">{label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1" />

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
        title={collapsed ? toggleLabel : undefined}
        className={`${itemClass} text-[#5d5c57] hover:bg-admin-hover hover:text-admin-ink ${collapsed ? 'justify-center' : ''}`}
      >
        <ToggleIcon size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
        {collapsed ? <span className="sr-only">{toggleLabel}</span> : <span className="flex-1 text-left">{toggleLabel}</span>}
      </button>
    </aside>
  )
}

export default AdminSidebar
