import { Link } from 'react-router'
import { useProfile } from '../features/profile/hooks/useProfile'
import ProfileDetails from '../features/profile/components/ProfileDetails'

function ProfilePage() {
  const { profile, isLoading, error } = useProfile()

  if (isLoading) {
    return <p>Cargando tu perfil...</p>
  }

  if (error) {
    return <p>Error: {error}</p>
  }

  if (!profile) {
    return null
  }

  return (
    <section>
      <div>
        <h2>Perfil</h2>
        <Link to="/cuenta/perfil/editar">Editar</Link>
      </div>

      <ProfileDetails profile={profile} />
    </section>
  )
}

export default ProfilePage