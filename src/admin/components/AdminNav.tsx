import { Link, NavLink } from 'react-router'
import { LogOut, Store } from 'lucide-react'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { adminLinks } from '../adminLinks'
import UserAvatar from '../../components/UserAvatar'

const itemBase = 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors'
const inactiveClass = 'text-ink-muted hover:bg-admin-bg hover:text-ink'

interface AdminNavProps {
  onNavigate?: () => void
}

// Menú completo con nombres: se usa en el celular
function AdminNav({ onNavigate }: AdminNavProps) {
  const { session, logout } = useAuth()

  const handleLogout = () => {
    onNavigate?.()
    logout()
  }

  return (
    <div className="flex flex-1 flex-col">
      <nav aria-label="Administración" className="flex-1 px-4 py-4">
        <ul className="space-y-1">
          {adminLinks.map(({ to, label, description, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `${itemBase} ${isActive ? 'bg-admin-accent/10 text-admin-accent' : inactiveClass}`
                }
              >
                <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block">{label}</span>
                  <span className="block truncate text-xs font-normal text-ink-muted">{description}</span>
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-1 border-t border-admin-line px-4 py-4">
        {session && (
          <div className="mb-2 flex items-center gap-3 px-3">
            <UserAvatar seed={session.email} size={32} className="ring-1 ring-admin-line" />
            <p className="min-w-0 truncate text-sm text-ink-muted">{session.email}</p>
          </div>
        )}
        <Link to="/" onClick={onNavigate} className={`${itemBase} ${inactiveClass}`}>
          <Store size={18} strokeWidth={1.6} aria-hidden="true" />
          Ver tienda
        </Link>
        <button type="button" onClick={handleLogout} className={`${itemBase} ${inactiveClass}`}>
          <LogOut size={18} strokeWidth={1.6} aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default AdminNav
