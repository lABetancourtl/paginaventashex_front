import { Link, Outlet } from 'react-router'
import { useAuth } from '../features/auth/hooks/useAuth'
import type { Rol } from '../features/auth/types'

interface RequireAuthProps {
  role?: Rol // Opcional: si se indica, exige ese rol
}

function RequireAuth({ role }: RequireAuthProps) {
  const { session, openLogin } = useAuth()

  // Sin sesión: invitamos a iniciar sesión sin salir de la página
  if (!session) {
    return (
      <section>
        <h2>Inicia sesión para continuar</h2>
        <p>Necesitas iniciar sesión para ver esta página.</p>
        <button type="button" onClick={openLogin}>
          Iniciar sesión
        </button>
      </section>
    )
  }

  // Con sesión, pero sin el rol requerido
  if (role && session.rol !== role) {
    return (
      <section>
        <h2>Acceso no permitido</h2>
        <p>No tienes permiso para ver esta página.</p>
        <Link to="/">Volver al inicio</Link>
      </section>
    )
  }

  // Todo en orden: se dibuja la página protegida
  return <Outlet />
}

export default RequireAuth