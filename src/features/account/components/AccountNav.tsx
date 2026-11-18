import { NavLink, useNavigate } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth'
import { useProfile } from '../../profile/hooks/useProfile'
import { getDisplayName } from '../../../utils/formatters'
import { getAccountLinks } from '../accountLinks'
import UserAvatar from '../../../components/UserAvatar'

// Cabecera de Mi cuenta: franja menta con el saludo y, debajo, las pestañas de las secciones
function AccountNav() {
  const { session, logout } = useAuth()
  const { data: profile } = useProfile()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const email = session?.email ?? ''
  const displayName = session ? getDisplayName(profile?.nombre, email) : ''

  return (
    <div className="flex flex-col gap-6">
      {/* Franja con avatar, saludo y email; "Cerrar sesión" a la derecha */}
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-4 rounded-2xl bg-mint px-5 py-6 md:px-8 md:py-7">
        <div className="flex min-w-0 items-center gap-4">
          {session && <UserAvatar seed={email} size={56} animate="always" className="bg-white" />}
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="truncate text-lg font-bold uppercase tracking-wide md:text-xl">Hola, {displayName}</h2>
            <p className="truncate text-[0.8125rem] text-[#3d5752]">{email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="text-[0.6875rem] font-bold uppercase tracking-wider text-footer underline underline-offset-2 hover:opacity-75"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Pestañas: la activa en negro con subrayado verde oscuro.
        En celular, si no caben, se desplazan de lado */}
      <nav aria-label="Mi cuenta" className="border-b border-line-soft">
        <ul className="-mb-px flex gap-7 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {getAccountLinks(session?.rol).map(({ to, label }) => (
            <li key={to} className="shrink-0">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `block border-b-2 pb-3 text-xs font-bold uppercase tracking-wide transition-colors ${
                    isActive ? 'border-footer text-ink' : 'border-transparent text-ink-muted hover:text-ink'
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default AccountNav
