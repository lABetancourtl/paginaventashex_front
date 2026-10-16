import { useAuth } from '../features/auth/hooks/useAuth'

// Provisional: en el siguiente paso mostrará los datos de GET /api/profile
function ProfilePage() {
  const { session } = useAuth()

  return (
    <section>
      <h2>Mi perfil</h2>
      <p>Correo: {session?.email}</p>
      <p>Rol: {session?.rol}</p>
    </section>
  )
}

export default ProfilePage