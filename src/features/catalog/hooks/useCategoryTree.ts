import { useQuery } from '@tanstack/react-query'
import { getCategoryTree } from '../services/categoryService'
import { categoryKeys } from '../queryKeys'
import { filterActive } from '../categoryTree'

export function useCategoryTree() {
  return useQuery({
    queryKey: categoryKeys.tree,
    queryFn: getCategoryTree,
    staleTime: 5 * 60 * 1000, // 5 minutos
    select: filterActive,
  })
}