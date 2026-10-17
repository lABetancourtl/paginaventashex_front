import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import BackHeader from '../components/BackHeader'
import ConfirmDialog from '../components/ConfirmDialog'
import { dangerButtonClass } from '../components/formStyles'
import AddressForm from '../features/addresses/components/AddressForm'
import { useAddresses } from '../features/addresses/hooks/useAddresses'
import {
  useDeleteAddress,
  useUpdateAddress,
} from '../features/addresses/hooks/useAddressMutations'
import { toAddressFormValues } from '../features/addresses/addressForm'
import type { AddressRequest } from '../features/addresses/types'

function AddressEditPage() {
  const { id } = useParams()
  const addressId = Number(id)
  const navigate = useNavigate()

  const { data: addresses, isPending, error } = useAddresses()
  const updateAddress = useUpdateAddress()
  const deleteAddress = useDeleteAddress()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const address = addresses?.find((item) => item.id === addressId)

  const header = (
    <BackHeader
      title="Editar dirección"
      backTo="/cuenta/direcciones"
      backLabel="Volver a direcciones"
    />
  )

  if (isPending) {
    return <p className="text-ink-muted">Cargando la dirección...</p>
  }

  if (error) {
    return <p className="text-danger">{error.message}</p>
  }

  if (!address) {
    return (
      <section>
        {header}
        <div className="border border-line p-6 text-center md:p-10">
          <p className="text-ink-muted">No encontramos esta dirección.</p>
          <Link
            to="/cuenta/direcciones"
            className="mt-3 inline-block text-sm underline underline-offset-4"
          >
            Ver mis direcciones
          </Link>
        </div>
      </section>
    )
  }

  const handleSubmit = (request: AddressRequest) => {
    updateAddress.mutate(
      { id: address.id, request },
      { onSuccess: () => navigate('/cuenta/direcciones') },
    )
  }

  const handleDelete = () => {
    deleteAddress.mutate(address.id, {
      onSuccess: () => navigate('/cuenta/direcciones'),
    })
  }

  const handleCancelDelete = () => {
    setIsConfirmOpen(false)
    deleteAddress.reset() // Limpia un error anterior, si lo hubo
  }

  // Si es la principal y hay otras, avisamos qué va a pasar
  const willReassignPrincipal = address.esPrincipal && addresses.length > 1
  const deleteMessage = willReassignPrincipal
    ? 'Esta es tu dirección principal. Otra de tus direcciones quedará como principal.'
    : 'Esta acción no se puede deshacer.'

  return (
    <section>
      {header}

      <div className="border border-line p-6 md:p-10">
        <AddressForm
          key={address.id}
          initialValues={toAddressFormValues(address)}
          submitLabel="Guardar cambios"
          isSaving={updateAddress.isPending}
          serverError={updateAddress.error?.message ?? null}
          onSubmit={handleSubmit}
        />
      </div>

      <button
        type="button"
        onClick={() => setIsConfirmOpen(true)}
        className={`${dangerButtonClass} mt-6 sm:w-80`}
      >
        Eliminar dirección
      </button>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="¿Eliminar esta dirección?"
        message={deleteMessage}
        confirmLabel="Eliminar"
        loadingLabel="Eliminando..."
        isLoading={deleteAddress.isPending}
        error={deleteAddress.error?.message ?? null}
        onConfirm={handleDelete}
        onCancel={handleCancelDelete}
      />
    </section>
  )
}

export default AddressEditPage