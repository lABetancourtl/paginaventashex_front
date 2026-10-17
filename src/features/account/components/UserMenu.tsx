import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { CircleUserRound, LogOut, User, X } from 'lucide-react'
import { useAuth } from '../../auth/hooks/useAuth'
import { useProfile } from '../../profile/hooks/useProfile'
import { useDismiss } from '../../../hooks/useDismiss'
import { getDisplayName } from '../../../utils/formatters'
import { headerIconButtonClass, headerPanelClass } from '../../../layouts/headerStyles'
import { getAccountLinks } from '../accountLinks'

const itemClass =
  'flex w-full items-center gap-3 px-5 py-3.5 text-sm font-semibold uppercase tracking-wide hover:bg-white/10 focus-visible:outline-white'
  
function UserMenu() {
  const { session, openLogin, logout } = useAuth()
  const { data: profile } = useProfile()
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const close = () => setIsOpen(false)
  useDismiss(containerRef, isOpen, close)

  // ─── Sin sesión ───────────────────────────────────────────
  if (!session) {
    return (
      <button
        type="button"
        onClick={openLogin}
        aria-label="Iniciar sesión"
        className={headerIconButtonClass}
      >
        <User size={22} strokeWidth={1.5} aria-hidden="true" />
      </button>
    )
  }

  // ─── Con sesión ───────────────────────────────────────────
  const displayName = getDisplayName(profile?.nombre, session.email)

  const handleLogout = () => {
    close()
    logout()
    navigate('/')
  }

  return (
    <>
      {/* Celular: el ícono lleva a la página de la cuenta */}
      <Link
        to="/cuenta"
        aria-label={`Mi cuenta. Hola, ${displayName}`}
        className={`${headerIconButtonClass} md:hidden`}
      >
        <CircleUserRound size={20} strokeWidth={1.5} aria-hidden="true" />
      </Link>

      {/* Computador: el ícono abre el menú desplegable */}
      <div ref={containerRef} className="hidden md:block">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="user-menu"
        className={`${headerIconButtonClass} md:w-auto md:gap-2 md:pl-2 md:pr-3`}
      >
        <CircleUserRound size={22} strokeWidth={1.5} aria-hidden="true" />
        {/* Visible solo en computador; en celular lo leen los lectores de pantalla */}
        <span className="sr-only text-sm md:not-sr-only md:max-w-44 md:truncate">
          Hola, {displayName}
        </span>
      </button>

      {isOpen && (
        <div id="user-menu" className={headerPanelClass}>
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar menú"
            className="absolute right-2 top-2 p-2 text-white/70 hover:text-white focus-visible:outline-white"
          >
            <X size={18} aria-hidden="true" />
          </button>

          <ul className="py-2">
            {getAccountLinks(session.rol).map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <Link to={to} onClick={close} className={itemClass}>
                  <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
            <li>
              <button type="button" onClick={handleLogout} className={itemClass}>
                <LogOut size={20} strokeWidth={1.5} aria-hidden="true" />
                <span>Cerrar sesión</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
    </>
  )
}

export default UserMenu