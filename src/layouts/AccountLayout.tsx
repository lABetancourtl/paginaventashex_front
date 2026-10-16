import { NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../features/auth/hooks/useAuth'
import { getDisplayName } from '../utils/formatters'

// Opciones del menú lateral
const accountLinks = [
  { to: '/cuenta/perfil', label: 'Perfil' },
  { to: '/cuenta/direcciones', label: 'Direcciones' },
  { to: '/cuenta/autenticacion', label: 'Autenticación' },
]

function AccountLayout() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Por ahora usamos el email; con TanStack Query mostraremos el nombre
  const displayName = session ? getDisplayName(null, session.email) : ''

  return (
    <div>
      <aside>
        <h2>Hola, {displayName}</h2>

        <nav aria-label="Mi cuenta">
          <ul>
            {accountLinks.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to}>{link.label}</NavLink>
              </li>
            ))}
            <li>
              <button type="button" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <div>
        {/* Aquí se dibuja la sección seleccionada */}
        <Outlet />
      </div>
    </div>
  )
}

export default AccountLayout