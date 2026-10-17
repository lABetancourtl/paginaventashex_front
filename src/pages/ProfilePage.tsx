import { Link } from 'react-router'
import { Pencil } from 'lucide-react'
import { useProfile } from '../features/profile/hooks/useProfile'
import ProfileDetails from '../features/profile/components/ProfileDetails'
import AccountSectionHeader from '../features/account/components/AccountSectionHeader'

function ProfilePage() {
  const { data: profile, isPending, error } = useProfile()

  if (isPending) {
    return <p className="text-ink-muted">Cargando tu perfil...</p>
  }

  if (error) {
    return <p className="text-danger">{error.message}</p>
  }

  return (
    <section>
      <AccountSectionHeader title="Perfil" />

      <div className="relative border border-line p-6 md:p-10">
        <Link
          to="/cuenta/perfil/editar"
          aria-label="Editar perfil"
          className="absolute right-4 top-4 p-2 text-ink-muted hover:text-ink md:right-6 md:top-6"
        >
          <Pencil size={20} strokeWidth={1.5} aria-hidden="true" />
        </Link>

        <ProfileDetails profile={profile} />
      </div>
    </section>
  )
}

export default ProfilePage