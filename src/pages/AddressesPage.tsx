import { Link } from 'react-router'
import { useAddresses } from '../features/addresses/hooks/useAddresses'
import { useSetPrincipalAddress } from '../features/addresses/hooks/useAddressMutations'
import AddressCard from '../features/addresses/components/AddressCard'
import { primaryButtonClass } from '../components/formStyles'
import AccountSectionHeader from '../features/account/components/AccountSectionHeader'

function AddressesPage() {
  const { data: addresses, isPending, error } = useAddresses()
  const setPrincipal = useSetPrincipalAddress()

  let content
  if (isPending) {
    content = <p className="text-center text-ink-muted">Cargando tus direcciones...</p>
  } else if (error) {
    content = <p className="text-center text-danger">{error.message}</p>
  } else if (addresses.length === 0) {
    content = (
      <div className="py-6 text-center">
        <p className="text-ink-muted">No tienes ninguna dirección registrada.</p>
        <p className="mt-1 text-sm text-ink-muted">
          Agrega una para que tus pedidos lleguen más rápido.
        </p>
      </div>
    )
  } else {
    content = (
      <>
        {setPrincipal.error && (
          <p role="alert" className="mb-4 text-sm text-danger">
            No pudimos cambiar tu dirección principal: {setPrincipal.error.message}
          </p>
        )}
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {addresses.map((address) => (
            <li key={address.id}>
              <AddressCard
                address={address}
                editTo={`/cuenta/direcciones/${address.id}/editar`}
                onSetPrincipal={() => setPrincipal.mutate(address.id)}
                actionsDisabled={setPrincipal.isPending}
              />
            </li>
          ))}
        </ul>
      </>
    )
  }

  return (
    <section>
      <AccountSectionHeader title="Direcciones" />

      <Link
        to="/cuenta/direcciones/nueva"
        className={`${primaryButtonClass} block text-center sm:w-80`}
      >
        Añadir dirección
      </Link>

      <div className="mt-6 min-h-60 border border-line p-6 md:p-8">{content}</div>
    </section>
  )
}

export default AddressesPage