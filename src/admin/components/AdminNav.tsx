import { Link, NavLink } from 'react-router'
import { LogOut, Store } from 'lucide-react'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { adminLinks } from '../adminLinks'

const itemBase = 'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors'
const inactiveClass = 'text-ink-muted hover:bg-card/70 hover:text-ink'

interface AdminNavProps {
  onNavigate?: () => void
}

function AdminNav({ onNavigate }: AdminNavProps) {
  const { session, logout } = useAuth()

  const handleLogout = () => {
    onNavigate?.()
    logout()
  }

  return (
    <div className="flex flex-1 flex-col">
      <nav aria-label="Administración" className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {adminLinks.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `${itemBase} ${isActive ? 'bg-card font-semibold text-ink shadow-sm' : inactiveClass}`
                }
              >
                <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-1 px-3 py-4">
        <Link to="/" onClick={onNavigate} className={`${itemBase} ${inactiveClass}`}>
          <Store size={18} strokeWidth={1.5} aria-hidden="true" />
          Ver tienda
        </Link>
        <button type="button" onClick={handleLogout} className={`${itemBase} ${inactiveClass}`}>
          <LogOut size={18} strokeWidth={1.5} aria-hidden="true" />
          Cerrar sesión
        </button>
        <p className="truncate px-3 pt-2 text-xs text-ink-muted">{session?.email}</p>
      </div>
    </div>
  )
}

export default AdminNav