import type { Profile } from '../types'
import { formatDateOnly } from '../../../utils/formatters'
import { GENERO_LABELS } from '../genero'

interface ProfileDetailsProps {
  profile: Profile
}

const EMPTY = 'Sin registrar'

function showValue(value: string | null): string {
  return value && value.trim() !== '' ? value : EMPTY
}

function ProfileDetails({ profile }: ProfileDetailsProps) {
  return (
    <dl>
      <dt>Nombre</dt>
      <dd>{showValue(profile.nombre)}</dd>

      <dt>Apellido</dt>
      <dd>{showValue(profile.apellido)}</dd>

      <dt>Email</dt>
      <dd>{profile.email}</dd>

      <dt>Documento</dt>
      <dd>{showValue(profile.documento)}</dd>

      <dt>Género</dt>
      <dd>{profile.genero ? GENERO_LABELS[profile.genero] : EMPTY}</dd>

      <dt>Fecha de nacimiento</dt>
      <dd>{profile.fechaNacimiento ? formatDateOnly(profile.fechaNacimiento) : EMPTY}</dd>

      <dt>Teléfono personal</dt>
      <dd>{showValue(profile.telefono)}</dd>
    </dl>
  )
}

export default ProfileDetails