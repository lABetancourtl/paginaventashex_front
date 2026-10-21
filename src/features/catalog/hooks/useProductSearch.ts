import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { searchProducts } from '../services/productService'
import { productKeys } from '../queryKeys'
import type { ProductSearchParams } from '../types'

export function useProductSearch(params: ProductSearchParams, enabled = true) {
  return useQuery({
    queryKey: productKeys.search(params),
    queryFn: () => searchProducts(params),
    // Mientras llega la página nueva, se siguen mostrando los productos anteriores
    placeholderData: keepPreviousData,
    enabled,
  })
}