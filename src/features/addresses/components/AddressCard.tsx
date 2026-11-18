import { Link } from 'react-router'
import { accountLinkClass } from '../../account/accountStyles'
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
    // La principal con borde verde oscuro; las demás con borde suave
    <article
      className={`flex h-full flex-col gap-3 rounded-xl bg-white p-6 ${
        address.esPrincipal ? 'border-[1.5px] border-footer' : 'border border-card-line'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          {address.esPrincipal && (
            <span className="self-start rounded-xs bg-[#3a3a3a] px-[7px] py-1 text-[0.625rem] font-bold uppercase tracking-wide text-white">
              Principal
            </span>
          )}
          <h3 className="truncate text-sm font-bold">{address.direccionTexto}</h3>
        </div>

        <Link
          to={editTo}
          aria-label={`Editar la dirección ${address.direccionTexto}`}
          className={`${accountLinkClass} shrink-0 text-ink`}
        >
          Editar
        </Link>
      </div>

      <div className="space-y-0.5 text-[0.8125rem] leading-relaxed text-ink/75">
        {details && <p>{details}</p>}
        <p>
          {address.municipioNombre}, {address.departamentoNombre}
        </p>
        <p>Colombia</p>
      </div>

      <p className="text-xs font-medium text-ink-muted">Recibe: {address.nombreQuienRecibe}</p>

      {!address.esPrincipal && onSetPrincipal && (
        <div className="mt-auto pt-1">
          <button
            type="button"
            onClick={onSetPrincipal}
            disabled={actionsDisabled}
            className={accountLinkClass}
          >
            Usar como principal
          </button>
        </div>
      )}
    </article>
  )
}

export default AddressCard
