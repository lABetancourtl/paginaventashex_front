import { NavLink, Outlet, useNavigate } from 'react-router'
import { LogOut } from 'lucide-react'
import { useAuth } from '../features/auth/hooks/useAuth'
import { useProfile } from '../features/profile/hooks/useProfile'
import { getDisplayName } from '../utils/formatters'
import { accountLinks } from '../features/account/accountLinks'

const itemBase = 'flex items-center gap-3 py-2.5 text-sm uppercase tracking-wide'

function AccountLayout() {
  const { session, logout } = useAuth()
  const { data: profile } = useProfile()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const displayName = session ? getDisplayName(profile?.nombre, session.email) : ''

  return (
    <div className="md:grid md:grid-cols-[14rem_1fr] md:gap-10">
      {/* Menú lateral: solo desde tablet. En móvil se usa el menú del header */}
      <aside className="hidden md:block">
        <h2 className="mb-6 truncate text-lg font-extrabold uppercase tracking-wide">
          Hola, {displayName}
        </h2>

        <nav aria-label="Mi cuenta">
          <ul>
            {accountLinks.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `${itemBase} ${isActive ? 'font-bold' : 'font-medium text-ink/80 hover:text-ink'}`
                  }
                >
                  <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className={`${itemBase} font-medium text-ink/80 hover:text-ink`}
              >
                <LogOut size={20} strokeWidth={1.5} aria-hidden="true" />
                <span>Cerrar sesión</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <div>
        <Outlet />
      </div>
    </div>
  )
}

export default AccountLayout