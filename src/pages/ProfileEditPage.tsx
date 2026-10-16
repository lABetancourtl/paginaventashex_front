import { Link, useNavigate } from 'react-router'
import { useProfile } from '../features/profile/hooks/useProfile'
import { useUpdateProfile } from '../features/profile/hooks/useUpdateProfile'
import { toFormValues } from '../features/profile/profileForm'
import ProfileForm from '../features/profile/components/ProfileForm'
import type { UpdateProfileRequest } from '../features/profile/types'

function ProfileEditPage() {
  const navigate = useNavigate()
  const { profile, isLoading, error } = useProfile()
  const { save, isSaving, error: saveError } = useUpdateProfile()

  const handleSubmit = async (request: UpdateProfileRequest) => {
    const saved = await save(request)
    if (saved) {
      navigate('/cuenta/perfil')
    }
  }

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
      <Link to="/cuenta/perfil">← Editar perfil</Link>

      <ProfileForm
        initialValues={toFormValues(profile)}
        email={profile.email}
        isSaving={isSaving}
        serverError={saveError}
        onSubmit={handleSubmit}
      />
    </section>
  )
}

export default ProfileEditPage