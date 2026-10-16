import { Link } from 'react-router'
import { Pencil } from 'lucide-react'
import { useProfile } from '../features/profile/hooks/useProfile'
import ProfileDetails from '../features/profile/components/ProfileDetails'

function ProfilePage() {
  const { data: profile, isPending, error } = useProfile()

  if (isPending) {
    return <p className="text-ink-muted">Cargando tu perfil...</p>
  }

  if (error) {
    return <p className="text-danger">{error.message}</p>
  }

  return (
    <section className="relative border border-line p-6 md:p-10">
      {/* Título para lectores de pantalla; visualmente lo da el menú lateral */}
      <h2 className="sr-only">Perfil</h2>

      <Link
        to="/cuenta/perfil/editar"
        aria-label="Editar perfil"
        className="absolute right-4 top-4 p-2 text-ink-muted hover:text-ink md:right-6 md:top-6"
      >
        <Pencil size={20} strokeWidth={1.5} aria-hidden="true" />
      </Link>

      <ProfileDetails profile={profile} />
    </section>
  )
}

export default ProfilePage