import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  activateProduct,
  createProduct,
  deactivateProduct,
  removeProductDiscount,
  setProductDiscount,
  updateProduct,
} from '../services/productService'
import { productKeys } from '../queryKeys'
import type { UpdateProductRequest } from '../types'

// Todas invalidan ['products']: el panel, el catálogo y el detalle se refrescan juntos
function useInvalidateProducts() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: productKeys.all })
}

export function useCreateProduct() {
  const invalidate = useInvalidateProducts()
  return useMutation({ mutationFn: createProduct, onSuccess: invalidate })
}

interface UpdateProductVariables {
  id: number
  request: UpdateProductRequest
}

export function useUpdateProduct() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: ({ id, request }: UpdateProductVariables) => updateProduct(id, request),
    onSuccess: invalidate,
  })
}

interface SetProductStatusVariables {
  id: number
  active: boolean
}

export function useSetProductStatus() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: ({ id, active }: SetProductStatusVariables) =>
      active ? activateProduct(id) : deactivateProduct(id),
    onSuccess: invalidate,
  })
}

interface SetDiscountVariables {
  id: number
  percent: number
}

export function useSetProductDiscount() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: ({ id, percent }: SetDiscountVariables) => setProductDiscount(id, percent),
    onSuccess: invalidate,
  })
}

export function useRemoveProductDiscount() {
  const invalidate = useInvalidateProducts()
  return useMutation({ mutationFn: removeProductDiscount, onSuccess: invalidate })
}