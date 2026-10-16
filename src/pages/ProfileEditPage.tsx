import { Link, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { useProfile } from '../features/profile/hooks/useProfile'
import { useUpdateProfile } from '../features/profile/hooks/useUpdateProfile'
import { toFormValues } from '../features/profile/profileForm'
import ProfileForm from '../features/profile/components/ProfileForm'
import type { UpdateProfileRequest } from '../features/profile/types'

function ProfileEditPage() {
  const navigate = useNavigate()
  const { data: profile, isPending, error } = useProfile()
  const updateProfile = useUpdateProfile()

  const handleSubmit = (request: UpdateProfileRequest) => {
    updateProfile.mutate(request, {
      onSuccess: () => navigate('/cuenta/perfil'),
    })
  }

  if (isPending) {
    return <p className="text-ink-muted">Cargando tu perfil...</p>
  }

  if (error) {
    return <p className="text-danger">{error.message}</p>
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <Link
          to="/cuenta/perfil"
          aria-label="Volver al perfil"
          className="p-1 text-ink hover:text-ink-muted"
        >
          <ArrowLeft size={20} strokeWidth={1.5} aria-hidden="true" />
        </Link>
        <h2 className="text-lg font-extrabold uppercase tracking-wide">Editar perfil</h2>
      </div>

      <div className="border border-line p-6 md:p-10">
        <ProfileForm
          initialValues={toFormValues(profile)}
          email={profile.email}
          isSaving={updateProfile.isPending}
          serverError={updateProfile.error?.message ?? null}
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  )
}

export default ProfileEditPage