import { useQuery } from '@tanstack/react-query'
import { getCategories } from '../services/categoryService'
import { categoryKeys } from '../queryKeys'

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}