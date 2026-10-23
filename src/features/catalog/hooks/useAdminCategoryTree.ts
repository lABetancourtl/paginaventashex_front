import { useQuery } from '@tanstack/react-query'
import { getAdminCategoryTree } from '../services/categoryService'
import { categoryKeys } from '../queryKeys'
import { sortByDisplayOrder } from '../categoryTree'

// El árbol completo del panel, con las inactivas, ordenado en cada nivel
export function useAdminCategoryTree() {
  return useQuery({
    queryKey: categoryKeys.adminTree,
    queryFn: getAdminCategoryTree,
    select: sortByDisplayOrder,
  })
}