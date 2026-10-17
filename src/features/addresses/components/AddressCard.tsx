import { Link } from 'react-router'
import { Pencil } from 'lucide-react'
import { linkButtonClass } from '../../../components/formStyles'
import type { Address } from '../types'

interface AddressCardProps {
  address: Address
  editTo: string
  onSetPrincipal?: () => void // Opcional: si no llega, no se muestra el botón
  actionsDisabled?: boolean
}

function AddressCard({ address, editTo, onSetPrincipal, actionsDisabled = false }: AddressCardProps) {
  const details = [address.informacionAdicional, address.barrio].filter(Boolean).join(', ')

  return (
    <article className="relative flex h-full flex-col border border-ink/60 p-5 pr-12">
      {address.esPrincipal && (
        <span className="mb-3 self-start bg-primary px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
          Principal
        </span>
      )}

      <h3 className="truncate font-semibold">{address.direccionTexto}</h3>

      <div className="mt-1 space-y-0.5 text-sm text-ink-muted">
        {details && <p>{details}</p>}
        <p>
          {address.municipioNombre}, {address.departamentoNombre}
        </p>
        <p>Colombia</p>
        <p className="pt-2">Recibe: {address.nombreQuienRecibe}</p>
      </div>

      {!address.esPrincipal && onSetPrincipal && (
        <div className="mt-auto pt-4">
          <button
            type="button"
            onClick={onSetPrincipal}
            disabled={actionsDisabled}
            className={linkButtonClass}
          >
            Usar como principal
          </button>
        </div>
      )}

      <Link
        to={editTo}
        aria-label={`Editar la dirección ${address.direccionTexto}`}
        className="absolute right-3 top-3 p-2 text-ink-muted hover:text-ink"
      >
        <Pencil size={18} strokeWidth={1.5} aria-hidden="true" />
      </Link>
    </article>
  )
}

export default AddressCard