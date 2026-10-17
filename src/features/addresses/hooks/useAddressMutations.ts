import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createAddress,
  deleteAddress,
  setPrincipalAddress,
  updateAddress,
} from '../services/addressService'
import { addressKeys } from '../queryKeys'
import type { Address, AddressRequest } from '../types'

export function useCreateAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAddress,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addressKeys.all }),
  })
}

interface UpdateAddressVariables {
  id: number
  request: AddressRequest
}

export function useUpdateAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, request }: UpdateAddressVariables) => updateAddress(id, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addressKeys.all }),
  })
}

export function useDeleteAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAddress,
    // Sin "return": no esperamos la recarga antes de dar la mutación por terminada
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all })
    },
  })
}

// ─── Marcar como principal, con actualización optimista ─────
export function useSetPrincipalAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setPrincipalAddress,

    // 1. Antes de la petición: actualizamos la caché como si ya hubiera funcionado
    onMutate: async (id: number) => {
      // Cancela recargas en curso, para que no pisen nuestro cambio
      await queryClient.cancelQueries({ queryKey: addressKeys.all })

      // Guardamos una copia de los datos actuales, por si hay que deshacer
      const previous = queryClient.getQueryData<Address[]>(addressKeys.all)

      // Solo la dirección elegida queda como principal
      queryClient.setQueryData<Address[]>(addressKeys.all, (old) =>
        old?.map((address) => ({ ...address, esPrincipal: address.id === id })),
      )

      // Lo que retornamos llega como "context" a onError
      return { previous }
    },

    // 2. Si el backend falla: restauramos la copia
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(addressKeys.all, context.previous)
      }
    },

    // 3. Siempre al final: sincronizamos con lo que diga el backend
    onSettled: () => queryClient.invalidateQueries({ queryKey: addressKeys.all }),
  })
}