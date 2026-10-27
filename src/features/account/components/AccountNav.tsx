import { NavLink, useNavigate } from 'react-router'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../auth/hooks/useAuth'
import { useProfile } from '../../profile/hooks/useProfile'
import { getDisplayName } from '../../../utils/formatters'
import { getAccountLinks } from '../accountLinks'
import UserAvatar from '../../../components/UserAvatar'

// En celular las opciones son más altas, para tocarlas fácil con el dedo
const itemBase = 'flex items-center gap-3 py-3.5 text-sm uppercase tracking-wide md:py-2.5'

function AccountNav() {
  const { session, logout } = useAuth()
  const { data: profile } = useProfile()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const displayName = session ? getDisplayName(profile?.nombre, session.email) : ''

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        {session && (
          <UserAvatar seed={session.email} size={44} animate="always" className="ring-1 ring-line" />
        )}
        <h2 className="min-w-0 truncate text-lg font-extrabold uppercase tracking-wide">
          Hola, {displayName}
        </h2>
      </div>

      <nav aria-label="Mi cuenta">
        <ul>
          {getAccountLinks(session?.rol).map(({ to, label, icon: Icon }) => (
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
    </div>
  )
}

export default AccountNav