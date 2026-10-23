import { useQuery } from '@tanstack/react-query'
import { getAdminProduct } from '../services/productService'
import { productKeys } from '../queryKeys'

export function useAdminProduct(id: number, enabled = true) {
  return useQuery({
    queryKey: productKeys.adminDetail(id),
    queryFn: () => getAdminProduct(id),
    enabled,
  })
}