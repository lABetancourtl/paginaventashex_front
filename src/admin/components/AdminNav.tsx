import { Link, NavLink } from 'react-router'
import { LogOut, Store } from 'lucide-react'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { adminLinks } from '../adminLinks'

const itemBase =
  'flex w-full items-center gap-3 px-3 py-2.5 text-sm focus-visible:outline-white'

interface AdminNavProps {
  onNavigate?: () => void // Para cerrar el menú del celular al elegir una opción
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
                  `${itemBase} ${
                    isActive
                      ? 'bg-white/10 font-bold text-white'
                      : 'text-white/75 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        <Link
          to="/"
          onClick={onNavigate}
          className={`${itemBase} text-white/75 hover:bg-white/5 hover:text-white`}
        >
          <Store size={18} strokeWidth={1.5} aria-hidden="true" />
          Ver tienda
        </Link>

        <p className="truncate px-3 pt-3 text-xs text-white/60">{session?.email}</p>

        <button
          type="button"
          onClick={handleLogout}
          className={`${itemBase} text-white/75 hover:bg-white/5 hover:text-white`}
        >
          <LogOut size={18} strokeWidth={1.5} aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default AdminNav