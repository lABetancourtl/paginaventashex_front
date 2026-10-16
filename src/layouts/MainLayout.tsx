import { Link, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../features/auth/hooks/useAuth'
import LoginModal from '../features/auth/components/LoginModal'

function MainLayout() {
  const { session, openLogin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/') // Al cerrar sesión, vuelve al inicio
  }

  return (
    <div>
      <header>
        <Link to="/">
          <strong>PaginaVentasNet</strong>
        </Link>

        <nav>
          <Link to="/">Inicio</Link>
          {session && <Link to="/perfil">Mi perfil</Link>}
          {session?.rol === 'Admin' && <Link to="/admin">Administración</Link>}
        </nav>

        {session ? (
          <div>
            <span>{session.email}</span>
            <button type="button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        ) : (
          <button type="button" onClick={openLogin}>
            Iniciar sesión
          </button>
        )}
      </header>

      <main>
        {/* Aquí se dibuja la página de la URL actual */}
        <Outlet />
      </main>

      {/* Un solo modal de login para todas las páginas */}
      <LoginModal />
    </div>
  )
}

export default MainLayout