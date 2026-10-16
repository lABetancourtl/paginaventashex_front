import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { CircleUserRound, LogOut, User, X } from 'lucide-react'
import { useAuth } from '../../auth/hooks/useAuth'
import { useProfile } from '../../profile/hooks/useProfile'
import { useDismiss } from '../../../hooks/useDismiss'
import { getDisplayName } from '../../../utils/formatters'
import { accountLinks } from '../accountLinks'

// Estilo compartido por las opciones del menú (enlaces y botón)
const itemClass =
  'flex w-full items-center gap-3 px-5 py-3 text-sm font-semibold uppercase tracking-wide hover:bg-canvas'

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
        className="rounded-full p-2 hover:bg-line/50"
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
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="user-menu"
        className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 hover:bg-line/50"
      >
        <CircleUserRound size={22} strokeWidth={1.5} aria-hidden="true" />
        <span className="max-w-32 truncate text-sm md:max-w-44">Hola, {displayName}</span>
      </button>

      {isOpen && (
        <div
          id="user-menu"
          className="absolute right-0 top-full mt-2 w-64 border border-line bg-surface py-2 shadow-lg"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar menú"
            className="absolute right-2 top-2 p-2 text-ink-muted hover:text-ink"
          >
            <X size={18} aria-hidden="true" />
          </button>

          <ul>
            {accountLinks.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <Link to={to} onClick={close} className={itemClass}>
                  <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
            <li className="mt-1 border-t border-line pt-1">
              <button type="button" onClick={handleLogout} className={itemClass}>
                <LogOut size={20} strokeWidth={1.5} aria-hidden="true" />
                <span>Cerrar sesión</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default UserMenu