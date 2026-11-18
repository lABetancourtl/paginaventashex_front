import { NavLink } from 'react-router'
import { SITE_NAME } from '../../config/site'
import { adminLinks } from '../adminLinks'

export function AdminBrand() {
  return (
    <span className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="flex size-8 items-center justify-center rounded-lg bg-admin-accent text-sm font-extrabold text-white shadow-sm shadow-admin-accent/30"
      >
        {SITE_NAME.charAt(0)}
      </span>
      <span className="text-[17px] font-semibold tracking-tight text-ink">{SITE_NAME}</span>
    </span>
  )
}

// Riel de íconos fijo, solo en computador. El nombre aparece al pasar el mouse.
function AdminSidebar() {
  return (
    <aside className="fixed bottom-0 left-0 top-16 z-20 hidden w-[72px] border-r border-admin-line bg-white md:block">
      <nav aria-label="Administración" className="flex flex-col items-center gap-2 py-5">
        {adminLinks.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `group relative flex size-11 items-center justify-center rounded-xl transition-colors ${
                isActive
                  ? 'bg-admin-accent text-white shadow-md shadow-admin-accent/30'
                  : 'text-ink-muted/80 hover:bg-admin-bg hover:text-ink'
              }`
            }
          >
            <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
            <span className="sr-only">{label}</span>
            {/* Etiqueta flotante */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 -translate-x-1 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-all group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
            >
              {label}
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default AdminSidebar
