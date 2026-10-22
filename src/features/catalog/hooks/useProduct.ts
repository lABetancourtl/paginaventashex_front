import { useQuery } from '@tanstack/react-query'
import { getProductById } from '../services/productService'
import { productKeys } from '../queryKeys'

export function useProduct(id: number, enabled = true) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProductById(id),
    enabled,
  })
}