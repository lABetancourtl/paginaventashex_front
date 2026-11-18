import { Link } from 'react-router'
import { useProfile } from '../features/profile/hooks/useProfile'
import ProfileDetails from '../features/profile/components/ProfileDetails'
import AccountSectionHeader from '../features/account/components/AccountSectionHeader'
import { accountCardClass, accountLinkClass } from '../features/account/accountStyles'

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

      {/* "Editar" en la esquina superior derecha de la tarjeta */}
      <div className={`${accountCardClass} relative`}>
        <Link
          to="/cuenta/perfil/editar"
          aria-label="Editar perfil"
          className={`${accountLinkClass} absolute top-5.5 right-6`}
        >
          Editar
        </Link>

        <ProfileDetails profile={profile} />
      </div>
    </section>
  )
}

export default ProfilePage