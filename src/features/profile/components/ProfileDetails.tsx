import type { Profile } from '../types'
import { GENERO_LABELS } from '../genero'
import { formatDateOnly } from '../../../utils/formatters'

interface ProfileDetailsProps {
  profile: Profile
}

const EMPTY = 'Sin registrar'

function showValue(value: string | null): string {
  return value && value.trim() !== '' ? value : EMPTY
}

// ─── Un par etiqueta/valor ──────────────────────────────────
interface DetailItemProps {
  label: string
  value: string
  wide?: boolean // Si ocupa toda la fila
}

function DetailItem({ label, value, wide = false }: DetailItemProps) {
  const isEmpty = value === EMPTY

  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <dt className="text-xs font-bold uppercase tracking-wide">{label}</dt>
      <dd className={`mt-1.5 break-words ${isEmpty ? 'italic text-ink-muted/70' : 'text-ink-muted'}`}>
        {value}
      </dd>
    </div>
  )
}

// ─── La lista completa ──────────────────────────────────────
function ProfileDetails({ profile }: ProfileDetailsProps) {
  return (
    <dl className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
      <DetailItem label="Nombre" value={showValue(profile.nombre)} />
      <DetailItem label="Apellido" value={showValue(profile.apellido)} />
      <DetailItem label="Email" value={profile.email} wide />
      <DetailItem label="Documento" value={showValue(profile.documento)} />
      <DetailItem
        label="Género"
        value={profile.genero ? GENERO_LABELS[profile.genero] : EMPTY}
      />
      <DetailItem
        label="Fecha de nacimiento"
        value={profile.fechaNacimiento ? formatDateOnly(profile.fechaNacimiento) : EMPTY}
      />
      <DetailItem label="Teléfono personal" value={showValue(profile.telefono)} />
    </dl>
  )
}

export default ProfileDetails