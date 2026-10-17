import { useNavigate } from 'react-router'
import BackHeader from '../components/BackHeader'
import AddressForm from '../features/addresses/components/AddressForm'
import { useCreateAddress } from '../features/addresses/hooks/useAddressMutations'
import { emptyAddressFormValues } from '../features/addresses/addressForm'
import { useProfile } from '../features/profile/hooks/useProfile'
import type { AddressRequest } from '../features/addresses/types'

function AddressCreatePage() {
  const navigate = useNavigate()
  const { data: profile, isPending } = useProfile()
  const createAddress = useCreateAddress()

  const handleSubmit = (request: AddressRequest) => {
    createAddress.mutate(request, {
      onSuccess: () => navigate('/cuenta/direcciones'),
    })
  }

  // Esperamos el perfil para precargar el nombre de quien recibe
  if (isPending) {
    return <p className="text-ink-muted">Cargando...</p>
  }

  const defaultNombre = [profile?.nombre, profile?.apellido].filter(Boolean).join(' ')

  return (
    <section>
      <BackHeader
        title="Añadir dirección"
        backTo="/cuenta/direcciones"
        backLabel="Volver a direcciones"
      />

      <div className="border border-line p-6 md:p-10">
        <AddressForm
          initialValues={emptyAddressFormValues(defaultNombre)}
          submitLabel="Añadir dirección"
          isSaving={createAddress.isPending}
          serverError={createAddress.error?.message ?? null}
          onSubmit={handleSubmit}
        />
      </div>
    </section>
  )
}

export default AddressCreatePage