import { useMutation, useQueryClient } from '@tanstack/react-query'
import { activateVariant, createVariant, deactivateVariant, updateVariant } from '../services/variantService'
import { productKeys } from '../queryKeys'
import type { VariantRequest } from '../types'

// Las variantes cambian el stock y la disponibilidad: se refresca todo lo de productos
function useInvalidateProducts() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: productKeys.all })
}

export function useCreateVariant() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: ({ productId, request }: { productId: number; request: VariantRequest }) =>
      createVariant(productId, request),
    onSuccess: invalidate,
  })
}

interface UpdateVariantVariables {
  productId: number
  variantId: number
  request: VariantRequest
}

export function useUpdateVariant() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: ({ productId, variantId, request }: UpdateVariantVariables) =>
      updateVariant(productId, variantId, request),
    onSuccess: invalidate,
  })
}

interface SetVariantStatusVariables {
  productId: number
  variantId: number
  active: boolean
}

export function useSetVariantStatus() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: ({ productId, variantId, active }: SetVariantStatusVariables) =>
      active ? activateVariant(productId, variantId) : deactivateVariant(productId, variantId),
    onSuccess: invalidate,
  })
}