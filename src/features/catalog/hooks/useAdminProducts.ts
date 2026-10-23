import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { searchAdminProducts } from '../services/productService'
import { productKeys } from '../queryKeys'
import type { AdminProductSearchParams } from '../types'

export function useAdminProducts(params: AdminProductSearchParams, enabled = true) {
  return useQuery({
    queryKey: productKeys.admin(params),
    queryFn: () => searchAdminProducts(params),
    placeholderData: keepPreviousData,
    enabled,
  })
}