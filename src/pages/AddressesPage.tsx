import { Link } from 'react-router'
import { useAddresses } from '../features/addresses/hooks/useAddresses'
import { useSetPrincipalAddress } from '../features/addresses/hooks/useAddressMutations'
import AddressCard from '../features/addresses/components/AddressCard'
import AccountSectionHeader from '../features/account/components/AccountSectionHeader'
import { accountCardClass, accountPrimaryButtonClass } from '../features/account/accountStyles'

function AddressesPage() {
  const { data: addresses, isPending, error } = useAddresses()
  const setPrincipal = useSetPrincipalAddress()

  let content
  if (isPending) {
    content = <p className="py-10 text-center text-ink-muted">Cargando tus direcciones...</p>
  } else if (error) {
    content = <p className="py-10 text-center text-danger">{error.message}</p>
  } else {
    // La principal siempre va primero
    const sorted = [...addresses].sort((a, b) => Number(b.esPrincipal) - Number(a.esPrincipal))

    content = (
      <>
        {setPrincipal.error && (
          <p role="alert" className="mb-4 text-sm text-danger">
            No pudimos cambiar tu dirección principal: {setPrincipal.error.message}
          </p>
        )}

        {addresses.length === 0 ? (
          <div className={`${accountCardClass} py-10 text-center md:py-12`}>
            <p className="text-ink-muted">No tienes ninguna dirección registrada.</p>
            <p className="mt-1 text-sm text-ink-muted">Agrega una para que tus pedidos lleguen más rápido.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {sorted.map((address) => (
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
        )}
      </>
    )
  }

  return (
    <section>
      <AccountSectionHeader
        title="Direcciones"
        action={
          <Link to="/cuenta/direcciones/nueva" className={accountPrimaryButtonClass}>
            Añadir dirección
          </Link>
        }
      />
      {content}
    </section>
  )
}

export default AddressesPage
